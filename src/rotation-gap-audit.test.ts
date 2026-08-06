import { describe, expect, it } from 'vitest';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { rotationGapAudit, rotationGapAuditSummary } from './rotation-gap-audit';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresets } from './rotation-presets';
import { verifiedRotationRecipeById } from './verified-rotation-recipes';

describe('Rotation Lab gap audit', () => {
  it('preserves the immutable 41-step baseline', () => {
    expect(rotationGapAuditSummary).toMatchObject({ total: 41, effectOrCycleCondition: 3, missingActionRecord: 26, nonDamageOperation: 8, ambiguousSourceStep: 4 });
    expect(new Set(rotationGapAudit.map((item) => `${item.presetId}:${item.sourceStepId}`)).size).toBe(41);
  });

  it('derives all 29 current gaps from exact bindings', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 12,
      total: 29,
      effectOrCycleCondition: 3,
      missingActionRecord: 13,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 106,
    });
    const unsupportedKeys = rotationPresets.flatMap((preset) => preset.steps.filter((step) => !rotationScenarioBindings[`${preset.id}:${step.id}`]).map((step) => `${preset.id}:${step.id}`));
    expect(unsupportedKeys).toHaveLength(29);
    expect([...currentRotationGapAuditByKey.keys()].sort()).toEqual(unsupportedKeys.sort());
  });

  it('promotes Nanally and expands Chaos without semantic substitutions', () => {
    expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(7);
    expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.gaps).toHaveLength(10);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(7);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.gaps).toHaveLength(9);
    expect(currentRotationGapAuditByKey.has('nanally-hexed-dual:nanally-energy-recovery')).toBe(true);
    expect(currentRotationGapAuditByKey.has('chaos-remora-bomb:chaos-restart')).toBe(true);
  });

  it('moves missing-action research priority to Daffodill and Zero', () => {
    expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Daffodill'], [2, 'Zero']]);
  });
});
