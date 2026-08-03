import type { ArcModelInput, ArcModifierSet } from '../packages/calculation-core/src';
import type { ArcModelModifiers, ModeledArcPreset, SourceEntry } from './types';

export const arcPresetSources: SourceEntry[] = [
  {
    id: 'gamewith-wrong-gate',
    title: 'The Wrong Gate Release Date and Arc Effect',
    publisher: 'GameWith',
    url: 'https://gamewith.net/nte/76491',
    verifiedAt: '2026-08-04',
    scope: {
      ru: 'Актуальные характеристики «Неверных врат» на 80 уровне и значения эффекта на базовом и максимальном уровне M.',
      en: 'Current level-80 stats and base/max Mixing Level effect values for The Wrong Gate.',
    },
  },
  {
    id: 'icy-wrong-gate',
    title: 'The Wrong Gate Details and Best Characters',
    publisher: 'Icy Veins',
    url: 'https://www.icy-veins.com/neverness-to-everness/weapons/the-wrong-gate',
    verifiedAt: '2026-08-04',
    scope: {
      ru: 'Независимая проверка базовой ATK 570, дополнительной ATK 30% и эффекта M1.',
      en: 'Independent verification of 570 base ATK, 30% ATK substat and the M1 effect.',
    },
  },
];

export const arcPresets: ModeledArcPreset[] = [
  {
    id: 'wrong-gate-m5', name: 'The Wrong Gate', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK%', secondaryValue: 30, mixing: 5,
    benchmarkNote: {
      ru: 'M5: постоянные +32% ATK; после лечения — +60% урона Анима Ирой и +30% урона союзников на 20 секунд.',
      en: 'M5: permanent +32% ATK; after healing, +60% Iroi Anima DMG and +30% ally damage for 20 seconds.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/47.webp',
    model: {
      static: { atkPct: 32 },
      conditional: { dmgBonus: 60, allyDmgBonus: 30 },
      trigger: { ru: 'После лечения · 20 секунд', en: 'After healing · 20 seconds' },
    },
    sourceId: 'gamewith-wrong-gate',
  },
  {
    id: 'wrong-gate-m1', name: 'The Wrong Gate', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK%', secondaryValue: 30, mixing: 1, benchmarkPercent: 100,
    benchmarkNote: {
      ru: 'M1: постоянные +16% ATK; после лечения — +30% урона Анима Ирой и +15% урона союзников на 20 секунд.',
      en: 'M1: permanent +16% ATK; after healing, +30% Iroi Anima DMG and +15% ally damage for 20 seconds.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/47.webp',
    model: {
      static: { atkPct: 16 },
      conditional: { dmgBonus: 30, allyDmgBonus: 15 },
      trigger: { ru: 'После лечения · 20 секунд', en: 'After healing · 20 seconds' },
    },
    sourceId: 'gamewith-wrong-gate',
  },
  {
    id: 'last-rose-m1', name: 'The Last Rose', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'CRIT Rate', secondaryValue: 24, mixing: 1, benchmarkPercent: 92.97,
    benchmarkNote: {
      ru: 'Постоянные +14% ATK учитываются. Короткое окно «Шипа хаоса» до +60% крит. урона намеренно не включено в консервативную модель.',
      en: 'The permanent +14% ATK is included. The short Chaos Thorn window of up to +60% CRIT DMG is deliberately omitted from the conservative model.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/8.webp',
    model: {
      static: { atkPct: 14 },
      conditional: {},
      trigger: { ru: '«Шип хаоса» не моделируется', en: 'Chaos Thorn is not modeled' },
    },
    sourceId: 'prydwen-iroi',
  },
  {
    id: 'youthful-fantasy-m5', name: 'Youthful Fantasy', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK%', secondaryValue: 30, mixing: 5,
    benchmarkNote: {
      ru: 'Интенсивность сломления и эффект «Чёрного тома» зависят от боя; частичная модель учитывает только постоянные 570 ATK и 30% ATK.',
      en: 'Break Intensity and Black Tome are encounter-dependent; the partial model includes only the permanent 570 ATK and 30% ATK.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/4.webp',
    model: { static: {}, conditional: {}, trigger: { ru: 'Условные эффекты не моделируются', en: 'Conditional effects are not modeled' } },
    sourceId: 'prydwen-iroi',
  },
  {
    id: 'youthful-fantasy-m1', name: 'Youthful Fantasy', rarity: 'S', type: 'Liquid', baseAtk: 570,
    secondaryLabel: 'ATK%', secondaryValue: 30, mixing: 1, benchmarkPercent: 92.55,
    benchmarkNote: {
      ru: 'Интенсивность сломления и эффект «Чёрного тома» зависят от боя; частичная модель учитывает только постоянные 570 ATK и 30% ATK.',
      en: 'Break Intensity and Black Tome are encounter-dependent; the partial model includes only the permanent 570 ATK and 30% ATK.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/4.webp',
    model: { static: {}, conditional: {}, trigger: { ru: 'Условные эффекты не моделируются', en: 'Conditional effects are not modeled' } },
    sourceId: 'prydwen-iroi',
  },
  {
    id: 'fluff-fleetness-m1', name: 'Fluff of Fleetness', rarity: 'S', type: 'Liquid', baseAtk: 512,
    secondaryLabel: 'CRIT DMG', secondaryValue: 44, mixing: 1, benchmarkPercent: 92,
    benchmarkNote: {
      ru: 'Постоянные 44% крит. урона учитываются. Накопительные уровни ATK на поле исключены, потому что Ирой почти всегда вне поля.',
      en: 'The permanent 44% CRIT DMG is included. On-field ATK stacks are omitted because Iroi is nearly always off-field.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/6.webp',
    model: { static: {}, conditional: {}, trigger: { ru: 'Накопление на поле не моделируется', en: 'On-field stacks are not modeled' } },
    sourceId: 'prydwen-iroi',
  },
  {
    id: 'shiny-days-m5', name: 'Shiny Days', rarity: 'A', type: 'Liquid', baseAtk: 475,
    secondaryLabel: 'ATK%', secondaryValue: 25, mixing: 5, benchmarkPercent: 91.88,
    benchmarkNote: {
      ru: 'Постоянные 25% ATK учитываются. Бонус по сломленным целям исключён как зависящий от боя.',
      en: 'The permanent 25% ATK is included. The Broken-target bonus is omitted as encounter-dependent.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/1.webp',
    model: { static: {}, conditional: {}, trigger: { ru: 'Бонус по сломленным целям не моделируется', en: 'Broken-target bonus is not modeled' } },
    sourceId: 'prydwen-iroi',
  },
  {
    id: 'clear-skies-m5', name: 'Clear Skies', rarity: 'A', type: 'Liquid', baseAtk: 475,
    secondaryLabel: 'ATK%', secondaryValue: 25, mixing: 5, benchmarkPercent: 91.63,
    benchmarkNote: {
      ru: 'Постоянные 25% ATK учитываются. Специализированный бонус навыка перенаправления и сверхспособности не применяется ко всему выбранному окну.',
      en: 'The permanent 25% ATK is included. The specialized Redirect Skill and Ultimate bonus is not applied to the whole selected window.',
    },
    image: 'https://cdn.prydwen.gg/images/nte/weapons/5.webp',
    model: { static: {}, conditional: {}, trigger: { ru: 'Специализированный бонус не моделируется', en: 'Specialized bonus is not modeled' } },
    sourceId: 'prydwen-iroi',
  },
];

export const customModelArcIds = [
  'wrong-gate-m5',
  'wrong-gate-m1',
  'last-rose-m1',
  'youthful-fantasy-m1',
  'fluff-fleetness-m1',
  'shiny-days-m5',
  'clear-skies-m5',
] as const;

const zeroModifiers = (): ArcModifierSet => ({
  atkPercent: 0,
  critRate: 0,
  critDamage: 0,
  damageBonus: 0,
  allyDamageBonus: 0,
});

const addModifiers = (target: ArcModifierSet, source: ArcModelModifiers): ArcModifierSet => ({
  atkPercent: target.atkPercent + (source.atkPct ?? 0),
  critRate: target.critRate + (source.critRate ?? 0),
  critDamage: target.critDamage + (source.critDmg ?? 0),
  damageBonus: target.damageBonus + (source.dmgBonus ?? 0),
  allyDamageBonus: target.allyDamageBonus + (source.allyDmgBonus ?? 0),
});

const staticSecondary = (arc: ModeledArcPreset): ArcModifierSet => {
  const modifiers = zeroModifiers();
  if (arc.secondaryLabel === 'ATK%') modifiers.atkPercent = arc.secondaryValue;
  if (arc.secondaryLabel === 'CRIT Rate') modifiers.critRate = arc.secondaryValue;
  if (arc.secondaryLabel === 'CRIT DMG') modifiers.critDamage = arc.secondaryValue;
  return modifiers;
};

export function arcPresetToModel(arc: ModeledArcPreset, conditionalUptime: number): ArcModelInput {
  return {
    id: arc.id,
    name: `${arc.name} M${arc.mixing}`,
    arcAtk: arc.baseAtk,
    static: addModifiers(staticSecondary(arc), arc.model.static),
    conditional: addModifiers(zeroModifiers(), arc.model.conditional),
    conditionalUptime,
  };
}
