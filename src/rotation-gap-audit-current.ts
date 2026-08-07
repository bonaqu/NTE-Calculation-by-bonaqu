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

const currentRotationGapOverrides = new Map<string, RotationGapAuditEntry>([
  [gapKey('lacrimosa-discord-dot', 'lacrimosa-transform'), {
    version: ROTATION_GAP_AUDIT_VERSION,
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-transform',
    classification: 'ambiguous-source-step',
    rationale: {
      ru: 'Точные записи Morning Tomato и обеих форм атак уже существуют, но шаг называет только «преобразующий навык». Источник допускает Morning Tomato либо Devilish Gift, который копирует внешний навык и не имеет фиксированного собственного коэффициента.',
      en: 'Exact Morning Tomato and both attack-form records now exist, but the step only says “transformation Skill.” The source allows Morning Tomato or Devilish Gift, which copies an external ability and has no fixed native ratio.',
    },
    rejectedActionIds: ['lacrimosa.morning-tomato.level-10'],
  }],
  [gapKey('lacrimosa-discord-dot', 'lacrimosa-basic-five'), {
    version: ROTATION_GAP_AUDIT_VERSION,
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-basic-five',
    classification: 'ambiguous-source-step',
    rationale: {
      ru: 'Каталог содержит полные ближнюю и дальнюю цепочки, но исходный шаг не фиксирует форму. Эти ветки имеют разные коэффициенты, поэтому выбор одной из них был бы догадкой.',
      en: 'The catalog contains complete melee and ranged strings, but the source step does not fix the form. Their ratios differ, so selecting either would be a guess.',
    },
    rejectedActionIds: [
      'lacrimosa.tomato-metal.full-direct-sequence.level-10',
      'lacrimosa.tomato-percussion.full-sequence.level-10',
    ],
  }],
  [gapKey('lacrimosa-discord-dot', 'lacrimosa-redirect-five'), {
    version: ROTATION_GAP_AUDIT_VERSION,
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-redirect-five',
    classification: 'ambiguous-source-step',
    rationale: {
      ru: 'Шаг требует навык перенаправления и переход к пятой атаке, но не выбирает Morning Tomato либо Devilish Gift и не указывает ближнюю или дальнюю пятую ступень.',
      en: 'The step requires a Redirect Skill and advancement to stage five, but it selects neither Morning Tomato versus Devilish Gift nor the melee versus ranged fifth stage.',
    },
    rejectedActionIds: [
      'lacrimosa.morning-tomato.level-10',
      'lacrimosa.tomato-metal.fifth.level-10',
      'lacrimosa.tomato-percussion.fifth.level-10',
    ],
  }],
]);

/**
 * The PR #123 registry remains the immutable 41-step baseline. This view keeps
 * only source steps that are still unsupported by the current exact bindings.
 */
export const currentRotationGapAudit: readonly RotationGapAuditEntry[] = baselineRotationGapAudit.filter(
  (item) => !rotationScenarioBindings[gapKey(item.presetId, item.sourceStepId)],
).map((item) => currentRotationGapOverrides.get(gapKey(item.presetId, item.sourceStepId)) ?? item);

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

export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [];

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
  if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 25) errors.push('Expected twenty-five source steps resolved since baseline');
  if (currentRotationGapAuditSummary.total !== 16) errors.push(`Expected 16 current gaps, got ${currentRotationGapAuditSummary.total}`);
  if (currentRotationGapAuditSummary.missingActionRecord !== 0) errors.push('Expected no current missing-action records');
  if (currentRotationGapAuditSummary.effectOrCycleCondition !== 3) errors.push('Expected 3 current effect/Cycle conditions');
  if (currentRotationGapAuditSummary.nonDamageOperation !== 8) errors.push('Expected 8 current non-damage operations');
  if (currentRotationGapAuditSummary.ambiguousSourceStep !== 5) errors.push('Expected 5 current ambiguous source steps');
  if (currentRotationGapAuditSummary.exactExistingAction !== 0 || currentRotationGapAuditSummary.compoundExistingActions !== 0) {
    errors.push('Current unsupported steps must not claim a safe existing-action match');
  }

  return errors;
}
