import { describe, expect, it } from 'vitest';
import {
  getTerminologyEntry,
  terminologyRegistry,
  terminologySearchTokens,
} from './terminology-registry';
import {
  characterRussianAliases,
  characterRussianNames,
  localizedArcType,
  russianClientTerminology,
} from './gameTerms';

describe('terminology provenance registry', () => {
  it('keeps identities unique and evidence complete', () => {
    expect(new Set(terminologyRegistry.map((entry) => entry.id)).size).toBe(
      terminologyRegistry.length,
    );

    for (const entry of terminologyRegistry) {
      expect(entry.en.trim()).not.toBe('');
      expect(entry.ru.trim()).not.toBe('');
      expect(entry.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.evidenceTier).toBeTruthy();
      expect(entry.confidence).toBeTruthy();
    }
  });

  it('keeps Shinku primary and Sinku alias-only', () => {
    const shinku = getTerminologyEntry('character:Shinku');

    expect(shinku?.ru).toBe('Шинку');
    expect(terminologySearchTokens(shinku!)).toContain('Синку');
    expect(characterRussianNames.Shinku).toBe('Шинку');
    expect(characterRussianAliases.Shinku).toContain('Синку');
    expect(Object.values(characterRussianNames)).not.toContain('Синку');
  });

  it('keeps Plasma canonical while rendering the current Russian adjective', () => {
    const plasma = getTerminologyEntry('arc-type:Plasma');

    expect(plasma?.en).toBe('Plasma');
    expect(plasma?.ru).toBe('Плазменный');
    expect(localizedArcType('Plasma', 'ru')).toBe('Плазменный');
    expect(localizedArcType('Plasma', 'en')).toBe('Plasma');
  });

  it('distinguishes the Break mechanic from the broken target state', () => {
    expect(russianClientTerminology.combat.breakGauge).toBe('Шкала разрушения');
    expect(russianClientTerminology.combat.breakIntensity).toBe(
      'Интенсивность разрушения',
    );
    expect(getTerminologyEntry('combat:broken-target')?.ru).toBe(
      'Сломленная цель',
    );
  });

  it('marks project translations explicitly', () => {
    const projectTranslations = terminologyRegistry.filter(
      (entry) => entry.evidenceTier === 'project-translation',
    );

    expect(projectTranslations.length).toBeGreaterThan(0);
    for (const entry of projectTranslations) {
      expect(entry.confidence).toBe('project-translation');
      expect(entry.note).toBeTruthy();
    }
  });
});
