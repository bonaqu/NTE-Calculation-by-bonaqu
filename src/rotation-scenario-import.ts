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

export type RotationScenarioSourceCoverage = 'full' | 'partial' | 'unsupported';

export type RotationScenarioBindingAtom =
  | { kind: 'action-sequence'; actionIds: readonly string[] }
  | { kind: 'activate-effect'; effectId: VerifiedTeamEffectId }
  | { kind: 'activate-cycle'; cycleId: EsperCycleId };

export interface RotationScenarioBinding {
  coverage: Exclude<RotationScenarioSourceCoverage, 'unsupported'>;
  items: readonly RotationScenarioBindingAtom[];
}

export interface RotationScenarioImportReport {
  presetId: string;
  totalSourceSteps: number;
  fullyMappedSourceSteps: number;
  partiallyMappedSourceSteps: number;
  mappedSourceSteps: number;
  generatedActionSteps: number;
  generatedEffectSteps: number;
  generatedCycleSteps: number;
  generatedPartialRemainderSteps: number;
  unsupportedSourceSteps: number;
  coveragePercent: number;
}

export interface RotationScenarioStepOrigin {
  sourceStepId: string;
  part: number;
  coverage?: RotationScenarioSourceCoverage;
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

const hanielSetupItems: readonly RotationScenarioBindingAtom[] = [
  {
    kind: 'action-sequence',
    actionIds: [
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
    ],
  },
  { kind: 'activate-effect', effectId: 'haniel.friendship.nova-atk-drain' },
];

const sakiriSetupItems: readonly RotationScenarioBindingAtom[] = [
  { kind: 'action-sequence', actionIds: ['sakiri.feast-of-gluttony.level-10'] },
  { kind: 'activate-effect', effectId: 'sakiri.awakening-four.team-atk' },
  { kind: 'activate-effect', effectId: 'sakiri.impish-trick.def-reduction' },
];

const daffodillUltimateRedirectItems: readonly RotationScenarioBindingAtom[] = [
  {
    kind: 'action-sequence',
    actionIds: [
      'daffodill.finale.initial-composition.level-10',
      'daffodill.echoes.enhanced-sequence.level-10',
    ],
  },
];

const hathorBurstItems: readonly RotationScenarioBindingAtom[] = [
  {
    kind: 'action-sequence',
    actionIds: [
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ],
  },
];

const fiveScarletDescentActions = Array.from(
  { length: 5 },
  () => 'shinku.scarlet-descent.level-10',
);
const threeCrimsonJudgmentActions = Array.from(
  { length: 3 },
  () => 'shinku.crimson-judgment.one-dash.level-10',
);

/** Exact source-step bindings only. Text similarity is deliberately not used. */
export const rotationScenarioBindings: Readonly<Record<string, RotationScenarioBinding>> = {
  [binding('shinku-charge', 'shinku-prep')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['shinku.high-speed-breach.level-10'] }],
  },
  [binding('shinku-charge', 'hathor-open')]: {
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
  },
  [binding('shinku-charge', 'zero-fill')]: {
    coverage: 'partial',
    items: [{
      kind: 'action-sequence',
      actionIds: ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],
    }],
  },
  [binding('shinku-charge', 'nanally-charge')]: {
    coverage: 'partial',
    items: [
      {
        kind: 'action-sequence',
        actionIds: [
          'nanally.colucci-ultimate-technique.initial.level-10',
          'nanally.colucci-howling-technique.level-10',
        ],
      },
    ],
  },
  [binding('shinku-charge', 'shinku-ultimate')]: {
    coverage: 'partial',
    items: [
      { kind: 'action-sequence', actionIds: ['shinku.crimson-fury.level-10'] },
      { kind: 'activate-effect', effectId: 'shinku.surging-crimson.damage' },
    ],
  },
  [binding('shinku-charge', 'shinku-enhanced-skills')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: fiveScarletDescentActions }],
  },
  [binding('shinku-charge', 'shinku-dashes')]: {
    coverage: 'full',
    items: [{
      kind: 'action-sequence',
      actionIds: [
        ...threeCrimsonJudgmentActions,
        'shinku.dragonflame-verdict.level-10',
      ],
    }],
  },
  [binding('shinku-charge', 'shinku-recovery')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['shinku.high-speed-breach.level-10'] }],
  },

  [binding('hathor-hyper', 'jiuyuan-open')]: {
    coverage: 'partial',
    items: [{
      kind: 'action-sequence',
      actionIds: ['jiuyuan.final-reckoning.direct.level-10', 'jiuyuan.intel-hunter.direct.level-10'],
    }],
  },
  [binding('hathor-hyper', 'zero-blossom')]: {
    coverage: 'partial',
    items: [
      { kind: 'action-sequence', actionIds: ['zero.divide-by-zero.level-10'] },
    ],
  },
  [binding('hathor-hyper', 'haniel-buffs')]: {
    coverage: 'partial',
    items: hanielSetupItems,
  },
  [binding('hathor-hyper', 'hathor-stain')]: {
    coverage: 'partial',
    items: [{ kind: 'activate-cycle', cycleId: 'stain' }],
  },
  [binding('hathor-hyper', 'hathor-charge')]: {
    coverage: 'partial',
    items: [{ kind: 'activate-effect', effectId: 'hathor.delay-warning.remora-crit-rate' }],
  },
  [binding('hathor-hyper', 'hathor-ultimate')]: {
    coverage: 'full',
    items: hathorBurstItems,
  },
  [binding('hathor-hyper', 'zero-third-strike')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['zero.appraise-and-engrave.main.level-10'] }],
  },
  [binding('hathor-hyper', 'jiuyuan-second-charge')]: {
    coverage: 'partial',
    items: [{ kind: 'activate-cycle', cycleId: 'charge' }],
  },

  [binding('chaos-remora-bomb', 'chaos-hathor-redirect')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['hathor.aerial-command.full-hold.level-10'] }],
  },
  [binding('chaos-remora-bomb', 'chaos-zero-remora')]: {
    coverage: 'partial',
    items: [
      { kind: 'action-sequence', actionIds: ['zero.divide-by-zero.level-10'] },
    ],
  },
  [binding('chaos-remora-bomb', 'chaos-haniel-buffs')]: {
    coverage: 'partial',
    items: hanielSetupItems,
  },
  [binding('chaos-remora-bomb', 'chaos-stain')]: {
    coverage: 'partial',
    items: [
      { kind: 'action-sequence', actionIds: ['chaos.doubtmark.full-sequence.level-10'] },
      { kind: 'activate-cycle', cycleId: 'stain' },
    ],
  },
  [binding('chaos-remora-bomb', 'chaos-ultimate')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['chaos.retribution.initial.level-10'] }],
  },
  [binding('chaos-remora-bomb', 'chaos-heavy-one')]: {
    coverage: 'full',
    items: [{ kind: 'action-sequence', actionIds: ['chaos.final-verdict.enhanced.level-10'] }],
  },
  [binding('chaos-remora-bomb', 'chaos-heavy-two')]: {
    coverage: 'full',
    items: [{ kind: 'action-sequence', actionIds: ['chaos.final-verdict.enhanced.level-10'] }],
  },
  [binding('chaos-remora-bomb', 'chaos-return-hathor')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['hathor.rider-express.level-10'] }],
  },

  [binding('nanally-hexed-dual', 'nanally-jiuyuan-hexed')]: {
    coverage: 'partial',
    items: [{
      kind: 'action-sequence',
      actionIds: ['jiuyuan.final-reckoning.direct.level-10', 'jiuyuan.intel-hunter.direct.level-10'],
    }],
  },
  [binding('nanally-hexed-dual', 'nanally-zero-blossom')]: {
    coverage: 'partial',
    items: [
      {
        kind: 'action-sequence',
        actionIds: ['zero.appraise-and-engrave.main.level-10', 'zero.divide-by-zero.level-10'],
      },
    ],
  },
  [binding('nanally-hexed-dual', 'nanally-sakiri-setup')]: {
    coverage: 'partial',
    items: sakiriSetupItems,
  },
  [binding('nanally-hexed-dual', 'nanally-redirect')]: {
    coverage: 'partial',
    items: [
      { kind: 'action-sequence', actionIds: ['nanally.colucci-howling-technique.level-10'] },
      { kind: 'activate-effect', effectId: 'nanally.ichi-daime-authority.crit-dmg' },
    ],
  },
  [binding('nanally-hexed-dual', 'nanally-ultimate')]: {
    coverage: 'partial',
    items: [{ kind: 'action-sequence', actionIds: ['nanally.colucci-ultimate-technique.initial.level-10'] }],
  },
  [binding('nanally-hexed-dual', 'nanally-basic-string')]: {
    coverage: 'full',
    items: [{
      kind: 'action-sequence',
      actionIds: [
        'nanally.colucci-secret-skill.full-sequence.level-10',
        'nanally.underboss.basic-coordinated-full-sequence.level-10',
      ],
    }],
  },
  [binding('nanally-hexed-dual', 'nanally-charged-string')]: {
    coverage: 'full',
    items: [{
      kind: 'action-sequence',
      actionIds: [
        'nanally.heavy-hitter.full-sequence.level-10',
        'nanally.underboss.heavy-coordinated-full-sequence.level-10',
      ],
    }],
  },

  [binding('lacrimosa-discord-dot', 'lacrimosa-haniel-open')]: {
    coverage: 'partial',
    items: hanielSetupItems,
  },
  [binding('lacrimosa-discord-dot', 'lacrimosa-sakiri-buffs')]: {
    coverage: 'partial',
    items: sakiriSetupItems,
  },
  [binding('lacrimosa-discord-dot', 'lacrimosa-scorch')]: {
    coverage: 'partial',
    items: [{ kind: 'activate-cycle', cycleId: 'scorch' }],
  },
  [binding('lacrimosa-discord-dot', 'lacrimosa-discord')]: {
    coverage: 'partial',
    items: [{ kind: 'activate-cycle', cycleId: 'discord' }],
  },
  [binding('lacrimosa-discord-dot', 'lacrimosa-daffodill-open')]: {
    coverage: 'partial',
    items: daffodillUltimateRedirectItems,
  },
  [binding('lacrimosa-discord-dot', 'lacrimosa-phantom-one')]: {
    coverage: 'full',
    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],
  },
  [binding('lacrimosa-discord-dot', 'lacrimosa-phantom-two')]: {
    coverage: 'full',
    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],
  },

  [binding('baicang-firefly-hyper', 'baicang-sakiri-buff')]: {
    coverage: 'partial',
    items: sakiriSetupItems,
  },
  [binding('baicang-firefly-hyper', 'baicang-daffodill-open')]: {
    coverage: 'partial',
    items: daffodillUltimateRedirectItems,
  },
  [binding('baicang-firefly-hyper', 'baicang-swap-ultimate')]: {
    coverage: 'full',
    items: [{
      kind: 'action-sequence',
      actionIds: ['baicang.judgment-of-autumn.expansion.level-10'],
    }],
  },
  [binding('baicang-firefly-hyper', 'baicang-basic-three')]: {
    coverage: 'partial',
    items: [{
      kind: 'action-sequence',
      actionIds: ['baicang.heart-of-heaven-and-earth.level-10'],
    }],
  },
  [binding('baicang-firefly-hyper', 'baicang-phantom-one')]: {
    coverage: 'full',
    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],
  },
  [binding('baicang-firefly-hyper', 'baicang-dodge-charged-one')]: {
    coverage: 'full',
    items: [{
      kind: 'action-sequence',
      actionIds: ['baicang.silenced-thought.full-composition.level-10'],
    }],
  },
  [binding('baicang-firefly-hyper', 'baicang-phantom-two')]: {
    coverage: 'full',
    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],
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
        ? Math.max(0, Math.min(40, Math.trunc(raw.part)))
        : 0;
      const coverage = raw.coverage === 'full' || raw.coverage === 'partial' || raw.coverage === 'unsupported'
        ? raw.coverage
        : undefined;
      if (stepId && sourceStepId) {
        originsByStepId[safeText(stepId, 80)] = {
          sourceStepId,
          part,
          ...(coverage ? { coverage } : {}),
        };
      }
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

  if (preset) {
    for (const origin of Object.values(originsByStepId)) {
      if (origin.coverage) continue;
      const sourceStep = preset.steps.find((step) => step.id === origin.sourceStepId);
      origin.coverage = sourceStep
        ? validatedBinding(preset, sourceStep)?.coverage ?? 'unsupported'
        : 'unsupported';
    }
  }

  return {
    version: ROTATION_SCENARIO_IMPORT_VERSION,
    sourceRotationId: preset?.id ?? '',
    timingStatus: preset ? timingStatus : 'none',
    report,
    originsByStepId,
    pendingByStepId,
  };
}

function atomFingerprint(atom: RotationScenarioBindingAtom): string {
  if (atom.kind === 'action-sequence') return `actions:${atom.actionIds.join(',')}`;
  if (atom.kind === 'activate-effect') return `effect:${atom.effectId}`;
  return `cycle:${atom.cycleId}`;
}

function validBindingAtom(step: RotationStep, atom: RotationScenarioBindingAtom): boolean {
  if (atom.kind === 'action-sequence') {
    return atom.actionIds.length > 0
      && atom.actionIds.every((actionId) => visibleActionById.get(actionId)?.characterName === step.actor);
  }
  if (atom.kind === 'activate-effect') {
    return verifiedTeamEffectById.get(atom.effectId)?.sourceCharacter === step.actor;
  }
  return step.cycle === atom.cycleId && verifiedCombatCycleModelById.has(atom.cycleId);
}

function validatedBinding(preset: RotationPreset, step: RotationStep): RotationScenarioBinding | null {
  const candidate = rotationScenarioBindings[binding(preset.id, step.id)];
  if (!candidate || candidate.items.length === 0) return null;
  const fingerprints = candidate.items.map(atomFingerprint);
  if (new Set(fingerprints).size !== fingerprints.length) return null;
  return candidate.items.every((atom) => validBindingAtom(step, atom)) ? candidate : null;
}

function stepNote(step: RotationStep, locale: Locale): string {
  return `${step.instruction[locale]} ${step.outcome[locale]}`.normalize('NFKC').trim().slice(0, 400);
}

function partialRemainderNote(step: RotationStep, locale: Locale): string {
  const prefix = locale === 'ru' ? 'Непокрытая часть исходного шага:' : 'Unsupported remainder of the source step:';
  return `${prefix} ${stepNote(step, locale)}`.slice(0, 400);
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
  let fullyMappedSourceSteps = 0;
  let partiallyMappedSourceSteps = 0;
  let generatedActionSteps = 0;
  let generatedEffectSteps = 0;
  let generatedCycleSteps = 0;
  let generatedPartialRemainderSteps = 0;

  const append = (
    scenarioStep: CombatScenarioStep,
    sourceStep: RotationStep,
    part: number,
    coverage: RotationScenarioSourceCoverage,
  ) => {
    steps.push(scenarioStep);
    originsByStepId[scenarioStep.id] = { sourceStepId: sourceStep.id, part, coverage };
  };

  preset.steps.forEach((sourceStep, sourceIndex) => {
    const sourceSlot = preset.team.indexOf(sourceStep.actor);
    const matched = sourceSlot >= 0 ? validatedBinding(preset, sourceStep) : null;

    if (!matched) {
      append({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, Math.max(0, sourceSlot), 0),
        note: stepNote(sourceStep, locale),
      }, sourceStep, 0, 'unsupported');
      return;
    }

    if (matched.coverage === 'full') fullyMappedSourceSteps += 1;
    else partiallyMappedSourceSteps += 1;

    let part = 0;
    for (const atom of matched.items) {
      if (atom.kind === 'action-sequence') {
        for (const actionId of atom.actionIds) {
          append({
            ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
            kind: 'action',
            actionId,
          }, sourceStep, part, matched.coverage);
          generatedActionSteps += 1;
          part += 1;
        }
        continue;
      }

      const pendingStep = {
        ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
        note: stepNote(sourceStep, locale),
      };
      append(pendingStep, sourceStep, part, matched.coverage);
      if (atom.kind === 'activate-effect') {
        pendingByStepId[pendingStep.id] = {
          kind: 'activate-effect',
          effectId: atom.effectId,
          sourceSlot,
        };
        generatedEffectSteps += 1;
      } else {
        pendingByStepId[pendingStep.id] = {
          kind: 'activate-cycle',
          cycleId: atom.cycleId,
          sourceSlot,
        };
        generatedCycleSteps += 1;
      }
      part += 1;
    }

    if (matched.coverage === 'partial') {
      append({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
        note: partialRemainderNote(sourceStep, locale),
      }, sourceStep, part, 'partial');
      generatedPartialRemainderSteps += 1;
    }
  });

  const mappedSourceSteps = fullyMappedSourceSteps + partiallyMappedSourceSteps;
  const unsupportedSourceSteps = preset.steps.length - mappedSourceSteps;
  const weightedMappedSteps = fullyMappedSourceSteps + partiallyMappedSourceSteps * 0.5;
  const report: RotationScenarioImportReport = {
    presetId: preset.id,
    totalSourceSteps: preset.steps.length,
    fullyMappedSourceSteps,
    partiallyMappedSourceSteps,
    mappedSourceSteps,
    generatedActionSteps,
    generatedEffectSteps,
    generatedCycleSteps,
    generatedPartialRemainderSteps,
    unsupportedSourceSteps,
    coveragePercent: preset.steps.length
      ? Math.round(weightedMappedSteps / preset.steps.length * 1_000) / 10
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
): { preset: RotationPreset; step: RotationStep; part: number; coverage: RotationScenarioSourceCoverage } | null {
  const preset = rotationPresetById.get(metadata.sourceRotationId);
  const origin = metadata.originsByStepId[scenarioStepId];
  const step = preset?.steps.find((entry) => entry.id === origin?.sourceStepId);
  return preset && step && origin ? {
    preset,
    step,
    part: origin.part,
    coverage: origin.coverage ?? validatedBinding(preset, step)?.coverage ?? 'unsupported',
  } : null;
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
