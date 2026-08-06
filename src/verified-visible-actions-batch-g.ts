import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/shinku-profile-skills';
const sourcePublisher = 'Icy Veins';
const sourceUpdatedAt = '2026-07-31';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 direct actions from Shinku's current released kit.
 * Surging Crimson's separate +30% DMG state and Awakening 6 ratio increases
 * are deliberately not baked into these action multipliers.
 */
export const verifiedVisibleActionsBatchG: readonly VerifiedVisibleAction[] = [
  {
    id: 'shinku.high-speed-breach.level-10',
    characterName: 'Shinku',
    title: { ru: 'High-Speed Breach · одно применение', en: 'High-Speed Breach: one cast' },
    description: {
      ru: 'Прямой урон одного обычного навыка перенаправления: 34,6% + 46,2% + 159,1% = 239,9% АТК. Английское имя сохранено до подтверждения названия в русском клиенте.',
      en: 'One normal Redirect Skill cast: 34.6% + 46.2% + 159.1% = 239.9% ATK.',
    },
    multiplier: 34.6 + 46.2 + 159.1,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Шинку находится вне состояния Surging Crimson; дополнительный Instant Strike от Menacing Gaze считается отдельным действием.',
      en: 'Shinku is outside Surging Crimson; any Menacing Gaze Instant Strike is a separate action.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'shinku.scarlet-descent.level-10',
    characterName: 'Shinku',
    title: { ru: 'Scarlet Descent · одно применение', en: 'Scarlet Descent: one cast' },
    description: {
      ru: 'Одно применение усиленного навыка перенаправления: 44,8% + 435% = 479,8% АТК. Бонус урона Surging Crimson и увеличение коэффициента от A6 не вшиты.',
      en: 'One enhanced Redirect Skill cast: 44.8% + 435% = 479.8% ATK. Surging Crimson DMG bonus and the A6 ratio increase are not baked in.',
    },
    multiplier: 44.8 + 435,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Активно состояние Surging Crimson и накоплено не менее 12 Fading Reason.',
        en: 'Surging Crimson is active and at least 12 Fading Reason is available.',
      },
      {
        ru: 'Это ровно одно из максимум пяти применений за состояние; автоматическое умножение на пять отсутствует.',
        en: 'This is exactly one of up to five casts per state; it is not automatically multiplied by five.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'shinku.crimson-fury.level-10',
    characterName: 'Shinku',
    title: { ru: 'Crimson Fury · входной урон', en: 'Crimson Fury: entry damage' },
    description: {
      ru: 'Прямой урон активации сверхспособности: 37% + 239,9% + 109,9% × 5 + 287,9% + 85% = 1199,3% АТК. Последующее 13-секундное состояние моделируется отдельно.',
      en: 'Direct Ultimate activation damage: 37% + 239.9% + 109.9% × 5 + 287.9% + 85% = 1199.3% ATK. The following 13-second state is modeled separately.',
    },
    multiplier: 37 + 239.9 + 109.9 * 5 + 287.9 + 85,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Накоплено 60 Defiant Spirit. Учитывается только прямой входной урон Crimson Fury.',
      en: 'Sixty Defiant Spirit is available. Only Crimson Fury direct entry damage is counted.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'shinku.crimson-judgment.one-dash.level-10',
    characterName: 'Shinku',
    title: { ru: 'Crimson Judgment · один рывок', en: 'Crimson Judgment: one dash' },
    description: {
      ru: 'Один подтверждённый экземпляр рывка: 119,9% × 4 = 479,6% АТК. Это не три рывка и не завершающий Dragonflame Verdict.',
      en: 'One verified dash instance: 119.9% × 4 = 479.6% ATK. This is neither three dashes nor the Dragonflame Verdict finisher.',
    },
    multiplier: 119.9 * 4,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Активно завершающее окно Surging Crimson и доступен один экземпляр Crimson Judgment.',
        en: 'The closing Surging Crimson window is active and one Crimson Judgment instance is available.',
      },
      {
        ru: 'A6 и отдельный бонус урона состояния не применяются автоматически.',
        en: 'A6 and the separate state DMG bonus are not applied automatically.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'shinku.dragonflame-verdict.level-10',
    characterName: 'Shinku',
    title: { ru: 'Dragonflame Verdict · завершающий удар', en: 'Dragonflame Verdict: finisher' },
    description: {
      ru: 'Завершающий удар сверхспособности: 40% × 10 + 799,6% = 1199,6% АТК. Он хранится отдельно от Crimson Judgment.',
      en: 'Ultimate finisher: 40% × 10 + 799.6% = 1199.6% ATK. It remains separate from Crimson Judgment.',
    },
    multiplier: 40 * 10 + 799.6,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Все доступные Crimson Judgment израсходованы либо Surging Crimson завершилось.',
        en: 'All available Crimson Judgment instances were consumed or Surging Crimson ended.',
      },
      {
        ru: 'A6 и отдельный бонус урона состояния не применяются автоматически.',
        en: 'A6 and the separate state DMG bonus are not applied automatically.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
