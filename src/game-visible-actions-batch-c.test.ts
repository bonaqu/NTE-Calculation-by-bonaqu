import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { calculateGameVisibleBuild, verifiedVisibleActions } from './game-visible-calculation';
import {
  combatCoverageByCharacter,
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';
import { verifiedVisibleActionsBatchC } from './verified-visible-actions-batch-c';

function combatBuild(characterName: string): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    stats: {
      ...build.stats,
      atk: 2_000,
      critRate: 50,
      critDamage: 100,
      damageBonus: 0,
      attributeDamageBonus: 0,
    },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
    testMode: 'verified-action',
  };
}

function multiplier(id: string): number | undefined {
  return verifiedVisibleActionsBatchC.find((action) => action.id === id)?.multiplier;
}

describe('verified game-visible actions batch C', () => {
  it('keeps twenty-one unique level-10 records inside the expanded action catalog', () => {
    expect(verifiedVisibleActionsBatchC).toHaveLength(21);
    expect(verifiedVisibleActions).toHaveLength(106);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(106);
    expect(new Set(verifiedVisibleActionsBatchC.map((action) => action.characterName))).toEqual(
      new Set(['Haniel', 'Sakiri', 'Baicang', 'Daffodill']),
    );
    for (const action of verifiedVisibleActionsBatchC) {
      expect(action.requiredLevel).toBe(10);
      expect(action.sourcePublisher).toBe('Icy Veins');
      expect(action.sourceUrl).toMatch(/^https:\/\/www\.icy-veins\.com\//u);
      expect(action.verifiedAt).toBe('2026-08-05');
      expect(action.multiplier).toBeGreaterThan(0);
      expect(action).not.toHaveProperty('duration');
      expect(action).not.toHaveProperty('actionsPerRotation');
      expect(action).not.toHaveProperty('repeatCount');
    }
  });

  it('locks Haniel level-10 hit compositions', () => {
    expect(multiplier('haniel.genesse-technique.full-combo.level-10')).toBeCloseTo(475.2, 8);
    expect(multiplier('haniel.silent-moonlit-forest-guardian.direct.level-10')).toBeCloseTo(399.8, 8);
    expect(multiplier('haniel.a-melody-named-haniel.initial.level-10')).toBeCloseTo(599.7, 8);
    expect(multiplier('haniel.easter-egg-time.level-10')).toBeCloseTo(399.8, 8);
    expect(verifiedVisibleActionsBatchC.some((action) => action.id.includes('ensemble'))).toBe(false);
  });

  it('locks Sakiri press, hold, Ultimate and Support values without Awakening scaling', () => {
    expect(multiplier('sakiri.devour-whole.press.level-10')).toBeCloseTo(799.6, 8);
    expect(multiplier('sakiri.devour-whole.hold.level-10')).toBeCloseTo(799.6, 8);
    expect(multiplier('sakiri.feast-of-gluttony.level-10')).toBeCloseTo(1799.2, 8);
    expect(multiplier('sakiri.squash.level-10')).toBeCloseTo(399.8, 8);
    for (const action of verifiedVisibleActionsBatchC.filter((entry) => entry.characterName === 'Sakiri')) {
      expect(action.minimumAwakening).toBeUndefined();
    }
  });

  it('keeps Baicang DoT and Power Words as standalone single triggers', () => {
    expect(multiplier('baicang.heart-of-heaven-and-earth.level-10')).toBeCloseTo(239.9, 8);
    expect(multiplier('baicang.silenced-thought.full-composition.level-10')).toBeCloseTo(839.6, 8);
    expect(multiplier('baicang.such-crime.level-10')).toBeCloseTo(559.7, 8);
    expect(multiplier('baicang.judgment-of-autumn.expansion.level-10')).toBeCloseTo(799.6, 8);
    expect(multiplier('baicang.judgment-of-autumn.one-dot-tick.level-10')).toBe(80);
    expect(multiplier('baicang.judgment-of-autumn.silence-trigger.level-10')).toBeCloseTo(599.7, 8);
    expect(multiplier('baicang.judgment-of-autumn.objurgate-trigger.level-10')).toBeCloseTo(399.8, 8);
    expect(multiplier('baicang.judgment-of-autumn.bless-trigger.level-10')).toBe(120);
    const tick = verifiedVisibleActionsBatchC.find((action) => action.id.includes('one-dot-tick'))!;
    expect(tick.assumedConditions?.some((condition) => condition.ru.includes('ровно одно'))).toBe(true);
    expect(tick.description.ru).not.toMatch(/6\s*(?:тиков|раз)/iu);
  });

  it('locks Daffodill sequences and keeps one Parry separate', () => {
    expect(multiplier('daffodill.still-waters.full-sequence.level-10')).toBeCloseTo(600.2, 8);
    expect(multiplier('daffodill.echoes.enhanced-sequence.level-10')).toBeCloseTo(599.7, 8);
    expect(multiplier('daffodill.finale.initial-composition.level-10')).toBeCloseTo(1598.7, 8);
    expect(multiplier('daffodill.finale.one-parry-extra.level-10')).toBeCloseTo(599.7, 8);
    expect(multiplier('daffodill.crossed-blades.level-10')).toBeCloseTo(399.8, 8);
    const parry = verifiedVisibleActionsBatchC.find((action) => action.id.includes('one-parry-extra'))!;
    expect(parry.description.ru).toContain('Один');
    expect(parry.assumedConditions?.some((condition) => condition.ru.includes('ровно одно'))).toBe(true);
  });

  it('requires the exact sourced skill category at level 10', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Daffodill'),
      verifiedActionId: 'daffodill.echoes.enhanced-sequence.level-10',
      skills: { basic: 10, skill: 9, ultimate: 10, support: 10 },
    };
    const blocked = calculateGameVisibleBuild(build, state);
    expect(blocked.supported).toBe(false);
    expect(blocked.blockedReason?.ru).toContain('уровень 10');
    const active = calculateGameVisibleBuild({
      ...build,
      skills: { ...build.skills, skill: 10 },
    }, state);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBeCloseTo(599.7, 8);
  });

  it('keeps exactly the four batch-C characters on partial coverage', () => {
    for (const characterName of ['Haniel', 'Sakiri', 'Baicang', 'Daffodill']) {
      const coverage = combatCoverageByCharacter.get(characterName);
      expect(coverage?.coverage).toBe('partial');
      expect(coverage?.supportedModes).toContain('verified-action');
      expect(coverage?.note.ru).toContain('Полная ротация ещё не моделируется');
    }
  });

  it('makes batch-C actions selectable by the time-aware scenario engine', () => {
    const state = initialGameVisibleTeamState();
    state.builds = [
      combatBuild('Haniel'),
      combatBuild('Sakiri'),
      combatBuild('Baicang'),
      combatBuild('Daffodill'),
    ];
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'Batch C standalone actions',
      steps: [
        { id: 'haniel', at: 0, kind: 'action', sourceSlot: 0, actionId: 'haniel.a-melody-named-haniel.initial.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'sakiri', at: 1, kind: 'action', sourceSlot: 1, actionId: 'sakiri.feast-of-gluttony.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'baicang', at: 2, kind: 'action', sourceSlot: 2, actionId: 'baicang.judgment-of-autumn.expansion.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'daffodill', at: 3, kind: 'action', sourceSlot: 3, actionId: 'daffodill.finale.initial-composition.level-10', effectId: '', cycleId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(state, scenario);
    expect(result.calculatedActionCount).toBe(4);
    expect(result.blockedActionCount).toBe(0);
    expect(result.coveragePercent).toBe(100);
    const values = result.steps.map((entry) => entry.calculation?.multiplier ?? 0);
    [599.7, 1799.2, 799.6, 1598.7].forEach((expected, index) => {
      expect(values[index]).toBeCloseTo(expected, 8);
    });
  });
});
