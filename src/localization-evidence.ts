import type { ArcDirectoryType } from './arc-directory';
import { arcRussianNames, characterRussianNames } from './gameTerms';
import type { Locale, LocalizedText } from './types';

export type LocalizationEvidenceLevel =
  | 'official-russian'
  | 'owner-confirmed-client'
  | 'current-russian-reference'
  | 'project-fallback';

export type LocalizationEvidenceKind = 'character-name' | 'arc-name' | 'arc-type';

export interface LocalizationEvidence {
  kind: LocalizationEvidenceKind;
  canonical: string;
  russian: string;
  level: LocalizationEvidenceLevel;
  sourcePublisher: string;
  sourceUrl?: string;
  verifiedAt: string;
  note: LocalizedText;
}

const verifiedAt = '2026-08-04';
const officialMain = 'https://nte.perfectworld.com/ru/main.html?nav=4';
const officialShinku = 'https://nte.perfectworld.com/ru/article/news/gamenews/20260706/263024.html';
const officialZero = 'https://nte.perfectworld.com/net/260323card/ru/index.html';
const russianArcReference = 'https://landofgames.ru/articles/guides/29798-dugi-v-neverness-to-everness-nte-kak-poluchit-i-vybrat-luchshee-oruzhie.html';
const wrongGateReference = 'https://telemetr.me/content/NevernessToEverness';

const levelLabels: Record<LocalizationEvidenceLevel, LocalizedText> = {
  'official-russian': { ru: 'Официальный русский источник', en: 'Official Russian source' },
  'owner-confirmed-client': { ru: 'Подтверждено в текущем клиенте', en: 'Confirmed in the current client' },
  'current-russian-reference': { ru: 'Актуальный русскоязычный справочник', en: 'Current Russian reference' },
  'project-fallback': { ru: 'Рабочий перевод проекта', en: 'Project fallback translation' },
};

export function localizationEvidenceLabel(level: LocalizationEvidenceLevel, locale: Locale): string {
  return levelLabels[level][locale];
}

function characterEvidence(canonical: string, russian: string): LocalizationEvidence {
  if (canonical === 'Shinku') {
    return {
      kind: 'character-name', canonical, russian, level: 'official-russian',
      sourcePublisher: 'Официальный сайт NTE', sourceUrl: officialShinku, verifiedAt,
      note: {
        ru: 'Имя многократно используется в официальном русском списке изменений версии 1.2.',
        en: 'The name appears repeatedly in the official Russian Version 1.2 patch notes.',
      },
    };
  }
  if (canonical === 'Zero') {
    return {
      kind: 'character-name', canonical, russian, level: 'official-russian',
      sourcePublisher: 'Официальный сайт NTE', sourceUrl: officialZero, verifiedAt,
      note: {
        ru: 'Официальная карточка жителя Этеро называет персонажа «Нулевой эспер». «Оценщик» относится к роли игрока и сохранён только как поисковый вариант.',
        en: 'The official Hethereau resident card names the character “Нулевой эспер”. “Оценщик” refers to the player role and remains search-only.',
      },
    };
  }
  if (canonical === 'Linko' || canonical === 'Zankou') {
    return {
      kind: 'character-name', canonical, russian, level: 'project-fallback',
      sourcePublisher: 'NTE Calculation by bonaqu', verifiedAt,
      note: {
        ru: 'Персонаж ещё не выпущен, а подтверждённое официальное русское написание не найдено. Используется прозрачная транслитерация.',
        en: 'The character is unreleased and no confirmed official Russian spelling was found. A transparent transliteration is used.',
      },
    };
  }
  return {
    kind: 'character-name', canonical, russian, level: 'official-russian',
    sourcePublisher: 'Официальный сайт NTE', sourceUrl: officialMain, verifiedAt,
    note: {
      ru: 'Основное написание сверено с официальным русским сайтом и его текущим списком персонажей.',
      en: 'The primary spelling is checked against the current official Russian site and character roster.',
    },
  };
}

export const characterNameEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(characterRussianNames).map(([canonical, russian]) => [canonical, characterEvidence(canonical, russian)]),
);

export const arcNameEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(arcRussianNames).map(([canonical, russian]) => {
    const wrongGate = canonical === 'The Wrong Gate';
    const evidence: LocalizationEvidence = {
      kind: 'arc-name', canonical, russian, level: 'current-russian-reference',
      sourcePublisher: wrongGate ? 'Neverness to Everness | NTE' : 'Land of Games',
      sourceUrl: wrongGate ? wrongGateReference : russianArcReference,
      verifiedAt,
      note: wrongGate ? {
        ru: 'Название используется в актуальной русскоязычной публикации события. Официальная русская страница с названием дуги во время проверки не найдена.',
        en: 'The name is used in a current Russian event publication. No official Russian page naming this Arc was found during verification.',
      } : {
        ru: 'Русское название приведено в актуальном справочнике дуг вместе с типом, характеристиками и эффектом.',
        en: 'The Russian name appears in a current Arc reference alongside type, stats and effect.',
      },
    };
    return [canonical, evidence];
  }),
);

const arcTypeRussian: Record<ArcDirectoryType, string> = {
  Solid: 'Твёрдый',
  Gas: 'Газовый',
  Liquid: 'Жидкий',
  Plasma: 'Плазменный',
  Synthesis: 'Гибридный',
};

export const arcTypeEvidence: Readonly<Record<ArcDirectoryType, LocalizationEvidence>> = Object.fromEntries(
  (Object.entries(arcTypeRussian) as Array<[ArcDirectoryType, string]>).map(([canonical, russian]) => {
    const ownerConfirmed = canonical === 'Plasma';
    const evidence: LocalizationEvidence = {
      kind: 'arc-type', canonical, russian,
      level: ownerConfirmed ? 'owner-confirmed-client' : 'current-russian-reference',
      sourcePublisher: ownerConfirmed ? 'Текущий русский клиент + Land of Games' : 'Land of Games',
      sourceUrl: russianArcReference,
      verifiedAt,
      note: ownerConfirmed ? {
        ru: 'Форма «Плазменный» подтверждена владельцем проекта в текущем русском клиенте и совпадает с актуальным русскоязычным справочником.',
        en: '“Плазменный” was confirmed by the project owner in the current Russian client and matches the current Russian reference.',
      } : {
        ru: 'Форма типа дуги сверена с актуальным русскоязычным справочником. Она не выдаётся за отдельно найденный официальный список типов.',
        en: 'The Arc-type form is checked against a current Russian reference and is not misrepresented as a separately located official type list.',
      },
    };
    return [canonical, evidence];
  }),
) as Readonly<Record<ArcDirectoryType, LocalizationEvidence>>;

export const localizationEvidenceLevels: readonly LocalizationEvidenceLevel[] = [
  'official-russian',
  'owner-confirmed-client',
  'current-russian-reference',
  'project-fallback',
];
