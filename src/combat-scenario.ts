import type { DamageResult } from '../packages/calculation-core/src';
import { calculateGameVisibleBuild, type VisibleBuildCalculation } from './game-visible-calculation';
import type { GameVisibleTeamState } from './game-visible-build';
import {
  deriveVerifiedTeamEffects,
  verifiedTeamEffectById,
  type TeamEffectEvaluation,
  type VerifiedTeamEffect,
  type VerifiedTeamEffectId,
} from './team-effects';
import type { LocalizedText } from './types';
import { visibleActionById } from './verified-visible-actions';

export const COMBAT_SCENARIO_VERSION = 1 as const;
export const COMBAT_SCENARIO_STORAGE_KEY = 'nte.team.scenario.v1';
export const COMBAT_SCENARIO_MAX_STEPS = 64;

export type CombatScenarioStepKind = 'action' | 'activate-effect' | 'wait';

export interface CombatScenarioStep {
  id: string;
  at: number;
  kind: CombatScenarioStepKind;
  sourceSlot: number;
  actionId: string;
  effectId: string;
  note: string;
}

export interface CombatScenarioState {
  version: typeof COMBAT_SCENARIO_VERSION;
  name: string;
  steps: CombatScenarioStep[];
}

export interface ActiveScenarioEffect {
  key: string;
  effectId: VerifiedTeamEffectId;
  sourceSlot: number;
  sourceCharacter: string;
  startedAt: number;
  expiresAt: number | null;
  title: LocalizedText;
}

export type CombatScenarioStepStatus = 'calculated' | 'activated' | 'wait' | 'blocked';

export interface CombatScenarioStepResult {
  step: CombatScenarioStep;
  originalIndex: number;
  status: CombatScenarioStepStatus;
  sourceCharacter?: string;
  calculation?: VisibleBuildCalculation;
  effectEvaluation?: TeamEffectEvaluation;
  activeEffects: readonly ActiveScenarioEffect[];
  blockedReason?: LocalizedText;
}

export interface CombatScenarioResult {
  steps: readonly CombatScenarioStepResult[];
  totalExpected: number;
  totalNonCrit: number;
  totalCrit: number;
  durationSeconds: number;
  actionStepCount: number;
  calculatedActionCount: number;
  blockedActionCount: number;
  activatedEffectCount: number;
  blockedStepCount: number;
  coveragePercent: number;
  finalActiveEffects: readonly ActiveScenarioEffect[];
}

const finite = (value: unknown, fallback = 0): number => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const clamp = (value: unknown, min: number, max: number, fallback = min): number => Math.min(max, Math.max(min, finite(value, fallback)));
const text = (value: unknown, fallback = '', max = 240): string => typeof value === 'string'
  ? value.normalize('NFKC').trim().slice(0, max)
  : fallback;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeKind(value: unknown): CombatScenarioStepKind {
  if (value === 'activate-effect' || value === 'wait') return value;
  return 'action';
}

export function createCombatScenarioStep(index = 0, kind: CombatScenarioStepKind = 'action'): CombatScenarioStep {
  return {
    id: `step-${index + 1}`,
    at: index,
    kind,
    sourceSlot: 0,
    actionId: '',
    effectId: '',
    note: '',
  };
}

export function initialCombatScenarioState(): CombatScenarioState {
  return {
    version: COMBAT_SCENARIO_VERSION,
    name: '',
    steps: [],
  };
}

export function normalizeCombatScenarioState(value: unknown): CombatScenarioState | null {
  if (!isRecord(value) || value.version !== COMBAT_SCENARIO_VERSION || !Array.isArray(value.steps)) return null;
  const usedIds = new Set<string>();
  const steps = value.steps.slice(0, COMBAT_SCENARIO_MAX_STEPS).map((entry, index) => {
    const input = isRecord(entry) ? entry : {};
    const requestedId = text(input.id, `step-${index + 1}`, 80) || `step-${index + 1}`;
    let id = requestedId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${requestedId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    return {
      id,
      at: Math.round(clamp(input.at, 0, 600, index) * 10) / 10,
      kind: normalizeKind(input.kind),
      sourceSlot: Math.trunc(clamp(input.sourceSlot, 0, 3)),
      actionId: text(input.actionId, '', 160),
      effectId: text(input.effectId, '', 160),
      note: text(input.note, '', 400),
    } satisfies CombatScenarioStep;
  });
  return {
    version: COMBAT_SCENARIO_VERSION,
    name: text(value.name, '', 120),
    steps,
  };
}

function blockedReason(ru: string, en: string): LocalizedText {
  return { ru, en };
}

function activeAt(window: ActiveScenarioEffect, timestamp: number): boolean {
  return window.expiresAt === null || timestamp < window.expiresAt;
}

function snapshotActiveEffects(windows: Map<string, ActiveScenarioEffect>, timestamp: number): ActiveScenarioEffect[] {
  return [...windows.values()]
    .filter((window) => activeAt(window, timestamp))
    .sort((left, right) => left.startedAt - right.startedAt || left.sourceSlot - right.sourceSlot || left.effectId.localeCompare(right.effectId));
}

function stateWithActiveEffects(
  team: GameVisibleTeamState,
  windows: readonly ActiveScenarioEffect[],
): GameVisibleTeamState {
  return {
    ...team,
    builds: team.builds.map((build, slot) => ({
      ...build,
      activeTeamEffectIds: windows
        .filter((window) => window.sourceSlot === slot)
        .map((window) => window.effectId),
    })),
  };
}

function validateEffectActivation(
  team: GameVisibleTeamState,
  sourceSlot: number,
  effect: VerifiedTeamEffect,
): TeamEffectEvaluation | null {
  const sourceBuild = team.builds[sourceSlot];
  if (!sourceBuild || sourceBuild.characterName !== effect.sourceCharacter) return null;
  const isolatedState: GameVisibleTeamState = {
    ...team,
    builds: team.builds.map((build, slot) => ({
      ...build,
      activeTeamEffectIds: slot === sourceSlot ? [effect.id] : [],
    })),
  };
  return deriveVerifiedTeamEffects(isolatedState).evaluations.find((evaluation) => (
    evaluation.sourceSlot === sourceSlot && evaluation.effect.id === effect.id
  )) ?? null;
}

function calculateActionAt(
  team: GameVisibleTeamState,
  sourceSlot: number,
  actionId: string,
  windows: readonly ActiveScenarioEffect[],
): VisibleBuildCalculation | null {
  const sourceBuild = team.builds[sourceSlot];
  const action = visibleActionById.get(actionId);
  if (!sourceBuild || !action || action.characterName !== sourceBuild.characterName) return null;

  const activeState = stateWithActiveEffects(team, windows);
  const actionBuild = {
    ...activeState.builds[sourceSlot]!,
    testMode: 'verified-action' as const,
    verifiedActionId: action.id,
  };
  const calculationState: GameVisibleTeamState = {
    ...activeState,
    activeSlot: sourceSlot,
    builds: activeState.builds.map((build, slot) => slot === sourceSlot ? actionBuild : build),
  };
  const modifiers = deriveVerifiedTeamEffects(calculationState).slotModifiers[sourceSlot];
  return calculateGameVisibleBuild(actionBuild, calculationState, modifiers);
}

function damageOf(calculation: VisibleBuildCalculation | undefined): DamageResult | null {
  return calculation?.supported && calculation.result ? calculation.result : null;
}

export function calculateCombatScenario(
  team: GameVisibleTeamState,
  scenario: CombatScenarioState,
): CombatScenarioResult {
  const ordered = scenario.steps
    .map((step, originalIndex) => ({ step, originalIndex }))
    .sort((left, right) => left.step.at - right.step.at || left.originalIndex - right.originalIndex);
  const windows = new Map<string, ActiveScenarioEffect>();
  const results: CombatScenarioStepResult[] = [];

  ordered.forEach(({ step, originalIndex }) => {
    [...windows.entries()].forEach(([key, window]) => {
      if (!activeAt(window, step.at)) windows.delete(key);
    });
    const sourceBuild = team.builds[step.sourceSlot];
    const before = snapshotActiveEffects(windows, step.at);

    if (!sourceBuild) {
      results.push({
        step,
        originalIndex,
        status: 'blocked',
        activeEffects: before,
        blockedReason: blockedReason('В сценарии указан отсутствующий слот команды.', 'The scenario references a missing team slot.'),
      });
      return;
    }

    if (step.kind === 'wait') {
      results.push({
        step,
        originalIndex,
        status: 'wait',
        sourceCharacter: sourceBuild.characterName,
        activeEffects: before,
      });
      return;
    }

    if (step.kind === 'activate-effect') {
      const effect = verifiedTeamEffectById.get(step.effectId as VerifiedTeamEffectId);
      if (!effect || effect.sourceCharacter !== sourceBuild.characterName) {
        results.push({
          step,
          originalIndex,
          status: 'blocked',
          sourceCharacter: sourceBuild.characterName,
          activeEffects: before,
          blockedReason: blockedReason(
            'Выбранный эффект не принадлежит персонажу в этом слоте или ещё не подтверждён.',
            'The selected effect does not belong to this slot character or is not verified.',
          ),
        });
        return;
      }
      const evaluation = validateEffectActivation(team, step.sourceSlot, effect);
      if (!evaluation?.active) {
        results.push({
          step,
          originalIndex,
          status: 'blocked',
          sourceCharacter: sourceBuild.characterName,
          effectEvaluation: evaluation ?? undefined,
          activeEffects: before,
          blockedReason: evaluation?.blockedReason ?? blockedReason(
            'Не удалось подтвердить обязательные условия эффекта.',
            'The effect requirements could not be validated.',
          ),
        });
        return;
      }
      const key = `${step.sourceSlot}:${effect.id}`;
      windows.set(key, {
        key,
        effectId: effect.id,
        sourceSlot: step.sourceSlot,
        sourceCharacter: sourceBuild.characterName,
        startedAt: step.at,
        expiresAt: effect.durationSeconds === 'combat' ? null : step.at + effect.durationSeconds,
        title: effect.title,
      });
      results.push({
        step,
        originalIndex,
        status: 'activated',
        sourceCharacter: sourceBuild.characterName,
        effectEvaluation: evaluation,
        activeEffects: snapshotActiveEffects(windows, step.at),
      });
      return;
    }

    const action = visibleActionById.get(step.actionId);
    if (!action || action.characterName !== sourceBuild.characterName) {
      results.push({
        step,
        originalIndex,
        status: 'blocked',
        sourceCharacter: sourceBuild.characterName,
        activeEffects: before,
        blockedReason: blockedReason(
          'Выбранное действие не принадлежит персонажу в этом слоте или ещё не подтверждено.',
          'The selected action does not belong to this slot character or is not verified.',
        ),
      });
      return;
    }
    const calculation = calculateActionAt(team, step.sourceSlot, action.id, before);
    if (!calculation?.supported || !calculation.result) {
      results.push({
        step,
        originalIndex,
        status: 'blocked',
        sourceCharacter: sourceBuild.characterName,
        calculation: calculation ?? undefined,
        activeEffects: before,
        blockedReason: calculation?.blockedReason ?? blockedReason(
          'Действие не удалось рассчитать по текущим видимым данным.',
          'The action could not be calculated from the current visible inputs.',
        ),
      });
      return;
    }
    results.push({
      step,
      originalIndex,
      status: 'calculated',
      sourceCharacter: sourceBuild.characterName,
      calculation,
      activeEffects: before,
    });
  });

  const actionResults = results.filter((result) => result.step.kind === 'action');
  const calculated = actionResults.filter((result) => result.status === 'calculated');
  const damage = calculated.map((result) => damageOf(result.calculation)).filter((result): result is DamageResult => Boolean(result));
  const durationSeconds = ordered.reduce((maximum, entry) => Math.max(maximum, entry.step.at), 0);

  return {
    steps: results,
    totalExpected: damage.reduce((sum, result) => sum + result.expected, 0),
    totalNonCrit: damage.reduce((sum, result) => sum + result.nonCrit, 0),
    totalCrit: damage.reduce((sum, result) => sum + result.crit, 0),
    durationSeconds,
    actionStepCount: actionResults.length,
    calculatedActionCount: calculated.length,
    blockedActionCount: actionResults.length - calculated.length,
    activatedEffectCount: results.filter((result) => result.status === 'activated').length,
    blockedStepCount: results.filter((result) => result.status === 'blocked').length,
    coveragePercent: actionResults.length ? Math.round(calculated.length / actionResults.length * 1_000) / 10 : 0,
    finalActiveEffects: snapshotActiveEffects(windows, durationSeconds),
  };
}
