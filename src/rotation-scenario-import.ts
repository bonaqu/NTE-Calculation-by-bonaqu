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

export interface RotationScenarioImportResult {
  team: GameVisibleTeamState;
  scenario: CombatScenarioState;
  report: RotationScenarioImportReport;
}

const binding = (presetId: string, stepId: string) => `${presetId}:${stepId}`;

/**
 * Exact source-step bindings only. Text similarity is deliberately not used.
 * A stale or invalid binding becomes an unsupported wait step during import.
 */
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

function safeId(value: string): string {
  return value.replace(/[^a-z0-9._-]+/giu, '-').replace(/^-+|-+$/gu, '').slice(0, 70) || 'step';
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
    sourceRotationStepId: sourceStep.id,
    sourceRotationStepPart: part,
  };
}

function importedSteps(preset: RotationPreset, locale: Locale): {
  steps: CombatScenarioStep[];
  report: RotationScenarioImportReport;
} {
  const steps: CombatScenarioStep[] = [];
  let mappedSourceSteps = 0;
  let generatedActionSteps = 0;
  let generatedEffectSteps = 0;
  let generatedCycleSteps = 0;

  preset.steps.forEach((sourceStep, sourceIndex) => {
    const sourceSlot = preset.team.indexOf(sourceStep.actor);
    const matched = sourceSlot >= 0 ? validatedBinding(preset, sourceStep) : null;

    if (!matched) {
      steps.push({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, Math.max(0, sourceSlot), 0),
        note: stepNote(sourceStep, locale),
      });
      return;
    }

    mappedSourceSteps += 1;
    if (matched.kind === 'action-sequence') {
      matched.actionIds.forEach((actionId, part) => {
        steps.push({
          ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
          kind: 'action',
          actionId,
        });
        generatedActionSteps += 1;
      });
      return;
    }

    if (matched.kind === 'activate-effect') {
      steps.push({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, 0),
        kind: 'activate-effect',
        effectId: matched.effectId,
      });
      generatedEffectSteps += 1;
      return;
    }

    steps.push({
      ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, 0),
      kind: 'activate-cycle',
      cycleId: matched.cycleId,
    });
    generatedCycleSteps += 1;
  });

  const unsupportedSourceSteps = preset.steps.length - mappedSourceSteps;
  return {
    steps,
    report: {
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
    timingStatus: 'order-only',
    sourceRotationId: preset.id,
    steps: generated.steps,
  };
  return { team, scenario, report: generated.report };
}

export function rotationSourceStep(
  presetId: string | undefined,
  stepId: string | undefined,
): { preset: RotationPreset; step: RotationStep } | null {
  if (!presetId || !stepId) return null;
  const preset = rotationPresetById.get(presetId);
  const step = preset?.steps.find((entry) => entry.id === stepId);
  return preset && step ? { preset, step } : null;
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
