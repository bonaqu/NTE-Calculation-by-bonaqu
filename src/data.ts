import type { ArcPreset, CharacterEntry, ProgressionStep, SourceEntry } from './types';

export const sources: SourceEntry[] = [
  {
    id: 'prydwen-iroi',
    title: 'Iroi Best Build Guide',
    publisher: 'Prydwen Institute',
    url: 'https://www.prydwen.gg/neverness-to-everness/characters/iroi',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Набор Ирой, рекомендации и командные проценты дуг для патча 1.2.',
      en: 'Iroi kit, build notes and team Arc benchmark percentages for patch 1.2.',
    },
  },
  {
    id: 'prydwen-arcs',
    title: 'Arcs (Weapons) Database',
    publisher: 'Prydwen Institute',
    url: 'https://www.prydwen.gg/neverness-to-everness/arcs',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Редкость, тип, базовые характеристики и описания эффектов дуг.',
      en: 'Arc rarity, type, base stats and passive descriptions.',
    },
  },
  {
    id: 'prydwen-characters',
    title: 'NTE Characters & Build Guides',
    publisher: 'Prydwen Institute',
    url: 'https://www.prydwen.gg/neverness-to-everness/characters',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Актуальный каталог из 22 персонажей; расширенные поля показываются только для отдельно проверенных профилей.',
      en: 'Current 22-character catalog; detailed fields are shown only for individually verified profiles.',
    },
  },
  {
    id: 'nte-wiki-formula',
    title: 'NTE Damage Calculator',
    publisher: 'NTE.wiki',
    url: 'https://nte.wiki/tools/damage-calculator/',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Публичная базовая формула урона, защиты, сопротивления и ожидаемого крита.',
      en: 'Public baseline formula for damage, defence, resistance and expected crit.',
    },
  },
  {
    id: 'icy-iroi-materials',
    title: 'Iroi Guide, Skills, Kit, and Awakenings',
    publisher: 'Icy Veins',
    url: 'https://www.icy-veins.com/neverness-to-everness/iroi-profile-skills',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Стоимость возвышения Ирой по порогам уровня.',
      en: 'Iroi character ascension material costs by level breakpoint.',
    },
  },
  {
    id: 'user-rivyn-chart',
    title: 'Rivyn Elowen Iroi Arc comparison screenshot',
    publisher: 'User-provided reference',
    url: '',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Бенчмарк The Wrong Gate M5 и визуальный референс; публичный калькулятор-источник не найден.',
      en: 'The Wrong Gate M5 benchmark and visual reference; no public source calculator was located.',
    },
  },
];

export const arcPresets: ArcPreset[] = [
  {
    id: 'wrong-gate-m5', name: 'The Wrong Gate', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK', secondaryValue: 46, mixing: 5, benchmarkPercent: 107.77,
    benchmarkNote: {
      ru: 'Значение M5 взято с предоставленного скриншота расчёта Rivyn Elowen.',
      en: 'M5 value comes from the user-provided Rivyn Elowen calculation screenshot.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/47.webp', effect: { atkPct: 46, teamDmgBonus: 15 }, sourceId: 'user-rivyn-chart',
  },
  {
    id: 'wrong-gate-m1', name: 'The Wrong Gate', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK', secondaryValue: 46, mixing: 1, benchmarkPercent: 100,
    benchmarkNote: {
      ru: 'Сигнатурная дуга Ирой и базовая точка командного сравнения.',
      en: 'Iroi signature Arc and the baseline for the team comparison.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/47.webp', effect: { atkPct: 46, teamDmgBonus: 15 }, sourceId: 'prydwen-iroi',
  },
  {
    id: 'last-rose-m1', name: 'The Last Rose', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'CRIT Rate', secondaryValue: 24, mixing: 1, benchmarkPercent: 92.97,
    benchmarkNote: {
      ru: 'Активный эффект с DoT нереалистично поддерживать на Ирой; в частичной модели он не учитывается.',
      en: 'Its DoT-based active is unrealistic to maintain on Iroi and is omitted from the partial model.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/8.webp', effect: { critRate: 24 }, sourceId: 'prydwen-iroi',
  },
  {
    id: 'youthful-fantasy-m1', name: 'Youthful Fantasy', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK', secondaryValue: 30, mixing: 1, benchmarkPercent: 92.55,
    benchmarkNote: {
      ru: 'Ценность Break зависит от боя; для Ирой дуга в основном работает как 570 ATK + 30% ATK.',
      en: 'Break value is encounter-dependent; for Iroi it mainly acts as 570 ATK plus 30% ATK.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/4.webp', effect: { atkPct: 30 }, sourceId: 'prydwen-iroi',
  },
  {
    id: 'fluff-fleetness-m1', name: 'Fluff of Fleetness', rarity: 'S', type: 'Liquid', baseAtk: 512,
    secondaryLabel: 'CRIT DMG', secondaryValue: 44, mixing: 1, benchmarkPercent: 92,
    benchmarkNote: {
      ru: 'Низкое время Ирой на поле ухудшает набор стаков активного эффекта.',
      en: 'Iroi low field time makes the stacking active difficult to realize.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/6.webp', effect: { critDmg: 44 }, sourceId: 'prydwen-iroi',
  },
  {
    id: 'shiny-days-m5', name: 'Shiny Days', rarity: 'A', type: 'Liquid', baseAtk: 475,
    secondaryLabel: 'ATK', secondaryValue: 25, mixing: 5, benchmarkPercent: 91.88,
    benchmarkNote: {
      ru: 'Пассив окна Break трудно реализовать в коротких боях.',
      en: 'The Break-window passive is difficult to realize in short encounters.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/1.webp', effect: { atkPct: 25 }, sourceId: 'prydwen-iroi',
  },
  {
    id: 'clear-skies-m5', name: 'Clear Skies', rarity: 'A', type: 'Liquid', baseAtk: 475,
    secondaryLabel: 'ATK', secondaryValue: 25, mixing: 5, benchmarkPercent: 91.63,
    benchmarkNote: {
      ru: 'Эффект усиливает не весь профиль урона Ирой; в частичной модели учитывается только подтверждённый ATK.',
      en: 'Its effect does not cover Iroi full damage profile; the partial model includes only verified ATK.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/5.webp', effect: { atkPct: 25 }, sourceId: 'prydwen-iroi',
  },
];

export const iroiProgression: ProgressionStep[] = [
  { cap: 20, beetleCoin: 25_000, page: 0, fading: 5, blurred: 0, chaos: 0 },
  { cap: 30, beetleCoin: 50_000, page: 2, fading: 12, blurred: 0, chaos: 0 },
  { cap: 40, beetleCoin: 75_000, page: 8, fading: 0, blurred: 6, chaos: 0 },
  { cap: 50, beetleCoin: 100_000, page: 16, fading: 0, blurred: 12, chaos: 0 },
  { cap: 60, beetleCoin: 125_000, page: 24, fading: 0, blurred: 0, chaos: 6 },
  { cap: 70, beetleCoin: 150_000, page: 36, fading: 0, blurred: 0, chaos: 9 },
];

const catalogNames = [
  'Adler', 'Aurelia', 'Baicang', 'Chaos', 'Chiz', 'Daffodill', 'Edgar', 'Fadia', 'Haniel', 'Hathor', 'Hotori',
  'Iroi', 'Jiuyuan', 'Lacrimosa', 'Linko', 'Mint', 'Nanally', 'Sakiri', 'Shinku', 'Skia', 'Zankou', 'Zero',
] as const;

const verifiedCharacterDetails: Record<string, Omit<CharacterEntry, 'name' | 'detailsVerified'>> = {
  Iroi: { attribute: 'Anima', role: 'Survival', arcType: 'Liquid', image: 'https://cdn.prydwen.gg/images/nte/characters/iroi_full.webp' },
  Shinku: { attribute: 'Cosmos', role: 'Damage', arcType: 'Synthesis' },
  Hathor: { attribute: 'Lakshana', role: 'Damage', arcType: 'Plasma' },
  Zero: { attribute: 'Cosmos', role: 'Damage', arcType: 'Solid' },
  Lacrimosa: { attribute: 'Chaos', role: 'Damage', arcType: 'Liquid' },
  Baicang: { attribute: 'Incantation', role: 'Damage', arcType: 'Synthesis' },
  Chiz: { attribute: 'Cosmos', role: 'Damage', arcType: 'Gas' },
};

export const characterDirectory: CharacterEntry[] = catalogNames.map((name) => ({
  name,
  ...verifiedCharacterDetails[name],
  detailsVerified: name in verifiedCharacterDetails,
}));
