import { describe, expect, it } from 'vitest';
import { createEmptyGameVisibleBuild, initialGameVisibleTeamState } from './game-visible-build';
import { calculateGameVisibleBuild } from './game-visible-calculation';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchL } from './verified-visible-actions-batch-l';
import { verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchL.map((action) => [action.id, action]));

function zeroBuild(actionId: string, damageBonus = 0) {
  const base = createEmptyGameVisibleBuild('Zero');
  return {
    ...base,
    level: 80,
    maxLevel: 80,
    stats: { ...base.stats, atk: 2000, critRate: 0, critDamage: 100, damageBonus, attributeDamageBonus: 0 },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
    testMode: 'verified-action' as const,
    verifiedActionId: actionId,
  };
}

describe('verified Zero direct actions and Rotation Lab bindings', () => {
  it('adds three exact level-10 records to the 112-action catalog', () => {
    expect(verifiedVisibleActionsBatchL).toHaveLength(3);
    expect(new Set(verifiedVisibleActionsBatchL.map((action) => action.id)).size).toBe(3);
    expect(verifiedVisibleActions).toHaveLength(112);
    expect(byId.get('zero.appraise-and-engrave.main.level-10')?.multiplier).toBeCloseTo(599.8, 8);
    expect(byId.get('zero.appraise-and-engrave.extra-lower-level.base.level-10')?.multiplier).toBe(200);
    expect(byId.get('zero.divide-by-zero.level-10')?.multiplier).toBeCloseTo(999.5, 8);
    expect(byId.get('zero.divide-by-zero.level-10')?.damageBonus).toBe(25);
  });

  it('applies Anomaly Perception as an additive action bonus without changing the raw ratio', () => {
    const state = initialGameVisibleTeamState();
    state.target.level = 70;
    const withPassive = calculateGameVisibleBuild(zeroBuild('zero.divide-by-zero.level-10', 0), state);
    const cancelled = calculateGameVisibleBuild(zeroBuild('zero.divide-by-zero.level-10', -25), state);
    expect(withPassive.supported).toBe(true);
    expect(cancelled.supported).toBe(true);
    expect(withPassive.multiplier).toBeCloseTo(999.5, 8);
    expect(withPassive.result!.nonCrit / cancelled.result!.nonCrit).toBeCloseTo(1.25, 8);
    expect(withPassive.conditions.some((condition) => condition.id.endsWith('.damage-bonus'))).toBe(true);
  });

  it('keeps the lower-level extra shot separate from A1 and A6', () => {
    const action = byId.get('zero.appraise-and-engrave.extra-lower-level.base.level-10')!;
    expect(action.requiresLowerLevelTarget).toBe(true);
    const state = initialGameVisibleTeamState();
    state.target.level = 80;
    expect(calculateGameVisibleBuild(zeroBuild(action.id), state).supported).toBe(false);
    state.target.level = 79;
    expect(calculateGameVisibleBuild(zeroBuild(action.id), state).supported).toBe(true);
    expect(action.defenceIgnore).toBeUndefined();
    expect(action.id).not.toContain('awakening');
  });

  it('binds five Zero steps and one existing Nanally step without conditional-hit substitution', () => {
    const expected = {
      'shinku-charge:zero-fill': ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],
      'shinku-charge:nanally-charge': ['nanally.colucci-ultimate-technique.initial.level-10', 'nanally.colucci-howling-technique.level-10'],
      'hathor-hyper:zero-blossom': ['zero.divide-by-zero.level-10'],
      'hathor-hyper:zero-third-strike': ['zero.appraise-and-engrave.main.level-10'],
      'chaos-remora-bomb:chaos-zero-remora': ['zero.divide-by-zero.level-10'],
      'nanally-hexed-dual:nanally-zero-blossom': ['zero.appraise-and-engrave.main.level-10', 'zero.divide-by-zero.level-10'],
    } as const;
    for (const [key, actionIds] of Object.entries(expected)) {
      expect(rotationScenarioBindings[key]?.coverage).toBe('partial');
      const actual = rotationScenarioBindings[key]?.items.flatMap((item) => item.kind === 'action-sequence' ? item.actionIds : []);
      expect(actual).toEqual(actionIds);
      expect(actual).not.toContain('zero.blooming-gaze.awakening-one');
      expect(actual).not.toContain('zero.appraise-and-engrave-extra.awakening-six');
      expect(actual).not.toContain('zero.appraise-and-engrave.extra-lower-level.base.level-10');
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
  });

  it('preserves sourced action order in all four affected recipes', () => {
    const expectedSubsequences = {
      'shinku-charge': [
        'zero.divide-by-zero.level-10',
        'zero.appraise-and-engrave.main.level-10',
        'nanally.colucci-ultimate-technique.initial.level-10',
        'nanally.colucci-howling-technique.level-10',
      ],
      'hathor-hyper': ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],
      'chaos-remora-bomb': ['zero.divide-by-zero.level-10'],
      'nanally-hexed-dual': ['zero.appraise-and-engrave.main.level-10', 'zero.divide-by-zero.level-10'],
    } as const;
    for (const [presetId, expected] of Object.entries(expectedSubsequences)) {
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');
      const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
      let cursor = -1;
      for (const actionId of expected) {
        const next = actions.indexOf(actionId, cursor + 1);
        expect(next, `${presetId}:${actionId}`).toBeGreaterThan(cursor);
        cursor = next;
      }
    }
  });

  it('derives 39 bindings, 58 promoted actions and the 19-gap audit', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 41,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 29,
      unsupportedSourceStepCount: 17,
      boundActionStepCount: 62,
      promotedRecipeCount: 6,
      promotedActionStepCount: 62,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 24,
      total: 17,
      missingActionRecord: 1,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 112,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual(['Hathor']);
  });
});
