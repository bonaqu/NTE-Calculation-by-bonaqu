import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/chaos-profile-skills';
const sourcePublisher = 'Icy Veins';
const sourceUpdatedAt = '2026-07-28';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Chaos direct actions. Dread Echo resource generation,
 * Warrant amplification, Awakening modifiers and Remora detonations remain
 * separate mechanics and are not baked into these ratios.
 */
export const verifiedVisibleActionsBatchI: readonly VerifiedVisibleAction[] = [
  {
    id: 'chaos.doubtmark.full-sequence.level-10',
    characterName: 'Chaos',
    title: { ru: 'Doubtmark · полная прямая последовательность', en: 'Doubtmark: full direct sequence' },
    description: {
      ru: 'Прямой урон навыка перенаправления: 164,9% + 434,8% = 599,7% АТК. Метка Warrant и её усиление урона моделируются отдельно.',
      en: 'Redirect Skill direct damage: 164.9% + 434.8% = 599.7% ATK. Warrant and its damage amplification are modeled separately.',
    },
    multiplier: 164.9 + 434.8,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Оба опубликованных попадания навыка попали по проверяемой цели.',
      en: 'Both published Skill hits connect with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'chaos.retribution.initial.level-10',
    characterName: 'Chaos',
    title: { ru: 'Retribution · входной урон', en: 'Retribution: initial damage' },
    description: {
      ru: 'Прямой входной урон сверхспособности: 254,5% × 4 + 581,5% = 1599,5% АТК. Состояние Dread Echo только ускоряет набор Crime и не добавляется к коэффициенту.',
      en: 'Ultimate entry damage: 254.5% × 4 + 581.5% = 1599.5% ATK. Dread Echo accelerates Crime generation and is not added to the ratio.',
    },
    multiplier: 254.5 * 4 + 581.5,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все пять опубликованных попаданий входной части сверхспособности попали по одной цели.',
      en: 'All five published hits of the Ultimate entry connect with one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'chaos.final-verdict.enhanced.level-10',
    characterName: 'Chaos',
    title: { ru: 'Final Verdict · усиленная тяжёлая атака', en: 'Final Verdict: enhanced Heavy Attack' },
    description: {
      ru: 'Одна полностью усиленная тяжёлая атака при 1000 Crime: 114,9% × 2 + 799,6% × 2 = 1829% АТК. В ротации действие применяется дважды как два экземпляра одного action ID.',
      en: 'One fully enhanced Heavy Attack at 1000 Crime: 114.9% × 2 + 799.6% × 2 = 1829% ATK. The rotation uses two instances of this same action ID.',
    },
    multiplier: 114.9 * 2 + 799.6 * 2,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Перед атакой накоплено 1000 Crime, поэтому обе ветви используют максимальный опубликованный коэффициент.',
        en: 'Chaos has 1000 Crime before the attack, so both branches use the published maximum ratio.',
      },
      {
        ru: 'Взрыв Remora Enhancement, Warrant, A2, A3 и A6 не добавляются автоматически.',
        en: 'Remora Enhancement detonation, Warrant, A2, A3 and A6 are not added automatically.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
