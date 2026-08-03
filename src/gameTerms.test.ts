import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { characterDirectory } from './data';
import { arcRussianNames, characterRussianNames, localizedArcName } from './gameTerms';

describe('Russian-first terminology', () => {
  it('covers every published Arc with a unique Russian primary name', () => {
    expect(arcDirectory).toHaveLength(47);
    const translated = arcDirectory.map((arc) => arcRussianNames[arc.name]);
    expect(translated.every((name) => typeof name === 'string' && /[А-Яа-яЁё]/u.test(name))).toBe(true);
    expect(new Set(translated).size).toBe(arcDirectory.length);
  });

  it('covers every character in the catalog', () => {
    expect(characterDirectory).toHaveLength(22);
    expect(characterDirectory.every((character) => characterRussianNames[character.name])).toBe(true);
  });

  it('keeps the canonical name in English mode', () => {
    expect(localizedArcName('The Wrong Gate', 'ru')).toBe('Неверные врата');
    expect(localizedArcName('The Wrong Gate', 'en')).toBe('The Wrong Gate');
  });
});
