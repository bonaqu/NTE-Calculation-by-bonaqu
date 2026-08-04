import type { Locale } from './types';
import type { ArcDirectoryType } from './arc-directory';

export const arcRussianNames: Record<string, string> = {
  'A Time Will Come': 'Время придет',
  'Be Happy': 'Будь счастлив',
  'Blow up the Crowd': 'Взорвать толпу',
  'Blushing Mirage': 'Алеющий мираж',
  'Call of the Twisted City': 'Зов искаженного города',
  'Camellia Society': 'Сообщество Камелии',
  'Clear Skies': 'Чистое небо',
  'Contemplative Cat': 'Созерцательная кошка',
  'Cosmos Daze, Wild Reverie': 'Космический восторг, дикая греза',
  'Dangerous Game': 'Опасная игра',
  'Day Off': 'Выходной',
  'Drawn Blade': 'Обнаженный клинок',
  'Eternal Waltz': 'Вечный вальс',
  'Failing You, Heavy in My Heart': 'Я подвожу тебя с тяжестью в сердце',
  'First Step to Success': 'Первый шаг к успеху',
  'Fluff of Fearlessness': 'Пух бесстрашия',
  'Fluff of Ferocity': 'Пух ярости',
  'Fluff of Finesse': 'Пух изящества',
  'Fluff of Fleetness': 'Пух проворности',
  'Fluff of Fortitude': 'Пух стойкости',
  "Good Boy's Grand Adventure": 'Большой квест хорошего мальчика',
  "Hethereau's Keeper": 'Хранитель Этеро',
  'Marching Beyond Time': 'За пределы времени',
  'Mind Royale': 'Королевский разум',
  'Oraora!': 'Ора-ора!',
  'Raging Flames': 'Бушующее пламя',
  'Ready-Ready': 'Полная готовность',
  'Real Music': 'Настоящая музыка',
  'Reality Refuge': 'Убежище реальности',
  'Shiny Days': 'Блестящие дни',
  'Song of the Whale': 'Песня кита',
  'Stellar Veil': 'Звёздная вуаль',
  'Tears Beneath the Mask': 'Слезы за маской',
  "The Fools' Spring": 'Ложная весна',
  'The Forgotten': 'Забытое',
  'The Good, The Bad, The Bitter': 'Хороший, плохой, горький',
  'The Great Thief': 'Великий вор',
  'The Last Rose': 'Последняя роза',
  'The Rain That Shook the World': 'Дождь, сотрясший мир',
  'The Wrong Gate': 'Неверные врата',
  'Time Bandit': 'Бандит времени',
  'Umbrella': 'Зонтик',
  'Us.': 'Мы.',
  'Watch Your Heads!': 'Берегите головы!',
  "What's Desired": 'Заветное желание',
  'Your Happiness is Priceless': 'Твое счастье бесценно',
  'Youthful Fantasy': 'Ребяческая фантазия',
};

export const characterRussianNames: Record<string, string> = {
  Adler: 'Адлер',
  Aurelia: 'Аурелия',
  Baicang: 'Байканг',
  Chaos: 'Хаос',
  Chiz: 'Чиз',
  Daffodill: 'Даффодил',
  Edgar: 'Эдгар',
  Fadia: 'Фадия',
  Haniel: 'Ханиэль',
  Hathor: 'Хатор',
  Hotori: 'Хотори',
  Iroi: 'Ирой',
  Jiuyuan: 'Цзююань',
  Lacrimosa: 'Лакримоза',
  Linko: 'Линко',
  Mint: 'Минт',
  Nanally: 'Наналли',
  Sakiri: 'Сакири',
  Shinku: 'Шинку',
  Skia: 'Ския',
  Zankou: 'Занкоу',
  Zero: 'Зеро',
};

/**
 * Legacy, contextual and search-only aliases. The first-class RU display name
 * always comes from characterRussianNames; aliases must never become primary labels.
 */
export const characterRussianAliases: Record<string, readonly string[]> = {
  Daffodill: ['Нарцисс'],
  Shinku: ['Синку'],
  Zero: ['Оценщик', 'Зеро эспер', 'Нулевой эспер'],
};

export function localizedCharacterAliases(name: string): readonly string[] {
  return characterRussianAliases[name] ?? [];
}

export const arcTypeRussian: Record<ArcDirectoryType, string> = {
  Solid: 'Твёрдый',
  Gas: 'Газовый',
  Liquid: 'Жидкий',
  Plasma: 'Плазменный',
  Synthesis: 'Гибридный',
};

export const statRussian: Record<string, string> = {
  'ATK%': 'АТК',
  'HP%': 'ОЗ',
  'CRIT Rate': 'Шанс критического удара',
  'CRIT DMG': 'Критический урон',
  'Break Intensity': 'Эффективность разрушения',
  'Charge Efficiency': 'Эффективность зарядки',
  'DMG Bonus': 'Бонус урона',
};

const sourceTitleRussian: Record<string, string> = {
  'Iroi Best Build Guide': 'Лучшая сборка Ирой',
  'Arcs (Weapons) Database': 'База дуг (оружия)',
  'NTE Characters & Build Guides': 'Персонажи и сборки NTE',
  'NTE Damage Calculator': 'Калькулятор урона NTE',
  'Iroi Guide, Skills, Kit, and Awakenings': 'Гайд по Ирой: навыки и пробуждения',
  'Rivyn Elowen Iroi Arc comparison screenshot': 'Скриншот сравнения дуг Ирой от Rivyn Elowen',
  'The Wrong Gate Release Date and Arc Effect': 'Дата выхода и эффект дуги «Неверные врата»',
  'The Wrong Gate Details and Best Characters': 'Характеристики «Неверных врат» и лучшие персонажи',
};

export const attributeRussian: Record<string, string> = {
  Anima: 'Анима',
  Cosmos: 'Космос',
  Lakshana: 'Лакшана',
  Chaos: 'Хаос',
  Incantation: 'Чары',
  Psyche: 'Психика',
};

export const roleRussian: Record<string, string> = {
  Damage: 'Урон',
  Buff: 'Усиление',
  Survival: 'Выживание',
  Support: 'Поддержка',
};

export const russianAbbreviations = {
  ATK: 'АТК',
  DEF: 'ЗАЩ',
  HP: 'ОЗ',
  CRIT: 'КРИТ',
  DPS: 'DPS',
  MAX: 'MAX',
  MIN: 'MIN',
} as const;

export const russianClientTerminology = {
  version: 4,
  verifiedAt: '2026-08-04',
  sourcePriority: [
    'current-russian-client',
    'official-russian-publication',
    'owner-confirmed-client-spelling',
    'current-russian-reference',
    'project-fallback',
  ] as const,
  arcTypes: arcTypeRussian,
  attributes: attributeRussian,
  roles: roleRussian,
  stats: statRussian,
  abbreviations: russianAbbreviations,
  combat: {
    esperCycle: 'Цикл эспера',
    basicAttack: 'Базовая атака',
    ultimate: 'Сверхспособность',
    redirectSkill: 'Навык перенаправления',
    supportSkill: 'Навык поддержки',
    criticalDodge: 'Критическое уклонение',
    criticalCounter: 'Критический контрудар',
    progressionStage: 'Прорыв',
    breakGauge: 'Шкала разрушения',
    breakIntensity: 'Эффективность разрушения',
    brokenEnemy: 'Сломленный враг',
    breakDamage: 'Урон разрушения',
  },
} as const;

export type ProgressionMaterialKey = 'beetleCoin' | 'page' | 'fading' | 'blurred' | 'chaos';

export const progressionMaterials: Record<ProgressionMaterialKey, { ru: string; en: string }> = {
  beetleCoin: { ru: 'Жук-монета', en: 'Beetle Coin' },
  page: { ru: 'Страница с Брегов Заблуждений', en: "A Page from Delusion's Shore" },
  fading: { ru: 'Исчезающий силуэт', en: 'Fading Silhouette' },
  blurred: { ru: 'Размытый силуэт', en: 'Blurred Silhouette' },
  chaos: { ru: 'Хаотичный силуэт', en: 'Chaos Silhouette' },
};

export function localizedArcName(name: string, locale: Locale): string {
  return locale === 'ru' ? arcRussianNames[name] ?? name : name;
}

export function localizedCharacterName(name: string, locale: Locale): string {
  return locale === 'ru' ? characterRussianNames[name] ?? name : name;
}

export function localizedArcType(type: ArcDirectoryType | string, locale: Locale): string {
  return locale === 'ru' && type in arcTypeRussian ? arcTypeRussian[type as ArcDirectoryType] : type;
}

export function localizedStatLabel(label: string, locale: Locale): string {
  return locale === 'ru' ? statRussian[label] ?? label : label;
}

export function localizedAttribute(attribute: string | undefined, locale: Locale): string {
  if (!attribute) return '';
  return locale === 'ru' ? attributeRussian[attribute] ?? attribute : attribute;
}

export function localizedRole(role: string | undefined, locale: Locale): string {
  if (!role) return '';
  return locale === 'ru' ? roleRussian[role] ?? role : role;
}

export function localizedMaterial(key: ProgressionMaterialKey, locale: Locale): string {
  return progressionMaterials[key][locale];
}

export function localizedSourceTitle(title: string, locale: Locale): string {
  return locale === 'ru' ? sourceTitleRussian[title] ?? title : title;
}

export function localizedAbbreviation(value: keyof typeof russianAbbreviations, locale: Locale): string {
  return locale === 'ru' ? russianAbbreviations[value] : value;
}

export function originalName(name: string, locale: Locale): string | null {
  return locale === 'ru' ? name : null;
}
