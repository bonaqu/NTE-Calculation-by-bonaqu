import {
  COMBAT_SCENARIO_VERSION,
  type CombatScenarioState,
  type CombatScenarioStep,
} from './combat-scenario';
import type { GameVisibleTeamState } from './game-visible-build';
import type { LocalizedText } from './types';
import {
  verifiedVisibleActions,
  visibleActionById,
  type VerifiedVisibleAction,
} from './verified-visible-actions';

export const VERIFIED_ACTION_SCENARIO_RECIPE_VERSION = 1 as const;

export interface VerifiedScenarioSourceEvidence {
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
  note: LocalizedText;
}

export type VerifiedScenarioTimingConstraint =
  | {
    kind: 'relative-offset';
    seconds: number;
    anchor: LocalizedText;
    evidence: VerifiedScenarioSourceEvidence;
  }
  | {
    kind: 'minimum-spacing';
    seconds: number;
    anchor: LocalizedText;
    evidence: VerifiedScenarioSourceEvidence;
  };

export interface VerifiedActionScenarioRecipe {
  version: typeof VERIFIED_ACTION_SCENARIO_RECIPE_VERSION;
  id: string;
  actionId: string;
  characterName: string;
  title: LocalizedText;
  description: LocalizedText;
  /** One catalog record always compiles to one action step. No repeat count is inferred. */
  occurrencePolicy: 'one-record-once';
  timingConstraint?: VerifiedScenarioTimingConstraint;
}

export interface VerifiedRotationFragmentStep {
  actionId: string;
}

export interface VerifiedRotationFragment {
  version: typeof VERIFIED_ACTION_SCENARIO_RECIPE_VERSION;
  id: string;
  characterName: string;
  title: LocalizedText;
  description: LocalizedText;
  timingMode: 'order-only';
  steps: readonly VerifiedRotationFragmentStep[];
  evidence: VerifiedScenarioSourceEvidence;
}

export type VerifiedScenarioCompilation =
  | {
    ok: true;
    sourceSlot: number;
    scenario: CombatScenarioState;
  }
  | {
    ok: false;
    reason: LocalizedText;
  };

const safeStepId = (value: string): string => value
  .replace(/[^a-z0-9._-]+/giu, '-')
  .replace(/^-+|-+$/gu, '')
  .slice(0, 80) || 'verified-step';

export const verifiedActionScenarioRecipeId = (actionId: string): string => `verified-action.${actionId}`;

function evidenceFromAction(actionId: string, note: LocalizedText): VerifiedScenarioSourceEvidence {
  const action = visibleActionById.get(actionId);
  if (!action) throw new Error(`Unknown verified action evidence: ${actionId}`);
  return {
    sourcePublisher: action.sourcePublisher,
    sourceUrl: action.sourceUrl,
    sourceUpdatedAt: action.sourceUpdatedAt,
    verifiedAt: action.verifiedAt,
    note,
  };
}

/**
 * Timing is absent by default. This registry contains only constraints that are
 * written directly in the same published action evidence as the numeric record.
 */
export const verifiedActionTimingConstraints: Readonly<Record<string, VerifiedScenarioTimingConstraint>> = {
  'chaos.remora-enhancement.base-five-seconds': {
    kind: 'relative-offset',
    seconds: 5,
    anchor: {
      ru: 'момент наложения Реморы',
      en: 'the moment Remora is applied',
    },
    evidence: evidenceFromAction('chaos.remora-enhancement.base-five-seconds', {
      ru: 'Источник прямо задаёт базовую длительность Реморы 5 секунд и завершение без обновления.',
      en: 'The source explicitly defines the base five-second Remora duration and an unreapplied end trigger.',
    }),
  },
  'chaos.remora-enhancement.maximum-twelve-seconds': {
    kind: 'relative-offset',
    seconds: 12,
    anchor: {
      ru: 'момент наложения Реморы',
      en: 'the moment Remora is applied',
    },
    evidence: evidenceFromAction('chaos.remora-enhancement.maximum-twelve-seconds', {
      ru: 'Источник прямо задаёт предельную длительность Реморы 12 секунд для максимального усиления.',
      en: 'The source explicitly defines a twelve-second maximum Remora duration for the capped enhancement.',
    }),
  },
  'jiuyuan.know-every-secret.awakening-six': {
    kind: 'minimum-spacing',
    seconds: 5,
    anchor: {
      ru: 'предыдущее срабатывание этого эффекта',
      en: 'the previous trigger of this effect',
    },
    evidence: evidenceFromAction('jiuyuan.know-every-secret.awakening-six', {
      ru: 'Источник прямо указывает внутреннюю перезарядку 5 секунд. Рецепт всё равно создаёт только одно срабатывание.',
      en: 'The source explicitly states a five-second internal cooldown. The recipe still creates only one trigger.',
    }),
  },
};

function recipeFromAction(action: VerifiedVisibleAction): VerifiedActionScenarioRecipe {
  const timingConstraint = verifiedActionTimingConstraints[action.id];
  return {
    version: VERIFIED_ACTION_SCENARIO_RECIPE_VERSION,
    id: verifiedActionScenarioRecipeId(action.id),
    actionId: action.id,
    characterName: action.characterName,
    title: {
      ru: `Сценарий · ${action.title.ru}`,
      en: `Scenario · ${action.title.en}`,
    },
    description: {
      ru: `${action.description.ru} Рецепт создаёт ровно одно подтверждённое действие.`,
      en: `${action.description.en} The recipe creates exactly one verified action.`,
    },
    occurrencePolicy: 'one-record-once',
    ...(timingConstraint ? { timingConstraint } : {}),
  };
}

export const verifiedActionScenarioRecipes: readonly VerifiedActionScenarioRecipe[] = verifiedVisibleActions.map(recipeFromAction);
export const verifiedActionScenarioRecipeById = new Map(verifiedActionScenarioRecipes.map((recipe) => [recipe.id, recipe]));

const hathorBurstActionIds = [
  'hathor.rider-express.level-10',
  'hathor.cyclone-strike-first.level-10',
  'hathor.cyclone-strike-second.level-10',
  'hathor.cyclone-strike-third.level-10',
] as const;

/**
 * Multi-action fragments remain a manually reviewed allow-list. Equal 0-second
 * timestamps preserve source order without pretending that animation timing is known.
 */
export const verifiedRotationFragments: readonly VerifiedRotationFragment[] = [
  {
    version: VERIFIED_ACTION_SCENARIO_RECIPE_VERSION,
    id: 'hathor.emergency-delivery-burst.level-10',
    characterName: 'Hathor',
    title: {
      ru: 'Хатор · подтверждённая атакующая последовательность',
      en: 'Hathor · verified burst sequence',
    },
    description: {
      ru: 'Rider Express, затем первое, второе и третье применение Cyclone Strike. Порядок опубликован; секунды между действиями не назначаются.',
      en: 'Rider Express followed by the first, second and third Cyclone Strike. The order is published; seconds between actions are not assigned.',
    },
    timingMode: 'order-only',
    steps: hathorBurstActionIds.map((actionId) => ({ actionId })),
    evidence: {
      sourcePublisher: 'Prydwen Institute',
      sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/characters/hathor',
      sourceUpdatedAt: '2026-06-27',
      verifiedAt: '2026-08-05',
      note: {
        ru: 'Гайд публикует Rider Express и три усиленных Cyclone Strike как последовательность основного окна Хатор. Коэффициенты каждого действия хранятся в отдельных записях Icy Veins.',
        en: 'The guide publishes Rider Express and three enhanced Cyclone Strikes as Hathor’s main window sequence. Each action coefficient remains in its separate Icy Veins record.',
      },
    },
  },
];

export const verifiedRotationFragmentById = new Map(verifiedRotationFragments.map((fragment) => [fragment.id, fragment]));

function localReferenceNote(recipe: VerifiedActionScenarioRecipe, locale: 'ru' | 'en'): string {
  const constraint = recipe.timingConstraint;
  if (!constraint) {
    return locale === 'ru'
      ? '0 с — локальная точка отсчёта одиночного теста, а не измеренная длительность анимации или позиция в ротации.'
      : '0s is the local origin of this standalone test, not measured animation timing or a rotation position.';
  }
  if (constraint.kind === 'relative-offset') {
    return locale === 'ru'
      ? `${constraint.seconds} с после: ${constraint.anchor.ru}. ${constraint.evidence.note.ru}`
      : `${constraint.seconds}s after ${constraint.anchor.en}. ${constraint.evidence.note.en}`;
  }
  return locale === 'ru'
    ? `Одно срабатывание. До следующего должно пройти минимум ${constraint.seconds} с после: ${constraint.anchor.ru}. Автоматический повтор не добавлен.`
    : `One trigger. A later trigger must be at least ${constraint.seconds}s after ${constraint.anchor.en}. No automatic repeat is added.`;
}

function compileActionStep(
  recipe: VerifiedActionScenarioRecipe,
  sourceSlot: number,
  locale: 'ru' | 'en',
): CombatScenarioStep {
  const offset = recipe.timingConstraint?.kind === 'relative-offset'
    ? recipe.timingConstraint.seconds
    : 0;
  return {
    id: safeStepId(`recipe-${recipe.actionId}`),
    at: offset,
    kind: 'action',
    sourceSlot,
    actionId: recipe.actionId,
    effectId: '',
    cycleId: '',
    note: localReferenceNote(recipe, locale),
  };
}

function missingCharacterReason(characterName: string): LocalizedText {
  return {
    ru: `В текущей команде нет персонажа ${characterName}. Состав не был изменён.`,
    en: `${characterName} is not in the current team. The lineup was not changed.`,
  };
}

export function compileVerifiedActionScenario(
  recipeId: string,
  team: GameVisibleTeamState,
  locale: 'ru' | 'en',
): VerifiedScenarioCompilation {
  const recipe = verifiedActionScenarioRecipeById.get(recipeId);
  if (!recipe) {
    return {
      ok: false,
      reason: {
        ru: 'Выбранный рецепт подтверждённого действия не найден.',
        en: 'The selected verified-action recipe was not found.',
      },
    };
  }
  const sourceSlot = team.builds.findIndex((build) => build.characterName === recipe.characterName);
  if (sourceSlot < 0) return { ok: false, reason: missingCharacterReason(recipe.characterName) };
  return {
    ok: true,
    sourceSlot,
    scenario: {
      version: COMBAT_SCENARIO_VERSION,
      name: recipe.title[locale],
      steps: [compileActionStep(recipe, sourceSlot, locale)],
    },
  };
}

export function compileVerifiedRotationFragment(
  fragmentId: string,
  team: GameVisibleTeamState,
  locale: 'ru' | 'en',
): VerifiedScenarioCompilation {
  const fragment = verifiedRotationFragmentById.get(fragmentId);
  if (!fragment) {
    return {
      ok: false,
      reason: {
        ru: 'Выбранный подтверждённый фрагмент ротации не найден.',
        en: 'The selected verified rotation fragment was not found.',
      },
    };
  }
  const sourceSlot = team.builds.findIndex((build) => build.characterName === fragment.characterName);
  if (sourceSlot < 0) return { ok: false, reason: missingCharacterReason(fragment.characterName) };
  return {
    ok: true,
    sourceSlot,
    scenario: {
      version: COMBAT_SCENARIO_VERSION,
      name: fragment.title[locale],
      steps: fragment.steps.map((entry, index) => ({
        id: safeStepId(`fragment-${fragment.id}-${index + 1}`),
        at: 0,
        kind: 'action' as const,
        sourceSlot,
        actionId: entry.actionId,
        effectId: '',
        cycleId: '',
        note: locale === 'ru'
          ? `Позиция ${index + 1} в опубликованном порядке. Секунды не подтверждены и не назначены.`
          : `Position ${index + 1} in the published order. Seconds are not verified or assigned.`,
      })),
    },
  };
}

function validEvidence(evidence: VerifiedScenarioSourceEvidence): boolean {
  return Boolean(
    evidence.sourcePublisher.trim()
    && evidence.sourceUrl.startsWith('https://')
    && /^\d{4}-\d{2}-\d{2}$/u.test(evidence.sourceUpdatedAt)
    && /^\d{4}-\d{2}-\d{2}$/u.test(evidence.verifiedAt)
    && evidence.note.ru.trim()
    && evidence.note.en.trim(),
  );
}

export function validateVerifiedActionScenarioRecipes(): string[] {
  const errors: string[] = [];
  const recipeIds = new Set<string>();
  const actionCounts = new Map<string, number>();

  for (const recipe of verifiedActionScenarioRecipes) {
    if (recipe.version !== VERIFIED_ACTION_SCENARIO_RECIPE_VERSION) {
      errors.push(`Invalid recipe version: ${recipe.id}`);
    }
    if (recipeIds.has(recipe.id)) errors.push(`Duplicate recipe ID: ${recipe.id}`);
    recipeIds.add(recipe.id);
    const action = visibleActionById.get(recipe.actionId);
    if (!action) errors.push(`Unknown recipe action: ${recipe.actionId}`);
    if (action && action.characterName !== recipe.characterName) {
      errors.push(`Recipe character mismatch: ${recipe.id}`);
    }
    actionCounts.set(recipe.actionId, (actionCounts.get(recipe.actionId) ?? 0) + 1);
    if (recipe.occurrencePolicy !== 'one-record-once') {
      errors.push(`Unsupported occurrence policy: ${recipe.id}`);
    }
    const constraint = recipe.timingConstraint;
    if (constraint && (!Number.isFinite(constraint.seconds) || constraint.seconds <= 0)) {
      errors.push(`Invalid timing seconds: ${recipe.id}`);
    }
    if (constraint && !validEvidence(constraint.evidence)) {
      errors.push(`Invalid timing evidence: ${recipe.id}`);
    }
  }

  for (const action of verifiedVisibleActions) {
    const count = actionCounts.get(action.id) ?? 0;
    if (count !== 1) errors.push(`Verified action must have exactly one standalone recipe: ${action.id} (${count})`);
  }
  for (const actionId of actionCounts.keys()) {
    if (!visibleActionById.has(actionId)) errors.push(`Recipe references non-catalog action: ${actionId}`);
  }

  for (const fragment of verifiedRotationFragments) {
    if (fragment.timingMode !== 'order-only') errors.push(`Unsupported fragment timing mode: ${fragment.id}`);
    if (fragment.steps.length < 2) errors.push(`Rotation fragment is not multi-action: ${fragment.id}`);
    if (!validEvidence(fragment.evidence)) errors.push(`Invalid fragment evidence: ${fragment.id}`);
    for (const step of fragment.steps) {
      const action = visibleActionById.get(step.actionId);
      if (!action) errors.push(`Unknown fragment action: ${fragment.id}:${step.actionId}`);
      if (action && action.characterName !== fragment.characterName) {
        errors.push(`Fragment character mismatch: ${fragment.id}:${step.actionId}`);
      }
    }
  }

  return errors;
}

export const verifiedActionScenarioCoverage = Object.freeze({
  verifiedActionCount: verifiedVisibleActions.length,
  standaloneRecipeCount: verifiedActionScenarioRecipes.length,
  representedCharacterCount: new Set(verifiedActionScenarioRecipes.map((recipe) => recipe.characterName)).size,
  explicitRelativeTimingCount: verifiedActionScenarioRecipes.filter((recipe) => recipe.timingConstraint?.kind === 'relative-offset').length,
  explicitMinimumSpacingCount: verifiedActionScenarioRecipes.filter((recipe) => recipe.timingConstraint?.kind === 'minimum-spacing').length,
  automaticRepeatCount: 0,
  rotationFragmentCount: verifiedRotationFragments.length,
  rotationFragmentActionCount: verifiedRotationFragments.reduce((sum, fragment) => sum + fragment.steps.length, 0),
});
