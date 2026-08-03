import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { characterCatalog } from './characters';
import {
  arcRussianNames,
  characterRussianNames,
  localizedArcName,
  localizedAttribute,
  localizedRole,
  localizedStatLabel,
} from './gameTerms';

describe('Russian-first terminology', () => {
  it('covers every published Arc with a unique Russian primary name', () => {
    expect(arcDirectory).toHaveLength(47);
    const translated = arcDirectory.map((arc) => arcRussianNames[arc.name]);
    expect(translated.every((name) => typeof name === 'string' && /[А-Яа-яЁё]/u.test(name))).toBe(true);
    expect(new Set(translated).size).toBe(arcDirectory.length);
  });

  it('covers every character in the sourced catalog', () => {
    expect(characterCatalog).toHaveLength(22);
    expect(characterCatalog.every((character) => characterRussianNames[character.name])).toBe(true);
  });

  it('localizes current attributes, roles and Break terminology in RU mode', () => {
    expect(localizedAttribute('Psyche', 'ru')).toBe('Психика');
    expect(localizedRole('Buff', 'ru')).toBe('Усиление');
    expect(localizedStatLabel('Break Intensity', 'ru')).toBe('Интенсивность сломления');
  });

  it('keeps canonical terms in English mode', () => {
    expect(localizedArcName('The Wrong Gate', 'ru')).toBe('Неверные врата');
    expect(localizedArcName('The Wrong Gate', 'en')).toBe('The Wrong Gate');
    expect(localizedAttribute('Psyche', 'en')).toBe('Psyche');
    expect(localizedRole('Buff', 'en')).toBe('Buff');
  });
});
