import { describe, expect, it } from 'vitest';
import { awakeningNodesForCharacter, relevantAwakeningNodes } from './awakening-reference';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { calculateGameVisibleBuild, verifiedVisibleActions } from './game-visible-calculation';
import {
  combatCoverageByCharacter,
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';
import { verifiedVisibleActionsBatchB } from './verified-visible-actions-batch-b';

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
      damageBonus: 10,
      attributeDamageBonus: 20,
    },
    testMode: 'verified-action',
  };
}

describe('verified game-visible actions batch B', () => {
  it('keeps five unique Batch B records inside the expanded public catalog', () => {
    expect(verifiedVisibleActionsBatchB).toHaveLength(5);
    expect(verifiedVisibleActions).toHaveLength(35);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(35);
    expect(new Set(verifiedVisibleActionsBatchB.map((action) => action.characterName)))
      .toEqual(new Set(['Hathor', 'Jiuyuan']));
    for (const action of verifiedVisibleActionsBatchB) {
      expect(action.multiplier).toBeGreaterThan(0);
      expect(action.sourceUrl).toMatch(/^https:\/\//u);
      expect(action.verifiedAt).toBe('2026-08-04');
      expect(action).not.toHaveProperty('actionsPerRotation');
      expect(action).not.toHaveProperty('hitCount');
      expect(action).not.toHaveProperty('duration');
    }
  });

  it('locks the exact level-10 Hathor hit compositions without extra Awakening modifiers', () => {
    const byId = new Map(verifiedVisibleActionsBatchB.map((action) => [action.id, action]));
    expect(byId.get('hathor.cyclone-strike-first.level-10')?.multiplier).toBeCloseTo(600.6, 8);
    expect(byId.get('hathor.cyclone-strike-second.level-10')?.multiplier).toBeCloseTo(799.7, 8);
    expect(byId.get('hathor.cyclone-strike-third.level-10')?.multiplier).toBeCloseTo(1099.4, 8);
    expect(byId.get('hathor.rider-express.level-10')?.multiplier).toBeCloseTo(1399.3, 8);

    for (const action of verifiedVisibleActionsBatchB.filter((entry) => entry.characterName === 'Hathor')) {
      expect(action.requiredLevel).toBe(10);
      expect(action.description.ru).not.toMatch(/официальное русское название/iu);
      expect(action.description.ru).not.toMatch(/A4|A5|A6/iu);
    }
    expect(verifiedVisibleActions.some((action) => action.id.includes('aerial-command'))).toBe(false);
  });

  it('requires the exact sourced Hathor skill level', () => {
    const state = initialGameVisibleTeamState();
    const base = combatBuild('Hathor');
    const action = {
      ...base,
      verifiedActionId: 'hathor.cyclone-strike-third.level-10',
      skills: { ...base.skills, skill: 9 },
    };
    const blocked = calculateGameVisibleBuild(action, state);
    expect(blocked.supported).toBe(false);
    expect(blocked.blockedReason?.ru).toContain('уровень 10');

    const active = calculateGameVisibleBuild({
      ...action,
      skills: { ...action.skills, skill: 10 },
    }, state);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBeCloseTo(1099.4, 8);
    expect(active.conditions.some((condition) => condition.label.ru.includes('третье применение'))).toBe(true);
  });

  it('models one Jiuyuan A6 trigger and exposes its five-second internal cooldown', () => {
    const action = verifiedVisibleActionsBatchB.find((entry) => entry.id === 'jiuyuan.know-every-secret.awakening-six');
    expect(action?.multiplier).toBe(200);
    expect(action?.minimumAwakening).toBe(6);
    expect(action?.assumedConditions?.some((condition) => condition.ru.includes('5 секунд'))).toBe(true);

    const state = initialGameVisibleTeamState();
    const base = {
      ...combatBuild('Jiuyuan'),
      verifiedActionId: action!.id,
      awakeningLevel: 5,
    };
    expect(calculateGameVisibleBuild(base, state).supported).toBe(false);
    const active = calculateGameVisibleBuild({ ...base, awakeningLevel: 6 }, state);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBe(200);
  });

  it('adds a complete English-fallback Jiuyuan A1-A6 reference and links A6 only', () => {
    const nodes = awakeningNodesForCharacter('Jiuyuan');
    expect(nodes).toHaveLength(6);
    expect(nodes.map((node) => node.level)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(nodes.every((node) => node.evidence === 'current-english-reference')).toBe(true);
    const required = relevantAwakeningNodes('Jiuyuan', 'jiuyuan.know-every-secret.awakening-six', []);
    expect(required).toHaveLength(1);
    expect(required[0]).toMatchObject({ level: 6, calculationStatus: 'applied' });
    expect(required[0]?.title.en).toBe('Know Every Secret');
  });

  it('promotes Hathor and Jiuyuan to partial coverage without claiming complete models', () => {
    for (const characterName of ['Hathor', 'Jiuyuan']) {
      const coverage = combatCoverageByCharacter.get(characterName);
      expect(coverage?.coverage).toBe('partial');
      expect(coverage?.supportedModes).toContain('verified-action');
      expect(coverage?.note.ru).toContain('Полная ротация ещё не моделируется');
    }
  });

  it('makes the new records available to the time-aware scenario engine', () => {
    const state = initialGameVisibleTeamState();
    state.builds[1] = {
      ...combatBuild('Hathor'),
      skills: { basic: 1, skill: 10, ultimate: 10, support: 1 },
    };
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'Hathor partial burst',
      steps: [
        { id: 'rider', at: 0, kind: 'action', sourceSlot: 1, actionId: 'hathor.rider-express.level-10', effectId: '', note: '' },
        { id: 'first', at: 1, kind: 'action', sourceSlot: 1, actionId: 'hathor.cyclone-strike-first.level-10', effectId: '', note: '' },
        { id: 'second', at: 2, kind: 'action', sourceSlot: 1, actionId: 'hathor.cyclone-strike-second.level-10', effectId: '', note: '' },
        { id: 'third', at: 3, kind: 'action', sourceSlot: 1, actionId: 'hathor.cyclone-strike-third.level-10', effectId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(state, scenario);
    expect(result.calculatedActionCount).toBe(4);
    expect(result.blockedActionCount).toBe(0);
    expect(result.coveragePercent).toBe(100);
    const multipliers = result.steps.map((entry) => entry.calculation?.multiplier ?? 0);
    [1399.3, 600.6, 799.7, 1099.4].forEach((expected, index) => {
      expect(multipliers[index]).toBeCloseTo(expected, 8);
    });
  });
});
