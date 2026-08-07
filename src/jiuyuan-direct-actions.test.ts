import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeById, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchM } from './verified-visible-actions-batch-m';
import { verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchM.map((action) => [action.id, action]));

describe('verified Jiuyuan direct actions and Rotation Lab bindings', () => {
  it('adds two exact level-10 direct actions to the 113-action catalog', () => {
    expect(verifiedVisibleActionsBatchM).toHaveLength(2);
    expect(new Set(verifiedVisibleActionsBatchM.map((action) => action.id)).size).toBe(2);
    expect(verifiedVisibleActions).toHaveLength(113);
    expect(byId.get('jiuyuan.intel-hunter.direct.level-10')?.multiplier).toBeCloseTo(600.3, 8);
    expect(byId.get('jiuyuan.final-reckoning.direct.level-10')?.multiplier).toBeCloseTo(1199.3, 8);
  });

  it('keeps Pact Settlement, Rose Pact and A6 outside the direct ratios', () => {
    const skill = byId.get('jiuyuan.intel-hunter.direct.level-10')!;
    const ultimate = byId.get('jiuyuan.final-reckoning.direct.level-10')!;
    expect(skill.description.ru).toContain('не превращаются');
    expect(ultimate.description.ru).toContain('Pact Settlement');
    expect(ultimate.description.ru).toContain('A2–A6');
    expect(verifiedVisibleActionsBatchM.some((action) => action.id.includes('awakening'))).toBe(false);
    expect(verifiedVisibleActionsBatchM.some((action) => action.id.includes('settlement'))).toBe(false);
  });

  it('binds both source steps as Ultimate then Redirect Skill without A6 substitution', () => {
    for (const key of ['hathor-hyper:jiuyuan-open', 'nanally-hexed-dual:nanally-jiuyuan-hexed']) {
      expect(rotationScenarioBindings[key]).toEqual({
        coverage: 'partial',
        items: [{
          kind: 'action-sequence',
          actionIds: ['jiuyuan.final-reckoning.direct.level-10', 'jiuyuan.intel-hunter.direct.level-10'],
        }],
      });
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
  });

  it('preserves the exact action order in both promoted recipes', () => {
    for (const presetId of ['hathor-hyper', 'nanally-hexed-dual']) {
      const recipe = verifiedRotationRecipeById.get(`rotation-lab.${presetId}.verified-actions`)!;
      const actions = recipe.steps.map((step) => step.actionId);
      const ultimateIndex = actions.indexOf('jiuyuan.final-reckoning.direct.level-10');
      const skillIndex = actions.indexOf('jiuyuan.intel-hunter.direct.level-10');
      expect(ultimateIndex).toBeGreaterThanOrEqual(0);
      expect(skillIndex).toBe(ultimateIndex + 1);
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');
      const importedActions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
      expect(importedActions.indexOf('jiuyuan.intel-hunter.direct.level-10')).toBe(importedActions.indexOf('jiuyuan.final-reckoning.direct.level-10') + 1);
      expect(importedActions).not.toContain('jiuyuan.know-every-secret.awakening-six');
    }
  });

  it('derives 41 bindings, 62 promoted actions and the 17-gap audit', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 42,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 30,
      unsupportedSourceStepCount: 16,
      boundActionStepCount: 63,
      promotedRecipeCount: 6,
      promotedActionStepCount: 63,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 25,
      total: 16,
      missingActionRecord: 0,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual([]);
  });
});
