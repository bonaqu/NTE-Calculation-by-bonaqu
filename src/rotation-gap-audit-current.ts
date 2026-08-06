import {
  ROTATION_GAP_AUDIT_VERSION,
  rotationGapAudit as baselineRotationGapAudit,
  rotationGapClassificationLabels,
  type RotationGapAuditEntry,
  type RotationGapClassification,
  type RotationMissingActionPriority,
} from './rotation-gap-audit';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById, rotationPresets } from './rotation-presets';
import { visibleActionById } from './verified-visible-actions';

const gapKey = (presetId: string, sourceStepId: string): string => `${presetId}:${sourceStepId}`;

/**
 * The PR #123 registry remains the immutable 41-step baseline. This view keeps
 * only source steps that are still unsupported by the current exact bindings.
 */
export const currentRotationGapAudit: readonly RotationGapAuditEntry[] = baselineRotationGapAudit.filter(
  (item) => !rotationScenarioBindings[gapKey(item.presetId, item.sourceStepId)],
);

export const currentRotationGapAuditByKey = new Map(
  currentRotationGapAudit.map((item) => [gapKey(item.presetId, item.sourceStepId), item]),
);

function count(classification: RotationGapClassification): number {
  return currentRotationGapAudit.filter((item) => item.classification === classification).length;
}

export const currentRotationGapAuditSummary = Object.freeze({
  baselineTotal: baselineRotationGapAudit.length,
  resolvedSinceBaseline: baselineRotationGapAudit.length - currentRotationGapAudit.length,
  total: currentRotationGapAudit.length,
  exactExistingAction: count('exact-existing-action'),
  compoundExistingActions: count('compound-existing-actions'),
  effectOrCycleCondition: count('effect-or-cycle-condition'),
  missingActionRecord: count('missing-action-record'),
  nonDamageOperation: count('non-damage-operation'),
  ambiguousSourceStep: count('ambiguous-source-step'),
  safelyBindableUnsupportedSteps: 0,
  verifiedActionCatalogCount: visibleActionById.size,
  existingCatalogExhausted: true,
});

export { rotationGapClassificationLabels };

export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Lacrimosa',
    capability: { ru: 'преобразование, базовая цепочка и переход к пятой атаке', en: 'transformation, Basic string and fifth-attack advance' },
    sourceSteps: ['lacrimosa-transform', 'lacrimosa-basic-five', 'lacrimosa-redirect-five'],
    reason: { ru: 'Добавит действия самой Лакримозы в её частичный рецепт.', en: 'Adds Lacrimosa own actions to her partial recipe.' },
  },
  {
    rank: 2,
    characterName: 'Daffodill',
    capability: { ru: 'первая и вторая усиленные базовые атаки', en: 'first and second enhanced Basic Attacks' },
    sourceSteps: ['lacrimosa-phantom-one', 'lacrimosa-phantom-two', 'baicang-phantom-one', 'baicang-phantom-two'],
    reason: { ru: 'Одна пара точных записей закроет четыре повторно используемых шага двух пресетов.', en: 'One exact pair closes four reused source steps across two presets.' },
  },
  {
    rank: 3,
    characterName: 'Zero',
    capability: { ru: 'прямые сверхспособность и навык перенаправления', en: 'direct Ultimate and Redirect Skill' },
    sourceSteps: ['zero-fill', 'zero-blossom', 'zero-third-strike', 'nanally-zero-blossom', 'chaos-zero-remora'],
    reason: { ru: 'Зеро участвует в четырёх пресетах, а текущие A1/A6-записи покрывают только условные дополнительные удары.', en: 'Zero appears in four presets while current A1/A6 records cover only conditional extra hits.' },
  },
];

function currentUnsupportedKeys(): string[] {
  return rotationPresets.flatMap((preset) => preset.steps
    .filter((step) => !rotationScenarioBindings[gapKey(preset.id, step.id)])
    .map((step) => gapKey(preset.id, step.id)));
}

export function validateCurrentRotationGapAudit(): string[] {
  const errors: string[] = [];
  const currentKeys = new Set(currentUnsupportedKeys());
  const registryKeys = new Set<string>();

  for (const item of currentRotationGapAudit) {
    const key = gapKey(item.presetId, item.sourceStepId);
    if (item.version !== ROTATION_GAP_AUDIT_VERSION) errors.push(`Invalid current gap-audit version: ${key}`);
    if (registryKeys.has(key)) errors.push(`Duplicate current gap-audit entry: ${key}`);
    registryKeys.add(key);
    if (!currentKeys.has(key)) errors.push(`Current gap-audit entry is now bound: ${key}`);

    const preset = rotationPresetById.get(item.presetId);
    const step = preset?.steps.find((candidate) => candidate.id === item.sourceStepId);
    if (!preset || !step) errors.push(`Unknown current gap-audit source step: ${key}`);
    for (const actionId of item.rejectedActionIds ?? []) {
      const action = visibleActionById.get(actionId);
      if (!action) errors.push(`Unknown rejected action: ${key}:${actionId}`);
      if (action && step && action.characterName !== step.actor) {
        errors.push(`Rejected action actor mismatch: ${key}:${actionId}`);
      }
    }
  }

  for (const key of currentKeys) {
    if (!registryKeys.has(key)) errors.push(`Unclassified current unsupported source step: ${key}`);
  }

  if (currentRotationGapAuditSummary.baselineTotal !== 41) errors.push('Expected the immutable 41-step baseline');
  if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 12) errors.push('Expected twelve source steps resolved since baseline');
  if (currentRotationGapAuditSummary.total !== 29) errors.push(`Expected 29 current gaps, got ${currentRotationGapAuditSummary.total}`);
  if (currentRotationGapAuditSummary.missingActionRecord !== 16) errors.push('Expected 16 current missing-action records');
  if (currentRotationGapAuditSummary.effectOrCycleCondition !== 3) errors.push('Expected 3 current effect/Cycle conditions');
  if (currentRotationGapAuditSummary.nonDamageOperation !== 8) errors.push('Expected 8 current non-damage operations');
  if (currentRotationGapAuditSummary.ambiguousSourceStep !== 2) errors.push('Expected 2 current ambiguous source steps');
  if (currentRotationGapAuditSummary.exactExistingAction !== 0 || currentRotationGapAuditSummary.compoundExistingActions !== 0) {
    errors.push('Current unsupported steps must not claim a safe existing-action match');
  }

  return errors;
}
