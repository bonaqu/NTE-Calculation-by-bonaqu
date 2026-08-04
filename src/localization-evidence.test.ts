import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { characterCatalog } from './characters';
import {
  arcRussianNames,
  arcTypeRussian,
  attributeRussian,
  characterRussianNames,
  localizedArcName,
  localizedArcType,
  localizedCharacterName,
  roleRussian,
  russianClientTerminology,
  statRussian,
} from './gameTerms';
import {
  allLocalizationEvidence,
  arcNameEvidence,
  arcTypeEvidence,
  attributeEvidence,
  canReplaceLocalizationPrimary,
  characterNameEvidence,
  combatTermEvidence,
  localizationEvidenceKinds,
  localizationEvidenceLevels,
  progressionMaterialEvidence,
  roleEvidence,
  statEvidence,
} from './localization-evidence';
import { ascensionMaterials } from './progression-data';

describe('localization evidence contract', () => {
  it('covers every primary character, Arc and Arc type label', () => {
    expect(Object.keys(characterNameEvidence)).toEqual(expect.arrayContaining(characterCatalog.map((entry) => entry.name)));
    expect(Object.keys(arcNameEvidence)).toEqual(expect.arrayContaining(arcDirectory.map((entry) => entry.name)));
    expect(Object.keys(arcTypeEvidence).sort()).toEqual(Object.keys(arcTypeRussian).sort());

    for (const [canonical, evidence] of Object.entries(characterNameEvidence)) {
      expect(evidence.kind).toBe('character-name');
      expect(evidence.canonical).toBe(canonical);
      expect(evidence.english).toBe(canonical);
      expect(evidence.russian).toBe(characterRussianNames[canonical]);
      expect(localizationEvidenceLevels).toContain(evidence.level);
      expect(evidence.verifiedAt).toBe('2026-08-04');
    }
    for (const [canonical, evidence] of Object.entries(arcNameEvidence)) {
      expect(evidence.kind).toBe('arc-name');
      expect(evidence.canonical).toBe(canonical);
      expect(evidence.english).toBe(canonical);
      expect(evidence.russian).toBe(arcRussianNames[canonical]);
      expect(localizationEvidenceLevels).toContain(evidence.level);
      expect(evidence.verifiedAt).toBe('2026-08-04');
    }
  });

  it('covers attributes, roles, stats, combat terms and progression materials', () => {
    expect(Object.keys(attributeEvidence).sort()).toEqual(Object.keys(attributeRussian).sort());
    expect(Object.keys(roleEvidence).sort()).toEqual(Object.keys(roleRussian).sort());
    expect(Object.keys(statEvidence).sort()).toEqual(Object.keys(statRussian).sort());
    expect(Object.keys(combatTermEvidence).sort()).toEqual(Object.keys(russianClientTerminology.combat).sort());
    expect(Object.keys(progressionMaterialEvidence).sort()).toEqual(Object.keys(ascensionMaterials).sort());

    expect(Object.values(attributeEvidence).every((entry) => entry.kind === 'attribute')).toBe(true);
    expect(Object.values(roleEvidence).every((entry) => entry.kind === 'role')).toBe(true);
    expect(Object.values(statEvidence).every((entry) => entry.kind === 'stat')).toBe(true);
    expect(Object.values(combatTermEvidence).every((entry) => entry.kind === 'combat-term')).toBe(true);
    expect(Object.values(progressionMaterialEvidence).every((entry) => entry.kind === 'progression-material')).toBe(true);
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

  it('uses current primary Gas and Zero labels while preserving contextual alternatives', () => {
    expect(localizedArcType('Gas', 'ru')).toBe('Газовый');
    expect(arcTypeEvidence.Gas.alternatives).toEqual(expect.arrayContaining([
      expect.objectContaining({ russian: 'Газ' }),
    ]));

    const zeroEvidence = characterNameEvidence.Zero;
    expect(zeroEvidence).toBeDefined();
    if (!zeroEvidence) throw new Error('Missing Zero localization evidence');

    expect(localizedCharacterName('Zero', 'ru')).toBe('Зеро');
    expect(zeroEvidence.alternatives).toEqual(expect.arrayContaining([
      expect.objectContaining({ russian: 'Оценщик' }),
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

  it('has one unique evidence identity with meaningful RU and EN text', () => {
    const identities = allLocalizationEvidence.map((entry) => `${entry.kind}:${entry.canonical}`);
    expect(new Set(identities).size).toBe(identities.length);
    expect(new Set(allLocalizationEvidence.map((entry) => entry.kind))).toEqual(new Set(localizationEvidenceKinds));
    for (const evidence of allLocalizationEvidence) {
      expect(evidence.russian.trim().length).toBeGreaterThan(0);
      expect(evidence.english.trim().length).toBeGreaterThan(0);
      expect(evidence.sourcePublisher.trim().length).toBeGreaterThan(0);
      expect(localizationEvidenceLevels).toContain(evidence.level);
    }
  });

  it('never marks project fallbacks as official or client-confirmed', () => {
    for (const evidence of allLocalizationEvidence.filter((entry) => entry.level === 'project-fallback')) {
      expect(evidence.sourcePublisher).toBe('NTE Calculation by bonaqu');
      expect(evidence.sourceUrl).toBeUndefined();
    }
  });
});
