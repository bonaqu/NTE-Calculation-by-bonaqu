import { describe, expect, it } from 'vitest';
import { emptyAscensionInventory, type RosterProgressionState } from './progression-engine';
import {
  MAX_PROGRESSION_EXPORT_BYTES,
  applyProgressionShare,
  buildProgressionShareUrl,
  decodeProgressionShareState,
  encodeProgressionShareState,
  parseProgressionPlan,
  readProgressionShareState,
  removeProgressionShareParam,
  serializeProgressionPlan,
} from './progression-share';

function sampleState(): RosterProgressionState {
  const inventory = emptyAscensionInventory();
  inventory.beetleCoin = 123_456;
  inventory.pageDelusionsShore = 9;
  return {
    version: 2,
    entries: [
      { characterName: 'Iroi', completedSteps: 3 },
      { characterName: 'Shinku', completedSteps: 1 },
    ],
    inventory,
  };
}

describe('progression share links', () => {
  it('excludes inventory by default', () => {
    const decoded = decodeProgressionShareState(encodeProgressionShareState(sampleState()));
    expect(decoded?.includesInventory).toBe(false);
    expect(decoded?.state.entries).toEqual(sampleState().entries);
    expect(decoded?.state.inventory.beetleCoin).toBe(0);
    expect(decoded?.state.inventory.pageDelusionsShore).toBe(0);
  });

  it('includes only explicitly requested inventory', () => {
    const decoded = decodeProgressionShareState(encodeProgressionShareState(sampleState(), true));
    expect(decoded?.includesInventory).toBe(true);
    expect(decoded?.state.inventory.beetleCoin).toBe(123_456);
    expect(decoded?.state.inventory.pageDelusionsShore).toBe(9);
    expect(decoded?.state.inventory.chargingKnightSparkPlug).toBe(0);
  });

  it('preserves recipient inventory when the link excludes it', () => {
    const current = sampleState();
    current.inventory.beetleCoin = 999;
    const shared = decodeProgressionShareState(encodeProgressionShareState({
      ...sampleState(),
      entries: [{ characterName: 'Chaos', completedSteps: 2 }],
    }));
    expect(shared).not.toBeNull();
    const applied = applyProgressionShare(current, shared!);
    expect(applied.entries).toEqual([{ characterName: 'Chaos', completedSteps: 2 }]);
    expect(applied.inventory.beetleCoin).toBe(999);
  });

  it('replaces inventory when the sender opted in', () => {
    const current = sampleState();
    current.inventory.beetleCoin = 999;
    const sender = sampleState();
    sender.inventory.beetleCoin = 42;
    const shared = decodeProgressionShareState(encodeProgressionShareState(sender, true));
    expect(shared).not.toBeNull();
    expect(applyProgressionShare(current, shared!).inventory.beetleCoin).toBe(42);
  });

  it('builds and consumes a compact progression route URL', () => {
    const url = buildProgressionShareUrl(sampleState(), 'https://example.com/tool/?theme=dark#/team');
    const parsed = new URL(url);
    expect(parsed.hash).toBe('#/progression');
    expect(parsed.searchParams.get('theme')).toBe('dark');
    expect(readProgressionShareState(parsed.search)?.state.entries).toEqual(sampleState().entries);
    expect(removeProgressionShareParam(url)).toBe('/tool/?theme=dark#/progression');
  });

  it('rejects malformed, unknown-index and oversized payloads', () => {
    expect(decodeProgressionShareState('not-base64')).toBeNull();
    expect(decodeProgressionShareState(btoa(JSON.stringify({ v: 1, e: [[999, 2]] })))).toEqual({
      state: { version: 2, entries: [], inventory: emptyAscensionInventory() },
      includesInventory: false,
    });
    expect(decodeProgressionShareState('a'.repeat(8_193))).toBeNull();
  });
});

describe('progression JSON import and export', () => {
  it('round-trips a human-readable versioned backup', () => {
    const json = serializeProgressionPlan(sampleState(), '2026-08-04T01:00:00.000Z');
    expect(json).toContain('"format": "nte-roster-progression"');
    expect(json).toContain('"exportedAt": "2026-08-04T01:00:00.000Z"');
    expect(parseProgressionPlan(json)).toEqual(sampleState());
  });

  it('rejects malformed, wrong-format and oversized imports', () => {
    expect(parseProgressionPlan('{broken')).toBeNull();
    expect(parseProgressionPlan(JSON.stringify({ format: 'other', version: 1, state: sampleState() }))).toBeNull();
    expect(parseProgressionPlan('x'.repeat(MAX_PROGRESSION_EXPORT_BYTES + 1))).toBeNull();
  });
});
