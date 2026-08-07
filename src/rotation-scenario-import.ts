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
import { verifiedScenarioOperationById, type VerifiedScenarioOperationId } from './scenario-operations';
import { verifiedTeamEffectById, type VerifiedTeamEffectId } from './team-effects';
import type { EsperCycleId, Locale, LocalizedText, RotationPreset, RotationStep } from './types';
import { visibleActionById } from './verified-visible-actions';

export const ROTATION_SCENARIO_IMPORT_STORAGE_KEY = 'nte.team.scenario.rotation-import.v1';
export const ROTATION_SCENARIO_IMPORT_VERSION = 1 as const;

export type RotationScenarioSourceCoverage = 'full' | 'partial' | 'variant-required' | 'unsupported';

export type RotationScenarioBindingAtom =
  | { kind: 'action-sequence'; actionIds: readonly string[] }
  | { kind: 'activate-effect'; effectId: VerifiedTeamEffectId }
  | { kind: 'activate-cycle'; cycleId: EsperCycleId }
  | { kind: 'operation-marker'; operationId: VerifiedScenarioOperationId }
  | { kind: 'variant-marker'; variantId: string; note: LocalizedText };

export interface RotationScenarioBinding {
  coverage: Extract<RotationScenarioSourceCoverage, 'full' | 'partial'>;
  items: readonly RotationScenarioBindingAtom[];
}

export type RotationScenarioVariantSelectionValue = string | number;
export type RotationScenarioVariantSelections = Readonly<Record<string, RotationScenarioVariantSelectionValue>>;

interface RotationScenarioVariantControlBase {
  id: string;
  presetId: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface RotationScenarioSelectVariantControl extends RotationScenarioVariantControlBase {
  kind: 'select';
  options: readonly { id: string; label: LocalizedText; description: LocalizedText }[];
}

export interface RotationScenarioCountVariantControl extends RotationScenarioVariantControlBase {
  kind: 'count';
  minimum: number;
  maximum: number;
}

export type RotationScenarioVariantControl = RotationScenarioSelectVariantControl | RotationScenarioCountVariantControl;

export interface RotationScenarioVariantRequirement {
  presetId: string;
  sourceStepId: string;
  controlIds: readonly string[];
  rationale: LocalizedText;
}

export const rotationScenarioVariantControls: readonly RotationScenarioVariantControl[] = [
  {
    id: 'lacrimosa.form',
    presetId: 'lacrimosa-discord-dot',
    kind: 'select',
    title: { ru: 'Форма атак Лакримозы', en: 'Lacrimosa attack form' },
    description: { ru: 'Один выбор согласованно применяется к полной базовой цепочке и пятой атаке.', en: 'One selection is applied consistently to the full Basic string and fifth attack.' },
    options: [
      { id: 'tomato-metal', label: { ru: 'Tomato Metal · ближняя форма', en: 'Tomato Metal · melee form' }, description: { ru: '974,3% прямая цепочка; пятая атака 386,3%.', en: '974.3% direct string; 386.3% fifth attack.' } },
      { id: 'tomato-percussion', label: { ru: 'Tomato Percussion · дальняя форма', en: 'Tomato Percussion · ranged form' }, description: { ru: '1127,6% полная цепочка; пятая атака 247,7%.', en: '1127.6% full string; 247.7% fifth attack.' } },
    ],
  },
  {
    id: 'lacrimosa.redirect-skill',
    presetId: 'lacrimosa-discord-dot',
    kind: 'select',
    title: { ru: 'Вариант навыка перенаправления', en: 'Redirect Skill variant' },
    description: { ru: 'Morning Tomato имеет собственный коэффициент. Devilish Gift копирует внешнюю способность и остаётся видимым marker.', en: 'Morning Tomato has a native ratio. Devilish Gift copies an external ability and remains a visible marker.' },
    options: [
      { id: 'morning-tomato', label: { ru: 'Morning Tomato', en: 'Morning Tomato' }, description: { ru: 'Точный прямой урон 599,7% АТК.', en: 'Exact 599.7% ATK direct damage.' } },
      { id: 'devilish-gift', label: { ru: 'Devilish Gift', en: 'Devilish Gift' }, description: { ru: 'Урон зависит от скопированной внешней способности и не синтезируется.', en: 'Damage depends on the copied external ability and is not synthesized.' } },
    ],
  },
  {
    id: 'baicang.adler-ultimate-mode',
    presetId: 'baicang-firefly-hyper',
    kind: 'select',
    title: { ru: 'Режим сверхспособности Адлер', en: 'Adler Ultimate mode' },
    description: { ru: 'Источник допускает взаимоисключающие варианты на 5 или 10 попаданий.', en: 'The source allows mutually exclusive five-hit or ten-hit variants.' },
    options: [
      { id: 'five-target-hits', label: { ru: '5 попаданий по нескольким целям', en: '5 hits across multiple targets' }, description: { ru: 'Использует точный five-target action ID.', en: 'Uses the exact five-target action ID.' } },
      { id: 'single-enemy-ten-hits', label: { ru: '10 попаданий по одной цели', en: '10 hits against one enemy' }, description: { ru: 'Использует точный single-enemy ten-hit action ID.', en: 'Uses the exact single-enemy ten-hit action ID.' } },
    ],
  },
  {
    id: 'baicang.dodge-charged-count',
    presetId: 'baicang-firefly-hyper',
    kind: 'count',
    title: { ru: 'Число Dodge Charged Attack Байканг', en: 'Baicang Dodge Charged Attack count' },
    description: { ru: 'Задаёт конечное число Silenced Thought. Контратаки и Skill when ready остаются visible remainder.', en: 'Sets a finite Silenced Thought count. Counters and Skill when ready remain a visible remainder.' },
    minimum: 1,
    maximum: 20,
  },
];

export const rotationScenarioVariantRequirements: readonly RotationScenarioVariantRequirement[] = [
  { presetId: 'lacrimosa-discord-dot', sourceStepId: 'lacrimosa-transform', controlIds: ['lacrimosa.redirect-skill'], rationale: { ru: 'Нужно выбрать Morning Tomato либо Devilish Gift.', en: 'Choose Morning Tomato or Devilish Gift.' } },
  { presetId: 'lacrimosa-discord-dot', sourceStepId: 'lacrimosa-basic-five', controlIds: ['lacrimosa.form'], rationale: { ru: 'Нужно выбрать ближнюю либо дальнюю форму полной цепочки.', en: 'Choose the melee or ranged full string.' } },
  { presetId: 'lacrimosa-discord-dot', sourceStepId: 'lacrimosa-redirect-five', controlIds: ['lacrimosa.redirect-skill', 'lacrimosa.form'], rationale: { ru: 'Нужно выбрать Redirect Skill и согласованную форму пятой атаки.', en: 'Choose the Redirect Skill and matching fifth-attack form.' } },
  { presetId: 'baicang-firefly-hyper', sourceStepId: 'baicang-adler-open', controlIds: ['baicang.adler-ultimate-mode'], rationale: { ru: 'Нужно выбрать 5-hit либо 10-hit Ultimate Адлер.', en: 'Choose Adler five-hit or ten-hit Ultimate.' } },
  { presetId: 'baicang-firefly-hyper', sourceStepId: 'baicang-dodge-spam', controlIds: ['baicang.dodge-charged-count'], rationale: { ru: 'Нужно задать конечное число Dodge Charged Attack.', en: 'Set a finite Dodge Charged Attack count.' } },
];

const variantControlById = new Map(rotationScenarioVariantControls.map((control) => [control.id, control]));
export const rotationScenarioVariantSourceKeys = new Set(
  rotationScenarioVariantRequirements.map((requirement) => `${requirement.presetId}:${requirement.sourceStepId}`),
);

export function rotationScenarioVariantControlsForPreset(presetId: string): readonly RotationScenarioVariantControl[] {
  return rotationScenarioVariantControls.filter((control) => control.presetId === presetId);
}

export function normalizeRotationScenarioVariantSelections(
  presetId: string,
  value: unknown,
): RotationScenarioVariantSelections {
  if (!isRecord(value)) return {};
  const result: Record<string, RotationScenarioVariantSelectionValue> = {};
  for (const control of rotationScenarioVariantControlsForPreset(presetId)) {
    const raw = value[control.id];
    if (control.kind === 'select') {
      if (typeof raw === 'string' && control.options.some((option) => option.id === raw)) result[control.id] = raw;
      continue;
    }
    if (typeof raw === 'number' && Number.isInteger(raw) && raw >= control.minimum && raw <= control.maximum) {
      result[control.id] = raw;
    }
  }
  return result;
}

export function unresolvedRotationScenarioVariantControls(
  presetId: string,
  selections: RotationScenarioVariantSelections,
): readonly RotationScenarioVariantControl[] {
  const normalized = normalizeRotationScenarioVariantSelections(presetId, selections);
  return rotationScenarioVariantControlsForPreset(presetId).filter((control) => normalized[control.id] === undefined);
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
  generatedOperationSteps: number;
  generatedVariantMarkerSteps: number;
  variantRequiredSourceSteps: number;
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
  variantSelections: RotationScenarioVariantSelections;
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

  [binding('hathor-hyper', 'hathor-quickswap')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'zero.quick-swap-return-hathor' }],
  },
  [binding('hathor-hyper', 'energy-routing')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'hathor.reaction-energy-routing' }],
  },
  [binding('hathor-hyper', 'haniel-rebuild')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'haniel.energy-cycle-rebuild' }],
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
  [binding('chaos-remora-bomb', 'chaos-restart')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'hathor.cooldown-restart-chaos' }],
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
  [binding('nanally-hexed-dual', 'nanally-jiuyuan-open')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'jiuyuan.start-position-nanally' }],
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
  [binding('nanally-hexed-dual', 'nanally-energy-recovery')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'sakiri.energy-recovery-preserve-hexed' }],
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
  [binding('lacrimosa-discord-dot', 'lacrimosa-repeat-loop')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'lacrimosa.conditional-support-energy-loop' }],
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

  [binding('baicang-firefly-hyper', 'baicang-restart')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'adler.energy-check-restart' }],
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

function variantRequirementForStep(presetId: string, sourceStepId: string): RotationScenarioVariantRequirement | undefined {
  return rotationScenarioVariantRequirements.find((requirement) => (
    requirement.presetId === presetId && requirement.sourceStepId === sourceStepId
  ));
}

function lacrimosaFormAction(form: RotationScenarioVariantSelectionValue | undefined, fifth = false): string | null {
  if (form === 'tomato-metal') return fifth
    ? 'lacrimosa.tomato-metal.fifth.level-10'
    : 'lacrimosa.tomato-metal.full-direct-sequence.level-10';
  if (form === 'tomato-percussion') return fifth
    ? 'lacrimosa.tomato-percussion.fifth.level-10'
    : 'lacrimosa.tomato-percussion.full-sequence.level-10';
  return null;
}

function variantBindingForStep(
  preset: RotationPreset,
  step: RotationStep,
  selections: RotationScenarioVariantSelections,
): RotationScenarioBinding | null {
  const normalized = normalizeRotationScenarioVariantSelections(preset.id, selections);
  if (preset.id === 'lacrimosa-discord-dot') {
    const redirect = normalized['lacrimosa.redirect-skill'];
    const form = normalized['lacrimosa.form'];
    if (step.id === 'lacrimosa-transform') {
      if (redirect === 'morning-tomato') return {
        coverage: 'partial',
        items: [{ kind: 'action-sequence', actionIds: ['lacrimosa.morning-tomato.level-10'] }],
      };
      if (redirect === 'devilish-gift') return {
        coverage: 'partial',
        items: [{
          kind: 'variant-marker',
          variantId: 'lacrimosa.devilish-gift.copied-external-ability',
          note: {
            ru: 'Выбран Devilish Gift: прямой урон зависит от скопированной внешней способности и не добавлен в расчёт.',
            en: 'Devilish Gift selected: direct damage depends on the copied external ability and is not added to the calculation.',
          },
        }],
      };
      return null;
    }
    if (step.id === 'lacrimosa-basic-five') {
      const actionId = lacrimosaFormAction(form);
      return actionId ? { coverage: 'full', items: [{ kind: 'action-sequence', actionIds: [actionId] }] } : null;
    }
    if (step.id === 'lacrimosa-redirect-five') {
      const fifthActionId = lacrimosaFormAction(form, true);
      if (!fifthActionId || !redirect) return null;
      if (redirect === 'morning-tomato') return {
        coverage: 'full',
        items: [{ kind: 'action-sequence', actionIds: ['lacrimosa.morning-tomato.level-10', fifthActionId] }],
      };
      return {
        coverage: 'partial',
        items: [
          {
            kind: 'variant-marker',
            variantId: 'lacrimosa.devilish-gift.copied-external-ability',
            note: {
              ru: 'Devilish Gift выбран, но его скопированная внешняя способность не имеет фиксированного action ID.',
              en: 'Devilish Gift is selected, but its copied external ability has no fixed action ID.',
            },
          },
          { kind: 'action-sequence', actionIds: [fifthActionId] },
        ],
      };
    }
  }
  if (preset.id === 'baicang-firefly-hyper' && step.id === 'baicang-adler-open') {
    const mode = normalized['baicang.adler-ultimate-mode'];
    const ultimateId = mode === 'five-target-hits'
      ? 'adler.tranquility.five-target-hits.level-10'
      : mode === 'single-enemy-ten-hits'
        ? 'adler.tranquility.single-enemy-ten-hits.level-10'
        : null;
    return ultimateId ? {
      coverage: 'full',
      items: [{ kind: 'action-sequence', actionIds: [ultimateId, 'adler.evils-bane.initial-composition.level-10'] }],
    } : null;
  }
  if (preset.id === 'baicang-firefly-hyper' && step.id === 'baicang-dodge-spam') {
    const count = normalized['baicang.dodge-charged-count'];
    if (typeof count !== 'number') return null;
    return {
      coverage: 'partial',
      items: [
        { kind: 'action-sequence', actionIds: Array.from({ length: count }, () => 'baicang.silenced-thought.full-composition.level-10') },
        {
          kind: 'variant-marker',
          variantId: 'baicang.dodge-spam.counter-and-skill-order',
          note: {
            ru: 'Число Dodge Charged Attack задано пользователем. Количество и порядок контратак и навыка по готовности источник не фиксирует.',
            en: 'The Dodge Charged Attack count is user-selected. The source does not fix the count or order of counters and Skill casts when ready.',
          },
        },
      ],
    };
  }
  return null;
}

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
    variantSelections: {},
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
      const coverage = raw.coverage === 'full' || raw.coverage === 'partial' || raw.coverage === 'variant-required' || raw.coverage === 'unsupported'
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
  const variantSelections = normalizeRotationScenarioVariantSelections(preset?.id ?? '', value.variantSelections);
  const rawReport = isRecord(value.report) ? value.report : null;
  const report = preset && rawReport ? previewRotationScenarioImport(preset, variantSelections) : null;

  if (preset) {
    for (const origin of Object.values(originsByStepId)) {
      if (origin.coverage) continue;
      const sourceStep = preset.steps.find((step) => step.id === origin.sourceStepId);
      origin.coverage = sourceStep
        ? validatedBinding(preset, sourceStep, variantSelections)?.coverage
          ?? (variantRequirementForStep(preset.id, sourceStep.id) ? 'variant-required' : 'unsupported')
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
    variantSelections,
  };
}

function atomFingerprint(atom: RotationScenarioBindingAtom): string {
  if (atom.kind === 'action-sequence') return `actions:${atom.actionIds.join(',')}`;
  if (atom.kind === 'activate-effect') return `effect:${atom.effectId}`;
  if (atom.kind === 'activate-cycle') return `cycle:${atom.cycleId}`;
  if (atom.kind === 'operation-marker') return `operation:${atom.operationId}`;
  return `variant:${atom.variantId}`;
}

function validBindingAtom(preset: RotationPreset, step: RotationStep, atom: RotationScenarioBindingAtom): boolean {
  if (atom.kind === 'action-sequence') {
    return atom.actionIds.length > 0
      && atom.actionIds.every((actionId) => visibleActionById.get(actionId)?.characterName === step.actor);
  }
  if (atom.kind === 'activate-effect') {
    return verifiedTeamEffectById.get(atom.effectId)?.sourceCharacter === step.actor;
  }
  if (atom.kind === 'activate-cycle') {
    return step.cycle === atom.cycleId && verifiedCombatCycleModelById.has(atom.cycleId);
  }
  if (atom.kind === 'operation-marker') {
    const operation = verifiedScenarioOperationById.get(atom.operationId);
    return operation?.presetId === preset.id
      && operation.sourceStepId === step.id
      && operation.sourceCharacter === step.actor;
  }
  return Boolean(atom.variantId && atom.note.ru && atom.note.en);
}

function validatedBinding(
  preset: RotationPreset,
  step: RotationStep,
  selections: RotationScenarioVariantSelections = {},
): RotationScenarioBinding | null {
  const candidate = rotationScenarioBindings[binding(preset.id, step.id)]
    ?? variantBindingForStep(preset, step, selections);
  if (!candidate || candidate.items.length === 0) return null;
  const fingerprints = candidate.items.map(atomFingerprint);
  if (new Set(fingerprints).size !== fingerprints.length) return null;
  return candidate.items.every((atom) => validBindingAtom(preset, step, atom)) ? candidate : null;
}

function stepNote(step: RotationStep, locale: Locale): string {
  return `${step.instruction[locale]} ${step.outcome[locale]}`.normalize('NFKC').trim().slice(0, 400);
}

function variantRequiredNote(preset: RotationPreset, step: RotationStep, locale: Locale): string {
  const requirement = variantRequirementForStep(preset.id, step.id);
  const prefix = locale === 'ru' ? 'Требуется выбор варианта:' : 'Variant selection required:';
  return `${prefix} ${requirement?.rationale[locale] ?? stepNote(step, locale)}`.slice(0, 400);
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
    operationId: '',
    note: '',
  };
}

function importedSteps(
  preset: RotationPreset,
  locale: Locale,
  selections: RotationScenarioVariantSelections = {},
): {
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
  let generatedOperationSteps = 0;
  let generatedVariantMarkerSteps = 0;
  let variantRequiredSourceSteps = 0;
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
    const matched = sourceSlot >= 0 ? validatedBinding(preset, sourceStep, selections) : null;

    if (!matched) {
      const variantRequired = sourceSlot >= 0 && Boolean(variantRequirementForStep(preset.id, sourceStep.id));
      append({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, Math.max(0, sourceSlot), 0),
        note: variantRequired ? variantRequiredNote(preset, sourceStep, locale) : stepNote(sourceStep, locale),
      }, sourceStep, 0, variantRequired ? 'variant-required' : 'unsupported');
      if (variantRequired) variantRequiredSourceSteps += 1;
      return;
    }

    if (matched.coverage === 'full') fullyMappedSourceSteps += 1;
    else partiallyMappedSourceSteps += 1;

    let part = 0;
    let hasVariantMarker = false;
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

      if (atom.kind === 'variant-marker') {
        append({
          ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
          note: atom.note[locale],
        }, sourceStep, part, matched.coverage);
        generatedVariantMarkerSteps += 1;
        hasVariantMarker = true;
        part += 1;
        continue;
      }

      if (atom.kind === 'operation-marker') {
        append({
          ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
          kind: 'operation',
          operationId: atom.operationId,
          note: stepNote(sourceStep, locale),
        }, sourceStep, part, matched.coverage);
        generatedOperationSteps += 1;
        part += 1;
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

    if (matched.coverage === 'partial' && !hasVariantMarker) {
      append({
        ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),
        note: partialRemainderNote(sourceStep, locale),
      }, sourceStep, part, 'partial');
      generatedPartialRemainderSteps += 1;
    }
  });

  const mappedSourceSteps = fullyMappedSourceSteps + partiallyMappedSourceSteps;
  const unsupportedSourceSteps = preset.steps.length - mappedSourceSteps - variantRequiredSourceSteps;
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
    generatedOperationSteps,
    generatedVariantMarkerSteps,
    variantRequiredSourceSteps,
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
      variantSelections: normalizeRotationScenarioVariantSelections(preset.id, selections),
    },
  };
}

export function previewRotationScenarioImport(
  preset: RotationPreset,
  selections: RotationScenarioVariantSelections = {},
): RotationScenarioImportReport {
  return importedSteps(preset, 'ru', selections).report;
}

export function importRotationPresetToScenario(
  preset: RotationPreset,
  currentTeam: GameVisibleTeamState,
  locale: Locale,
  selections: RotationScenarioVariantSelections = {},
): RotationScenarioImportResult {
  if (preset.team.length !== 4 || new Set(preset.team).size !== 4) {
    throw new Error(`Rotation preset ${preset.id} must contain four unique characters.`);
  }
  const normalizedSelections = normalizeRotationScenarioVariantSelections(preset.id, selections);
  const unresolved = unresolvedRotationScenarioVariantControls(preset.id, normalizedSelections);
  if (unresolved.length > 0) {
    throw new Error(`Rotation preset ${preset.id} requires variant selections: ${unresolved.map((control) => control.id).join(', ')}`);
  }
  const generated = importedSteps(preset, locale, normalizedSelections);
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
    coverage: origin.coverage
      ?? validatedBinding(preset, step, metadata.variantSelections)?.coverage
      ?? (variantRequirementForStep(preset.id, step.id) ? 'variant-required' : 'unsupported'),
  } : null;
}

export function validateRotationScenarioBindings(): string[] {
  const errors: string[] = [];
  const knownKeys = new Set<string>();
  for (const preset of rotationPresets) {
    for (const step of preset.steps) knownKeys.add(binding(preset.id, step.id));
  }
  for (const control of rotationScenarioVariantControls) {
    if (!rotationPresetById.has(control.presetId)) errors.push(`Unknown variant-control preset: ${control.id}`);
    if (control.kind === 'select' && (control.options.length < 2 || new Set(control.options.map((option) => option.id)).size !== control.options.length)) {
      errors.push(`Invalid select variant control: ${control.id}`);
    }
    if (control.kind === 'count' && (!Number.isInteger(control.minimum) || !Number.isInteger(control.maximum) || control.minimum < 0 || control.maximum < control.minimum)) {
      errors.push(`Invalid count variant control: ${control.id}`);
    }
  }
  for (const requirement of rotationScenarioVariantRequirements) {
    const key = binding(requirement.presetId, requirement.sourceStepId);
    if (!knownKeys.has(key)) errors.push(`Unknown variant source step: ${key}`);
    if (rotationScenarioBindings[key]) errors.push(`Variant source step also has a fixed binding: ${key}`);
    for (const controlId of requirement.controlIds) {
      const control = variantControlById.get(controlId);
      if (!control || control.presetId !== requirement.presetId) errors.push(`Invalid variant control reference: ${key}:${controlId}`);
    }
  }
  const sampleSelections: Record<string, Record<string, RotationScenarioVariantSelectionValue>> = {};
  for (const control of rotationScenarioVariantControls) {
    sampleSelections[control.presetId] ??= {};
    sampleSelections[control.presetId]![control.id] = control.kind === 'select' ? control.options[0]!.id : control.minimum;
  }
  for (const requirement of rotationScenarioVariantRequirements) {
    const preset = rotationPresetById.get(requirement.presetId);
    const step = preset?.steps.find((entry) => entry.id === requirement.sourceStepId);
    if (preset && step && !validatedBinding(preset, step, sampleSelections[preset.id] ?? {})) {
      errors.push(`Unresolvable variant source step: ${requirement.presetId}:${requirement.sourceStepId}`);
    }
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
