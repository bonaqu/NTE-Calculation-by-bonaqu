import { verifiedCombatCycleModelById } from './combat-cycle-models';
import {
  COMBAT_SCENARIO_VERSION,
  type CombatScenarioState,
  type CombatScenarioStep,
} from './combat-scenario';
import type { GameVisibleTeamState } from './game-visible-build';
import {
  previewRotationScenarioImport,
  ROTATION_SCENARIO_IMPORT_VERSION,
  rotationScenarioBindings,
  type RotationScenarioBinding,
  type RotationScenarioBindingAtom,
  type RotationScenarioImportMetadata,
  type RotationScenarioSourceCoverage,
} from './rotation-scenario-import';
import { rotationPresetById, rotationPresets } from './rotation-presets';
import { verifiedTeamEffectById } from './team-effects';
import type { LocalizedText, RotationPreset, RotationStep } from './types';
import { visibleActionById } from './verified-visible-actions';

export const VERIFIED_ROTATION_RECIPE_VERSION = 1 as const;

export type VerifiedRotationRecipeCoverage = 'complete-action-order' | 'partial-action-order';
export type VerifiedRotationRecipeTimingMode = 'order-only' | 'confirmed-seconds';

export interface VerifiedRotationRecipeStep {
  actionId: string;
  characterName: string;
  sourceStepId: string;
  sourceStepIndex: number;
  part: number;
  sourceCoverage: Exclude<RotationScenarioSourceCoverage, 'unsupported'>;
}

export type VerifiedRotationRecipeGapKind =
  | 'unsupported-source-step'
  | 'partial-source-step-remainder'
  | 'unconfirmed-effect'
  | 'unconfirmed-cycle';

export interface VerifiedRotationRecipeGap {
  sourceStepId: string;
  sourceStepIndex: number;
  part: number;
  kind: VerifiedRotationRecipeGapKind;
  note: LocalizedText;
}

export interface VerifiedRotationRecipe {
  version: typeof VERIFIED_ROTATION_RECIPE_VERSION;
  id: string;
  presetId: string;
  title: LocalizedText;
  description: LocalizedText;
  team: readonly string[];
  coverage: VerifiedRotationRecipeCoverage;
  timingMode: VerifiedRotationRecipeTimingMode;
  steps: readonly VerifiedRotationRecipeStep[];
  gaps: readonly VerifiedRotationRecipeGap[];
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export type RotationRepeatEvidenceKind = 'fixed-count' | 'condition-bound';

export interface RotationRepeatEvidence {
  presetId: string;
  sourceStepIds: readonly string[];
  kind: RotationRepeatEvidenceKind;
  count: number | null;
  action: LocalizedText;
  note: LocalizedText;
  promotedActionIds?: readonly string[];
}

export interface RotationConfirmedSecondEvidence {
  presetId: string;
  sourceStepId: string;
  seconds: number;
  relation: LocalizedText;
}

export interface RotationPresetRecipeAudit {
  presetId: string;
  title: LocalizedText;
  totalSourceSteps: number;
  fullyBoundSourceSteps: number;
  partiallyBoundSourceSteps: number;
  unsupportedSourceSteps: number;
  exactActionSourceSteps: number;
  partialActionSourceSteps: number;
  verifiedActionSteps: number;
  omittedEffectConditions: number;
  omittedCycleConditions: number;
  fixedRepeatEvidence: readonly RotationRepeatEvidence[];
  conditionBoundRepeatEvidence: readonly RotationRepeatEvidence[];
  confirmedSecondEvidence: readonly RotationConfirmedSecondEvidence[];
  promotedRecipeId: string | null;
  promotedCoverage: VerifiedRotationRecipeCoverage | null;
  promotedTimingMode: VerifiedRotationRecipeTimingMode | null;
}

export type VerifiedRotationRecipeCompilation =
  | {
    ok: true;
    scenario: CombatScenarioState;
    metadata: RotationScenarioImportMetadata;
    sourceSlots: Readonly<Record<string, number>>;
  }
  | {
    ok: false;
    missingCharacters: readonly string[];
    reason: LocalizedText;
  };

const bindingKey = (presetId: string, stepId: string): string => `${presetId}:${stepId}`;
const recipeId = (presetId: string): string => `rotation-lab.${presetId}.verified-actions`;

const safeStepId = (value: string): string => value
  .replace(/[^a-z0-9._-]+/giu, '-')
  .replace(/^-+|-+$/gu, '')
  .slice(0, 80) || 'verified-rotation-step';

/**
 * The source explicitly publishes these counts or condition-bound repetitions.
 * This registry is audit evidence only. A fixed count is promoted into scenario
 * actions only when exact action IDs are also present in the binding table.
 */
export const rotationRepeatEvidence: readonly RotationRepeatEvidence[] = [
  {
    presetId: 'shinku-charge',
    sourceStepIds: ['shinku-enhanced-skills'],
    kind: 'fixed-count',
    count: 5,
    action: { ru: 'Scarlet Descent Шинку', en: 'Shinku Scarlet Descent' },
    note: {
      ru: 'Источник прямо требует пять применений. Они представлены пятью экземплярами одного подтверждённого action ID; обычные атаки между применениями остаются пробелом.',
      en: 'The source explicitly requires five casts. They are represented by five instances of one verified action ID; the Basic Attacks between casts remain a gap.',
    },
    promotedActionIds: Array.from({ length: 5 }, () => 'shinku.scarlet-descent.level-10'),
  },
  {
    presetId: 'shinku-charge',
    sourceStepIds: ['shinku-dashes'],
    kind: 'fixed-count',
    count: 3,
    action: { ru: 'Crimson Judgment Шинку', en: 'Shinku Crimson Judgment' },
    note: {
      ru: 'Источник прямо указывает три рывка. Они представлены тремя экземплярами одного подтверждённого action ID, после которых отдельно следует Dragonflame Verdict.',
      en: 'The source explicitly lists three dashes. They are represented by three instances of one verified action ID followed separately by Dragonflame Verdict.',
    },
    promotedActionIds: Array.from({ length: 3 }, () => 'shinku.crimson-judgment.one-dash.level-10'),
  },
  {
    presetId: 'hathor-hyper',
    sourceStepIds: ['hathor-ultimate'],
    kind: 'fixed-count',
    count: 3,
    action: { ru: 'Cyclone Strike Хатор', en: 'Hathor Cyclone Strike' },
    note: {
      ru: 'Три применения представлены отдельными action ID: первое, второе и третье.',
      en: 'The three uses are represented by separate first, second and third action IDs.',
    },
    promotedActionIds: [
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ],
  },
  {
    presetId: 'chaos-remora-bomb',
    sourceStepIds: ['chaos-heavy-one', 'chaos-heavy-two'],
    kind: 'fixed-count',
    count: 2,
    action: { ru: 'усиленная тяжёлая атака Хаос', en: 'Chaos enhanced Heavy Attack' },
    note: {
      ru: 'Источник публикует два отдельных применения одной полностью усиленной Final Verdict. Рецепт хранит два экземпляра одного точного action ID.',
      en: 'The source publishes two separate uses of the same fully enhanced Final Verdict. The recipe stores two instances of one exact action ID.',
    },
    promotedActionIds: Array.from({ length: 2 }, () => 'chaos.final-verdict.enhanced.level-10'),
  },
  {
    presetId: 'nanally-hexed-dual',
    sourceStepIds: ['nanally-basic-string'],
    kind: 'fixed-count',
    count: 5,
    action: { ru: 'базовая атака Наналли', en: 'Nanally Basic Attack' },
    note: {
      ru: 'Пять ступеней собраны в одну точную запись собственного урона Наналли и отдельную запись согласованных ответов Underboss.',
      en: 'The five stages are represented by one exact Nanally-own record and a separate coordinated Underboss response record.',
    },
    promotedActionIds: [
      'nanally.colucci-secret-skill.full-sequence.level-10',
      'nanally.underboss.basic-coordinated-full-sequence.level-10',
    ],
  },
  {
    presetId: 'nanally-hexed-dual',
    sourceStepIds: ['nanally-charged-string'],
    kind: 'fixed-count',
    count: 3,
    action: { ru: 'заряженная атака Наналли', en: 'Nanally Charged Attack' },
    note: {
      ru: 'Три ступени тяжёлой цепочки собраны в одну точную запись Наналли и отдельную запись ответов Underboss.',
      en: 'The three Heavy stages are represented by one exact Nanally record and a separate Underboss response record.',
    },
    promotedActionIds: [
      'nanally.heavy-hitter.full-sequence.level-10',
      'nanally.underboss.heavy-coordinated-full-sequence.level-10',
    ],
  },
  {
    presetId: 'lacrimosa-discord-dot',
    sourceStepIds: ['lacrimosa-basic-five'],
    kind: 'fixed-count',
    count: 5,
    action: { ru: 'базовая атака Лакримозы', en: 'Lacrimosa Basic Attack' },
    note: {
      ru: 'Источник публикует атаки с первой по пятую; текущий каталог не содержит пяти отдельных action ID для этой цепочки.',
      en: 'The source publishes Basic Attacks one through five; the catalog does not yet contain five separate action IDs for this string.',
    },
  },
  {
    presetId: 'lacrimosa-discord-dot',
    sourceStepIds: ['lacrimosa-phantom-one', 'lacrimosa-phantom-two'],
    kind: 'fixed-count',
    count: 2,
    action: { ru: 'усиленная базовая атака Даффодил', en: 'Daffodill enhanced Basic Attack' },
    note: {
      ru: 'Первая и вторая атаки представлены двумя отдельными экземплярами одного точного Phantom Step action ID.',
      en: 'The first and second attacks are represented by two separate instances of one exact Phantom Step action ID.',
    },
    promotedActionIds: Array.from({ length: 2 }, () => 'daffodill.phantom-step.level-10'),
  },
  {
    presetId: 'baicang-firefly-hyper',
    sourceStepIds: ['baicang-basic-three'],
    kind: 'fixed-count',
    count: 3,
    action: { ru: 'базовая атака Байканг', en: 'Baicang Basic Attack' },
    note: {
      ru: 'Источник прямо публикует первые три базовые атаки. Частичный binding покрывает только последующий навык перенаправления.',
      en: 'The source explicitly publishes the first three Basic Attacks. The partial binding covers only the following Redirect Skill.',
    },
  },
  {
    presetId: 'baicang-firefly-hyper',
    sourceStepIds: ['baicang-phantom-one', 'baicang-phantom-two'],
    kind: 'fixed-count',
    count: 2,
    action: { ru: 'усиленная базовая атака Даффодил', en: 'Daffodill enhanced Basic Attack' },
    note: {
      ru: 'Два быстрого переключения представлены двумя отдельными экземплярами одного точного Phantom Step action ID.',
      en: 'The two quick swaps are represented by two separate instances of one exact Phantom Step action ID.',
    },
    promotedActionIds: Array.from({ length: 2 }, () => 'daffodill.phantom-step.level-10'),
  },
  {
    presetId: 'lacrimosa-discord-dot',
    sourceStepIds: ['lacrimosa-repeat-loop'],
    kind: 'condition-bound',
    count: null,
    action: { ru: 'короткая связка Лакримоза ↔ Даффодил', en: 'Lacrimosa ↔ Daffodill short loop' },
    note: {
      ru: 'Повтор зависит от восстановления энергии Ханиэль или Сакири. Фиксированное число повторов не назначается.',
      en: 'The repeat depends on Haniel or Sakiri Energy recovery. No fixed repeat count is assigned.',
    },
  },
  {
    presetId: 'baicang-firefly-hyper',
    sourceStepIds: ['baicang-dodge-spam'],
    kind: 'condition-bound',
    count: null,
    action: { ru: 'заряженная атака после уклонения', en: 'Dodge Charged Attack' },
    note: {
      ru: 'Источник задаёт повтор до конца сверхспособности, а не конкретное число атак.',
      en: 'The source defines repetition until Ultimate ends rather than a fixed number of attacks.',
    },
  },
];

/** Rotation Lab currently publishes order and conditions, but no confirmed per-step seconds. */
export const rotationConfirmedSecondEvidence: readonly RotationConfirmedSecondEvidence[] = [];

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

function bindingForStep(preset: RotationPreset, step: RotationStep): RotationScenarioBinding | null {
  const candidate = rotationScenarioBindings[bindingKey(preset.id, step.id)];
  if (!candidate || candidate.items.length === 0) return null;
  return candidate.items.every((atom) => validBindingAtom(step, atom)) ? candidate : null;
}

function gapNote(kind: VerifiedRotationRecipeGapKind, step: RotationStep): LocalizedText {
  if (kind === 'partial-source-step-remainder') {
    return {
      ru: `Шаг «${step.instruction.ru}» покрыт только частично; непокрытая часть не превращена в действие.`,
      en: `The step “${step.instruction.en}” is only partially covered; its remainder was not converted into an action.`,
    };
  }
  if (kind === 'unconfirmed-effect') {
    return {
      ru: `В шаге «${step.instruction.ru}» есть эффект без подтверждённых секунд; он не активирован автоматически.`,
      en: `The step “${step.instruction.en}” contains an effect without verified seconds; it was not activated automatically.`,
    };
  }
  if (kind === 'unconfirmed-cycle') {
    return {
      ru: `В шаге «${step.instruction.ru}» есть цикл эспера без подтверждённых секунд; он оставлен пробелом.`,
      en: `The step “${step.instruction.en}” contains an Esper Cycle without verified seconds; it remains a gap.`,
    };
  }
  return {
    ru: `Исходный шаг «${step.instruction.ru}» не имеет точного action binding и не был синтезирован.`,
    en: `The source step “${step.instruction.en}” has no exact action binding and was not synthesized.`,
  };
}

function extractPresetActions(preset: RotationPreset): {
  steps: VerifiedRotationRecipeStep[];
  gaps: VerifiedRotationRecipeGap[];
} {
  const steps: VerifiedRotationRecipeStep[] = [];
  const gaps: VerifiedRotationRecipeGap[] = [];

  preset.steps.forEach((sourceStep, sourceStepIndex) => {
    const matched = bindingForStep(preset, sourceStep);
    if (!matched) {
      gaps.push({
        sourceStepId: sourceStep.id,
        sourceStepIndex,
        part: 0,
        kind: 'unsupported-source-step',
        note: gapNote('unsupported-source-step', sourceStep),
      });
      return;
    }

    let part = 0;
    for (const atom of matched.items) {
      if (atom.kind === 'action-sequence') {
        for (const actionId of atom.actionIds) {
          steps.push({
            actionId,
            characterName: sourceStep.actor,
            sourceStepId: sourceStep.id,
            sourceStepIndex,
            part,
            sourceCoverage: matched.coverage,
          });
          part += 1;
        }
        continue;
      }

      const kind: VerifiedRotationRecipeGapKind = atom.kind === 'activate-effect'
        ? 'unconfirmed-effect'
        : 'unconfirmed-cycle';
      gaps.push({
        sourceStepId: sourceStep.id,
        sourceStepIndex,
        part,
        kind,
        note: gapNote(kind, sourceStep),
      });
      part += 1;
    }

    if (matched.coverage === 'partial') {
      gaps.push({
        sourceStepId: sourceStep.id,
        sourceStepIndex,
        part,
        kind: 'partial-source-step-remainder',
        note: gapNote('partial-source-step-remainder', sourceStep),
      });
    }
  });

  return { steps, gaps };
}

function buildRecipe(preset: RotationPreset): VerifiedRotationRecipe | null {
  const extracted = extractPresetActions(preset);
  if (extracted.steps.length < 2) return null;
  const coverage: VerifiedRotationRecipeCoverage = extracted.gaps.length === 0
    ? 'complete-action-order'
    : 'partial-action-order';
  return {
    version: VERIFIED_ROTATION_RECIPE_VERSION,
    id: recipeId(preset.id),
    presetId: preset.id,
    title: {
      ru: `${preset.title.ru} · подтверждённые действия`,
      en: `${preset.title.en} · verified actions`,
    },
    description: {
      ru: `Из точных bindings извлечено ${extracted.steps.length} действий. ${extracted.gaps.length} непокрытых частей сохранены как пробелы и не участвуют в расчёте.`,
      en: `${extracted.steps.length} actions were extracted from exact bindings. ${extracted.gaps.length} uncovered parts remain gaps and do not enter the calculation.`,
    },
    team: [...preset.team],
    coverage,
    timingMode: rotationConfirmedSecondEvidence.some((entry) => entry.presetId === preset.id)
      ? 'confirmed-seconds'
      : 'order-only',
    steps: extracted.steps,
    gaps: extracted.gaps,
    sourcePublisher: preset.sourcePublisher,
    sourceUrl: preset.sourceUrl,
    sourceUpdatedAt: preset.sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  };
}

export const verifiedRotationRecipes: readonly VerifiedRotationRecipe[] = rotationPresets
  .map(buildRecipe)
  .filter((recipe): recipe is VerifiedRotationRecipe => Boolean(recipe));

export const verifiedRotationRecipeById = new Map(verifiedRotationRecipes.map((recipe) => [recipe.id, recipe]));

function buildAudit(preset: RotationPreset): RotationPresetRecipeAudit {
  let fullyBoundSourceSteps = 0;
  let partiallyBoundSourceSteps = 0;
  let exactActionSourceSteps = 0;
  let partialActionSourceSteps = 0;
  let verifiedActionSteps = 0;
  let omittedEffectConditions = 0;
  let omittedCycleConditions = 0;

  for (const step of preset.steps) {
    const matched = bindingForStep(preset, step);
    if (!matched) continue;
    if (matched.coverage === 'full') fullyBoundSourceSteps += 1;
    else partiallyBoundSourceSteps += 1;

    const actionCount = matched.items.reduce((sum, atom) => (
      atom.kind === 'action-sequence' ? sum + atom.actionIds.length : sum
    ), 0);
    if (actionCount > 0) {
      verifiedActionSteps += actionCount;
      if (matched.coverage === 'full') exactActionSourceSteps += 1;
      else partialActionSourceSteps += 1;
    }
    omittedEffectConditions += matched.items.filter((atom) => atom.kind === 'activate-effect').length;
    omittedCycleConditions += matched.items.filter((atom) => atom.kind === 'activate-cycle').length;
  }

  const repeats = rotationRepeatEvidence.filter((entry) => entry.presetId === preset.id);
  const seconds = rotationConfirmedSecondEvidence.filter((entry) => entry.presetId === preset.id);
  const promoted = verifiedRotationRecipeById.get(recipeId(preset.id));
  return {
    presetId: preset.id,
    title: preset.title,
    totalSourceSteps: preset.steps.length,
    fullyBoundSourceSteps,
    partiallyBoundSourceSteps,
    unsupportedSourceSteps: preset.steps.length - fullyBoundSourceSteps - partiallyBoundSourceSteps,
    exactActionSourceSteps,
    partialActionSourceSteps,
    verifiedActionSteps,
    omittedEffectConditions,
    omittedCycleConditions,
    fixedRepeatEvidence: repeats.filter((entry) => entry.kind === 'fixed-count'),
    conditionBoundRepeatEvidence: repeats.filter((entry) => entry.kind === 'condition-bound'),
    confirmedSecondEvidence: seconds,
    promotedRecipeId: promoted?.id ?? null,
    promotedCoverage: promoted?.coverage ?? null,
    promotedTimingMode: promoted?.timingMode ?? null,
  };
}

export const rotationPresetRecipeAudit: readonly RotationPresetRecipeAudit[] = rotationPresets.map(buildAudit);
export const rotationPresetRecipeAuditById = new Map(rotationPresetRecipeAudit.map((entry) => [entry.presetId, entry]));

function missingCharactersReason(missingCharacters: readonly string[]): LocalizedText {
  return {
    ru: `Для исходной команды не хватает: ${missingCharacters.join(', ')}. Состав не был изменён.`,
    en: `The source lineup is missing: ${missingCharacters.join(', ')}. The lineup was not changed.`,
  };
}

export function compileVerifiedRotationRecipe(
  id: string,
  team: GameVisibleTeamState,
  locale: 'ru' | 'en',
): VerifiedRotationRecipeCompilation {
  const recipe = verifiedRotationRecipeById.get(id);
  if (!recipe) {
    return {
      ok: false,
      missingCharacters: [],
      reason: {
        ru: 'Выбранный рецепт Rotation Lab не найден.',
        en: 'The selected Rotation Lab recipe was not found.',
      },
    };
  }

  const sourceSlots: Record<string, number> = {};
  const missingCharacters: string[] = [];
  for (const characterName of recipe.team) {
    const slot = team.builds.findIndex((build) => build.characterName === characterName);
    if (slot < 0) missingCharacters.push(characterName);
    else sourceSlots[characterName] = slot;
  }
  if (missingCharacters.length > 0) {
    return { ok: false, missingCharacters, reason: missingCharactersReason(missingCharacters) };
  }

  const originsByStepId: RotationScenarioImportMetadata['originsByStepId'] = {};
  const scenarioSteps: CombatScenarioStep[] = recipe.steps.map((step, index) => {
    const idForStep = safeStepId(`verified-rotation-${recipe.presetId}-${step.sourceStepId}-${step.part}-${index + 1}`);
    originsByStepId[idForStep] = {
      sourceStepId: step.sourceStepId,
      part: step.part,
      coverage: step.sourceCoverage,
    };
    return {
      id: idForStep,
      at: 0,
      kind: 'action',
      sourceSlot: sourceSlots[step.characterName] ?? 0,
      actionId: step.actionId,
      effectId: '',
      cycleId: '',
      note: locale === 'ru'
        ? `Позиция ${index + 1} в подтверждённом порядке действий. Секунды не назначены; исходный шаг: ${step.sourceStepId}.`
        : `Position ${index + 1} in the verified action order. Seconds are not assigned; source step: ${step.sourceStepId}.`,
    };
  });

  const preset = rotationPresetById.get(recipe.presetId);
  const report = preset ? previewRotationScenarioImport(preset) : null;
  return {
    ok: true,
    scenario: {
      version: COMBAT_SCENARIO_VERSION,
      name: recipe.title[locale],
      steps: scenarioSteps,
    },
    metadata: {
      version: ROTATION_SCENARIO_IMPORT_VERSION,
      sourceRotationId: recipe.presetId,
      timingStatus: recipe.timingMode,
      report,
      originsByStepId,
      pendingByStepId: {},
    },
    sourceSlots,
  };
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value);
}

export function validateVerifiedRotationRecipes(): string[] {
  const errors: string[] = [];
  const recipeIds = new Set<string>();

  if (rotationPresetRecipeAudit.length !== rotationPresets.length) {
    errors.push(`Rotation audit coverage mismatch: ${rotationPresetRecipeAudit.length}/${rotationPresets.length}`);
  }

  for (const recipe of verifiedRotationRecipes) {
    if (recipeIds.has(recipe.id)) errors.push(`Duplicate verified rotation recipe: ${recipe.id}`);
    recipeIds.add(recipe.id);
    const preset = rotationPresetById.get(recipe.presetId);
    if (!preset) {
      errors.push(`Unknown recipe preset: ${recipe.id}:${recipe.presetId}`);
      continue;
    }
    if (recipe.version !== VERIFIED_ROTATION_RECIPE_VERSION) errors.push(`Invalid recipe version: ${recipe.id}`);
    if (recipe.steps.length < 2) errors.push(`Recipe is not multi-action: ${recipe.id}`);
    if (recipe.team.length !== 4 || new Set(recipe.team).size !== 4) errors.push(`Invalid recipe team: ${recipe.id}`);
    if (recipe.coverage === 'complete-action-order' && recipe.gaps.length > 0) {
      errors.push(`Complete recipe contains gaps: ${recipe.id}`);
    }
    if (recipe.coverage === 'partial-action-order' && recipe.gaps.length === 0) {
      errors.push(`Partial recipe has no gaps: ${recipe.id}`);
    }
    if (recipe.timingMode === 'confirmed-seconds'
      && !rotationConfirmedSecondEvidence.some((entry) => entry.presetId === recipe.presetId)) {
      errors.push(`Recipe claims seconds without evidence: ${recipe.id}`);
    }
    if (!recipe.sourcePublisher.trim() || !recipe.sourceUrl.startsWith('https://')
      || !validDate(recipe.sourceUpdatedAt) || !validDate(recipe.verifiedAt)) {
      errors.push(`Invalid recipe provenance: ${recipe.id}`);
    }

    let previousOrder = -1;
    for (const step of recipe.steps) {
      const action = visibleActionById.get(step.actionId);
      const sourceStep = preset.steps[step.sourceStepIndex];
      const order = step.sourceStepIndex * 100 + step.part;
      if (!action) errors.push(`Unknown recipe action: ${recipe.id}:${step.actionId}`);
      if (action && action.characterName !== step.characterName) {
        errors.push(`Recipe action owner mismatch: ${recipe.id}:${step.actionId}`);
      }
      if (!sourceStep || sourceStep.id !== step.sourceStepId || sourceStep.actor !== step.characterName) {
        errors.push(`Recipe source step mismatch: ${recipe.id}:${step.sourceStepId}`);
      }
      if (order < previousOrder) errors.push(`Recipe order regression: ${recipe.id}:${step.actionId}`);
      previousOrder = order;
    }
  }

  for (const audit of rotationPresetRecipeAudit) {
    const preset = rotationPresetById.get(audit.presetId);
    if (!preset) errors.push(`Unknown audited preset: ${audit.presetId}`);
    if (audit.totalSourceSteps !== (preset?.steps.length ?? -1)) {
      errors.push(`Audit source-step mismatch: ${audit.presetId}`);
    }
    if (audit.fullyBoundSourceSteps + audit.partiallyBoundSourceSteps + audit.unsupportedSourceSteps
      !== audit.totalSourceSteps) {
      errors.push(`Audit coverage arithmetic mismatch: ${audit.presetId}`);
    }
  }

  return errors;
}

export const verifiedRotationRecipeCoverage = Object.freeze({
  presetCount: rotationPresets.length,
  bindingCount: Object.keys(rotationScenarioBindings).length,
  totalSourceStepCount: rotationPresetRecipeAudit.reduce((sum, entry) => sum + entry.totalSourceSteps, 0),
  fullyBoundSourceStepCount: rotationPresetRecipeAudit.reduce((sum, entry) => sum + entry.fullyBoundSourceSteps, 0),
  partiallyBoundSourceStepCount: rotationPresetRecipeAudit.reduce((sum, entry) => sum + entry.partiallyBoundSourceSteps, 0),
  unsupportedSourceStepCount: rotationPresetRecipeAudit.reduce((sum, entry) => sum + entry.unsupportedSourceSteps, 0),
  boundActionStepCount: rotationPresetRecipeAudit.reduce((sum, entry) => sum + entry.verifiedActionSteps, 0),
  promotedRecipeCount: verifiedRotationRecipes.length,
  promotedActionStepCount: verifiedRotationRecipes.reduce((sum, recipe) => sum + recipe.steps.length, 0),
  completeActionOrderRecipeCount: verifiedRotationRecipes.filter((recipe) => recipe.coverage === 'complete-action-order').length,
  partialActionOrderRecipeCount: verifiedRotationRecipes.filter((recipe) => recipe.coverage === 'partial-action-order').length,
  orderOnlyRecipeCount: verifiedRotationRecipes.filter((recipe) => recipe.timingMode === 'order-only').length,
  confirmedSecondRecipeCount: verifiedRotationRecipes.filter((recipe) => recipe.timingMode === 'confirmed-seconds').length,
  fixedRepeatEvidenceCount: rotationRepeatEvidence.filter((entry) => entry.kind === 'fixed-count').length,
  conditionBoundRepeatEvidenceCount: rotationRepeatEvidence.filter((entry) => entry.kind === 'condition-bound').length,
});
