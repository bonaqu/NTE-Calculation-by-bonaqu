import { verifiedCombatCycleModelById } from './combat-cycle-models';
import {
  COMBAT_SCENARIO_VERSION,
  type CombatScenarioState,
  type CombatScenarioStep,
} from './combat-scenario';
import {
  createEmptyGameVisibleBuild,
  type GameVisibleTeamState,
} from './game-visible-build';
import { rotationPresetById, rotationPresets } from './rotation-presets';
import { verifiedTeamEffectById, type VerifiedTeamEffectId } from './team-effects';
import type { EsperCycleId, Locale, RotationPreset, RotationStep } from './types';
import { visibleActionById } from './verified-visible-actions';

export const ROTATION_SCENARIO_IMPORT_STORAGE_KEY = 'nte.team.scenario.rotation-import.v1';
export const ROTATION_SCENARIO_IMPORT_VERSION = 1 as const;

export type RotationScenarioBinding =
  | { kind: 'action-sequence'; actionIds: readonly string[] }
  | { kind: 'activate-effect'; effectId: VerifiedTeamEffectId }
  | { kind: 'activate-cycle'; cycleId: EsperCycleId };

export interface RotationScenarioImportReport {
  presetId: string;
  totalSourceSteps: number;
  mappedSourceSteps: number;
  generatedActionSteps: number;
  generatedEffectSteps: number;
  generatedCycleSteps: number;
  unsupportedSourceSteps: number;
  coveragePercent: number;
}

export interface RotationScenarioStepOrigin {
  sourceStepId: string;
  part: number;
}

export type PendingRotationCondition =
  | { kind: 'activate-effect'; effectId: VerifiedTeamEffectId; sourceSlot: number }
  | { kind: 'activate-cycle'; cycleId: EsperCycleId; sourceSlot: number };

export interface RotationScenarioImportMetadata {
  version: typeof ROTATION_SCENARIO_IMPORT_VERSION;
  sourceRotationId: string;
  timingStatus: 'none' | 'order-only' | 'confirmed-seconds';
  report: RotationScenarioImportReport | null;
  originsByStepId: Record<string, RotationScenarioStepOrigin>;
  pendingByStepId: Record<string, PendingRotationCondition>;
}

export interface RotationScenarioImportResult {
  team: GameVisibleTeamState;
  scenario: CombatScenarioState;
  metadata: RotationScenarioImportMetadata;
  report: RotationScenarioImportReport;
}

const binding = (presetId: string, stepId: string) => `${presetId}:${stepId}`;

/** Exact source-step bindings only. Text similarity is deliberately not used. */
export const rotationScenarioBindings: Readonly<Record<string, RotationScenarioBinding>> = {
  [binding('chaos-remora-bomb', 'chaos-haniel-buffs')]: {
    kind: 'activate-effect',
    effectId: 'haniel.friendship.nova-atk-drain',
  },
  [binding('chaos-remora-bomb', 'chaos-stain')]: {
    kind: 'activate-cycle',
    cycleId: 'stain',
  },
  [binding('hathor-hyper', 'haniel-buffs')]: {
    kind: 'activate-effect',
    effectId: 'haniel.friendship.nova-atk-drain',
  },
  [binding('hathor-hyper', 'hathor-stain')]: {
    kind: 'activate-cycle',
    cycleId: 'stain',
  },
  [binding('hathor-hyper', 'hathor-ultimate')]: {
    kind: 'action-sequence',
    actionIds: [
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ],
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.normalize('NFKC').trim().slice(0, max) : '';
}

function safeId(value: string): string {
  return value.replace(/[^a-z0-9._-]+/giu, '-').replace(/^-+|-+$/gu, '').slice(0, 70) || 'step';
}

export function initialRotationScenarioImportMetadata(): RotationScenarioImportMetadata {
  return {
    version: ROTATION_SCENARIO_IMPORT_VERSION,
    sourceRotationId: '',
    timingStatus: 'none',
    report: null,
    originsByStepId: {},
    pendingByStepId: {},
  };
}

export function normalizeRotationScenarioImportMetadata(value: unknown): RotationScenarioImportMetadata | null {
  if (!isRecord(value) || value.version !== ROTATION_SCENARIO_IMPORT_VERSION) return null;
  const originsByStepId: Record<string, RotationScenarioStepOrigin> = {};
  if (isRecord(value.originsByStepId)) {
    for (const [stepId, raw] of Object.entries(value.originsByStepId)) {
      if (!isRecord(raw)) continue;
      const sourceStepId = safeText(raw.sourceStepId, 100);
      const part = typeof raw.part === 'number' && Number.isFinite(raw.part)
        ? Math.max(0, Math.min(20, Math.trunc(raw.part)))
        : 0;
      if (stepId && sourceStepId) originsByStepId[safeText(stepId, 80)] = { sourceStepId, part };
    }
  }

  const pendingByStepId: Record<string, PendingRotationCondition> = {};
  if (isRecord(value.pendingByStepId)) {
    for (const [stepId, raw] of Object.entries(value.pendingByStepId)) {
      if (!isRecord(raw)) continue;
      const sourceSlot = typeof raw.sourceSlot === 'number'
        ? Math.max(0, Math.min(3, Math.trunc(raw.sourceSlot)))
        : 0;
      if (raw.kind === 'activate-effect') {
        const effectId = safeText(raw.effectId, 160) as VerifiedTeamEffectId;
        if (verifiedTeamEffectById.has(effectId)) {
          pendingByStepId[safeText(stepId, 80)] = { kind: 'activate-effect', effectId, sourceSlot };
        }
      }
      if (raw.kind === 'activate-cycle') {
        const cycleId = safeText(raw.cycleId, 80) as EsperCycleId;
        if (verifiedCombatCycleModelById.has(cycleId)) {
          pendingByStepId[safeText(stepId, 80)] = { kind: 'activate-cycle', cycleId, sourceSlot };
        }
      }
    }
  }

  const sourceRotationId = safeText(value.sourceRotationId, 100);
  const timingStatus = value.timingStatus === 'order-only' || value.timingStatus === 'confirmed-seconds'
    ? value.timingStatus
    : 'none';
  const preset = rotationPresetById.get(sourceRotationId);
  const rawReport = isRecord(value.report) ? value.report : null;
  const report = preset && rawReport ? previewRotationScenarioImport(preset) : null;

  return {
    version: ROTATION_SCENARIO_IMPORT_VERSION,
    sourceRotationId: preset?.id ?? '',
    timingStatus: preset ? timingStatus : 'none',
    report,
    originsByStepId,
    pendingByStepId,
  };
}

function validatedBinding(preset: RotationPreset, step: RotationStep): RotationScenarioBinding | null {
  const candidate = rotationScenarioBindings[binding(preset.id, step.id)];
  if (!candidate) return null;

  if (candidate.kind === 'action-sequence') {
    if (!candidate.actionIds.length) return null;
    return candidate.actionIds.every((actionId) => visibleActionById.get(actionId)?.characterName === step.actor)
      ? candidate
      : null;
  }
  if (candidate.kind === 'activate-effect') {
    return verifiedTeamEffectById.get(candidate.effectId)?.sourceCharacter === step.actor ? candidate : null;
  }
  return step.cycle === candidate.cycleId && verifiedCombatCycleModelById.has(candidate.cycleId)
    ? candidate
    : null;
}

function stepNote(step: RotationStep, locale: Locale): string {
  return `${step.instruction[locale]} ${step.outcome[locale]}`.normalize('NFKC').trim().slice(0, 400);
}

function baseScenarioStep(
  preset: RotationPreset,
  sourceStep: RotationStep,
  sourceIndex: number,
  sourceSlot: number,
  part: number,
): CombatScenarioStep {
  const suffix = part > 0 ? `-${part + 1}` : '';
  return {
    id: safeId(`rotation-${preset.id}-${sourceStep.id}${suffix}`),
    at: Math.round((sourceIndex + part / 10) * 10) / 10,
    kind: 'wait',
    sourceSlot: Math.max(0, sourceSlot),
    actionId: '',
    effectId: '',
    cycleId: '',
    note: '',
  };
}

function importedSteps(preset: RotationPreset, locale: Locale): {
  steps: CombatScenarioStep[];
  metadata: RotationScenarioImportMetadata;
  report: RotationScenarioImportReport;
} {
  const steps: CombatScenarioStep[] = [];
  const originsByStepId: Record<string, RotationScenarioStepOrigin> = {};
  const pendingByStepId: Record<string, PendingRotationCondition> = {};
  let mappedSourceSteps = 0;
  let generatedActionSteps = 0;
  let generatedEffectSteps = 0;
  let generatedCycleSteps = 0;

  const append = (scenarioStep: CombatScenarioStep, sourceStep: RotationStep, part: number) => {
    steps.push(scenarioStep);
    originsByStepId[scenarioStep.id] = { sourceStepId: sourceStep.id, part };
  };

  preset.steps.forEach((sourceStep, sourceIndex) => {
    const sourceSlot = preset.team.indexOf(sourceStep.actor);
    const matched = sourceSlot >= 0 ? validatedBinding(preset, sourceStep) : null;

    if (!matched) {
      append({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, Math.max(0, sourceSlot), 0),
        note: stepNote(sourceStep, locale),
      }, sourceStep, 0);
      return;
    }

    mappedSourceSteps += 1;
    if (matched.kind === 'action-sequence') {
      matched.actionIds.forEach((actionId, part) => {
        append({
          ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
          kind: 'action',
          actionId,
        }, sourceStep, part);
        generatedActionSteps += 1;
      });
      return;
    }

    const pendingStep = {
      ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, 0),
      note: stepNote(sourceStep, locale),
    };
    append(pendingStep, sourceStep, 0);
    if (matched.kind === 'activate-effect') {
      pendingByStepId[pendingStep.id] = {
        kind: 'activate-effect',
        effectId: matched.effectId,
        sourceSlot,
      };
      generatedEffectSteps += 1;
      return;
    }
    pendingByStepId[pendingStep.id] = {
      kind: 'activate-cycle',
      cycleId: matched.cycleId,
      sourceSlot,
    };
    generatedCycleSteps += 1;
  });

  const unsupportedSourceSteps = preset.steps.length - mappedSourceSteps;
  const report: RotationScenarioImportReport = {
    presetId: preset.id,
    totalSourceSteps: preset.steps.length,
    mappedSourceSteps,
    generatedActionSteps,
    generatedEffectSteps,
    generatedCycleSteps,
    unsupportedSourceSteps,
    coveragePercent: preset.steps.length
      ? Math.round(mappedSourceSteps / preset.steps.length * 1_000) / 10
      : 0,
  };
  return {
    steps,
    report,
    metadata: {
      version: ROTATION_SCENARIO_IMPORT_VERSION,
      sourceRotationId: preset.id,
      timingStatus: 'order-only',
      report,
      originsByStepId,
      pendingByStepId,
    },
  };
}

export function previewRotationScenarioImport(preset: RotationPreset): RotationScenarioImportReport {
  return importedSteps(preset, 'ru').report;
}

export function importRotationPresetToScenario(
  preset: RotationPreset,
  currentTeam: GameVisibleTeamState,
  locale: Locale,
): RotationScenarioImportResult {
  if (preset.team.length !== 4 || new Set(preset.team).size !== 4) {
    throw new Error(`Rotation preset ${preset.id} must contain four unique characters.`);
  }
  const generated = importedSteps(preset, locale);
  const team: GameVisibleTeamState = {
    ...currentTeam,
    activeSlot: 0,
    builds: preset.team.map((characterName, index) => {
      const existing = currentTeam.builds[index];
      return existing?.characterName === characterName
        ? existing
        : createEmptyGameVisibleBuild(characterName);
    }),
  };
  const scenario: CombatScenarioState = {
    version: COMBAT_SCENARIO_VERSION,
    name: preset.title[locale],
    steps: generated.steps,
  };
  return { team, scenario, metadata: generated.metadata, report: generated.report };
}

export function confirmRotationScenarioTiming(
  scenario: CombatScenarioState,
  metadata: RotationScenarioImportMetadata,
): { scenario: CombatScenarioState; metadata: RotationScenarioImportMetadata } {
  if (metadata.timingStatus !== 'order-only') return { scenario, metadata };
  const steps = scenario.steps.map((step) => {
    const pending = metadata.pendingByStepId[step.id];
    if (!pending) return step;
    if (pending.kind === 'activate-effect') {
      return { ...step, kind: 'activate-effect' as const, sourceSlot: pending.sourceSlot, effectId: pending.effectId, cycleId: '' };
    }
    return { ...step, kind: 'activate-cycle' as const, sourceSlot: pending.sourceSlot, effectId: '', cycleId: pending.cycleId };
  });
  return {
    scenario: { ...scenario, steps },
    metadata: { ...metadata, timingStatus: 'confirmed-seconds' },
  };
}

export function invalidateRotationScenarioTiming(
  scenario: CombatScenarioState,
  metadata: RotationScenarioImportMetadata,
  locale: Locale,
): { scenario: CombatScenarioState; metadata: RotationScenarioImportMetadata } {
  if (metadata.timingStatus !== 'confirmed-seconds') return { scenario, metadata };
  const preset = rotationPresetById.get(metadata.sourceRotationId);
  const steps = scenario.steps.map((step) => {
    const pending = metadata.pendingByStepId[step.id];
    const origin = metadata.originsByStepId[step.id];
    if (!pending || !origin || !preset) return step;
    const sourceStep = preset.steps.find((entry) => entry.id === origin.sourceStepId);
    return {
      ...step,
      kind: 'wait' as const,
      actionId: '',
      effectId: '',
      cycleId: '',
      note: sourceStep ? stepNote(sourceStep, locale) : step.note,
    };
  });
  return {
    scenario: { ...scenario, steps },
    metadata: { ...metadata, timingStatus: 'order-only' },
  };
}

export function rotationSourceStep(
  metadata: RotationScenarioImportMetadata,
  scenarioStepId: string,
): { preset: RotationPreset; step: RotationStep; part: number } | null {
  const preset = rotationPresetById.get(metadata.sourceRotationId);
  const origin = metadata.originsByStepId[scenarioStepId];
  const step = preset?.steps.find((entry) => entry.id === origin?.sourceStepId);
  return preset && step && origin ? { preset, step, part: origin.part } : null;
}

export function validateRotationScenarioBindings(): string[] {
  const errors: string[] = [];
  const knownKeys = new Set<string>();
  for (const preset of rotationPresets) {
    for (const step of preset.steps) knownKeys.add(binding(preset.id, step.id));
  }
  for (const [key, candidate] of Object.entries(rotationScenarioBindings)) {
    if (!knownKeys.has(key)) {
      errors.push(`Unknown rotation step binding: ${key}`);
      continue;
    }
    const separator = key.indexOf(':');
    const preset = rotationPresetById.get(key.slice(0, separator));
    const step = preset?.steps.find((entry) => entry.id === key.slice(separator + 1));
    if (!preset || !step || validatedBinding(preset, step) !== candidate) {
      errors.push(`Invalid rotation scenario binding: ${key}`);
    }
  }
  return errors;
}
