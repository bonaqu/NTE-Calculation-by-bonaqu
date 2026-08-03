import { describe, expect, it } from 'vitest';
import { canonicalCharacterName, characterCatalog } from './characters';

const released = characterCatalog.filter((character) => character.releaseStatus === 'released');
const upcoming = characterCatalog.filter((character) => character.releaseStatus === 'upcoming');

describe('verified character catalog', () => {
  it('contains 22 unique sourced character records', () => {
    expect(characterCatalog).toHaveLength(22);
    expect(new Set(characterCatalog.map((character) => character.id)).size).toBe(22);
    expect(new Set(characterCatalog.map((character) => character.name)).size).toBe(22);

    for (const character of characterCatalog) {
      expect(['S', 'A']).toContain(character.rarity);
      expect(character.attribute).toBeTruthy();
      expect(character.image).toMatch(/^https:\/\/cdn\.prydwen\.gg\/images\/nte\/characters\/.+_card\.webp$/);
      expect(character.sourceUrl).toMatch(/^https:\/\//);
      expect(character.sourcePublisher.length).toBeGreaterThan(2);
      expect(character.verifiedAt).toBe('2026-08-03');
      expect(character.summary.ru.length).toBeGreaterThan(25);
      expect(character.summary.en.length).toBeGreaterThan(25);
    }
  });

  it('keeps all released profiles complete and upcoming unknowns explicit', () => {
    expect(released).toHaveLength(20);
    for (const character of released) {
      expect(character.detailsVerified).toBe(true);
      expect(character.role).toBeTruthy();
      expect(character.arcType).toBeTruthy();
    }

    expect(upcoming.map((character) => character.name).sort()).toEqual(['Linko', 'Zankou']);
    for (const character of upcoming) {
      expect(character.releaseVersion).toBe('1.3');
      expect(character.detailsVerified).toBe(false);
      expect(character.role).toBeUndefined();
      expect(character.arcType).toBeUndefined();
    }
  });

  it('normalizes canonical and Russian names without guessing unknown input', () => {
    expect(canonicalCharacterName('Shinku')).toBe('Shinku');
    expect(canonicalCharacterName('Синку')).toBe('Shinku');
    expect(canonicalCharacterName('Оценщик')).toBe('Zero');
    expect(canonicalCharacterName('Unknown')).toBeNull();
  });
});
