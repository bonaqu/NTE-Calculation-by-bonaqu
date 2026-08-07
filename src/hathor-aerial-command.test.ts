import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeById, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchN } from './verified-visible-actions-batch-n';
import { verifiedVisibleActions } from './verified-visible-actions';

const action = verifiedVisibleActionsBatchN[0];

describe('verified Hathor maximum-hold Aerial Command', () => {
  it('adds one exact level-10 action to the 113-action catalog', () => {
    expect(verifiedVisibleActionsBatchN).toHaveLength(1);
    expect(action).toMatchObject({
      id: 'hathor.aerial-command.full-hold.level-10',
      characterName: 'Hathor',
      requiredSkill: 'skill',
      requiredLevel: 10,
    });
    expect(action?.multiplier).toBeCloseTo(3100, 8);
    expect(20.4 * 4 + 244.9 + 110.3 * 5 + 111.1 * 20).toBeCloseTo(3100, 8);
    expect(verifiedVisibleActions).toHaveLength(113);
  });

  it('documents the twenty-tick full hold without folding in resources or Remora', () => {
    expect(action?.description.ru).toContain('111,1% × 20');
    expect(action?.description.ru).toContain('Five-Star Tracking');
    expect(action?.description.ru).toContain('Ремора не включены');
    expect(action?.assumedConditions?.some((condition) => condition.ru.includes('20 периодических'))).toBe(true);
    expect(action?.id).not.toContain('remora');
    expect(action?.id).not.toContain('awakening');
  });

  it('adds one partial binding and removes the final missing-action gap', () => {
    const key = 'chaos-remora-bomb:chaos-hathor-redirect';
    expect(rotationScenarioBindings[key]).toEqual({
      coverage: 'partial',
      items: [{ kind: 'action-sequence', actionIds: ['hathor.aerial-command.full-hold.level-10'] }],
    });
    expect(currentRotationGapAuditByKey.has(key)).toBe(false);
  });

  it('preserves action order and leaves the non-damage remainder visible', () => {
    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const generated = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'chaos-hathor-redirect'
    ));
    expect(generated.filter((step) => step.kind === 'action').map((step) => step.actionId)).toEqual([
      'hathor.aerial-command.full-hold.level-10',
    ]);
    expect(generated.filter((step) => step.kind === 'wait' && step.note.startsWith('Непокрытая часть'))).toHaveLength(1);
    expect(generated.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'partial')).toBe(true);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps[0]?.actionId).toBe('hathor.aerial-command.full-hold.level-10');
  });

  it('derives 42 bindings, 63 promoted actions and zero missing-action records', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 53,
      fullyBoundSourceStepCount: 20,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 5,
      boundActionStepCount: 63,
      promotedRecipeCount: 6,
      promotedActionStepCount: 63,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 36,
      total: 5,
      missingActionRecord: 0,
      effectOrCycleCondition: 0,
      nonDamageOperation: 0,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
    expect(currentRotationMissingActionPriorities).toEqual([]);
  });

  it('retains exact source provenance', () => {
    expect(action).toMatchObject({
      sourcePublisher: 'Icy Veins / Prydwen Institute',
      sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/hathor-profile-skills',
      sourceUpdatedAt: '2026-06-27',
      verifiedAt: '2026-08-06',
    });
  });
});
