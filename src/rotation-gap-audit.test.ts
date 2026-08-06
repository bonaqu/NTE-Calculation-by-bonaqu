import { describe, expect, it } from 'vitest';
import {
  rotationGapAudit,
  rotationGapAuditByKey,
  rotationGapAuditSummary,
  rotationMissingActionPriorities,
  validateRotationGapAudit,
} from './rotation-gap-audit';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresets } from './rotation-presets';
import { verifiedRotationRecipeById } from './verified-rotation-recipes';

describe('Rotation Lab gap audit', () => {
  it('classifies every baseline unsupported source step exactly once', () => {
    expect(validateRotationGapAudit()).toEqual([]);
    expect(rotationGapAuditSummary).toMatchObject({
      total: 41,
      exactExistingAction: 0,
      compoundExistingActions: 0,
      effectOrCycleCondition: 3,
      missingActionRecord: 26,
      nonDamageOperation: 8,
      ambiguousSourceStep: 4,
      safelyBindableUnsupportedSteps: 0,
      existingCatalogExhausted: true,
    });
    expect(new Set(rotationGapAudit.map((item) => `${item.presetId}:${item.sourceStepId}`)).size).toBe(41);
  });

  it('matches the current unbound source-step set without swallowing bound steps', () => {
    const unsupportedKeys = rotationPresets.flatMap((preset) => preset.steps
      .filter((step) => !rotationScenarioBindings[`${preset.id}:${step.id}`])
      .map((step) => `${preset.id}:${step.id}`));
    expect(unsupportedKeys).toHaveLength(41);
    expect([...rotationGapAuditByKey.keys()].sort()).toEqual(unsupportedKeys.sort());
  });

  it('rejects semantic look-alikes instead of using them as substitutes', () => {
    expect(rotationGapAuditByKey.get('nanally-hexed-dual:nanally-basic-string')).toMatchObject({
      classification: 'missing-action-record',
      rejectedActionIds: [
        'nanally.fair-duel.level-11',
        'nanally.awakening-three-follow-up.level-11',
      ],
    });
    expect(rotationGapAuditByKey.get('lacrimosa-discord-dot:lacrimosa-phantom-one')).toMatchObject({
      classification: 'missing-action-record',
      rejectedActionIds: [
        'daffodill.echoes.enhanced-sequence.level-10',
        'daffodill.finale.one-parry-extra.level-10',
      ],
    });
    expect(rotationGapAuditByKey.get('baicang-firefly-hyper:baicang-adler-open')).toMatchObject({
      classification: 'ambiguous-source-step',
    });
  });

  it('promotes only the exact Hathor preparation inside the Shinku preset', () => {
    expect(rotationScenarioBindings['shinku-charge:hathor-open']).toEqual({
      coverage: 'partial',
      items: [
        {
          kind: 'action-sequence',
          actionIds: [
            'hathor.rider-express.level-10',
            'hathor.cyclone-strike-first.level-10',
          ],
        },
        { kind: 'activate-effect', effectId: 'hathor.delay-warning.remora-crit-rate' },
      ],
    });
    expect(verifiedRotationRecipeById.get('rotation-lab.shinku-charge.verified-actions')?.steps.map((step) => step.actionId)).toEqual([
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
    ]);
  });

  it('keeps Nanally audit-only instead of promoting one passive or support action', () => {
    expect(verifiedRotationRecipeById.has('rotation-lab.nanally-hexed-dual.verified-actions')).toBe(false);
    expect(rotationGapAuditByKey.get('nanally-hexed-dual:nanally-ultimate')?.classification).toBe('missing-action-record');
    expect(rotationGapAuditByKey.get('nanally-hexed-dual:nanally-energy-recovery')?.classification).toBe('non-damage-operation');
  });

  it('ranks genuinely missing records only after the existing catalog is exhausted', () => {
    expect(rotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([
      [1, 'Shinku'],
      [2, 'Nanally'],
      [3, 'Chaos'],
      [4, 'Lacrimosa'],
      [5, 'Daffodill'],
      [6, 'Zero'],
    ]);
    expect(rotationMissingActionPriorities.every((item) => item.sourceSteps.length > 0)).toBe(true);
  });
});
