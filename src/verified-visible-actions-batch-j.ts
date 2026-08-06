import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/lacrimosa-profile-skills';
const sourcePublisher = 'Icy Veins';
const sourceUpdatedAt = '2026-07-07';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Lacrimosa actions for both Basic Attack forms. These records
 * intentionally do not decide which form or Redirect Skill branch the Rotation
 * Lab preset uses. Discord, Nightmare repeats and copied Devilish Gift damage
 * remain separate mechanics.
 */
export const verifiedVisibleActionsBatchJ: readonly VerifiedVisibleAction[] = [
  {
    id: 'lacrimosa.tomato-metal.full-direct-sequence.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Metal · полная прямая цепочка', en: 'Tomato Metal: full direct sequence' },
    description: {
      ru: 'Пять прямых ступеней ближней формы: (128,3% + 46,4%) + 39,8% × 2 + (49,2% + 29,4% × 3) + (141,7% + 54,6%) + (46,6% × 3 + 246,5%) = 974,3% АТК. Взрыв снаряда второй атаки хранится отдельно.',
      en: 'Five direct melee-form stages: (128.3% + 46.4%) + 39.8% × 2 + (49.2% + 29.4% × 3) + (141.7% + 54.6%) + (46.6% × 3 + 246.5%) = 974.3% ATK. The second-attack projectile explosion is stored separately.',
    },
    multiplier: (128.3 + 46.4) + 39.8 * 2 + (49.2 + 29.4 * 3) + (141.7 + 54.6) + (46.6 * 3 + 246.5),
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Лакримоза остаётся в ближней форме и выполняет ступени 1–5 по одной цели.',
      en: 'Lacrimosa remains in melee form and completes stages 1–5 against one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-metal.projectile-explosion.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Metal · взрыв снаряда', en: 'Tomato Metal: projectile explosion' },
    description: {
      ru: 'Один отдельный взрыв снаряда, созданного второй атакой ближней формы: 38,8% АТК. Запись не умножается на длительность и не прикрепляется к каждой базовой атаке.',
      en: 'One separate explosion of the projectile created by melee Basic Attack stage two: 38.8% ATK. The record is not duration-multiplied or attached to every Basic Attack.',
    },
    multiplier: 38.8,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Созданный второй атакой снаряд разрушен последующей подходящей атакой.',
      en: 'The projectile created by stage two is shattered by a subsequent eligible attack.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-percussion.full-sequence.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Percussion · полная цепочка', en: 'Tomato Percussion: full sequence' },
    description: {
      ru: 'Пять ступеней дальней формы: 74,2% + 32% × 3 + 227,7% + (31,6% × 3 + 387,2%) + 247,7% = 1127,6% АТК.',
      en: 'Five ranged-form stages: 74.2% + 32% × 3 + 227.7% + (31.6% × 3 + 387.2%) + 247.7% = 1127.6% ATK.',
    },
    multiplier: 74.2 + 32 * 3 + 227.7 + (31.6 * 3 + 387.2) + 247.7,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Лакримоза остаётся в дальней форме и выполняет ступени 1–5 по одной цели.',
      en: 'Lacrimosa remains in ranged form and completes stages 1–5 against one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-metal.fifth.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Metal · пятая атака', en: 'Tomato Metal: fifth attack' },
    description: {
      ru: 'Только пятая атака ближней формы: 46,6% × 3 + 246,5% = 386,3% АТК. Она не включает Morning Tomato или предыдущие четыре ступени.',
      en: 'Melee-form fifth attack only: 46.6% × 3 + 246.5% = 386.3% ATK. It excludes Morning Tomato and the preceding four stages.',
    },
    multiplier: 46.6 * 3 + 246.5,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Выполняется именно пятая ступень ближней формы.', en: 'The melee-form fifth stage is used.' }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-percussion.fifth.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Percussion · пятая атака', en: 'Tomato Percussion: fifth attack' },
    description: {
      ru: 'Только пятая атака дальней формы: 247,7% АТК. Она хранится отдельно от ближнего варианта на 386,3% АТК.',
      en: 'Ranged-form fifth attack only: 247.7% ATK. It remains separate from the 386.3% melee variant.',
    },
    multiplier: 247.7,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Выполняется именно пятая ступень дальней формы.', en: 'The ranged-form fifth stage is used.' }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.morning-tomato.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Morning Tomato · прямой урон', en: 'Morning Tomato: direct damage' },
    description: {
      ru: 'Прямой урон варианта навыка перенаправления: 599,7% АТК. Навык накладывает 5 Nightmare и переводит к пятой базовой атаке, но урон Nightmare и выбранная форма пятой атаки считаются отдельно.',
      en: 'Direct damage of the Redirect Skill variant: 599.7% ATK. It applies 5 Nightmare and advances to Basic Attack stage five, while Nightmare damage and the selected fifth-attack form remain separate.',
    },
    multiplier: 599.7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Выбран именно Morning Tomato, а не Devilish Gift с копированием внешнего навыка.',
      en: 'Morning Tomato is selected rather than Devilish Gift copying an external ability.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
