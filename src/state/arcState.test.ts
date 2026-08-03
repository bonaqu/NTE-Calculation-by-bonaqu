import { describe, expect, it } from 'vitest';
import {
  buildArcShareUrl,
  createDefaultArcState,
  decodeArcShareState,
  defaultArcStats,
  encodeArcShareState,
  normalizeArcCalculatorState,
  normalizeArcStats,
  readArcShareState,
  removeArcShareParam,
} from './arcState';

const scenarios = ['prydwen-public', 'rivyn-support'] as const;

describe('Arc calculator state', () => {
  it('round-trips a compact custom share payload', () => {
    const state = {
      ...createDefaultArcState(scenarios[0]),
      mode: 'custom' as const,
      scenarioId: scenarios[1],
      stats: { ...defaultArcStats, baseAtk: 1777, passiveUptime: 42 },
    };

    expect(decodeArcShareState(encodeArcShareState(state), scenarios)).toEqual(state);
  });

  it('rejects malformed, oversized and non-finite payloads', () => {
    expect(decodeArcShareState('not-base64-json', scenarios)).toBeNull();
    expect(decodeArcShareState('x'.repeat(2_049), scenarios)).toBeNull();
    expect(normalizeArcStats({ ...defaultArcStats, baseAtk: Number.NaN })).toBeNull();
  });

  it('normalizes bounded numeric values and integer-only fields', () => {
    expect(normalizeArcStats({
      ...defaultArcStats,
      critRate: 170,
      passiveUptime: -15,
      hits: 2.6,
      enemyLevel: 300,
    })).toMatchObject({
      critRate: 100,
      passiveUptime: 0,
      hits: 3,
      enemyLevel: 200,
    });
  });

  it('falls back to a valid scenario and benchmark mode for stale metadata', () => {
    const normalized = normalizeArcCalculatorState({
      version: 1,
      mode: 'unknown',
      scenarioId: 'removed-scenario',
      stats: defaultArcStats,
    }, scenarios);

    expect(normalized).toMatchObject({ mode: 'benchmark', scenarioId: scenarios[0] });
  });

  it('builds, reads and removes a share parameter without breaking hash routing', () => {
    const state = { ...createDefaultArcState(scenarios[0]), mode: 'custom' as const };
    const sharedUrl = buildArcShareUrl(state, 'https://example.test/tool?source=test#/database');
    const parsed = new URL(sharedUrl);

    expect(parsed.hash).toBe('#/arcs');
    expect(parsed.searchParams.get('source')).toBe('test');
    expect(readArcShareState(parsed.search, scenarios)).toEqual(state);
    expect(removeArcShareParam(sharedUrl)).toBe('/tool?source=test#/arcs');
  });
});
