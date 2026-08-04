import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { canonicalCharacterName, characterCatalog } from './characters';
import {
  arcRussianNames,
  characterRussianAliases,
  characterRussianNames,
  localizedArcName,
  localizedArcType,
  localizedAttribute,
  localizedCharacterName,
  localizedRole,
  localizedStatLabel,
  russianClientTerminology,
} from './gameTerms';
import { ascensionMaterials } from './progression-data';

describe('Russian client terminology', () => {
  it('has one unique Russian name for every published Arc and character', () => {
    expect(Object.keys(arcRussianNames)).toHaveLength(47);
    expect(new Set(Object.values(arcRussianNames)).size).toBe(47);
    expect(arcDirectory.every((arc) => Boolean(arcRussianNames[arc.name]))).toBe(true);

    expect(Object.keys(characterRussianNames)).toHaveLength(22);
    expect(new Set(Object.values(characterRussianNames)).size).toBe(22);
    expect(characterCatalog.every((character) => Boolean(characterRussianNames[character.name]))).toBe(true);
  });

  it('uses the best current Russian evidence as primary labels', () => {
    expect(localizedCharacterName('Shinku', 'ru')).toBe('Шинку');
    expect(localizedCharacterName('Zero', 'ru')).toBe('Оценщик');
    expect(localizedCharacterName('Daffodill', 'ru')).toBe('Даффодил');
    expect(localizedCharacterName('Shinku', 'en')).toBe('Shinku');
  });

  it('keeps older and alternative names as search-only aliases', () => {
    expect(characterRussianAliases.Shinku).toContain('Синку');
    expect(characterRussianAliases.Zero).toEqual(expect.arrayContaining(['Зеро', 'Зеро эспер', 'Нулевой эспер']));
    expect(characterRussianNames.Shinku).not.toBe('Синку');
    expect(characterRussianNames.Zero).not.toBe('Нулевой эспер');

    expect(canonicalCharacterName('Синку')).toBe('Shinku');
    expect(canonicalCharacterName('Шинку')).toBe('Shinku');
    expect(canonicalCharacterName('Оценщик')).toBe('Zero');
    expect(canonicalCharacterName('Зеро')).toBe('Zero');
    expect(canonicalCharacterName('Нулевой эспер')).toBe('Zero');
  });

  it('uses current Russian Arc types, attributes, roles and stats', () => {
    expect(localizedArcType('Solid', 'ru')).toBe('Твёрдый');
    expect(localizedArcType('Gas', 'ru')).toBe('Газ');
    expect(localizedArcType('Liquid', 'ru')).toBe('Жидкий');
    expect(localizedArcType('Plasma', 'ru')).toBe('Плазменный');
    expect(localizedArcType('Synthesis', 'ru')).toBe('Гибридный');
    expect(localizedAttribute('Incantation', 'ru')).toBe('Чары');
    expect(localizedRole('Buff', 'ru')).toBe('Бафф');
    expect(localizedRole('Survival', 'ru')).toBe('Выживание');
    expect(localizedStatLabel('Break Intensity', 'ru')).toBe('Интенсивность разрушения');
    expect(russianClientTerminology.combat.esperCycle).toBe('Цикл эспера');
    expect(russianClientTerminology.combat.ultimate).toBe('Сверхспособность');
    expect(russianClientTerminology.combat.progressionStage).toBe('Прорыв');
    expect(russianClientTerminology.combat.breakGauge).toBe('Шкала разрушения');
    expect(russianClientTerminology.combat.breakDamage).toBe('Урон разрушения');
    expect(russianClientTerminology.combat.brokenEnemy).toBe('Сломленный враг');
    expect(russianClientTerminology.sourcePriority.indexOf('official-russian-publication'))
      .toBeLessThan(russianClientTerminology.sourcePriority.indexOf('owner-confirmed-client-spelling'));
  });

  it('uses current Russian Arc and progression-material names', () => {
    expect(localizedArcName('Blushing Mirage', 'ru')).toBe('Алеющий мираж');
    expect(localizedArcName("What's Desired", 'ru')).toBe('Заветное желание');
    expect(localizedArcName('Marching Beyond Time', 'ru')).toBe('За пределы времени');
    expect(localizedArcName('Tears Beneath the Mask', 'ru')).toBe('Слезы за маской');

    expect(ascensionMaterials.beetleCoin.name.ru).toBe('Жук-монета');
    expect(ascensionMaterials.lostWhispers.name.ru).toBe('Потерянный шёпот');
    expect(ascensionMaterials.chargingKnightSparkPlug.name.ru).toBe('Свеча зажигания атакующего рыцаря');
    expect(ascensionMaterials.waterMoonPick.name.ru).toBe('Пик Водяной Луны');
    expect(ascensionMaterials.confessionalFlowerSeed.name.ru).toBe('Семя исповедального цветка');
  });
});
