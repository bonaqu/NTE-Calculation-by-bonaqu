import {
  applyBuildProfile,
  type BuildProfile,
  type BuildProfileLibrary,
} from './build-profiles';
import type { CombatScenarioState } from './combat-scenario';
import { characterByName } from './characters';
import { esperCycleById } from './esper-cycles';
import type {
  GameVisibleCharacterBuild,
  GameVisibleTeamState,
} from './game-visible-build';
import { verifiedCombatCycleModelById } from './combat-cycle-models';
import { verifiedTeamEffectById } from './team-effects';
import type { CharacterAttribute, LocalizedText } from './types';
import { visibleActionById } from './verified-visible-actions';

export type ScenarioBuildIssueCode =
  | 'missing-final-atk'
  | 'skill-level'
  | 'awakening'
  | 'base-atk'
  | 'target-level'
  | 'action-ownership'
  | 'effect-ownership'
  | 'cycle-model'
  | 'cycle-attributes';

export type ScenarioBuildIssueScope = 'build' | 'target' | 'scenario';

export interface ScenarioBuildIssue {
  code: ScenarioBuildIssueCode;
  scope: ScenarioBuildIssueScope;
  slot?: number;
  stepId: string;
  actionId?: string;
  effectId?: string;
  cycleId?: string;
  field?: 'basic' | 'skill' | 'ultimate' | 'support' | 'awakeningLevel' | 'baseAtk' | 'atk' | 'level';
  required?: number;
  actual?: number;
  label: LocalizedText;
}

export interface ScenarioProfileReadiness {
  profile: BuildProfile;
  ready: boolean;
  issues: readonly ScenarioBuildIssue[];
}

export type ScenarioSlotReadinessStatus = 'not-used' | 'ready' | 'needs-build' | 'blocked-by-target';

export interface ScenarioSlotBuildReadiness {
  slot: number;
  characterName: string;
  status: ScenarioSlotReadinessStatus;
  requiredActionIds: readonly string[];
  requiredEffectIds: readonly string[];
  currentIssues: readonly ScenarioBuildIssue[];
  matchingProfiles: readonly ScenarioProfileReadiness[];
  readyProfileCount: number;
}

export interface ScenarioBuildReadinessReport {
  slots: readonly ScenarioSlotBuildReadiness[];
  globalIssues: readonly ScenarioBuildIssue[];
  requiredSlotCount: number;
  readySlotCount: number;
  slotsWithReadyProfile: number;
  totalMatchingProfiles: number;
}

export type ApplyScenarioProfilesResult =
  | { ok: true; team: GameVisibleTeamState; appliedSlots: readonly number[] }
  | { ok: false; error: 'profile-not-found' | 'character-mismatch' | 'duplicate-selection' | 'apply-failed' };

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function issueKey(issue: ScenarioBuildIssue): string {
  return [
    issue.code,
    issue.scope,
    issue.slot ?? '-',
    issue.field ?? '-',
    issue.required ?? '-',
    issue.actual ?? '-',
    issue.actionId ?? '-',
    issue.effectId ?? '-',
    issue.cycleId ?? '-',
  ].join(':');
}

function uniqueIssues(issues: readonly ScenarioBuildIssue[]): ScenarioBuildIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = issueKey(issue);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function actionIssues(
  team: GameVisibleTeamState,
  build: GameVisibleCharacterBuild,
  slot: number,
  stepId: string,
  actionId: string,
): ScenarioBuildIssue[] {
  const action = visibleActionById.get(actionId);
  if (!action || action.characterName !== build.characterName) {
    return [{
      code: 'action-ownership',
      scope: 'scenario',
      slot,
      stepId,
      actionId,
      label: {
        ru: 'Действие не принадлежит персонажу в этом слоте или больше не подтверждено.',
        en: 'The action does not belong to this slot character or is no longer verified.',
      },
    }];
  }

  const issues: ScenarioBuildIssue[] = [];
  if (build.stats.atk <= 0) {
    issues.push({
      code: 'missing-final-atk',
      scope: 'build',
      slot,
      stepId,
      actionId,
      field: 'atk',
      actual: build.stats.atk,
      label: {
        ru: `Для «${action.title.ru}» не введена итоговая Атака из окна «Атрибуты».`,
        en: `Final ATK from the Attributes screen is missing for ${action.title.en}.`,
      },
    });
  }

  if (typeof action.requiredLevel === 'number') {
    const actual = build.skills[action.requiredSkill];
    if (actual !== action.requiredLevel) {
      issues.push({
        code: 'skill-level',
        scope: 'build',
        slot,
        stepId,
        actionId,
        field: action.requiredSkill,
        required: action.requiredLevel,
        actual,
        label: {
          ru: `«${action.title.ru}»: нужен точный уровень навыка ${action.requiredLevel}, сейчас ${actual}.`,
          en: `${action.title.en} requires exact Skill level ${action.requiredLevel}; current level is ${actual}.`,
        },
      });
    }
  }

  if (action.minimumAwakening !== undefined && build.awakeningLevel < action.minimumAwakening) {
    issues.push({
      code: 'awakening',
      scope: 'build',
      slot,
      stepId,
      actionId,
      field: 'awakeningLevel',
      required: action.minimumAwakening,
      actual: build.awakeningLevel,
      label: {
        ru: `«${action.title.ru}»: требуется пробуждение A${action.minimumAwakening}, сейчас A${build.awakeningLevel}.`,
        en: `${action.title.en} requires Awakening A${action.minimumAwakening}; current value is A${build.awakeningLevel}.`,
      },
    });
  }

  if (action.requiresLowerLevelTarget && team.target.level >= build.level) {
    issues.push({
      code: 'target-level',
      scope: 'target',
      slot,
      stepId,
      actionId,
      field: 'level',
      required: team.target.level + 1,
      actual: build.level,
      label: {
        ru: `«${action.title.ru}»: уровень персонажа ${build.level}, а цель ${team.target.level}; цель должна быть ниже персонажа.`,
        en: `${action.title.en}: character level is ${build.level} and target level is ${team.target.level}; the target must be lower level.`,
      },
    });
  }
  return issues;
}

function effectIssues(
  build: GameVisibleCharacterBuild,
  slot: number,
  stepId: string,
  effectId: string,
): ScenarioBuildIssue[] {
  const effect = verifiedTeamEffectById.get(effectId as never);
  if (!effect || effect.sourceCharacter !== build.characterName) {
    return [{
      code: 'effect-ownership',
      scope: 'scenario',
      slot,
      stepId,
      effectId,
      label: {
        ru: 'Эффект не принадлежит персонажу в этом слоте или больше не подтверждён.',
        en: 'The effect does not belong to this slot character or is no longer verified.',
      },
    }];
  }

  const issues: ScenarioBuildIssue[] = [];
  if (effect.baseAtkPercent !== undefined && build.baseAtk <= 0) {
    issues.push({
      code: 'base-atk',
      scope: 'build',
      slot,
      stepId,
      effectId,
      field: 'baseAtk',
      actual: build.baseAtk,
      label: {
        ru: `Для эффекта «${effect.title.ru}» нужна базовая Атака персонажа.`,
        en: `${effect.title.en} requires the character's Base ATK.`,
      },
    });
  }
  if (effect.minimumAwakening !== undefined && build.awakeningLevel < effect.minimumAwakening) {
    issues.push({
      code: 'awakening',
      scope: 'build',
      slot,
      stepId,
      effectId,
      field: 'awakeningLevel',
      required: effect.minimumAwakening,
      actual: build.awakeningLevel,
      label: {
        ru: `Эффект «${effect.title.ru}» требует A${effect.minimumAwakening}, сейчас A${build.awakeningLevel}.`,
        en: `${effect.title.en} requires A${effect.minimumAwakening}; current value is A${build.awakeningLevel}.`,
      },
    });
  }
  return issues;
}

function slotRequirements(
  team: GameVisibleTeamState,
  scenario: CombatScenarioState,
  slot: number,
  build: GameVisibleCharacterBuild,
): {
  actionIds: string[];
  effectIds: string[];
  issues: ScenarioBuildIssue[];
} {
  const actionIds: string[] = [];
  const effectIds: string[] = [];
  const issues: ScenarioBuildIssue[] = [];
  for (const step of scenario.steps) {
    if (step.sourceSlot !== slot) continue;
    if (step.kind === 'action') {
      actionIds.push(step.actionId);
      issues.push(...actionIssues(team, build, slot, step.id, step.actionId));
    }
    if (step.kind === 'activate-effect') {
      effectIds.push(step.effectId);
      issues.push(...effectIssues(build, slot, step.id, step.effectId));
    }
  }
  return {
    actionIds: uniqueStrings(actionIds.filter(Boolean)),
    effectIds: uniqueStrings(effectIds.filter(Boolean)),
    issues: uniqueIssues(issues),
  };
}

function globalCycleIssues(team: GameVisibleTeamState, scenario: CombatScenarioState): ScenarioBuildIssue[] {
  const issues: ScenarioBuildIssue[] = [];
  const attributes = new Set(team.builds
    .map((build) => characterByName.get(build.characterName)?.attribute)
    .filter((attribute): attribute is CharacterAttribute => Boolean(attribute)));

  for (const step of scenario.steps) {
    if (step.kind !== 'activate-cycle') continue;
    const cycle = esperCycleById.get(step.cycleId as never);
    const model = verifiedCombatCycleModelById.get(step.cycleId as never);
    if (!cycle || !model) {
      issues.push({
        code: 'cycle-model',
        scope: 'scenario',
        stepId: step.id,
        cycleId: step.cycleId,
        label: {
          ru: 'Для шага цикла эспера нет подтверждённой числовой модели.',
          en: 'The Esper Cycle step does not have a verified numerical model.',
        },
      });
      continue;
    }
    if (!cycle.attributes.every((attribute) => attributes.has(attribute))) {
      issues.push({
        code: 'cycle-attributes',
        scope: 'scenario',
        stepId: step.id,
        cycleId: cycle.id,
        label: {
          ru: `Для цикла «${cycle.name.ru}» нужны атрибуты ${cycle.attributes.join(' + ')}.`,
          en: `${cycle.name.en} requires ${cycle.attributes.join(' + ')} attributes.`,
        },
      });
    }
  }
  return uniqueIssues(issues);
}

function slotStatus(required: boolean, issues: readonly ScenarioBuildIssue[]): ScenarioSlotReadinessStatus {
  if (!required) return 'not-used';
  if (issues.some((issue) => issue.scope === 'target' || issue.scope === 'scenario')) return 'blocked-by-target';
  return issues.length ? 'needs-build' : 'ready';
}

export function evaluateScenarioBuildReadiness(
  team: GameVisibleTeamState,
  scenario: CombatScenarioState,
  library: BuildProfileLibrary,
): ScenarioBuildReadinessReport {
  const slots = team.builds.map((build, slot): ScenarioSlotBuildReadiness => {
    const current = slotRequirements(team, scenario, slot, build);
    const required = current.actionIds.length > 0 || current.effectIds.length > 0;
    const matchingProfiles = library.profiles
      .filter((profile) => profile.build.characterName === build.characterName)
      .map((profile): ScenarioProfileReadiness => {
        const candidate = slotRequirements(team, scenario, slot, profile.build);
        return {
          profile,
          ready: candidate.issues.length === 0,
          issues: candidate.issues,
        };
      });
    return {
      slot,
      characterName: build.characterName,
      status: slotStatus(required, current.issues),
      requiredActionIds: current.actionIds,
      requiredEffectIds: current.effectIds,
      currentIssues: current.issues,
      matchingProfiles,
      readyProfileCount: matchingProfiles.filter((profile) => profile.ready).length,
    };
  });
  const requiredSlots = slots.filter((slot) => slot.status !== 'not-used');
  return {
    slots,
    globalIssues: globalCycleIssues(team, scenario),
    requiredSlotCount: requiredSlots.length,
    readySlotCount: requiredSlots.filter((slot) => slot.status === 'ready').length,
    slotsWithReadyProfile: requiredSlots.filter((slot) => slot.readyProfileCount > 0).length,
    totalMatchingProfiles: slots.reduce((sum, slot) => sum + slot.matchingProfiles.length, 0),
  };
}

export function uniqueReadyScenarioProfileSelections(
  report: ScenarioBuildReadinessReport,
): Record<number, string> {
  const selections: Record<number, string> = {};
  for (const slot of report.slots) {
    if (slot.status === 'ready' || slot.status === 'not-used') continue;
    const ready = slot.matchingProfiles.filter((profile) => profile.ready);
    if (ready.length === 1) selections[slot.slot] = ready[0]!.profile.id;
  }
  return selections;
}

export function applySelectedScenarioProfiles(
  team: GameVisibleTeamState,
  library: BuildProfileLibrary,
  selections: Readonly<Record<number, string>>,
): ApplyScenarioProfilesResult {
  const entries = Object.entries(selections)
    .map(([slot, profileId]) => ({ slot: Number(slot), profileId }))
    .filter((entry) => Number.isInteger(entry.slot) && entry.profileId);
  if (new Set(entries.map((entry) => entry.profileId)).size !== entries.length) {
    return { ok: false, error: 'duplicate-selection' };
  }

  const resolved = entries.map((entry) => ({
    ...entry,
    profile: library.profiles.find((profile) => profile.id === entry.profileId),
  }));
  if (resolved.some((entry) => !entry.profile)) return { ok: false, error: 'profile-not-found' };
  if (resolved.some((entry) => team.builds[entry.slot]?.characterName !== entry.profile!.build.characterName)) {
    return { ok: false, error: 'character-mismatch' };
  }

  let next = team;
  const appliedSlots: number[] = [];
  for (const entry of resolved) {
    const result = applyBuildProfile(next, entry.slot, entry.profile!);
    if (!result.ok) return { ok: false, error: 'apply-failed' };
    next = result.team;
    appliedSlots.push(entry.slot);
  }
  return { ok: true, team: next, appliedSlots };
}
