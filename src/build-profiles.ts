import { characterCatalog } from './characters';
import {
  combatCoverageByCharacter,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
} from './game-visible-build';
import { visibleActionById } from './verified-visible-actions';

export const BUILD_PROFILE_LIBRARY_VERSION = 1 as const;
export const BUILD_PROFILE_LIBRARY_STORAGE_KEY = 'nte.build-profiles.v1';
export const BUILD_PROFILE_EXPORT_KIND = 'nte-build-profile';
export const BUILD_PROFILE_MAX_COUNT = 50;

export interface BuildProfile {
  id: string;
  name: string;
  build: GameVisibleCharacterBuild;
  createdAt: string;
  updatedAt: string;
}

export interface BuildProfileLibrary {
  version: typeof BUILD_PROFILE_LIBRARY_VERSION;
  profiles: BuildProfile[];
}

export interface BuildProfileExportPayload {
  name: string;
  build: GameVisibleCharacterBuild;
}

export interface BuildProfileExportEnvelope {
  kind: typeof BUILD_PROFILE_EXPORT_KIND;
  version: typeof BUILD_PROFILE_LIBRARY_VERSION;
  payload: BuildProfileExportPayload;
  checksum: string;
}

export type ApplyBuildProfileResult =
  | { ok: true; team: GameVisibleTeamState }
  | { ok: false; error: 'missing-slot' | 'duplicate-character' };

export type ImportBuildProfileResult =
  | { ok: true; library: BuildProfileLibrary; profile: BuildProfile }
  | { ok: false; error: 'invalid-json' | 'invalid-envelope' | 'checksum-mismatch' | 'invalid-build' | 'library-full' };

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

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

export function canonicalProfileJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function profileChecksum(value: unknown): string {
  const input = canonicalProfileJson(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function knownCharacterName(value: unknown): value is string {
  return typeof value === 'string' && characterCatalog.some((character) => character.name === value);
}

export function sanitizeBuildProfileSnapshot(value: unknown): GameVisibleCharacterBuild | null {
  if (!isRecord(value) || !knownCharacterName(value.characterName)) return null;
  const fallback = initialGameVisibleTeamState();
  const normalized = normalizeGameVisibleTeamState({
    ...fallback,
    builds: [value, ...fallback.builds.slice(1)],
  });
  const build = normalized?.builds[0];
  if (!build || build.characterName !== value.characterName) return null;
  return {
    ...build,
    activeTeamEffectIds: [],
    arc: { ...build.arc, afterUltimateActive: false },
    testMode: 'neutral-reference',
    verifiedActionId: '',
  };
}

function normalizeProfileId(value: unknown, fallback: string): string {
  const normalized = cleanText(value, 80)
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9._-]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  return normalized || fallback;
}

function uniqueId(requested: string, used: Set<string>): string {
  if (!used.has(requested)) return requested;
  let suffix = 2;
  while (used.has(`${requested}-${suffix}`)) suffix += 1;
  return `${requested}-${suffix}`;
}

export function initialBuildProfileLibrary(): BuildProfileLibrary {
  return { version: BUILD_PROFILE_LIBRARY_VERSION, profiles: [] };
}

export function normalizeBuildProfileLibrary(value: unknown): BuildProfileLibrary | null {
  if (!isRecord(value) || value.version !== BUILD_PROFILE_LIBRARY_VERSION || !Array.isArray(value.profiles)) return null;
  const used = new Set<string>();
  const profiles: BuildProfile[] = [];
  value.profiles.slice(0, BUILD_PROFILE_MAX_COUNT).forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const build = sanitizeBuildProfileSnapshot(entry.build);
    const name = cleanText(entry.name, 60);
    if (!build || !name) return;
    const fallbackId = `profile-${index + 1}`;
    const id = uniqueId(normalizeProfileId(entry.id, fallbackId), used);
    used.add(id);
    const createdAt = validIso(entry.createdAt, '1970-01-01T00:00:00.000Z');
    const updatedAt = validIso(entry.updatedAt, createdAt);
    profiles.push({ id, name, build, createdAt, updatedAt });
  });
  return { version: BUILD_PROFILE_LIBRARY_VERSION, profiles };
}

function nextProfileId(library: BuildProfileLibrary, build: GameVisibleCharacterBuild, requestedId: string): string {
  const used = new Set(library.profiles.map((profile) => profile.id));
  const character = normalizeProfileId(build.characterName, 'character');
  return uniqueId(normalizeProfileId(requestedId, `profile-${character}`), used);
}

export function createBuildProfile(
  library: BuildProfileLibrary,
  buildValue: unknown,
  nameValue: unknown,
  options: { id: string; now: string },
): BuildProfileLibrary {
  if (library.profiles.length >= BUILD_PROFILE_MAX_COUNT) throw new Error('BUILD_PROFILE_LIBRARY_FULL');
  const build = sanitizeBuildProfileSnapshot(buildValue);
  const name = cleanText(nameValue, 60);
  if (!build || !name) throw new Error('INVALID_BUILD_PROFILE');
  const timestamp = validIso(options.now, new Date(0).toISOString());
  const profile: BuildProfile = {
    id: nextProfileId(library, build, options.id),
    name,
    build,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return { ...library, profiles: [...library.profiles, profile] };
}

export function updateBuildProfile(
  library: BuildProfileLibrary,
  profileId: string,
  buildValue: unknown,
  nameValue: unknown,
  now: string,
): BuildProfileLibrary {
  const build = sanitizeBuildProfileSnapshot(buildValue);
  const name = cleanText(nameValue, 60);
  if (!build || !name) throw new Error('INVALID_BUILD_PROFILE');
  const timestamp = validIso(now, new Date(0).toISOString());
  return {
    ...library,
    profiles: library.profiles.map((profile) => profile.id === profileId
      ? { ...profile, name, build, updatedAt: timestamp }
      : profile),
  };
}

export function renameBuildProfile(
  library: BuildProfileLibrary,
  profileId: string,
  nameValue: unknown,
  now: string,
): BuildProfileLibrary {
  const name = cleanText(nameValue, 60);
  if (!name) throw new Error('INVALID_BUILD_PROFILE_NAME');
  const timestamp = validIso(now, new Date(0).toISOString());
  return {
    ...library,
    profiles: library.profiles.map((profile) => profile.id === profileId
      ? { ...profile, name, updatedAt: timestamp }
      : profile),
  };
}

export function deleteBuildProfile(library: BuildProfileLibrary, profileId: string): BuildProfileLibrary {
  return { ...library, profiles: library.profiles.filter((profile) => profile.id !== profileId) };
}

function compatibleTestContext(
  current: GameVisibleCharacterBuild,
  profileBuild: GameVisibleCharacterBuild,
): Pick<GameVisibleCharacterBuild, 'testMode' | 'verifiedActionId'> {
  if (current.characterName !== profileBuild.characterName) {
    return { testMode: 'neutral-reference', verifiedActionId: '' };
  }
  const coverage = combatCoverageByCharacter.get(profileBuild.characterName);
  const testMode = coverage?.supportedModes.includes(current.testMode)
    ? current.testMode
    : 'neutral-reference';
  if (testMode !== 'verified-action') return { testMode, verifiedActionId: '' };
  const action = visibleActionById.get(current.verifiedActionId);
  return action?.characterName === profileBuild.characterName
    ? { testMode, verifiedActionId: action.id }
    : { testMode: 'neutral-reference', verifiedActionId: '' };
}

export function applyBuildProfile(
  team: GameVisibleTeamState,
  slot: number,
  profile: BuildProfile,
): ApplyBuildProfileResult {
  const current = team.builds[slot];
  if (!current) return { ok: false, error: 'missing-slot' };
  if (team.builds.some((build, index) => index !== slot && build.characterName === profile.build.characterName)) {
    return { ok: false, error: 'duplicate-character' };
  }
  const test = compatibleTestContext(current, profile.build);
  const applied: GameVisibleCharacterBuild = {
    ...profile.build,
    activeTeamEffectIds: [],
    arc: { ...profile.build.arc, afterUltimateActive: false },
    ...test,
  };
  return {
    ok: true,
    team: {
      ...team,
      activeSlot: slot,
      builds: team.builds.map((build, index) => index === slot ? applied : build),
    },
  };
}

export function exportBuildProfile(profile: BuildProfile): string {
  const payload: BuildProfileExportPayload = {
    name: profile.name,
    build: sanitizeBuildProfileSnapshot(profile.build)!,
  };
  const envelope: BuildProfileExportEnvelope = {
    kind: BUILD_PROFILE_EXPORT_KIND,
    version: BUILD_PROFILE_LIBRARY_VERSION,
    payload,
    checksum: profileChecksum(payload),
  };
  return canonicalProfileJson(envelope);
}

export function importBuildProfile(
  library: BuildProfileLibrary,
  raw: string,
  options: { id: string; now: string },
): ImportBuildProfileResult {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, error: 'invalid-json' };
  }
  if (!isRecord(value)
    || value.kind !== BUILD_PROFILE_EXPORT_KIND
    || value.version !== BUILD_PROFILE_LIBRARY_VERSION
    || !isRecord(value.payload)
    || typeof value.checksum !== 'string') {
    return { ok: false, error: 'invalid-envelope' };
  }
  if (profileChecksum(value.payload) !== value.checksum) return { ok: false, error: 'checksum-mismatch' };
  const name = cleanText(value.payload.name, 60);
  const build = sanitizeBuildProfileSnapshot(value.payload.build);
  if (!name || !build) return { ok: false, error: 'invalid-build' };
  if (library.profiles.length >= BUILD_PROFILE_MAX_COUNT) return { ok: false, error: 'library-full' };
  const next = createBuildProfile(library, build, name, options);
  const profile = next.profiles[next.profiles.length - 1]!;
  return { ok: true, library: next, profile };
}
