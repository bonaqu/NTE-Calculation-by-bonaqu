import type { ArcDirectoryType } from './arc-directory';
import { arcRussianNames, characterRussianNames } from './gameTerms';
import type { Locale, LocalizedText } from './types';

export type LocalizationEvidenceLevel =
  | 'official-russian'
  | 'owner-confirmed-client'
  | 'current-russian-reference'
  | 'project-fallback';

export type LocalizationEvidenceKind = 'character-name' | 'arc-name' | 'arc-type';

export interface LocalizationEvidenceSource {
  publisher: string;
  url?: string;
}

export interface LocalizationAlternative {
  russian: string;
  level: LocalizationEvidenceLevel;
  source: LocalizationEvidenceSource;
  note: LocalizedText;
}

export interface LocalizationEvidence {
  kind: LocalizationEvidenceKind;
  canonical: string;
  russian: string;
  level: LocalizationEvidenceLevel;
  sourcePublisher: string;
  sourceUrl?: string;
  supportingSources?: readonly LocalizationEvidenceSource[];
  alternatives?: readonly LocalizationAlternative[];
  verifiedAt: string;
  note: LocalizedText;
}

const verifiedAt = '2026-08-04';
const officialMain = 'https://nte.perfectworld.com/ru/main.html?nav=4';
const officialShinku = 'https://nte.perfectworld.com/ru/article/news/gamenews/20260706/263024.html';
const officialZero = 'https://nte.perfectworld.com/net/260323card/ru/index.html';
const nteWikiArcs = 'https://ntewiki.org/ru/arcs/';
const gameWithArcs = 'https://gamewith.ai/nte/ru/arc';
const interactiveDatabase = 'https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-1008/';
const wotpackAnomaly = 'https://wotpack.ru/vse-anomalii-v-neverness-to-everness-nte-kak-nayti-i-proyti-porucheniya/';
const landOfGamesArcs = 'https://landofgames.ru/articles/guides/29798-dugi-v-neverness-to-everness-nte-kak-poluchit-i-vybrat-luchshee-oruzhie.html';
const wrongGateReference = 'https://telemetr.me/content/NevernessToEverness';

const levelLabels: Record<LocalizationEvidenceLevel, LocalizedText> = {
  'official-russian': { ru: 'Официальный русский источник', en: 'Official Russian source' },
  'owner-confirmed-client': { ru: 'Подтверждено в текущем клиенте', en: 'Confirmed in the current client' },
  'current-russian-reference': { ru: 'Актуальные русскоязычные источники', en: 'Current Russian references' },
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
      alternatives: [{
        russian: 'Синку', level: 'project-fallback', source: { publisher: 'Старое написание сообщества' },
        note: { ru: 'Сохранено только для поиска и старых сохранений.', en: 'Kept only for search and legacy saved text.' },
      }],
    };
  }
  if (canonical === 'Zero') {
    return {
      kind: 'character-name', canonical, russian, level: 'owner-confirmed-client',
      sourcePublisher: 'Текущий русский клиент · подтверждено владельцем проекта', verifiedAt,
      supportingSources: [{ publisher: 'Официальная карточка жителя Этеро', url: officialZero }],
      note: {
        ru: 'В проекте сохраняется отображение «Оценщик», подтверждённое владельцем по текущему клиенту. Официальная веб-карточка отдельно использует «Нулевой эспер», поэтому это противоречие показано, а не скрыто.',
        en: 'The project keeps “Оценщик”, confirmed by the owner from the current client. An official web card separately uses “Нулевой эспер”, so the conflict is disclosed rather than hidden.',
      },
      alternatives: [{
        russian: 'Нулевой эспер', level: 'official-russian',
        source: { publisher: 'Официальная карточка жителя Этеро', url: officialZero },
        note: {
          ru: 'Официальная веб-карточка использует эту форму, но без дополнительного снимка интерфейса она не заменяет подтверждённое отображение клиента.',
          en: 'The official web card uses this form, but without additional client UI evidence it does not replace the confirmed client display.',
        },
      }],
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

function arcEvidence(canonical: string, russian: string): LocalizationEvidence {
  if (canonical === 'Tears Beneath the Mask') {
    return {
      kind: 'arc-name', canonical, russian, level: 'owner-confirmed-client',
      sourcePublisher: 'Текущий русский клиент · подтверждено владельцем проекта',
      sourceUrl: nteWikiArcs,
      supportingSources: [
        { publisher: 'GameWith: русская база дуг', url: gameWithArcs },
        { publisher: 'База данных клиента interactivemap.app', url: interactiveDatabase },
        { publisher: 'Wotpack: награда за аномалию', url: wotpackAnomaly },
      ],
      verifiedAt,
      note: {
        ru: '«Слезы за маской» подтверждено владельцем проекта в текущем клиенте и совпадает с несколькими независимыми базами и гайдами получения награды.',
        en: '“Слезы за маской” was confirmed by the project owner in the current client and matches several independent databases and reward guides.',
      },
      alternatives: [{
        russian: 'Слезы с маской', level: 'current-russian-reference',
        source: { publisher: 'Land of Games', url: landOfGamesArcs },
        note: {
          ru: 'Вариант встречается в нескольких списках дуг, но противоречит клиенту и более широкому набору источников, поэтому не используется как основной.',
          en: 'This variant appears in several Arc lists but conflicts with the client and broader evidence, so it is not used as primary.',
        },
      }],
    };
  }
  if (canonical === 'The Wrong Gate') {
    return {
      kind: 'arc-name', canonical, russian, level: 'current-russian-reference',
      sourcePublisher: 'Neverness to Everness | NTE', sourceUrl: wrongGateReference, verifiedAt,
      note: {
        ru: 'Название используется в актуальной русскоязычной публикации события. Официальная русская страница с названием дуги во время проверки не найдена.',
        en: 'The name is used in a current Russian event publication. No official Russian page naming this Arc was found during verification.',
      },
    };
  }
  return {
    kind: 'arc-name', canonical, russian, level: 'current-russian-reference',
    sourcePublisher: 'NTE Wiki: русская база дуг', sourceUrl: nteWikiArcs,
    supportingSources: [{ publisher: 'GameWith: русская база дуг', url: gameWithArcs }],
    verifiedAt,
    note: {
      ru: 'Название сверено по актуальным русскоязычным базам. Оно не объявляется официальным, если отдельный официальный русский источник не найден.',
      en: 'The name is checked against current Russian databases and is not labelled official unless a separate official Russian source is available.',
    },
  };
}

export const arcNameEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(arcRussianNames).map(([canonical, russian]) => [canonical, arcEvidence(canonical, russian)]),
);

const arcTypeRussian: Record<ArcDirectoryType, string> = {
  Solid: 'Твёрдый',
  Gas: 'Газ',
  Liquid: 'Жидкий',
  Plasma: 'Плазменный',
  Synthesis: 'Гибридный',
};

function arcTypeEntry(canonical: ArcDirectoryType, russian: string): LocalizationEvidence {
  if (canonical === 'Plasma') {
    return {
      kind: 'arc-type', canonical, russian, level: 'owner-confirmed-client',
      sourcePublisher: 'Текущий русский клиент · подтверждено владельцем проекта',
      supportingSources: [{ publisher: 'Land of Games', url: landOfGamesArcs }],
      verifiedAt,
      note: {
        ru: 'Форма «Плазменный» подтверждена владельцем проекта непосредственно в текущем русском клиенте.',
        en: '“Плазменный” was confirmed by the project owner directly in the current Russian client.',
      },
    };
  }
  if (canonical === 'Gas') {
    return {
      kind: 'arc-type', canonical, russian, level: 'current-russian-reference',
      sourcePublisher: 'NTE Wiki: русская база дуг', sourceUrl: nteWikiArcs,
      supportingSources: [
        { publisher: 'GameWith: русская база дуг', url: gameWithArcs },
        { publisher: 'База данных клиента interactivemap.app', url: interactiveDatabase },
      ],
      verifiedAt,
      note: {
        ru: 'Основная форма «Газ» поддерживается несколькими базами. Вариант «Газовый» встречается в статьях, но без подтверждения интерфейсом клиента не заменяет текущую форму.',
        en: 'The primary form “Газ” is supported by several databases. “Газовый” appears in articles but does not replace it without client UI confirmation.',
      },
      alternatives: [{
        russian: 'Газовый', level: 'current-russian-reference',
        source: { publisher: 'Land of Games', url: landOfGamesArcs },
        note: { ru: 'Зафиксирован как конфликтующий вариант.', en: 'Recorded as a conflicting variant.' },
      }],
    };
  }
  return {
    kind: 'arc-type', canonical, russian, level: 'current-russian-reference',
    sourcePublisher: 'NTE Wiki: русская база дуг', sourceUrl: nteWikiArcs,
    supportingSources: [{ publisher: 'GameWith: русская база дуг', url: gameWithArcs }],
    verifiedAt,
    note: {
      ru: 'Форма сверена по актуальным русскоязычным базам и не выдаётся за отдельно найденный официальный список типов.',
      en: 'The form is checked against current Russian databases and is not misrepresented as a separately located official type list.',
    },
  };
}

export const arcTypeEvidence: Readonly<Record<ArcDirectoryType, LocalizationEvidence>> = Object.fromEntries(
  (Object.entries(arcTypeRussian) as Array<[ArcDirectoryType, string]>).map(([canonical, russian]) => [canonical, arcTypeEntry(canonical, russian)]),
) as Readonly<Record<ArcDirectoryType, LocalizationEvidence>>;

export const localizationEvidenceLevels: readonly LocalizationEvidenceLevel[] = [
  'official-russian',
  'owner-confirmed-client',
  'current-russian-reference',
  'project-fallback',
];
