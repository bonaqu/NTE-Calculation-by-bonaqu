import { characterRussianAliases, characterRussianNames } from './gameTerms';
import type {
  CharacterArcType,
  CharacterAttribute,
  CharacterProfile,
  CharacterRarity,
  CharacterReleaseStatus,
  CharacterRole,
  LocalizedText,
} from './types';

const verifiedAt = '2026-08-04';
const prydwen = 'Prydwen Institute';
const gameWith = 'GameWith';

interface CharacterDefinition {
  name: string;
  rarity: CharacterRarity;
  attribute: CharacterAttribute;
  role?: CharacterRole;
  arcType?: CharacterArcType;
  releaseStatus?: CharacterReleaseStatus;
  releaseVersion?: string;
  imageSlug?: string;
  pageSlug?: string;
  summary: LocalizedText;
  sourcePublisher?: string;
  sourceUrl?: string;
}

function profile(definition: CharacterDefinition): CharacterProfile {
  const releaseStatus = definition.releaseStatus ?? 'released';
  const pageSlug = definition.pageSlug ?? definition.name.toLowerCase();
  const imageSlug = definition.imageSlug ?? pageSlug;
  return {
    id: pageSlug,
    name: definition.name,
    rarity: definition.rarity,
    attribute: definition.attribute,
    role: definition.role,
    arcType: definition.arcType,
    releaseStatus,
    releaseVersion: definition.releaseVersion,
    image: `https://cdn.prydwen.gg/images/nte/characters/${imageSlug}_card.webp`,
    summary: definition.summary,
    sourcePublisher: definition.sourcePublisher ?? prydwen,
    sourceUrl: definition.sourceUrl ?? `https://www.prydwen.gg/neverness-to-everness/characters/${pageSlug}`,
    verifiedAt,
    detailsVerified: releaseStatus === 'released' && Boolean(definition.role && definition.arcType),
  };
}

export const characterCatalog: CharacterProfile[] = [
  profile({
    name: 'Adler', rarity: 'A', attribute: 'Incantation', role: 'Survival', arcType: 'Synthesis',
    summary: {
      ru: 'Защищает команду щитом и даёт полезные ослабления. Обычно выходит на поле ненадолго.',
      en: 'Protects the team with shields and useful debuffs while requiring little field time.',
    },
  }),
  profile({
    name: 'Aurelia', rarity: 'A', attribute: 'Psyche', role: 'Damage', arcType: 'Plasma',
    summary: {
      ru: 'Активный персонаж урона Психики: дольше остаётся на поле и атакует призванными медузами.',
      en: 'An on-field damage dealer who benefits from longer active windows and jellyfish attacks.',
    },
  }),
  profile({
    name: 'Baicang', rarity: 'S', attribute: 'Incantation', role: 'Damage', arcType: 'Synthesis',
    summary: {
      ru: 'Основной персонаж урона Чар со сложными комбинациями и периодическим уроном от Поджога.',
      en: 'A main damage dealer built around deliberate combos and Scorch damage over time.',
    },
  }),
  profile({
    name: 'Chaos', rarity: 'S', attribute: 'Lakshana', role: 'Damage', arcType: 'Synthesis',
    summary: {
      ru: 'Основной персонаж урона Лакшаны с понятной ротацией и сильным взаимодействием с циклами эспера.',
      en: 'A straightforward Lakshana main damage dealer with strong team reaction access.',
    },
  }),
  profile({
    name: 'Chiz', rarity: 'S', attribute: 'Cosmos', role: 'Damage', arcType: 'Gas',
    summary: {
      ru: 'Персонаж урона Космоса для активного боя и атак по области.',
      en: 'A Cosmos damage dealer focused on active combat and area damage.',
    },
  }),
  profile({
    name: 'Daffodill', pageSlug: 'daffodil', imageSlug: 'daffodil', rarity: 'S', attribute: 'Chaos', role: 'Damage', arcType: 'Liquid',
    summary: {
      ru: 'Дополнительный персонаж взрывного урона: быстро снижает шкалу разрушения и хорошо работает при частых переключениях.',
      en: 'A burst-oriented secondary damage dealer who shreds Break and rewards frequent swapping.',
    },
  }),
  profile({
    name: 'Edgar', rarity: 'A', attribute: 'Cosmos', role: 'Survival', arcType: 'Liquid',
    summary: {
      ru: 'Простой лекарь Космоса. Его главная задача — восстанавливать ОЗ команды.',
      en: 'A straightforward Cosmos healer whose main job is restoring team HP.',
    },
  }),
  profile({
    name: 'Fadia', rarity: 'S', attribute: 'Psyche', role: 'Survival', arcType: 'Synthesis',
    summary: {
      ru: 'Перенаправляет входящий урон союзников на себя и помогает команде переживать ошибки в бою.',
      en: 'Redirects ally damage to herself and makes the team much more forgiving to play.',
    },
  }),
  profile({
    name: 'Haniel', rarity: 'A', attribute: 'Psyche', role: 'Buff', arcType: 'Solid',
    summary: {
      ru: 'Универсальный персонаж усиления: повышает АТК команды и не требует долгого времени на поле.',
      en: 'A universal buffer who raises team ATK without demanding much field time.',
    },
  }),
  profile({
    name: 'Hathor', rarity: 'S', attribute: 'Lakshana', role: 'Damage', arcType: 'Plasma',
    summary: {
      ru: 'Персонаж взрывного урона Лакшаны для команд Реморы; основную часть урона наносит во время сверхспособности.',
      en: 'A burst Lakshana damage dealer for Remora teams whose Ultimate is the main damage window.',
    },
  }),
  profile({
    name: 'Hotori', rarity: 'S', attribute: 'Cosmos', role: 'Buff', arcType: 'Solid',
    summary: {
      ru: 'Усиливает команды Космоса и сама наносит заметный урон во время сверхспособности.',
      en: 'A Cosmos buffer with a strong short personal damage window during the Ultimate.',
    },
  }),
  profile({
    name: 'Iroi', rarity: 'S', attribute: 'Anima', role: 'Survival', arcType: 'Liquid',
    summary: {
      ru: 'Поддерживает выживаемость команды и усиливает союзников, оставаясь удобной вне поля.',
      en: 'Sustains and buffs the team while remaining comfortable to use mostly off-field.',
    },
  }),
  profile({
    name: 'Jiuyuan', rarity: 'S', attribute: 'Anima', role: 'Damage', arcType: 'Solid',
    summary: {
      ru: 'Основной персонаж урона Анимы, которому отводится активное время в ротации.',
      en: 'An Anima main damage dealer intended to take active field time in the rotation.',
    },
  }),
  profile({
    name: 'Lacrimosa', rarity: 'S', attribute: 'Chaos', role: 'Damage', arcType: 'Liquid',
    summary: {
      ru: 'Персонаж урона Хаоса с сильным периодическим уроном и хорошей синергией с Дискордом.',
      en: 'A Chaos damage dealer built around strong damage over time and Discord synergy.',
    },
  }),
  profile({
    name: 'Linko', rarity: 'S', attribute: 'Anima', releaseStatus: 'upcoming', releaseVersion: '1.3',
    summary: {
      ru: 'Будущий персонаж версии 1.3. Роль и совместимый тип дуги пока публично не объявлены.',
      en: 'An upcoming Version 1.3 character. Role and Arc compatibility are not public yet.',
    },
    sourcePublisher: gameWith,
    sourceUrl: 'https://gamewith.net/nte/76100',
  }),
  profile({
    name: 'Mint', rarity: 'A', attribute: 'Anima', role: 'Damage', arcType: 'Liquid',
    summary: {
      ru: 'Доступный персонаж урона Анимы для быстрых активных атак и раннего развития аккаунта.',
      en: 'An accessible Anima damage dealer for fast active attacks and early account progression.',
    },
  }),
  profile({
    name: 'Nanally', rarity: 'S', attribute: 'Anima', role: 'Damage', arcType: 'Plasma',
    summary: {
      ru: 'Основной персонаж урона Анимы с последующими атаками и простой последовательностью навыка, сверхспособности и базовых атак.',
      en: 'An Anima main DPS with follow-up attacks and a simple Skill–Ultimate–Basic flow.',
    },
  }),
  profile({
    name: 'Sakiri', rarity: 'S', attribute: 'Incantation', role: 'Buff', arcType: 'Gas',
    summary: {
      ru: 'Универсальный персонаж усиления Чар, особенно полезный для Поджога и периодического урона.',
      en: 'A universal Incantation buffer with extra value in Scorch and damage-over-time teams.',
    },
  }),
  profile({
    name: 'Shinku', rarity: 'S', attribute: 'Cosmos', role: 'Damage', arcType: 'Synthesis',
    summary: {
      ru: 'Основной персонаж урона Космоса с продолжительной активной последовательностью и высоким личным уроном.',
      en: 'A Cosmos main damage dealer with an extended active window and high personal damage.',
    },
  }),
  profile({
    name: 'Skia', rarity: 'A', attribute: 'Lakshana', role: 'Damage', arcType: 'Gas',
    summary: {
      ru: 'Доступный персонаж урона Лакшаны и бюджетный участник команд с циклами эспера.',
      en: 'An accessible Lakshana damage dealer and budget reaction-team option.',
    },
  }),
  profile({
    name: 'Zankou', rarity: 'S', attribute: 'Incantation', releaseStatus: 'upcoming', releaseVersion: '1.3',
    summary: {
      ru: 'Будущий персонаж версии 1.3. Роль и совместимый тип дуги пока публично не объявлены.',
      en: 'An upcoming Version 1.3 character. Role and Arc compatibility are not public yet.',
    },
    sourcePublisher: gameWith,
    sourceUrl: 'https://gamewith.net/nte/76171',
  }),
  profile({
    name: 'Zero', rarity: 'S', attribute: 'Cosmos', role: 'Damage', arcType: 'Solid',
    summary: {
      ru: 'Гибкий бесплатный персонаж урона Космоса: быстро заполняет шкалу цикла эспера и помогает всей команде.',
      en: 'A flexible free Cosmos DPS who triggers Esper Cycles frequently and supports the whole team.',
    },
  }),
];

export const characterByName = new Map(characterCatalog.map((character) => [character.name, character]));
const russianToCanonical = new Map<string, string>();
for (const [canonical, russian] of Object.entries(characterRussianNames)) {
  russianToCanonical.set(russian.toLocaleLowerCase('ru'), canonical);
  for (const alias of characterRussianAliases[canonical] ?? []) {
    russianToCanonical.set(alias.toLocaleLowerCase('ru'), canonical);
  }
}

export function canonicalCharacterName(value: string): string | null {
  const trimmed = value.trim();
  if (characterByName.has(trimmed)) return trimmed;
  const caseInsensitive = characterCatalog.find((character) => character.name.toLowerCase() === trimmed.toLowerCase());
  return caseInsensitive?.name ?? russianToCanonical.get(trimmed.toLocaleLowerCase('ru')) ?? null;
}
