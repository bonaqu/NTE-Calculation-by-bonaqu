import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { characterCatalog } from './characters';
import { arcRussianNames, characterRussianNames, localizedArcName, localizedArcType, localizedCharacterName } from './gameTerms';
import {
  arcNameEvidence,
  arcTypeEvidence,
  canReplaceLocalizationPrimary,
  characterNameEvidence,
  localizationEvidenceLevels,
} from './localization-evidence';

describe('localization evidence contract', () => {
  it('covers every primary character, Arc and Arc type label', () => {
    expect(Object.keys(characterNameEvidence)).toEqual(expect.arrayContaining(characterCatalog.map((entry) => entry.name)));
    expect(Object.keys(arcNameEvidence)).toEqual(expect.arrayContaining(arcDirectory.map((entry) => entry.name)));
    expect(Object.keys(arcTypeEvidence).sort()).toEqual(['Gas', 'Liquid', 'Plasma', 'Solid', 'Synthesis']);

    for (const [canonical, evidence] of Object.entries(characterNameEvidence)) {
      expect(evidence.kind).toBe('character-name');
      expect(evidence.canonical).toBe(canonical);
      expect(evidence.russian).toBe(characterRussianNames[canonical]);
      expect(localizationEvidenceLevels).toContain(evidence.level);
      expect(evidence.verifiedAt).toBe('2026-08-04');
    }
    for (const [canonical, evidence] of Object.entries(arcNameEvidence)) {
      expect(evidence.kind).toBe('arc-name');
      expect(evidence.canonical).toBe(canonical);
      expect(evidence.russian).toBe(arcRussianNames[canonical]);
      expect(localizationEvidenceLevels).toContain(evidence.level);
      expect(evidence.verifiedAt).toBe('2026-08-04');
    }
  });

  it('keeps the owner-confirmed Tears primary and records the conflicting article variant', () => {
    const evidence = arcNameEvidence['Tears Beneath the Mask'];
    expect(evidence).toBeDefined();
    if (!evidence) throw new Error('Missing Tears Beneath the Mask localization evidence');

    expect(localizedArcName('Tears Beneath the Mask', 'ru')).toBe('Слезы за маской');
    expect(evidence.level).toBe('owner-confirmed-client');
    expect(evidence.supportingSources?.length).toBeGreaterThanOrEqual(3);
    expect(evidence.alternatives).toEqual(expect.arrayContaining([
      expect.objectContaining({ russian: 'Слезы с маской', level: 'current-russian-reference' }),
    ]));
  });

  it('keeps disputed Gas and Zero alternatives searchable but not primary', () => {
    expect(localizedArcType('Gas', 'ru')).toBe('Газ');
    expect(arcTypeEvidence.Gas.alternatives).toEqual(expect.arrayContaining([
      expect.objectContaining({ russian: 'Газовый' }),
    ]));

    const zeroEvidence = characterNameEvidence.Zero;
    expect(zeroEvidence).toBeDefined();
    if (!zeroEvidence) throw new Error('Missing Zero localization evidence');

    expect(localizedCharacterName('Zero', 'ru')).toBe('Оценщик');
    expect(zeroEvidence.alternatives).toEqual(expect.arrayContaining([
      expect.objectContaining({ russian: 'Нулевой эспер', level: 'official-russian' }),
    ]));
  });

  it('does not let weaker or equal evidence silently replace a top-tier primary', () => {
    expect(canReplaceLocalizationPrimary('owner-confirmed-client', 'current-russian-reference')).toBe(false);
    expect(canReplaceLocalizationPrimary('official-russian', 'project-fallback')).toBe(false);
    expect(canReplaceLocalizationPrimary('owner-confirmed-client', 'official-russian')).toBe(false);
    expect(canReplaceLocalizationPrimary('official-russian', 'owner-confirmed-client')).toBe(false);
    expect(canReplaceLocalizationPrimary('current-russian-reference', 'official-russian')).toBe(true);
    expect(canReplaceLocalizationPrimary('project-fallback', 'current-russian-reference')).toBe(true);
  });

  it('never marks project fallbacks as official or client-confirmed', () => {
    const all = [
      ...Object.values(characterNameEvidence),
      ...Object.values(arcNameEvidence),
      ...Object.values(arcTypeEvidence),
    ];
    for (const evidence of all.filter((entry) => entry.level === 'project-fallback')) {
      expect(evidence.sourcePublisher).toBe('NTE Calculation by bonaqu');
      expect(evidence.sourceUrl).toBeUndefined();
    }
  });
});
