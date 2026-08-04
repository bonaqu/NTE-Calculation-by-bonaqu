import { describe, expect, it } from 'vitest';
import {
  calculateCombatScenario,
  COMBAT_SCENARIO_VERSION,
  normalizeCombatScenarioState,
  type CombatScenarioState,
} from './combat-scenario';
import {
  createEmptyGameVisibleBuild,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
} from './game-visible-build';

function build(characterName: string, overrides: Partial<GameVisibleCharacterBuild> = {}): GameVisibleCharacterBuild {
  const value = createEmptyGameVisibleBuild(characterName);
  return {
    ...value,
    level: 80,
    maxLevel: 80,
    stats: {
      ...value.stats,
      atk: 1_000,
      critRate: 0,
      critDamage: 0,
    },
    ...overrides,
  };
}

function team(builds: GameVisibleCharacterBuild[]): GameVisibleTeamState {
  return {
    version: 1,
    activeSlot: 0,
    duration: 30,
    builds,
    target: {
      level: 80,
      resistance: 0,
      defenceReduction: 0,
      resistanceReduction: 0,
      boss: true,
    },
  };
}

function scenario(steps: CombatScenarioState['steps']): CombatScenarioState {
  return {
    version: COMBAT_SCENARIO_VERSION,
    name: 'Test',
    steps,
  };
}

const action = (id: string, at: number, sourceSlot = 0, actionId = 'shinku.charge-enhancement.level-11') => ({
  id,
  at,
  kind: 'action' as const,
  sourceSlot,
  actionId,
  effectId: '',
  note: '',
});

const effect = (id: string, at: number, sourceSlot: number, effectId: string) => ({
  id,
  at,
  kind: 'activate-effect' as const,
  sourceSlot,
  actionId: '',
  effectId,
  note: '',
});

describe('time-aware verified combat scenario', () => {
  it('keeps Haniel post-Nova ATK active for later verified actions', () => {
    const shinku = build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } });
    const state = team([
      shinku,
      build('Haniel', { baseAtk: 500 }),
      build('Zero'),
      build('Nanally'),
    ]);
    const result = calculateCombatScenario(state, scenario([
      effect('haniel', 0, 1, 'haniel.friendship.nova-atk-drain'),
      action('hit', 7),
    ]));

    expect(result.activatedEffectCount).toBe(1);
    expect(result.calculatedActionCount).toBe(1);
    expect(result.steps[1]?.calculation?.result?.totalAtk).toBe(1_040);
    expect(result.steps[1]?.calculation?.conditions.some((condition) => condition.id.startsWith('haniel.friendship.nova-atk-drain'))).toBe(true);
  });

  it('applies Sakiri A4 inside 20 seconds and expires it at the boundary', () => {
    const state = team([
      build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Sakiri', { awakeningLevel: 4, baseAtk: 600 }),
      build('Zero'),
      build('Nanally'),
    ]);
    const result = calculateCombatScenario(state, scenario([
      effect('sakiri', 0, 1, 'sakiri.awakening-four.team-atk'),
      action('inside', 19.9),
      action('expired', 20),
    ]));

    expect(result.steps[1]?.calculation?.result?.totalAtk).toBe(1_180);
    expect(result.steps[2]?.calculation?.result?.totalAtk).toBe(1_000);
    expect(result.calculatedActionCount).toBe(2);
    expect(result.coveragePercent).toBe(100);
  });

  it('preserves explicit list order for steps with the same timestamp', () => {
    const state = team([
      build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Haniel', { baseAtk: 500 }),
      build('Zero'),
      build('Nanally'),
    ]);
    const beforeActivation = calculateCombatScenario(state, scenario([
      action('first-hit', 0),
      effect('then-effect', 0, 1, 'haniel.friendship.nova-atk-drain'),
      action('second-hit', 0),
    ]));

    expect(beforeActivation.steps[0]?.calculation?.result?.totalAtk).toBe(1_000);
    expect(beforeActivation.steps[2]?.calculation?.result?.totalAtk).toBe(1_040);
  });

  it('blocks effects whose visible requirements are not satisfied', () => {
    const state = team([
      build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Sakiri', { awakeningLevel: 3, baseAtk: 600 }),
      build('Zero'),
      build('Nanally'),
    ]);
    const result = calculateCombatScenario(state, scenario([
      effect('blocked', 0, 1, 'sakiri.awakening-four.team-atk'),
      action('hit', 1),
    ]));

    expect(result.steps[0]?.status).toBe('blocked');
    expect(result.steps[0]?.blockedReason?.ru).toContain('A4');
    expect(result.steps[1]?.calculation?.result?.totalAtk).toBe(1_000);
    expect(result.blockedStepCount).toBe(1);
  });

  it('blocks mismatched action ownership instead of calculating plausible damage', () => {
    const state = team([
      build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Haniel', { baseAtk: 500 }),
      build('Zero'),
      build('Nanally'),
    ]);
    const result = calculateCombatScenario(state, scenario([
      action('wrong', 0, 0, 'zero.blooming-gaze.awakening-one'),
    ]));

    expect(result.calculatedActionCount).toBe(0);
    expect(result.blockedActionCount).toBe(1);
    expect(result.steps[0]?.blockedReason?.ru).toContain('не принадлежит');
  });

  it('never mutates saved final Attributes or enabled-effect state', () => {
    const state = team([
      build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Haniel', { baseAtk: 500, activeTeamEffectIds: ['legacy-visible-state'] }),
      build('Zero'),
      build('Nanally'),
    ]);
    const before = JSON.stringify(state);
    calculateCombatScenario(state, scenario([
      effect('haniel', 0, 1, 'haniel.friendship.nova-atk-drain'),
      action('hit', 1),
    ]));
    expect(JSON.stringify(state)).toBe(before);
  });

  it('normalizes unsafe scenario payloads and makes duplicate IDs deterministic', () => {
    const normalized = normalizeCombatScenarioState({
      version: 1,
      name: '  My scenario  ',
      steps: [
        { id: 'same', at: -4, kind: 'unknown', sourceSlot: 99, actionId: 12 },
        { id: 'same', at: 999, kind: 'wait', sourceSlot: -2, note: ' note ' },
      ],
    });

    expect(normalized?.name).toBe('My scenario');
    expect(normalized?.steps[0]).toMatchObject({ id: 'same', at: 0, kind: 'action', sourceSlot: 3, actionId: '' });
    expect(normalized?.steps[1]).toMatchObject({ id: 'same-2', at: 600, kind: 'wait', sourceSlot: 0, note: 'note' });
    expect(normalizeCombatScenarioState({ version: 2, steps: [] })).toBeNull();
  });
});
