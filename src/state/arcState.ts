export const ARC_STATE_STORAGE_KEY = 'nte.arcs.state.v1';
export const ARC_SHARE_PARAM = 'arc';

export const arcStatKeys = [
  'baseAtk',
  'flatAtk',
  'atkPercent',
  'critRate',
  'critDamage',
  'damageBonus',
  'skillMultiplier',
  'hits',
  'enemyLevel',
  'resistance',
  'teamFixed',
  'passiveUptime',
] as const;

export type ArcStatKey = typeof arcStatKeys[number];
export type ArcMode = 'benchmark' | 'custom';
export type ArcStats = Record<ArcStatKey, number>;

export interface ArcCalculatorState {
  version: 1;
  mode: ArcMode;
  scenarioId: string;
  stats: ArcStats;
}

export const defaultArcStats: ArcStats = {
  baseAtk: 1500,
  flatAtk: 250,
  atkPercent: 70,
  critRate: 30,
  critDamage: 70,
  damageBonus: 10,
  skillMultiplier: 1000,
  hits: 1,
  enemyLevel: 82,
  resistance: 20,
  teamFixed: 2_300_000,
  passiveUptime: 100,
};

const bounds: Record<ArcStatKey, readonly [number, number]> = {
  baseAtk: [0, 10_000],
  flatAtk: [0, 100_000],
  atkPercent: [-100, 1_000],
  critRate: [0, 100],
  critDamage: [0, 2_000],
  damageBonus: [-100, 2_000],
  skillMultiplier: [0, 100_000],
  hits: [0, 1_000],
  enemyLevel: [1, 200],
  resistance: [-500, 500],
  teamFixed: [0, 1_000_000_000_000],
  passiveUptime: [0, 100],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function normalizeArcStats(value: unknown): ArcStats | null {
  if (!isRecord(value)) return null;
  const normalized = {} as ArcStats;

  for (const key of arcStatKeys) {
    const candidate = value[key];
    if (typeof candidate !== 'number' || !Number.isFinite(candidate)) return null;
    const [min, max] = bounds[key];
    const bounded = clamp(candidate, min, max);
    normalized[key] = key === 'hits' || key === 'enemyLevel' ? Math.round(bounded) : bounded;
  }

  return normalized;
}

export function createDefaultArcState(scenarioId: string): ArcCalculatorState {
  return { version: 1, mode: 'benchmark', scenarioId, stats: { ...defaultArcStats } };
}

export function normalizeArcCalculatorState(
  value: unknown,
  validScenarioIds: readonly string[],
): ArcCalculatorState | null {
  if (!isRecord(value) || value.version !== 1) return null;
  const stats = normalizeArcStats(value.stats);
  if (!stats) return null;

  const fallbackScenario = validScenarioIds[0];
  if (!fallbackScenario) return null;
  const scenarioId = typeof value.scenarioId === 'string' && validScenarioIds.includes(value.scenarioId)
    ? value.scenarioId
    : fallbackScenario;
  const mode: ArcMode = value.mode === 'custom' ? 'custom' : 'benchmark';

  return { version: 1, mode, scenarioId, stats };
}

type ArcSharePayload = {
  v: 1;
  m: ArcMode;
  s: string;
  x: number[];
};

const toBase64Url = (value: string): string =>
  btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');

const fromBase64Url = (value: string): string => {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
};

export function encodeArcShareState(state: ArcCalculatorState): string {
  const payload: ArcSharePayload = {
    v: 1,
    m: state.mode,
    s: state.scenarioId,
    x: arcStatKeys.map((key) => state.stats[key]),
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeArcShareState(
  encoded: string | null,
  validScenarioIds: readonly string[],
): ArcCalculatorState | null {
  if (!encoded || encoded.length > 2_048) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as unknown;
    if (!isRecord(payload) || payload.v !== 1 || !Array.isArray(payload.x) || payload.x.length !== arcStatKeys.length) return null;
    const statsObject = Object.fromEntries(arcStatKeys.map((key, index) => [key, payload.x[index]]));
    return normalizeArcCalculatorState({
      version: 1,
      mode: payload.m,
      scenarioId: payload.s,
      stats: statsObject,
    }, validScenarioIds);
  } catch {
    return null;
  }
}

export function readArcShareState(search: string, validScenarioIds: readonly string[]): ArcCalculatorState | null {
  return decodeArcShareState(new URLSearchParams(search).get(ARC_SHARE_PARAM), validScenarioIds);
}

export function buildArcShareUrl(state: ArcCalculatorState, currentHref: string): string {
  const url = new URL(currentHref);
  url.searchParams.set(ARC_SHARE_PARAM, encodeArcShareState(state));
  url.hash = '/arcs';
  return url.toString();
}

export function removeArcShareParam(currentHref: string): string {
  const url = new URL(currentHref);
  url.searchParams.delete(ARC_SHARE_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}
