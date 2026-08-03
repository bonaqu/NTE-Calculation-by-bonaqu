import { arcCatalog, arcCatalogSourceIds } from '../../../src/arc-catalog';
import { arcPresets } from '../../../src/arc-presets';
import { characterCatalog } from '../../../src/characters';
import { iroiProgression } from '../../../src/data';
import { esperCycles } from '../../../src/esper-cycles';
import { rotationPresets } from '../../../src/rotation-presets';
import { calculateDamage, calculateTeam, type DamageInput, type TeamMemberInput } from '../../../packages/calculation-core/src';

const MAX_BODY_BYTES = 32_768;
const FORMULA_VERSION = '0.2';
const SERVICE_VERSION = '0.5.0';
const DATASET_VERIFIED_AT = '2026-08-03';

function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}

function json(body: unknown, status = 200, requestId?: string, cacheControl = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
      'x-content-type-options': 'nosniff',
      ...(requestId ? { 'x-request-id': requestId } : {}),
      ...corsHeaders(),
    },
  });
}

async function parseJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  return JSON.parse(text) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasFiniteNumbers(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
}

const damageNumberKeys = [
  'characterLevel', 'baseAtk', 'arcAtk', 'flatAtk', 'atkPercent', 'teamAtkPercent', 'skillMultiplier', 'hits',
  'damageBonus', 'teamDamageBonus', 'critRate', 'critDamage',
];
const enemyNumberKeys = ['level', 'resistance', 'defenceReduction', 'resistanceReduction'];

function isDamageInput(value: unknown): value is DamageInput {
  if (!isRecord(value) || !hasFiniteNumbers(value, damageNumberKeys) || !isRecord(value.enemy)) return false;
  return hasFiniteNumbers(value.enemy, enemyNumberKeys);
}

function isTeamMember(value: unknown): value is TeamMemberInput {
  if (!isDamageInput(value)) return false;
  const record = value as unknown as Record<string, unknown>;
  return typeof record.id === 'string'
    && typeof record.name === 'string'
    && typeof record.actionsPerRotation === 'number'
    && Number.isFinite(record.actionsPerRotation);
}

const endpoints = [
  '/api/v1/health',
  '/api/v1/data/arcs',
  '/api/v1/data/arc-presets',
  '/api/v1/data/characters',
  '/api/v1/data/esper-cycles',
  '/api/v1/data/rotation-presets',
  '/api/v1/data/progression/iroi',
  '/api/v1/calculate/damage',
  '/api/v1/calculate/team',
];

export default {
  async fetch(request: Request): Promise<Response> {
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);
    const startedAt = Date.now();
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });

    try {
      let response: Response;
      if (request.method === 'GET' && url.pathname === '/api/v1') {
        response = json({
          service: 'nte-calculation-api',
          version: SERVICE_VERSION,
          formulaVersion: FORMULA_VERSION,
          datasetVerifiedAt: DATASET_VERIFIED_AT,
          endpoints,
        }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'GET' && url.pathname === '/api/v1/health') {
        response = json({
          ok: true,
          service: 'nte-calculation-api',
          version: SERVICE_VERSION,
          formulaVersion: FORMULA_VERSION,
        }, 200, requestId);
      } else if (request.method === 'GET' && url.pathname === '/api/v1/data/arcs') {
        response = json({
          data: arcCatalog,
          count: arcCatalog.length,
          sourceIds: arcCatalogSourceIds,
          verifiedAt: DATASET_VERIFIED_AT,
        }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'GET' && url.pathname === '/api/v1/data/arc-presets') {
        response = json({
          data: arcPresets,
          count: arcPresets.length,
          verifiedAt: DATASET_VERIFIED_AT,
          formulaVersion: FORMULA_VERSION,
          scope: 'calculator-presets',
        }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'GET' && url.pathname === '/api/v1/data/characters') {
        response = json({
          data: characterCatalog,
          count: characterCatalog.length,
          releasedCount: characterCatalog.filter((character) => character.releaseStatus === 'released').length,
          upcomingCount: characterCatalog.filter((character) => character.releaseStatus === 'upcoming').length,
          verifiedAt: DATASET_VERIFIED_AT,
          scope: 'sourced-character-profiles',
        }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'GET' && url.pathname === '/api/v1/data/esper-cycles') {
        response = json({
          data: esperCycles,
          count: esperCycles.length,
          pairCount: esperCycles.filter((cycle) => cycle.category === 'pair').length,
          tripleCount: esperCycles.filter((cycle) => cycle.category === 'triple').length,
          verifiedAt: DATASET_VERIFIED_AT,
          scope: 'sourced-esper-cycle-definitions',
        }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'GET' && url.pathname === '/api/v1/data/rotation-presets') {
        response = json({
          data: rotationPresets,
          count: rotationPresets.length,
          stepCount: rotationPresets.reduce((sum, preset) => sum + preset.steps.length, 0),
          verifiedAt: DATASET_VERIFIED_AT,
          scope: 'sourced-ordered-rotation-presets',
          timingPolicy: 'No unsourced second-by-second duration or DPS claims.',
        }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'GET' && url.pathname === '/api/v1/data/progression/iroi') {
        response = json({ data: iroiProgression, verifiedAt: DATASET_VERIFIED_AT }, 200, requestId, 'public, max-age=300');
      } else if (request.method === 'POST' && url.pathname === '/api/v1/calculate/damage') {
        const input = await parseJson(request);
        response = isDamageInput(input)
          ? json({ result: calculateDamage(input), formulaVersion: FORMULA_VERSION }, 200, requestId)
          : json({ error: 'INVALID_DAMAGE_INPUT', requestId }, 400, requestId);
      } else if (request.method === 'POST' && url.pathname === '/api/v1/calculate/team') {
        const input = await parseJson(request);
        if (!isRecord(input)
          || !Array.isArray(input.members)
          || !input.members.every(isTeamMember)
          || input.members.length < 1
          || input.members.length > 4
          || typeof input.duration !== 'number'
          || !Number.isFinite(input.duration)) {
          response = json({ error: 'INVALID_TEAM_INPUT', requestId }, 400, requestId);
        } else {
          response = json({ result: calculateTeam(input.members, input.duration), formulaVersion: FORMULA_VERSION }, 200, requestId);
        }
      } else {
        response = json({ error: 'NOT_FOUND', requestId }, 404, requestId);
      }
      console.log(JSON.stringify({ requestId, method: request.method, path: url.pathname, status: response.status, durationMs: Date.now() - startedAt }));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      const status = message === 'PAYLOAD_TOO_LARGE' ? 413 : error instanceof SyntaxError ? 400 : 500;
      console.error(JSON.stringify({ requestId, method: request.method, path: url.pathname, status, durationMs: Date.now() - startedAt, error: message }));
      return json({ error: status === 500 ? 'INTERNAL_ERROR' : message, requestId }, status, requestId);
    }
  },
};
