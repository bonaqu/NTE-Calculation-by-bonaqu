import { describe, expect, it } from 'vitest';
import { characterCombatCoverage } from './game-visible-build';
import { verifiedVisibleActions } from './game-visible-calculation';

const AS_OF = Date.parse('2026-08-04T00:00:00.000Z');
const DAY_MS = 86_400_000;

function ageDays(value: string): number {
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) throw new Error(`Malformed evidence date: ${value}`);
  return Math.floor((AS_OF - parsed) / DAY_MS);
}

describe('game-visible combat evidence freshness', () => {
  it('keeps one dated evidence record for every released-character coverage entry', () => {
    expect(characterCombatCoverage).toHaveLength(20);
    for (const record of characterCombatCoverage) {
      expect(record.sourcePublisher.trim().length).toBeGreaterThan(0);
      expect(record.verifiedAt).toMatch(/^2026-\d{2}-\d{2}$/u);
      expect(ageDays(record.verifiedAt)).toBeGreaterThanOrEqual(0);
      expect(ageDays(record.verifiedAt)).toBeLessThanOrEqual(120);
      expect(record.note.ru.trim().length).toBeGreaterThan(0);
      expect(record.note.en.trim().length).toBeGreaterThan(0);
    }
  });

  it('requires direct source metadata and a hard freshness limit for exact actions', () => {
    expect(verifiedVisibleActions.length).toBeGreaterThan(0);
    for (const action of verifiedVisibleActions) {
      expect(action.sourceUrl).toMatch(/^https:\/\//u);
      expect(action.sourcePublisher.trim().length).toBeGreaterThan(0);
      expect(action.verifiedAt).toMatch(/^2026-\d{2}-\d{2}$/u);
      expect(ageDays(action.verifiedAt)).toBeGreaterThanOrEqual(0);
      expect(ageDays(action.verifiedAt)).toBeLessThanOrEqual(90);
      expect(action.multiplier).toBeGreaterThan(0);
      expect(Number.isFinite(action.multiplier)).toBe(true);
    }
  });

  it('does not let relative-only coverage expose exact-action mode', () => {
    for (const record of characterCombatCoverage.filter((entry) => entry.coverage === 'relative-only')) {
      expect(record.supportedModes).not.toContain('verified-action');
      expect(record.supportedModes).not.toContain('burst-reference');
    }
  });
});
