import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { characterArcGuides, guideMeasurementKind } from './arc-recommendations';
import { characterCatalog } from './characters';

const arcByName = new Map(arcDirectory.map((arc) => [arc.name, arc]));
const characterByName = new Map(characterCatalog.map((character) => [character.name, character]));
const releasedCharacters = characterCatalog.filter((character) => character.releaseStatus !== 'upcoming');

describe('character Arc recommendations', () => {
  it('covers every released character exactly once and excludes upcoming characters', () => {
    expect(releasedCharacters).toHaveLength(20);
    expect(characterArcGuides).toHaveLength(releasedCharacters.length);
    expect(new Set(characterArcGuides.map((entry) => entry.characterName)).size).toBe(characterArcGuides.length);
    expect(new Set(characterArcGuides.map((entry) => entry.characterName)))
      .toEqual(new Set(releasedCharacters.map((character) => character.name)));
    expect(characterArcGuides.map((entry) => entry.characterName)).not.toEqual(expect.arrayContaining(['Linko', 'Zankou']));
  });

  it('references existing compatible Arcs and explicit Mixing levels', () => {
    for (const guide of characterArcGuides) {
      const character = characterByName.get(guide.characterName);
      expect(character).toBeDefined();
      expect(character?.arcType).toBeDefined();
      expect(guide.recommendations.length).toBeGreaterThan(0);

      for (const recommendation of guide.recommendations) {
        const arc = arcByName.get(recommendation.arcName);
        expect(arc, `${guide.characterName}: ${recommendation.arcName}`).toBeDefined();
        expect(arc?.type, `${guide.characterName}: ${recommendation.arcName}`).toBe(character?.arcType);
        expect([1, 2, 3, 4, 5]).toContain(recommendation.mixing);
      }
    }
  });

  it('does not duplicate the same Arc and Mixing level within a guide', () => {
    for (const guide of characterArcGuides) {
      const identities = guide.recommendations.map((entry) => `${entry.arcName}:M${entry.mixing}`);
      expect(new Set(identities).size, guide.characterName).toBe(identities.length);
    }
  });

  it('keeps percentages optional, finite and positive rather than inventing values', () => {
    const qualitative = characterArcGuides.filter((entry) => guideMeasurementKind(entry) === 'qualitative');
    const quantitative = characterArcGuides.filter((entry) => guideMeasurementKind(entry) === 'quantitative');
    const mixed = characterArcGuides.filter((entry) => guideMeasurementKind(entry) === 'mixed');

    expect(qualitative.length).toBeGreaterThan(0);
    expect(quantitative.length).toBeGreaterThan(0);
    expect(mixed.map((entry) => entry.characterName)).toEqual(['Zero']);

    for (const guide of characterArcGuides) {
      for (const recommendation of guide.recommendations) {
        if (recommendation.relativePercent === undefined) continue;
        expect(Number.isFinite(recommendation.relativePercent)).toBe(true);
        expect(recommendation.relativePercent).toBeGreaterThan(0);
      }
    }
  });

  it('stores current source and verification metadata for every guide', () => {
    for (const guide of characterArcGuides) {
      expect(guide.sourcePublisher).toBe('Prydwen Institute');
      expect(guide.sourceUrl).toMatch(/^https:\/\/www\.prydwen\.gg\/neverness-to-everness\/characters\/[a-z-]+$/u);
      expect(guide.sourceUpdatedAt).toMatch(/^2026-\d{2}-\d{2}$/u);
      expect(guide.verifiedAt).toBe('2026-08-04');
      expect(Date.parse(guide.sourceUpdatedAt)).not.toBeNaN();
      expect(Date.parse(guide.verifiedAt)).not.toBeNaN();
      expect(Date.parse(guide.sourceUpdatedAt)).toBeLessThanOrEqual(Date.parse(guide.verifiedAt));
    }
  });

  it('keeps specialist recommendations visibly separate from the main ranking', () => {
    const zero = characterArcGuides.find((entry) => entry.characterName === 'Zero');
    expect(zero?.recommendations.filter((entry) => entry.category === 'specialist'))
      .toEqual([expect.objectContaining({ arcName: 'Your Happiness is Priceless', relativePercent: undefined })]);
  });
});
