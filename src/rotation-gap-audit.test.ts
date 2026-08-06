import { describe, expect, it } from 'vitest';
import {
  currentRotationGapAudit,
  currentRotationGapAuditByKey,
  currentRotationGapAuditSummary,
  currentRotationMissingActionPriorities,
  validateCurrentRotationGapAudit,
} from './rotation-gap-audit-current';
import {
  rotationGapAudit,
  rotationGapAuditByKey,
  rotationGapAuditSummary,
} from './rotation-gap-audit';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresets } from './rotation-presets';
import { verifiedRotationRecipeById } from './verified-rotation-recipes';

describe('Rotation Lab gap audit', () => {
  it('preserves the immutable 41-step baseline', () => {
    expect(rotationGapAuditSummary).toMatchObject({
      total: 41,
      exactExistingAction: 0,
      compoundExistingActions: 0,
      effectOrCycleCondition: 3,
      missingActionRecord: 26,
      nonDamageOperation: 8,
      ambiguousSourceStep: 4,
    });
    expect(new Set(rotationGapAudit.map((item) => `${item.presetId}:${item.sourceStepId}`)).size).toBe(41);
  });

  it('derives all 36 current gaps from exact bindings', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 5,
      total: 36,
      exactExistingAction: 0,
      compoundExistingActions: 0,
      effectOrCycleCondition: 3,
      missingActionRecord: 23,
      nonDamageOperation: 8,
      ambiguousSourceStep: 2,
      safelyBindableUnsupportedSteps: 0,
      verifiedActionCatalogCount: 91,
      existingCatalogExhausted: true,
    });
    const unsupportedKeys = rotationPresets.flatMap((preset) => preset.steps
      .filter((step) => !rotationScenarioBindings[`${preset.id}:${step.id}`])
      .map((step) => `${preset.id}:${step.id}`));
    expect(unsupportedKeys).toHaveLength(36);
    expect([...currentRotationGapAuditByKey.keys()].sort()).toEqual(unsupportedKeys.sort());
  });

  it('removes only the five newly bound Shinku source steps from baseline', () => {
    const baselineKeys = new Set(rotationGapAuditByKey.keys());
    const currentKeys = new Set(currentRotationGapAuditByKey.keys());
    const resolved = [...baselineKeys].filter((key) => !currentKeys.has(key)).sort();
    expect(resolved).toEqual([
      'shinku-charge:shinku-dashes',
      'shinku-charge:shinku-enhanced-skills',
      'shinku-charge:shinku-prep',
      'shinku-charge:shinku-recovery',
      'shinku-charge:shinku-ultimate',
    ]);
  });

  it('continues rejecting semantic look-alikes in unresolved presets', () => {
    expect(currentRotationGapAuditByKey.get('nanally-hexed-dual:nanally-basic-string')).toMatchObject({
      classification: 'missing-action-record',
      rejectedActionIds: [
        'nanally.fair-duel.level-11',
        'nanally.awakening-three-follow-up.level-11',
      ],
    });
    expect(currentRotationGapAuditByKey.get('lacrimosa-discord-dot:lacrimosa-phantom-one')).toMatchObject({
      classification: 'missing-action-record',
      rejectedActionIds: [
        'daffodill.echoes.enhanced-sequence.level-10',
        'daffodill.finale.one-parry-extra.level-10',
      ],
    });
    expect(currentRotationGapAuditByKey.get('baicang-firefly-hyper:baicang-adler-open')).toMatchObject({
      classification: 'ambiguous-source-step',
    });
  });

  it('promotes the exact Shinku window while keeping unsupported team setup visible', () => {
    expect(rotationScenarioBindings['shinku-charge:shinku-enhanced-skills']).toMatchObject({ coverage: 'partial' });
    expect(rotationScenarioBindings['shinku-charge:shinku-dashes']).toMatchObject({ coverage: 'full' });
    const recipe = verifiedRotationRecipeById.get('rotation-lab.shinku-charge.verified-actions');
    expect(recipe?.steps).toHaveLength(14);
    expect(recipe?.gaps).toHaveLength(9);
    expect(currentRotationGapAuditByKey.has('shinku-charge:zero-fill')).toBe(true);
    expect(currentRotationGapAuditByKey.has('shinku-charge:nanally-charge')).toBe(true);
  });

  it('keeps Nanally audit-only and moves it to research priority one', () => {
    expect(verifiedRotationRecipeById.has('rotation-lab.nanally-hexed-dual.verified-actions')).toBe(false);
    expect(currentRotationGapAuditByKey.get('nanally-hexed-dual:nanally-ultimate')?.classification).toBe('missing-action-record');
    expect(currentRotationGapAuditByKey.get('nanally-hexed-dual:nanally-energy-recovery')?.classification).toBe('non-damage-operation');
    expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([
      [1, 'Nanally'],
      [2, 'Chaos'],
      [3, 'Lacrimosa'],
      [4, 'Daffodill'],
      [5, 'Zero'],
    ]);
  });
});
