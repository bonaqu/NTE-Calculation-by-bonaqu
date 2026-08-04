import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { createEmptyGameVisibleBuild, type GameVisibleCharacterBuild, type GameVisibleTeamState } from './game-visible-build';

function build(characterName: string, critRate = 0, overrides: Partial<GameVisibleCharacterBuild> = {}): GameVisibleCharacterBuild {
  const value = createEmptyGameVisibleBuild(characterName);
  return {
    ...value,
    level: 80,
    maxLevel: 80,
    stats: {
      ...value.stats,
      atk: 1_000,
      critRate,
      critDamage: 100,
    },
    ...overrides,
  };
}

function team(): GameVisibleTeamState {
  return {
    version: 1,
    activeSlot: 0,
    duration: 20,
    builds: [
      build('Shinku', 50, { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Hathor', 50),
      build('Zero', 50),
      build('Nanally', 50),
    ],
    target: {
      level: 80,
      resistance: 0,
      defenceReduction: 0,
      resistanceReduction: 0,
      boss: true,
    },
  };
}

const scenario: CombatScenarioState = {
  version: 1,
  name: 'Hathor Remora boundary',
  steps: [
    {
      id: 'remora',
      at: 0,
      kind: 'activate-effect',
      sourceSlot: 1,
      actionId: '',
      effectId: 'hathor.delay-warning.remora-crit-rate',
      note: '',
    },
    {
      id: 'inside',
      at: 11.9,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
    {
      id: 'expired',
      at: 12,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      note: '',
    },
  ],
};

describe('Hathor Remora timed CRIT Rate effect', () => {
  it('applies inside the 12-second half-open window and expires at the boundary', () => {
    const state = team();
    const before = JSON.stringify(state);
    const result = calculateCombatScenario(state, scenario);
    const inside = result.steps.find((entry) => entry.step.id === 'inside');
    const expired = result.steps.find((entry) => entry.step.id === 'expired');

    expect(result.activatedEffectCount).toBe(1);
    expect(result.calculatedActionCount).toBe(2);
    expect(inside?.activeEffects.some((entry) => entry.effectId === 'hathor.delay-warning.remora-crit-rate')).toBe(true);
    expect(expired?.activeEffects).toHaveLength(0);
    expect(inside?.calculation?.result?.totalAtk).toBe(1_000);
    expect(expired?.calculation?.result?.totalAtk).toBe(1_000);
    expect(inside?.calculation?.result?.expectedCritMultiplier).toBe(1.6);
    expect(expired?.calculation?.result?.expectedCritMultiplier).toBe(1.5);
    expect(inside?.calculation?.result?.expected).toBeGreaterThan(expired?.calculation?.result?.expected ?? 0);
    expect(inside?.calculation?.conditions.some((condition) => condition.id.startsWith('hathor.delay-warning.remora-crit-rate'))).toBe(true);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('never activates merely because Hathor is in the team', () => {
    const withoutActivation: CombatScenarioState = {
      version: 1,
      name: 'No Remora confirmation',
      steps: [scenario.steps[1]!],
    };
    const result = calculateCombatScenario(team(), withoutActivation);
    expect(result.steps[0]?.calculation?.result?.expectedCritMultiplier).toBe(1.5);
    expect(result.steps[0]?.activeEffects).toHaveLength(0);
  });
});
