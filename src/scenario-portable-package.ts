import {
  canonicalProfileJson,
  profileChecksum,
  sanitizeBuildProfileSnapshot,
} from './build-profiles';
import { verifiedCombatCycleModelById } from './combat-cycle-models';
import {
  COMBAT_SCENARIO_VERSION,
  normalizeCombatScenarioState,
  type CombatScenarioState,
  type CombatScenarioStep,
} from './combat-scenario';
import { characterByName } from './characters';
import {
  createEmptyGameVisibleBuild,
  GAME_VISIBLE_BUILD_VERSION,
  normalizeGameVisibleTeamState,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
  type VisibleTargetProfile,
} from './game-visible-build';
import {
  initialRotationScenarioImportMetadata,
  normalizeRotationScenarioImportMetadata,
  ROTATION_SCENARIO_IMPORT_VERSION,
  type RotationScenarioImportMetadata,
} from './rotation-scenario-import';
import { verifiedTeamEffectById, type VerifiedTeamEffectId } from './team-effects';
import type { EsperCycleId } from './types';
import { visibleActionById } from './verified-visible-actions';

export const SCENARIO_PORTABLE_PACKAGE_KIND = 'nte-combat-scenario-package' as const;
export const SCENARIO_PORTABLE_PACKAGE_VERSION = 1 as const;
export const SCENARIO_PORTABLE_PACKAGE_MAX_TEXT = 250_000;

export type ScenarioPackageBuildMode = 'lineup-only' | 'sanitized-builds';

export interface ScenarioPortableTeamPayload {
  activeSlot: number;
  duration: number;
  lineup: string[];
  target: VisibleTargetProfile;
  buildMode: ScenarioPackageBuildMode;
  builds?: GameVisibleCharacterBuild[];
}

export interface ScenarioPortablePayload {
  exportedAt: string;
  name: string;
  team: ScenarioPortableTeamPayload;
  scenario: CombatScenarioState;
  rotation: RotationScenarioImportMetadata;
}

export interface ScenarioPortableEnvelope {
  kind: typeof SCENARIO_PORTABLE_PACKAGE_KIND;
  version: typeof SCENARIO_PORTABLE_PACKAGE_VERSION;
  payload: ScenarioPortablePayload;
  checksum: string;
}

export interface ScenarioPortablePreview {
  name: string;
  exportedAt: string;
  lineup: readonly string[];
  buildMode: ScenarioPackageBuildMode;
  sourceRotationId: string;
  timingStatus: RotationScenarioImportMetadata['timingStatus'];
  totalSteps: number;
  actionSteps: number;
  effectSteps: number;
  cycleSteps: number;
  waitSteps: number;
  blockedModelRows: number;
}

export interface ParsedScenarioPortablePackage {
  envelope: ScenarioPortableEnvelope;
  payload: ScenarioPortablePayload;
  preview: ScenarioPortablePreview;
}

export type ParseScenarioPortablePackageResult =
  | { ok: true; value: ParsedScenarioPortablePackage }
  | {
      ok: false;
      error:
        | 'invalid-json'
        | 'invalid-envelope'
        | 'unsupported-version'
        | 'checksum-mismatch'
        | 'invalid-lineup'
        | 'invalid-team'
        | 'invalid-scenario'
        | 'invalid-rotation';
    };

export type ApplyScenarioPortablePackageResult =
  | {
      ok: true;
      team: GameVisibleTeamState;
      scenario: CombatScenarioState;
      rotation: RotationScenarioImportMetadata;
    }
  | { ok: false; error: 'invalid-current-team' | 'invalid-imported-team' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string'
    ? value.normalize('NFKC').replace(/[<>]/gu, '').trim().slice(0, max)
    : '';
}

function validIso(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return fallback;
  return new Date(value).toISOString();
}

function validLineup(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length !== 4) return false;
  if (!value.every((entry): entry is string => typeof entry === 'string')) return false;
  if (new Set(value).size !== value.length) return false;
  return value.every((name) => characterByName.get(name)?.releaseStatus === 'released');
}

function sanitizedBuild(value: unknown): GameVisibleCharacterBuild | null {
  const snapshot = sanitizeBuildProfileSnapshot(value);
  if (!snapshot) return null;
  return {
    ...snapshot,
    activeTeamEffectIds: [],
    arc: { ...snapshot.arc, afterUltimateActive: false },
    testMode: 'neutral-reference',
    verifiedActionId: '',
  };
}

function cleanRotationForScenario(
  value: unknown,
  scenario: CombatScenarioState,
): RotationScenarioImportMetadata | null {
  const normalized = normalizeRotationScenarioImportMetadata(value);
  if (!normalized) return null;
  if (!normalized.sourceRotationId) return initialRotationScenarioImportMetadata();
  const stepIds = new Set(scenario.steps.map((step) => step.id));
  return {
    ...normalized,
    originsByStepId: Object.fromEntries(
      Object.entries(normalized.originsByStepId).filter(([stepId]) => stepIds.has(stepId)),
    ),
    pendingByStepId: Object.fromEntries(
      Object.entries(normalized.pendingByStepId).filter(([stepId]) => stepIds.has(stepId)),
    ),
  };
}

function normalizeTeamPayload(value: unknown):
  | { ok: true; value: ScenarioPortableTeamPayload }
  | { ok: false; error: 'invalid-lineup' | 'invalid-team' } {
  if (!isRecord(value) || !validLineup(value.lineup)) return { ok: false, error: 'invalid-lineup' };
  if (value.buildMode !== 'sanitized-builds' && value.buildMode !== 'lineup-only') {
    return { ok: false, error: 'invalid-team' };
  }
  const lineup = [...value.lineup];
  const buildMode = value.buildMode;

  let builds: GameVisibleCharacterBuild[] | undefined;
  if (buildMode === 'sanitized-builds') {
    if (!Array.isArray(value.builds) || value.builds.length !== 4) return { ok: false, error: 'invalid-team' };
    builds = value.builds.map(sanitizedBuild).filter((entry): entry is GameVisibleCharacterBuild => Boolean(entry));
    if (builds.length !== 4 || builds.some((build, index) => build.characterName !== lineup[index])) {
      return { ok: false, error: 'invalid-team' };
    }
  }

  const normalized = normalizeGameVisibleTeamState({
    version: GAME_VISIBLE_BUILD_VERSION,
    activeSlot: value.activeSlot,
    duration: value.duration,
    target: value.target,
    builds: builds ?? lineup.map(createEmptyGameVisibleBuild),
  });
  if (!normalized) return { ok: false, error: 'invalid-team' };

  return {
    ok: true,
    value: {
      activeSlot: normalized.activeSlot,
      duration: normalized.duration,
      lineup,
      target: normalized.target,
      buildMode,
      ...(builds ? { builds } : {}),
    },
  };
}

function blockedModelRow(step: CombatScenarioStep, lineup: readonly string[]): boolean {
  const owner = lineup[step.sourceSlot];
  if (step.kind === 'action') return visibleActionById.get(step.actionId)?.characterName !== owner;
  if (step.kind === 'activate-effect') return verifiedTeamEffectById.get(step.effectId as VerifiedTeamEffectId)?.sourceCharacter !== owner;
  if (step.kind === 'activate-cycle') return !verifiedCombatCycleModelById.has(step.cycleId as EsperCycleId);
  return false;
}

function preview(payload: ScenarioPortablePayload): ScenarioPortablePreview {
  const counts = payload.scenario.steps.reduce((result, step) => ({
    actionSteps: result.actionSteps + (step.kind === 'action' ? 1 : 0),
    effectSteps: result.effectSteps + (step.kind === 'activate-effect' ? 1 : 0),
    cycleSteps: result.cycleSteps + (step.kind === 'activate-cycle' ? 1 : 0),
    waitSteps: result.waitSteps + (step.kind === 'wait' ? 1 : 0),
    blockedModelRows: result.blockedModelRows + (blockedModelRow(step, payload.team.lineup) ? 1 : 0),
  }), { actionSteps: 0, effectSteps: 0, cycleSteps: 0, waitSteps: 0, blockedModelRows: 0 });
  return {
    name: payload.name,
    exportedAt: payload.exportedAt,
    lineup: payload.team.lineup,
    buildMode: payload.team.buildMode,
    sourceRotationId: payload.rotation.sourceRotationId,
    timingStatus: payload.rotation.timingStatus,
    totalSteps: payload.scenario.steps.length,
    ...counts,
  };
}

function normalizePayload(value: unknown):
  | { ok: true; value: ScenarioPortablePayload }
  | {
      ok: false;
      error: 'invalid-lineup' | 'invalid-team' | 'invalid-scenario' | 'invalid-rotation';
    } {
  if (!isRecord(value)) return { ok: false, error: 'invalid-team' };
  const team = normalizeTeamPayload(value.team);
  if (!team.ok) return team;
  const scenario = normalizeCombatScenarioState(value.scenario);
  if (!scenario || scenario.version !== COMBAT_SCENARIO_VERSION) return { ok: false, error: 'invalid-scenario' };
  const rotation = cleanRotationForScenario(value.rotation, scenario);
  if (!rotation || rotation.version !== ROTATION_SCENARIO_IMPORT_VERSION) return { ok: false, error: 'invalid-rotation' };
  return {
    ok: true,
    value: {
      exportedAt: validIso(value.exportedAt, '1970-01-01T00:00:00.000Z'),
      name: cleanText(value.name, 120) || scenario.name || 'Combat Scenario',
      team: team.value,
      scenario,
      rotation,
    },
  };
}

export function scenarioPortableChecksum(payload: unknown): string {
  return profileChecksum(payload);
}

export function exportScenarioPortablePackage(
  teamValue: unknown,
  scenarioValue: unknown,
  rotationValue: unknown,
  options: { includeBuilds: boolean; now: string; name?: string },
): string {
  const team = normalizeGameVisibleTeamState(teamValue);
  const scenario = normalizeCombatScenarioState(scenarioValue);
  if (!team || !scenario) throw new Error('INVALID_SCENARIO_PACKAGE_STATE');
  const lineup = team.builds.map((build) => build.characterName);
  if (!validLineup(lineup)) throw new Error('INVALID_SCENARIO_PACKAGE_LINEUP');
  const rotation = cleanRotationForScenario(rotationValue, scenario);
  if (!rotation) throw new Error('INVALID_SCENARIO_PACKAGE_ROTATION');
  const builds = options.includeBuilds
    ? team.builds.map(sanitizedBuild).filter((entry): entry is GameVisibleCharacterBuild => Boolean(entry))
    : undefined;
  if (options.includeBuilds && builds?.length !== 4) throw new Error('INVALID_SCENARIO_PACKAGE_BUILDS');

  const payload: ScenarioPortablePayload = {
    exportedAt: validIso(options.now, new Date(0).toISOString()),
    name: cleanText(options.name, 120) || scenario.name || rotation.sourceRotationId || 'Combat Scenario',
    team: {
      activeSlot: team.activeSlot,
      duration: team.duration,
      lineup,
      target: team.target,
      buildMode: options.includeBuilds ? 'sanitized-builds' : 'lineup-only',
      ...(builds ? { builds } : {}),
    },
    scenario,
    rotation,
  };
  const envelope: ScenarioPortableEnvelope = {
    kind: SCENARIO_PORTABLE_PACKAGE_KIND,
    version: SCENARIO_PORTABLE_PACKAGE_VERSION,
    payload,
    checksum: scenarioPortableChecksum(payload),
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseScenarioPortablePackage(text: string): ParseScenarioPortablePackageResult {
  if (!text.trim() || text.length > SCENARIO_PORTABLE_PACKAGE_MAX_TEXT) return { ok: false, error: 'invalid-json' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid-json' };
  }
  if (!isRecord(raw) || raw.kind !== SCENARIO_PORTABLE_PACKAGE_KIND) return { ok: false, error: 'invalid-envelope' };
  if (raw.version !== SCENARIO_PORTABLE_PACKAGE_VERSION) return { ok: false, error: 'unsupported-version' };
  if (typeof raw.checksum !== 'string' || raw.checksum !== scenarioPortableChecksum(raw.payload)) {
    return { ok: false, error: 'checksum-mismatch' };
  }
  const normalized = normalizePayload(raw.payload);
  if (!normalized.ok) return normalized;
  const envelope: ScenarioPortableEnvelope = {
    kind: SCENARIO_PORTABLE_PACKAGE_KIND,
    version: SCENARIO_PORTABLE_PACKAGE_VERSION,
    payload: normalized.value,
    checksum: scenarioPortableChecksum(normalized.value),
  };
  return {
    ok: true,
    value: {
      envelope,
      payload: normalized.value,
      preview: preview(normalized.value),
    },
  };
}

export function applyScenarioPortablePackage(
  currentTeamValue: unknown,
  parsed: ParsedScenarioPortablePackage,
): ApplyScenarioPortablePackageResult {
  const currentTeam = normalizeGameVisibleTeamState(currentTeamValue);
  if (!currentTeam) return { ok: false, error: 'invalid-current-team' };
  const payload = parsed.payload;
  const builds = payload.team.buildMode === 'sanitized-builds'
    ? payload.team.builds?.map((build) => sanitizedBuild(build))
    : payload.team.lineup.map((characterName, slot) => {
        const current = currentTeam.builds[slot];
        return current?.characterName === characterName
          ? sanitizedBuild(current)
          : createEmptyGameVisibleBuild(characterName);
      });
  if (!builds || builds.length !== 4 || builds.some((build) => !build)) {
    return { ok: false, error: 'invalid-imported-team' };
  }
  const team = normalizeGameVisibleTeamState({
    version: GAME_VISIBLE_BUILD_VERSION,
    activeSlot: payload.team.activeSlot,
    duration: payload.team.duration,
    target: payload.team.target,
    builds,
  });
  if (!team) return { ok: false, error: 'invalid-imported-team' };
  return {
    ok: true,
    team,
    scenario: payload.scenario,
    rotation: payload.rotation,
  };
}

export function canonicalScenarioPortableJson(value: unknown): string {
  return canonicalProfileJson(value);
}