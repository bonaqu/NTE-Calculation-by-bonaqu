import { describe, expect, it } from 'vitest';
import { awakeningNodes, awakeningNodesByCharacter } from './awakening-data';
import { visibleActionById } from './game-visible-calculation';

const AS_OF = Date.parse('2026-08-04T00:00:00.000Z');
const DAY_MS = 86_400_000;

function ageDays(value: string): number {
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) throw new Error(`Malformed date: ${value}`);
  return Math.floor((AS_OF - parsed) / DAY_MS);
}

describe('awakening node registry', () => {
  it('publishes six ordered nodes for every currently partial combat model', () => {
    expect(awakeningNodes).toHaveLength(30);
    expect([...awakeningNodesByCharacter.keys()].sort()).toEqual([
      'Chaos',
      'Lacrimosa',
      'Nanally',
      'Shinku',
      'Zero',
    ]);
    for (const nodes of awakeningNodesByCharacter.values()) {
      expect(nodes.map((node) => node.level)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it('keeps Russian-reference and English-fallback evidence explicit', () => {
    const zero = awakeningNodesByCharacter.get('Zero') ?? [];
    const lacrimosa = awakeningNodesByCharacter.get('Lacrimosa') ?? [];
    const nanally = awakeningNodesByCharacter.get('Nanally') ?? [];
    const shinku = awakeningNodesByCharacter.get('Shinku') ?? [];
    const chaos = awakeningNodesByCharacter.get('Chaos') ?? [];

    expect([...zero, ...lacrimosa, ...nanally].every((node) => node.evidence === 'current-russian-reference')).toBe(true);
    expect([...shinku, ...chaos].every((node) => node.evidence === 'current-english-reference')).toBe(true);
    expect(zero[0]?.title.ru).toBe('Цветущий взгляд');
    expect(nanally[2]?.title.ru).toBe('Называйте меня боссом');
    expect(lacrimosa[5]?.title.ru).toBe('Утреннее заклинание');
  });

  it('links only calculation-applied nodes to real verified action IDs', () => {
    const linked = awakeningNodes.filter((node) => node.relatedActionIds?.length);
    expect(linked.map((node) => `${node.characterName}:A${node.level}`)).toEqual([
      'Nanally:A3',
      'Zero:A1',
      'Zero:A6',
    ]);
    for (const node of linked) {
      expect(node.calculationStatus).toBe('applied');
      for (const actionId of node.relatedActionIds ?? []) {
        expect(visibleActionById.has(actionId)).toBe(true);
        expect(visibleActionById.get(actionId)?.characterName).toBe(node.characterName);
      }
    }
    expect(awakeningNodes.filter((node) => !node.relatedActionIds?.length)
      .every((node) => node.calculationStatus === 'informational')).toBe(true);
  });

  it('requires fresh, complete provenance for every node', () => {
    for (const node of awakeningNodes) {
      expect(node.title.ru.trim().length).toBeGreaterThan(0);
      expect(node.title.en.trim().length).toBeGreaterThan(0);
      expect(node.description.ru.trim().length).toBeGreaterThan(0);
      expect(node.description.en.trim().length).toBeGreaterThan(0);
      expect(node.sourceUrl).toMatch(/^https:\/\//u);
      expect(node.sourcePublisher.trim().length).toBeGreaterThan(0);
      expect(ageDays(node.sourceUpdatedAt)).toBeGreaterThanOrEqual(0);
      expect(ageDays(node.sourceUpdatedAt)).toBeLessThanOrEqual(120);
      expect(ageDays(node.verifiedAt)).toBeGreaterThanOrEqual(0);
    }
  });
});
