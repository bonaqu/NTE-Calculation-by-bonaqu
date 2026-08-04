import {
  calculateCombatScenario,
  COMBAT_SCENARIO_VERSION,
  normalizeCombatScenarioState,
} from '../../../src/combat-scenario';
import {
  GAME_VISIBLE_BUILD_VERSION,
  normalizeGameVisibleTeamState,
} from '../../../src/game-visible-build';
import baseApi from './index';

const SERVICE_VERSION = '0.9.0';
const MAX_SCENARIO_BODY_BYTES = 65_536;
const COMBAT_SCENARIO_ENDPOINT = '/api/v1/calculate/combat-scenario';

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function parseScenarioBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_SCENARIO_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_SCENARIO_BODY_BYTES) throw new Error('PAYLOAD_TOO_LARGE');
  return JSON.parse(text) as unknown;
}

async function augmentBaseJson(
  request: Request,
  mutate: (body: Record<string, unknown>) => Record<string, unknown>,
): Promise<Response> {
  const response = await baseApi.fetch(request);
  const body = await response.json() as unknown;
  if (!isRecord(body)) return response;
  const headers = new Headers(response.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(mutate(body)), {
    status: response.status,
    headers,
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/v1') {
      return augmentBaseJson(request, (body) => ({
        ...body,
        version: SERVICE_VERSION,
        combatScenarioVersion: COMBAT_SCENARIO_VERSION,
        endpoints: Array.isArray(body.endpoints)
          ? [...new Set([...body.endpoints.filter((entry): entry is string => typeof entry === 'string'), COMBAT_SCENARIO_ENDPOINT])]
          : [COMBAT_SCENARIO_ENDPOINT],
      }));
    }

    if (request.method === 'GET' && url.pathname === '/api/v1/health') {
      return augmentBaseJson(request, (body) => ({
        ...body,
        version: SERVICE_VERSION,
        combatScenarioVersion: COMBAT_SCENARIO_VERSION,
      }));
    }

    if (request.method === 'GET' && url.pathname === '/api/v1/data/combat-models') {
      return augmentBaseJson(request, (body) => ({
        ...body,
        combatScenarioVersion: COMBAT_SCENARIO_VERSION,
        combatScenarioStepKinds: ['action', 'activate-effect', 'wait'],
        combatScenarioPolicy: 'Only verified actions and explicitly activated timed effects are calculated.',
      }));
    }

    if (request.method === 'POST' && url.pathname === COMBAT_SCENARIO_ENDPOINT) {
      const requestId = crypto.randomUUID();
      try {
        const input = await parseScenarioBody(request);
        const team = isRecord(input) ? normalizeGameVisibleTeamState(input.team) : null;
        const scenario = isRecord(input) ? normalizeCombatScenarioState(input.scenario) : null;
        if (!team || !scenario) {
          return json({ error: 'INVALID_COMBAT_SCENARIO_INPUT', requestId }, 400, requestId);
        }
        return json({
          result: calculateCombatScenario(team, scenario),
          visibleBuildVersion: GAME_VISIBLE_BUILD_VERSION,
          combatScenarioVersion: COMBAT_SCENARIO_VERSION,
          policy: 'verified-actions-and-timed-effects-only',
        }, 200, requestId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        const status = message === 'PAYLOAD_TOO_LARGE' ? 413 : error instanceof SyntaxError ? 400 : 500;
        return json({ error: status === 500 ? 'INTERNAL_ERROR' : message, requestId }, status, requestId);
      }
    }

    return baseApi.fetch(request);
  },
};
