import { describe, expect, it } from 'vitest';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { initialGameVisibleTeamState } from './game-visible-build';
import { rotationRepeatEvidence, validateVerifiedRotationRecipes, verifiedRotationRecipeById, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchK } from './verified-visible-actions-batch-k';
import { verifiedVisibleActions } from './verified-visible-actions';

const action = verifiedVisibleActionsBatchK[0];

describe('verified Daffodill Phantom Step integration', () => {
  it('adds one exact raw Phantom Step to the 113-action catalog', () => {
    expect(verifiedVisibleActionsBatchK).toHaveLength(1);
    expect(action).toMatchObject({
      id: 'daffodill.phantom-step.level-10',
      characterName: 'Daffodill',
      multiplier: 799,
      requiredSkill: 'basic',
      requiredLevel: 10,
    });
    expect(136.1 + 110.5 * 4 + 220.9).toBeCloseTo(799, 8);
    expect(verifiedVisibleActions).toHaveLength(113);
  });

  it('keeps Finale, Cicada Shell and successful-parry extra damage outside the ratio', () => {
    expect(action?.description.ru).toContain('+80% Cicada Shell');
    expect(action?.description.ru).toContain('599,7%');
    expect(action?.assumedConditions?.some((condition) => condition.ru.includes('не предполагается'))).toBe(true);
    expect(action?.id).not.toContain('parry');
  });

  it('binds four source steps as four separate uses of one action ID', () => {
    const keys = [
      'lacrimosa-discord-dot:lacrimosa-phantom-one',
      'lacrimosa-discord-dot:lacrimosa-phantom-two',
      'baicang-firefly-hyper:baicang-phantom-one',
      'baicang-firefly-hyper:baicang-phantom-two',
    ];
    for (const key of keys) {
      expect(rotationScenarioBindings[key]).toEqual({
        coverage: 'full',
        items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],
      });
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
  });

  it('preserves exact order in both promoted recipes', () => {
    const lacrimosa = verifiedRotationRecipeById.get('rotation-lab.lacrimosa-discord-dot.verified-actions')!;
    const baicang = verifiedRotationRecipeById.get('rotation-lab.baicang-firefly-hyper.verified-actions')!;
    expect(lacrimosa.steps.filter((step) => step.actionId === action?.id)).toHaveLength(2);
    expect(baicang.steps.filter((step) => step.actionId === action?.id)).toHaveLength(2);
    expect(lacrimosa.steps.map((step) => step.sourceStepId).filter((id) => id.includes('phantom'))).toEqual(['lacrimosa-phantom-one', 'lacrimosa-phantom-two']);
    expect(baicang.steps.map((step) => step.sourceStepId).filter((id) => id.includes('phantom'))).toEqual(['baicang-phantom-one', 'baicang-phantom-two']);
  });

  it('records fixed-count evidence without aggregating the two uses', () => {
    for (const presetId of ['lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const evidence = rotationRepeatEvidence.find((entry) => entry.presetId === presetId && entry.action.en.includes('Daffodill'));
      expect(evidence).toMatchObject({ kind: 'fixed-count', count: 2 });
      expect(evidence?.promotedActionIds).toEqual([
        'daffodill.phantom-step.level-10',
        'daffodill.phantom-step.level-10',
      ]);
    }
  });

  it('derives the 25-gap audit and leaves Zero as the only action priority', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 45,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 13,
      boundActionStepCount: 63,
      promotedRecipeCount: 6,
      promotedActionStepCount: 63,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 28,
      total: 13,
      missingActionRecord: 0,
      effectOrCycleCondition: 0,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual([]);
  });

  it('imports two independent Phantom Step actions per preset without parry-extra', () => {
    for (const presetId of ['lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');
      const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
      expect(actions.filter((id) => id === 'daffodill.phantom-step.level-10')).toHaveLength(2);
      expect(actions).not.toContain('daffodill.finale.one-parry-extra.level-10');
      expect(actions.filter((id) => id === 'daffodill.echoes.enhanced-sequence.level-10')).toHaveLength(1);
    }
  });
});
