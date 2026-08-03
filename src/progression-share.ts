import { ascensionMaterialIds, characterAscensionProfiles } from './progression-data';
import {
  emptyAscensionInventory,
  normalizeRosterProgressionState,
  type RosterProgressionState,
} from './progression-engine';

export const PROGRESSION_SHARE_PARAM = 'plan';
export const PROGRESSION_EXPORT_FORMAT = 'nte-roster-progression';
export const MAX_PROGRESSION_SHARE_LENGTH = 8_192;
export const MAX_PROGRESSION_EXPORT_BYTES = 65_536;

export interface DecodedProgressionShare {
  state: RosterProgressionState;
  includesInventory: boolean;
}

type CompactProgressionPayload = {
  v: 1;
  e: Array<[number, number]>;
  i?: Array<[number, number]>;
};

type ProgressionExportEnvelope = {
  format: typeof PROGRESSION_EXPORT_FORMAT;
  version: 1;
  exportedAt: string;
  state: RosterProgressionState;
};

const characterIndex = new Map(characterAscensionProfiles.map((profile, index) => [profile.characterName, index]));

function toBase64Url(value: string): string {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function fromBase64Url(value: string): string {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTuple(value: unknown): value is [number, number] {
  return Array.isArray(value)
    && value.length === 2
    && value.every((item) => typeof item === 'number' && Number.isInteger(item));
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function encodeProgressionShareState(
  state: RosterProgressionState,
  includeInventory = false,
): string {
  const normalized = normalizeRosterProgressionState(state);
  if (!normalized) throw new Error('INVALID_PROGRESSION_STATE');

  const entries: Array<[number, number]> = [];
  for (const entry of normalized.entries) {
    const index = characterIndex.get(entry.characterName);
    if (index !== undefined) entries.push([index, entry.completedSteps]);
  }

  const payload: CompactProgressionPayload = { v: 1, e: entries };
  if (includeInventory) {
    const inventory: Array<[number, number]> = [];
    for (const [index, id] of ascensionMaterialIds.entries()) {
      const value = normalized.inventory[id];
      if (value > 0) inventory.push([index, value]);
    }
    payload.i = inventory;
  }

  return toBase64Url(JSON.stringify(payload));
}

export function decodeProgressionShareState(encoded: string | null): DecodedProgressionShare | null {
  if (!encoded || encoded.length > MAX_PROGRESSION_SHARE_LENGTH) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as unknown;
    if (!isRecord(payload) || payload.v !== 1 || !Array.isArray(payload.e)) return null;
    if (payload.e.length > characterAscensionProfiles.length || !payload.e.every(isTuple)) return null;
    if (payload.i !== undefined && (!Array.isArray(payload.i) || payload.i.length > ascensionMaterialIds.length || !payload.i.every(isTuple))) return null;

    const entries = payload.e.flatMap((tuple) => {
      const [index, completedSteps] = tuple;
      const profile = characterAscensionProfiles[index];
      return profile ? [{ characterName: profile.characterName, completedSteps }] : [];
    });
    const inventory = emptyAscensionInventory();
    const includesInventory = Array.isArray(payload.i);

    if (includesInventory) {
      for (const [index, value] of payload.i as Array<[number, number]>) {
        const id = ascensionMaterialIds[index];
        if (id) inventory[id] = value;
      }
    }

    const state = normalizeRosterProgressionState({ version: 2, entries, inventory });
    return state ? { state, includesInventory } : null;
  } catch {
    return null;
  }
}

export function readProgressionShareState(search: string): DecodedProgressionShare | null {
  return decodeProgressionShareState(new URLSearchParams(search).get(PROGRESSION_SHARE_PARAM));
}

export function buildProgressionShareUrl(
  state: RosterProgressionState,
  currentHref: string,
  includeInventory = false,
): string {
  const url = new URL(currentHref);
  url.searchParams.set(PROGRESSION_SHARE_PARAM, encodeProgressionShareState(state, includeInventory));
  url.hash = '/progression';
  return url.toString();
}

export function removeProgressionShareParam(currentHref: string): string {
  const url = new URL(currentHref);
  url.searchParams.delete(PROGRESSION_SHARE_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function applyProgressionShare(
  current: RosterProgressionState,
  shared: DecodedProgressionShare,
): RosterProgressionState {
  return shared.includesInventory
    ? shared.state
    : { ...shared.state, inventory: { ...current.inventory } };
}

export function serializeProgressionPlan(
  state: RosterProgressionState,
  exportedAt = new Date().toISOString(),
): string {
  const normalized = normalizeRosterProgressionState(state);
  if (!normalized) throw new Error('INVALID_PROGRESSION_STATE');
  const envelope: ProgressionExportEnvelope = {
    format: PROGRESSION_EXPORT_FORMAT,
    version: 1,
    exportedAt,
    state: normalized,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseProgressionPlan(text: string): RosterProgressionState | null {
  if (!text || byteLength(text) > MAX_PROGRESSION_EXPORT_BYTES) return null;

  try {
    const envelope = JSON.parse(text) as unknown;
    if (!isRecord(envelope)
      || envelope.format !== PROGRESSION_EXPORT_FORMAT
      || envelope.version !== 1
      || !isRecord(envelope.state)) return null;
    return normalizeRosterProgressionState(envelope.state);
  } catch {
    return null;
  }
}
