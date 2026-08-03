import type { ArcBenchmarkScenario, CharacterEntry, ProgressionStep, SourceEntry } from './types';

export const sources: SourceEntry[] = [
  {
    id: 'prydwen-iroi',
    title: 'Iroi Best Build Guide',
    publisher: 'Prydwen Institute',
    url: 'https://www.prydwen.gg/neverness-to-everness/characters/iroi',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Набор Ирой, рекомендации и публичные командные проценты дуг для патча 1.2.',
      en: 'Iroi kit, build notes and public team Arc benchmark percentages for patch 1.2.',
    },
  },
  {
    id: 'prydwen-arcs',
    title: 'Arcs (Weapons) Database',
    publisher: 'Prydwen Institute',
    url: 'https://www.prydwen.gg/neverness-to-everness/arcs',
    verifiedAt: '2026-08-03',
    scope: {
      ru: 'Редкость, тип, базовые характеристики и описания эффектов дуг, кроме записей с отдельно указанным актуальным источником.',
      en: 'Arc rarity, type, base stats and passive descriptions, except entries with an explicitly listed current source.',
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
      ru: 'Полная таблица Support Calc Only со значениями урона, DPS и условиями со скриншота; публичный исходный калькулятор не найден.',
      en: 'Complete Support Calc Only table with damage, DPS and scenario conditions from the screenshot; no public source calculator was located.',
    },
  },
];

export const arcBenchmarkScenarios: ArcBenchmarkScenario[] = [
  {
    id: 'prydwen-public',
    title: { ru: 'Prydwen · публичный бенчмарк патча 1.2', en: 'Prydwen · public Patch 1.2 benchmark' },
    description: {
      ru: 'Опубликованный порядок лучших дуг Ирой. Prydwen показывает относительный командный результат, но не публикует в таблице абсолютный урон и DPS.',
      en: 'Published Iroi Arc ranking. Prydwen exposes relative team performance but does not publish absolute damage or DPS in the table.',
    },
    sourceId: 'prydwen-iroi',
    verifiedAt: '2026-08-03',
    meta: [
      { ru: 'Персонаж: Ирой · роль поддержки', en: 'Character: Iroi · support role' },
      { ru: 'Версия гайда: Patch 1.2', en: 'Guide version: Patch 1.2' },
      { ru: 'База сравнения: The Wrong Gate M1 = 100%', en: 'Baseline: The Wrong Gate M1 = 100%' },
    ],
    rows: [
      { arcId: 'wrong-gate-m1', percent: 100, note: { ru: 'Сигнатурная дуга и публичная база сравнения.', en: 'Signature Arc and public comparison baseline.' } },
      { arcId: 'last-rose-m1', percent: 92.97, note: { ru: 'Активный DoT-эффект на Ирой нереалистично поддерживать.', en: 'The active DoT effect is unrealistic to maintain on Iroi.' } },
      { arcId: 'youthful-fantasy-m1', percent: 92.55, note: { ru: 'В основном работает как 570 Base ATK + 30% ATK.', en: 'Mainly functions as 570 Base ATK plus 30% ATK.' } },
      { arcId: 'fluff-fleetness-m1', percent: 92, note: { ru: 'Низкое время на поле мешает набору стаков.', en: 'Low field time makes stacking difficult.' } },
      { arcId: 'shiny-days-m5', percent: 91.88, note: { ru: 'Break-окно сложно реализовать до гибели цели.', en: 'The Break window is difficult to realize before the target dies.' } },
      { arcId: 'clear-skies-m5', percent: 91.63, note: { ru: 'Бафф покрывает не весь профиль урона Ирой.', en: 'The buff does not cover Iroi full damage profile.' } },
    ],
  },
  {
    id: 'rivyn-support',
    title: { ru: 'Rivyn Elowen · Support Calc Only', en: 'Rivyn Elowen · Support Calc Only' },
    description: {
      ru: 'Расширенная таблица с предоставленного скриншота. Она содержит абсолютный командный урон и DPS, но исходный публичный калькулятор и воспроизводимая модель не найдены.',
      en: 'Extended table from the supplied screenshot. It includes absolute team damage and DPS, but no public source calculator or reproducible model was found.',
    },
    sourceId: 'user-rivyn-chart',
    verifiedAt: '2026-08-03',
    meta: [
      { ru: 'Команда: Ирой MC (Day Off) + Shinku (Blushing Mirage) + Hathor (Raging Flames)', en: 'Team: Iroi MC (Day Off) + Shinku (Blushing Mirage) + Hathor (Raging Flames)' },
      { ru: 'Speedy Hedgehog · Cycle Intensity · 22 эффективных сабстата', en: 'Speedy Hedgehog · Cycle Intensity · 22 effective substats' },
      { ru: 'Босс Lv82 · одна цель · 1032 DEF · All-Type RES 20% · 35 секунд', en: 'Boss Lv82 · single target · 1032 DEF · All-Type RES 20% · 35 seconds' },
      { ru: 'Вклад Ирой в урон команды: 10,51% без Break DMG', en: 'Iroi team damage contribution: 10.51% excluding Break DMG' },
    ],
    rows: [
      { arcId: 'wrong-gate-m5', percent: 107.77, teamDamage: 2_912_618, teamDps: 83_218, note: { ru: 'Максимальное смешение сигнатурной дуги.', en: 'Maximum mixing of the signature Arc.' } },
      { arcId: 'wrong-gate-m1', percent: 100, teamDamage: 2_702_636, teamDps: 77_218, note: { ru: 'Baseline расширенного расчёта.', en: 'Baseline of the extended calculation.' } },
      { arcId: 'last-rose-m1', percent: 92.97, teamDamage: 2_512_743, teamDps: 71_793, note: { ru: 'Custom uptime: 3 секунды после применения Skill.', en: 'Custom uptime: 3 seconds after casting Skill.' } },
      { arcId: 'youthful-fantasy-m5', percent: 92.63, teamDamage: 2_503_523, teamDps: 71_529, note: { ru: 'Активный эффект не учитывается.', en: 'Assumes no active use.' } },
      { arcId: 'youthful-fantasy-m1', percent: 92.55, teamDamage: 2_501_294, teamDps: 71_466, note: { ru: 'Активный эффект не учитывается.', en: 'Assumes no active use.' } },
      { arcId: 'shiny-days-m5', percent: 92.36, teamDamage: 2_496_268, teamDps: 71_322, note: { ru: 'Большинство боссов погибает до Break.', en: 'Most bosses are dead before they break.' } },
      { arcId: 'fluff-fleetness-m1', percent: 92.30, teamDamage: 2_494_516, teamDps: 71_272, note: { ru: 'Аптайм отсутствует: Ирой почти всегда вне поля.', en: 'No uptime because Iroi is nearly always off-field.' } },
      { arcId: 'clear-skies-m5', percent: 92.12, teamDamage: 2_489_582, teamDps: 71_151, note: { ru: 'Значение из предоставленной таблицы.', en: 'Value from the supplied table.' } },
    ],
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
