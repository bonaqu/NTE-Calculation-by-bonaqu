import type { ArcDirectoryType } from './arc-directory';
import {
  arcRussianNames,
  arcTypeRussian,
  attributeRussian,
  characterRussianNames,
  roleRussian,
  russianClientTerminology,
  statRussian,
} from './gameTerms';
import { ascensionMaterials } from './progression-data';
import type { Locale, LocalizedText } from './types';

export type LocalizationEvidenceLevel =
  | 'official-russian'
  | 'owner-confirmed-client'
  | 'current-russian-reference'
  | 'project-fallback';

export type LocalizationEvidenceKind =
  | 'character-name'
  | 'arc-name'
  | 'arc-type'
  | 'attribute'
  | 'role'
  | 'stat'
  | 'combat-term'
  | 'progression-material';

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
  english: string;
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
const interactiveDatabase = 'https://interactivemap.app/neverness-to-everness/database/ru/';
const interactiveZero = 'https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-1051/';
const interactiveHaniel = 'https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-1020/';
const interactiveFadia = 'https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-1039/';
const interactiveHathor = 'https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-1025/';
const communityCharacters = 'https://neverness-to-everness.fandom.com/ru/wiki/Персонажи';
const communityTypes = 'https://neverness-to-everness.fandom.com/ru/wiki/Категория:Типы_эспера';
const wotpackAnomaly = 'https://wotpack.ru/vse-anomalii-v-neverness-to-everness-nte-kak-nayti-i-proyti-porucheniya/';
const landOfGamesArcs = 'https://landofgames.ru/articles/guides/29798-dugi-v-neverness-to-everness-nte-kak-poluchit-i-vybrat-luchshee-oruzhie.html';
const wrongGateReference = 'https://telemetr.me/content/NevernessToEverness';

const levelLabels: Record<LocalizationEvidenceLevel, LocalizedText> = {
  'official-russian': { ru: 'Официальный русский источник', en: 'Official Russian source' },
  'owner-confirmed-client': { ru: 'Подтверждено в текущем клиенте', en: 'Confirmed in the current client' },
  'current-russian-reference': { ru: 'Актуальные русскоязычные данные', en: 'Current Russian data/reference' },
  'project-fallback': { ru: 'Рабочий перевод проекта', en: 'Project fallback translation' },
};

const kindLabels: Record<LocalizationEvidenceKind, LocalizedText> = {
  'character-name': { ru: 'Персонажи', en: 'Characters' },
  'arc-name': { ru: 'Дуги', en: 'Arcs' },
  'arc-type': { ru: 'Типы дуг', en: 'Arc types' },
  attribute: { ru: 'Типы эсперов', en: 'Esper types' },
  role: { ru: 'Роли', en: 'Roles' },
  stat: { ru: 'Характеристики', en: 'Stats' },
  'combat-term': { ru: 'Боевые термины', en: 'Combat terms' },
  'progression-material': { ru: 'Материалы прокачки', en: 'Progression materials' },
};

const evidenceStrength: Record<LocalizationEvidenceLevel, number> = {
  'official-russian': 4,
  'owner-confirmed-client': 4,
  'current-russian-reference': 2,
  'project-fallback': 1,
};

export function localizationEvidenceLabel(level: LocalizationEvidenceLevel, locale: Locale): string {
  return levelLabels[level][locale];
}

export function localizationEvidenceKindLabel(kind: LocalizationEvidenceKind, locale: Locale): string {
  return kindLabels[kind][locale];
}

/**
 * Automatic replacement is intentionally conservative. Official Russian and
 * current-client confirmation are equal top-tier evidence and conflicts between
 * them require explicit review instead of silent last-write-wins behavior.
 */
export function canReplaceLocalizationPrimary(
  current: LocalizationEvidenceLevel,
  candidate: LocalizationEvidenceLevel,
): boolean {
  return evidenceStrength[candidate] > evidenceStrength[current];
}

function characterEvidence(canonical: string, russian: string): LocalizationEvidence {
  if (canonical === 'Shinku') {
    return {
      kind: 'character-name', canonical, english: canonical, russian, level: 'official-russian',
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
      kind: 'character-name', canonical, english: canonical, russian, level: 'current-russian-reference',
      sourcePublisher: 'Текущая русская база данных клиента', sourceUrl: interactiveZero, verifiedAt,
      supportingSources: [
        { publisher: 'Neverness to Everness Wiki: русская карточка', url: communityCharacters },
        { publisher: 'Официальная карточка жителя Этеро', url: officialZero },
      ],
      note: {
        ru: 'В актуальной русской выгрузке персонаж называется «Зеро». «Оценщик» используется как обращение, сюжетный титул и название пассивного навыка, поэтому не подменяет имя персонажа.',
        en: 'Current Russian client data names the playable character “Зеро”. “Оценщик” is also used as an address, story title and passive-skill name, so it does not replace the character name.',
      },
      alternatives: [
        {
          russian: 'Оценщик', level: 'current-russian-reference',
          source: { publisher: 'Русские игровые тексты и официальные публикации', url: interactiveZero },
          note: { ru: 'Контекстный титул и обращение; сохранён для поиска.', en: 'A contextual title/address retained for search.' },
        },
        {
          russian: 'Нулевой эспер', level: 'official-russian',
          source: { publisher: 'Официальная карточка жителя Этеро', url: officialZero },
          note: { ru: 'Лорное обозначение протагониста, а не основная подпись записи персонажа.', en: 'A lore designation for the protagonist rather than the primary character-record label.' },
        },
      ],
    };
  }
  if (canonical === 'Linko' || canonical === 'Zankou') {
    return {
      kind: 'character-name', canonical, english: canonical, russian, level: 'project-fallback',
      sourcePublisher: 'NTE Calculation by bonaqu', verifiedAt,
      note: {
        ru: 'Персонаж ещё не выпущен, а подтверждённое официальное русское написание не найдено. Используется прозрачная транслитерация.',
        en: 'The character is unreleased and no confirmed official Russian spelling was found. A transparent transliteration is used.',
      },
    };
  }
  return {
    kind: 'character-name', canonical, english: canonical, russian, level: 'official-russian',
    sourcePublisher: 'Официальный сайт NTE', sourceUrl: officialMain, verifiedAt,
    note: {
      ru: 'Основное написание сверено с официальным русским сайтом и текущими русскими карточками персонажей.',
      en: 'The primary spelling is checked against the official Russian site and current Russian character records.',
    },
  };
}

export const characterNameEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(characterRussianNames).map(([canonical, russian]) => [canonical, characterEvidence(canonical, russian)]),
);

function arcEvidence(canonical: string, russian: string): LocalizationEvidence {
  if (canonical === 'Tears Beneath the Mask') {
    return {
      kind: 'arc-name', canonical, english: canonical, russian, level: 'owner-confirmed-client',
      sourcePublisher: 'Текущий русский клиент · подтверждено владельцем проекта',
      sourceUrl: nteWikiArcs,
      supportingSources: [
        { publisher: 'GameWith: русская база дуг', url: gameWithArcs },
        { publisher: 'Текущая русская база данных клиента', url: interactiveDatabase },
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
      kind: 'arc-name', canonical, english: canonical, russian, level: 'current-russian-reference',
      sourcePublisher: 'Neverness to Everness | NTE', sourceUrl: wrongGateReference, verifiedAt,
      note: {
        ru: 'Название используется в актуальной русскоязычной публикации события. Официальная русская страница с названием дуги во время проверки не найдена.',
        en: 'The name is used in a current Russian event publication. No official Russian page naming this Arc was found during verification.',
      },
    };
  }
  return {
    kind: 'arc-name', canonical, english: canonical, russian, level: 'current-russian-reference',
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

function arcTypeEntry(canonical: ArcDirectoryType, russian: string): LocalizationEvidence {
  if (canonical === 'Plasma') {
    return {
      kind: 'arc-type', canonical, english: canonical, russian, level: 'owner-confirmed-client',
      sourcePublisher: 'Текущий русский клиент · подтверждено владельцем проекта',
      supportingSources: [
        { publisher: 'Текущая русская база данных клиента', url: interactiveDatabase },
        { publisher: 'Neverness to Everness Wiki', url: communityCharacters },
      ],
      verifiedAt,
      note: {
        ru: 'Форма «Плазменный» подтверждена владельцем проекта непосредственно в текущем русском клиенте и совпадает с актуальными русскими карточками персонажей.',
        en: '“Плазменный” was confirmed by the project owner directly in the current Russian client and matches current Russian character records.',
      },
    };
  }
  if (canonical === 'Gas') {
    return {
      kind: 'arc-type', canonical, english: canonical, russian, level: 'current-russian-reference',
      sourcePublisher: 'Текущие русские карточки персонажей', sourceUrl: communityCharacters,
      supportingSources: [{ publisher: 'Русские статьи о типах дуг', url: landOfGamesArcs }],
      verifiedAt,
      note: {
        ru: 'Форма «Газовый» последовательно используется в актуальных русских карточках персонажей и списках типов дуг.',
        en: '“Газовый” is used consistently in current Russian character records and Arc-type lists.',
      },
      alternatives: [{
        russian: 'Газ', level: 'project-fallback', source: { publisher: 'Предыдущая версия проекта' },
        note: { ru: 'Старое сокращение проекта; не используется как основная подпись.', en: 'An older project shorthand that is no longer primary.' },
      }],
    };
  }
  return {
    kind: 'arc-type', canonical, english: canonical, russian, level: 'current-russian-reference',
    sourcePublisher: 'Текущие русские карточки персонажей', sourceUrl: communityCharacters,
    supportingSources: [{ publisher: 'Текущая русская база данных клиента', url: interactiveDatabase }],
    verifiedAt,
    note: {
      ru: 'Форма сверена по актуальным русским карточкам персонажей и данным совместимых дуг.',
      en: 'The form is checked against current Russian character records and compatible-Arc data.',
    },
  };
}

export const arcTypeEvidence: Readonly<Record<ArcDirectoryType, LocalizationEvidence>> = Object.fromEntries(
  (Object.entries(arcTypeRussian) as Array<[ArcDirectoryType, string]>).map(([canonical, russian]) => [canonical, arcTypeEntry(canonical, russian)]),
) as Readonly<Record<ArcDirectoryType, LocalizationEvidence>>;

function simpleCurrentEvidence(
  kind: LocalizationEvidenceKind,
  canonical: string,
  english: string,
  russian: string,
  sourceUrl: string,
  note: LocalizedText,
  alternatives?: readonly LocalizationAlternative[],
): LocalizationEvidence {
  return {
    kind,
    canonical,
    english,
    russian,
    level: 'current-russian-reference',
    sourcePublisher: 'Текущая русская база данных клиента',
    sourceUrl,
    supportingSources: [{ publisher: 'Neverness to Everness Wiki', url: kind === 'attribute' ? communityTypes : communityCharacters }],
    alternatives,
    verifiedAt,
    note,
  };
}

export const attributeEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(attributeRussian).map(([canonical, russian]) => [canonical, simpleCurrentEvidence(
    'attribute', canonical, canonical, russian, interactiveDatabase,
    {
      ru: 'Название типа эспера сверено по актуальным русским карточкам персонажей и страницам типов эсперов.',
      en: 'The Esper-type name is checked against current Russian character records and type pages.',
    },
    canonical === 'Incantation' ? [{
      russian: 'Инкантация', level: 'current-russian-reference', source: { publisher: 'Часть сторонних гайдов' },
      note: { ru: 'Буквальная транслитерация встречается в сторонних материалах, но текущие русские карточки используют «Чары».', en: 'A literal transliteration found in some guides; current Russian character records use “Чары”.' },
    }] : canonical === 'Psyche' ? [{
      russian: 'Психея', level: 'current-russian-reference', source: { publisher: 'Часть сторонних гайдов' },
      note: { ru: 'Вариант встречается в переводных статьях; текущие русские карточки используют «Психика».', en: 'A variant found in translated articles; current Russian character records use “Психика”.' },
    }] : undefined,
  )]),
);

export const roleEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(roleRussian).map(([canonical, russian]) => {
    if (canonical === 'Support') {
      const evidence: LocalizationEvidence = {
        kind: 'role', canonical, english: canonical, russian, level: 'project-fallback',
        sourcePublisher: 'NTE Calculation by bonaqu', verifiedAt,
        note: {
          ru: 'Служебная категория проекта для совместимости с данными. Она не показывается как основная роль персонажа, если источник публикует Урон, Усиление или Выживание.',
          en: 'A project utility category retained for data compatibility. It is not shown as a primary character role when the source publishes Damage, Buff or Survival.',
        },
      };
      return [canonical, evidence];
    }
    const sourceUrl = canonical === 'Buff' ? interactiveHaniel : canonical === 'Survival' ? interactiveFadia : interactiveZero;
    return [canonical, simpleCurrentEvidence(
      'role', canonical, canonical, russian, sourceUrl,
      {
        ru: 'Основная роль сверена по актуальной русской карточке персонажа и её тегам.',
        en: 'The primary role is checked against the current Russian character record and its role tags.',
      },
      canonical === 'Buff' ? [{
        russian: 'Бафф', level: 'project-fallback', source: { publisher: 'Предыдущая версия интерфейса' },
        note: { ru: 'Понятный игровой жаргон, но не основная подпись текущих русских карточек.', en: 'Understandable player jargon, but not the primary label in current Russian records.' },
      }] : undefined,
    )];
  }),
);

const statEnglish: Record<string, string> = {
  'ATK%': 'ATK',
  'HP%': 'HP',
  'CRIT Rate': 'CRIT Rate',
  'CRIT DMG': 'CRIT DMG',
  'Break Intensity': 'Break Efficiency',
  'Charge Efficiency': 'Charge Efficiency',
  'DMG Bonus': 'DMG Bonus',
};

export const statEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.entries(statRussian).map(([canonical, russian]) => [canonical, simpleCurrentEvidence(
    'stat', canonical, statEnglish[canonical] ?? canonical, russian,
    canonical === 'Break Intensity' ? interactiveFadia : interactiveHathor,
    {
      ru: 'Подпись характеристики сверена по текущему русскому тексту характеристик, навыков и эффектов.',
      en: 'The stat label is checked against current Russian stat, skill and effect text.',
    },
  )]),
);

const combatEnglish: Record<keyof typeof russianClientTerminology.combat, string> = {
  esperCycle: 'Esper Cycle',
  basicAttack: 'Basic Attack',
  ultimate: 'Ultimate',
  redirectSkill: 'Redirect Skill',
  supportSkill: 'Support Skill',
  criticalDodge: 'Critical Dodge',
  criticalCounter: 'Critical Counterattack',
  progressionStage: 'Breakthrough',
  breakGauge: 'Break Gauge',
  breakIntensity: 'Break Efficiency',
  brokenEnemy: 'Broken Enemy',
  breakDamage: 'Break Damage',
};

export const combatTermEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  (Object.entries(russianClientTerminology.combat) as Array<[keyof typeof russianClientTerminology.combat, string]>).map(([canonical, russian]) => [canonical, simpleCurrentEvidence(
    'combat-term', canonical, combatEnglish[canonical], russian,
    canonical === 'progressionStage' ? interactiveZero : interactiveHathor,
    {
      ru: 'Термин сверяется по актуальным русским описаниям навыков, пассивных эффектов и таблицам прорыва.',
      en: 'The term is checked against current Russian skill descriptions, passive effects and progression tables.',
    },
  )]),
);

export const progressionMaterialEvidence: Readonly<Record<string, LocalizationEvidence>> = Object.fromEntries(
  Object.values(ascensionMaterials).map((material) => [material.id, {
    kind: 'progression-material' as const,
    canonical: material.id,
    english: material.name.en,
    russian: material.name.ru,
    level: 'current-russian-reference' as const,
    sourcePublisher: 'Текущие русские таблицы прорыва персонажей',
    sourceUrl: interactiveDatabase,
    verifiedAt,
    note: {
      ru: 'Название материала сверено с русскими таблицами прорыва и существующим проверенным набором данных планировщика.',
      en: 'The material name is checked against Russian character progression tables and the planner’s validated dataset.',
    },
  }]),
);

export const allLocalizationEvidence: readonly LocalizationEvidence[] = [
  ...Object.values(characterNameEvidence),
  ...Object.values(arcNameEvidence),
  ...Object.values(arcTypeEvidence),
  ...Object.values(attributeEvidence),
  ...Object.values(roleEvidence),
  ...Object.values(statEvidence),
  ...Object.values(combatTermEvidence),
  ...Object.values(progressionMaterialEvidence),
];

export const localizationEvidenceLevels: readonly LocalizationEvidenceLevel[] = [
  'official-russian',
  'owner-confirmed-client',
  'current-russian-reference',
  'project-fallback',
];

export const localizationEvidenceKinds: readonly LocalizationEvidenceKind[] = [
  'character-name',
  'arc-name',
  'arc-type',
  'attribute',
  'role',
  'stat',
  'combat-term',
  'progression-material',
];
