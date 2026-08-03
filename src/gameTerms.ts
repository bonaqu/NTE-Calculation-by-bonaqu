import type { Locale } from './types';
import type { ArcDirectoryType } from './arc-directory';

export const arcRussianNames: Record<string, string> = {
  'A Time Will Come': 'Время придёт',
  'Be Happy': 'Будь счастлив',
  'Blow up the Crowd': 'Взорви толпу',
  'Blushing Mirage': 'Румяный мираж',
  'Call of the Twisted City': 'Зов искажённого города',
  'Camellia Society': 'Общество камелии',
  'Clear Skies': 'Ясное небо',
  'Contemplative Cat': 'Созерцающий кот',
  'Cosmos Daze, Wild Reverie': 'Космический дурман, дикая грёза',
  'Dangerous Game': 'Опасная игра',
  'Day Off': 'Выходной',
  'Drawn Blade': 'Обнажённый клинок',
  'Eternal Waltz': 'Вечный вальс',
  'Failing You, Heavy in My Heart': 'Подвёл тебя — тяжесть на сердце',
  'First Step to Success': 'Первый шаг к успеху',
  'Fluff of Fearlessness': 'Пух бесстрашия',
  'Fluff of Ferocity': 'Пух свирепости',
  'Fluff of Finesse': 'Пух искусности',
  'Fluff of Fleetness': 'Пух стремительности',
  'Fluff of Fortitude': 'Пух стойкости',
  "Good Boy's Grand Adventure": 'Большое приключение хорошего мальчика',
  "Hethereau's Keeper": 'Хранитель Этеро',
  'Marching Beyond Time': 'Шествие сквозь время',
  'Mind Royale': 'Королевская игра разума',
  'Oraora!': 'Ора-ора!',
  'Raging Flames': 'Бушующее пламя',
  'Ready-Ready': 'Готово-готово',
  'Real Music': 'Настоящая музыка',
  'Reality Refuge': 'Убежище реальности',
  'Shiny Days': 'Сияющие дни',
  'Song of the Whale': 'Песнь кита',
  'Stellar Veil': 'Звёздная вуаль',
  'Tears Beneath the Mask': 'Слёзы под маской',
  "The Fools' Spring": 'Весна дураков',
  'The Forgotten': 'Забытый',
  'The Good, The Bad, The Bitter': 'Хорошее, плохое и горькое',
  'The Great Thief': 'Великий вор',
  'The Last Rose': 'Последняя роза',
  'The Rain That Shook the World': 'Дождь, потрясший мир',
  'The Wrong Gate': 'Неверные врата',
  'Time Bandit': 'Похититель времени',
  'Umbrella': 'Зонт',
  'Us.': 'Мы.',
  'Watch Your Heads!': 'Берегите головы!',
  "What's Desired": 'Желанное',
  'Your Happiness is Priceless': 'Твоё счастье бесценно',
  'Youthful Fantasy': 'Юношеская фантазия',
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
  Shinku: 'Синку',
  Skia: 'Ския',
  Zankou: 'Занкоу',
  Zero: 'Оценщик',
};

const arcTypeRussian: Record<ArcDirectoryType, string> = {
  Solid: 'Твёрдая',
  Gas: 'Газовая',
  Liquid: 'Жидкая',
  Plasma: 'Плазменная',
  Synthesis: 'Синтез',
};

const statRussian: Record<string, string> = {
  'ATK%': 'ATK',
  'HP%': 'HP',
  'CRIT Rate': 'Крит. шанс',
  'CRIT DMG': 'Крит. урон',
  'Break Intensity': 'Сила пробития',
  'Charge Efficiency': 'Эффективность зарядки',
  'DMG Bonus': 'Бонус урона',
};

const sourceTitleRussian: Record<string, string> = {
  'Iroi Best Build Guide': 'Лучший билд Ирой',
  'Arcs (Weapons) Database': 'База дуг (оружия)',
  'NTE Characters & Build Guides': 'Персонажи и билды NTE',
  'NTE Damage Calculator': 'Калькулятор урона NTE',
  'Iroi Guide, Skills, Kit, and Awakenings': 'Гайд по Ирой: навыки, набор и пробуждения',
  'Rivyn Elowen Iroi Arc comparison screenshot': 'Скриншот сравнения дуг Ирой от Rivyn Elowen',
  'The Wrong Gate Release Date and Arc Effect': 'Дата выхода и эффект дуги «Неверные врата»',
  'The Wrong Gate Details and Best Characters': 'Характеристики «Неверных врат» и лучшие персонажи',
};

const attributeRussian: Record<string, string> = {
  Anima: 'Анима',
  Cosmos: 'Космос',
  Lakshana: 'Лакшана',
  Chaos: 'Хаос',
  Incantation: 'Заклинание',
};

const roleRussian: Record<string, string> = {
  Damage: 'Урон',
  Survival: 'Выживаемость',
  Support: 'Поддержка',
};

export type ProgressionMaterialKey = 'beetleCoin' | 'page' | 'fading' | 'blurred' | 'chaos';

export const progressionMaterials: Record<ProgressionMaterialKey, { ru: string; en: string }> = {
  beetleCoin: { ru: 'Жучиная монета', en: 'Beetle Coin' },
  page: { ru: 'Страница с Брегов Заблуждений', en: "A Page from Delusion's Shore" },
  fading: { ru: 'Тусклый силуэт', en: 'Fading Silhouette' },
  blurred: { ru: 'Размытый силуэт', en: 'Blurred Silhouette' },
  chaos: { ru: 'Силуэт хаоса', en: 'Chaos Silhouette' },
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

export function originalName(name: string, locale: Locale): string | null {
  return locale === 'ru' ? name : null;
}
