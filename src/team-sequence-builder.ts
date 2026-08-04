import type { TeamMemberInput } from '../packages/calculation-core/src';
import { totalMultiplierPerUse, withTotalMultiplierPerUse } from './state/teamForm';

export const ATTACK_SEQUENCE_VERSION = 1 as const;
export const MAX_ATTACK_SEQUENCE_COMPONENTS = 16;
export const MAX_ATTACK_SEQUENCE_LABEL_LENGTH = 80;

export interface AttackSequenceComponent {
  id: string;
  label: string;
  multiplierPerHit: number;
  identicalHits: number;
}

export interface AttackSequenceDraft {
  components: AttackSequenceComponent[];
  usesPerRotation: number;
}

export interface AttackSequenceStore {
  version: typeof ATTACK_SEQUENCE_VERSION;
  drafts: Record<string, AttackSequenceDraft>;
}

export type AttackSequenceErrorCode =
  | 'no-components'
  | 'too-many-components'
  | 'empty-label'
  | 'invalid-multiplier'
  | 'invalid-hits'
  | 'invalid-uses'
  | 'zero-total';

export interface AttackSequenceError {
  code: AttackSequenceErrorCode;
  componentId?: string;
  componentIndex?: number;
}

export interface AttackSequenceRowResult extends AttackSequenceComponent {
  subtotalPerUse: number;
  errors: readonly AttackSequenceErrorCode[];
}

export interface AttackSequenceEvaluation {
  valid: boolean;
  rows: readonly AttackSequenceRowResult[];
  errors: readonly AttackSequenceError[];
  totalMultiplierPerUse: number;
  usesPerRotation: number;
  totalMultiplierPerRotation: number;
}

export interface AttackSequenceApplication<T extends Pick<TeamMemberInput, 'skillMultiplier' | 'hits' | 'actionsPerRotation'>> {
  applied: boolean;
  member: T;
  evaluation: AttackSequenceEvaluation;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finite(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeLabel(value: unknown): string {
  return typeof value === 'string'
    ? value.normalize('NFKC').replace(/\s+/gu, ' ').trim().slice(0, MAX_ATTACK_SEQUENCE_LABEL_LENGTH)
    : '';
}

function normalizeComponent(value: unknown, index: number): AttackSequenceComponent | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim().slice(0, 64) : `action-${index + 1}`;
  return {
    id,
    label: normalizeLabel(value.label),
    multiplierPerHit: Math.max(0, finite(value.multiplierPerHit)),
    identicalHits: Math.max(1, Math.trunc(finite(value.identicalHits, 1))),
  };
}

function normalizeDraft(value: unknown): AttackSequenceDraft | null {
  if (!isRecord(value) || !Array.isArray(value.components)) return null;
  const components = value.components
    .slice(0, MAX_ATTACK_SEQUENCE_COMPONENTS)
    .map(normalizeComponent)
    .filter((component): component is AttackSequenceComponent => component !== null);
  return {
    components,
    usesPerRotation: Math.max(0, finite(value.usesPerRotation, 1)),
  };
}

export function emptyAttackSequenceStore(): AttackSequenceStore {
  return { version: ATTACK_SEQUENCE_VERSION, drafts: {} };
}

export function normalizeAttackSequenceStore(value: unknown): AttackSequenceStore | null {
  if (!isRecord(value) || value.version !== ATTACK_SEQUENCE_VERSION || !isRecord(value.drafts)) return null;
  const drafts: Record<string, AttackSequenceDraft> = {};
  for (const [characterName, rawDraft] of Object.entries(value.drafts)) {
    const key = characterName.normalize('NFKC').trim().slice(0, 80);
    const draft = normalizeDraft(rawDraft);
    if (key && draft) drafts[key] = draft;
  }
  return { version: ATTACK_SEQUENCE_VERSION, drafts };
}

export function createAttackSequenceDraft(
  member: Pick<TeamMemberInput, 'skillMultiplier' | 'hits' | 'actionsPerRotation'>,
  defaultLabel: string,
): AttackSequenceDraft {
  return {
    components: [{
      id: 'action-1',
      label: normalizeLabel(defaultLabel) || 'Action 1',
      multiplierPerHit: totalMultiplierPerUse(member),
      identicalHits: 1,
    }],
    usesPerRotation: Math.max(0, finite(member.actionsPerRotation, 1)),
  };
}

export function nextAttackSequenceComponentId(components: readonly AttackSequenceComponent[]): string {
  const used = new Set(components.map((component) => component.id));
  let index = 1;
  while (used.has(`action-${index}`)) index += 1;
  return `action-${index}`;
}

export function evaluateAttackSequence(draft: AttackSequenceDraft): AttackSequenceEvaluation {
  const errors: AttackSequenceError[] = [];
  if (draft.components.length === 0) errors.push({ code: 'no-components' });
  if (draft.components.length > MAX_ATTACK_SEQUENCE_COMPONENTS) errors.push({ code: 'too-many-components' });

  const rows = draft.components.slice(0, MAX_ATTACK_SEQUENCE_COMPONENTS).map((component, componentIndex) => {
    const rowErrors: AttackSequenceErrorCode[] = [];
    const label = normalizeLabel(component.label);
    if (!label) rowErrors.push('empty-label');
    if (!Number.isFinite(component.multiplierPerHit) || component.multiplierPerHit < 0) rowErrors.push('invalid-multiplier');
    if (!Number.isInteger(component.identicalHits) || component.identicalHits <= 0) rowErrors.push('invalid-hits');
    for (const code of rowErrors) errors.push({ code, componentId: component.id, componentIndex });
    const multiplier = Number.isFinite(component.multiplierPerHit) ? Math.max(0, component.multiplierPerHit) : 0;
    const hits = Number.isInteger(component.identicalHits) && component.identicalHits > 0 ? component.identicalHits : 0;
    return {
      ...component,
      label,
      subtotalPerUse: multiplier * hits,
      errors: rowErrors,
    };
  });

  const usesPerRotation = Number.isFinite(draft.usesPerRotation) && draft.usesPerRotation > 0
    ? draft.usesPerRotation
    : 0;
  if (usesPerRotation === 0) errors.push({ code: 'invalid-uses' });

  const totalPerUse = rows.reduce((sum, row) => sum + row.subtotalPerUse, 0);
  if (rows.length > 0 && totalPerUse <= 0) errors.push({ code: 'zero-total' });

  return {
    valid: errors.length === 0,
    rows,
    errors,
    totalMultiplierPerUse: totalPerUse,
    usesPerRotation,
    totalMultiplierPerRotation: totalPerUse * usesPerRotation,
  };
}

export function applyAttackSequence<
  T extends Pick<TeamMemberInput, 'skillMultiplier' | 'hits' | 'actionsPerRotation'>,
>(member: T, draft: AttackSequenceDraft): AttackSequenceApplication<T> {
  const evaluation = evaluateAttackSequence(draft);
  if (!evaluation.valid) return { applied: false, member, evaluation };
  return {
    applied: true,
    member: {
      ...withTotalMultiplierPerUse(member, evaluation.totalMultiplierPerUse),
      actionsPerRotation: evaluation.usesPerRotation,
    },
    evaluation,
  };
}

export function updateAttackSequenceDraft(
  store: AttackSequenceStore,
  characterName: string,
  draft: AttackSequenceDraft,
): AttackSequenceStore {
  return {
    version: ATTACK_SEQUENCE_VERSION,
    drafts: { ...store.drafts, [characterName]: draft },
  };
}
