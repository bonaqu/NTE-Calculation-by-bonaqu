import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/nanally-profile-skills';
const sourcePublisher = 'Icy Veins';
const sourceUpdatedAt = '2026-07-31';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Nanally direct and Underboss-coordinated actions. The
 * Ichi-daime's Authority CRIT DMG state, passive Fair Duel and Awakening 3
 * follow-ups remain separate records/modifiers and are not baked in here.
 */
export const verifiedVisibleActionsBatchH: readonly VerifiedVisibleAction[] = [
  {
    id: 'nanally.colucci-secret-skill.full-sequence.level-10',
    characterName: 'Nanally',
    title: { ru: 'Colucci Secret Skill · полная базовая цепочка', en: 'Colucci Secret Skill: full Basic string' },
    description: {
      ru: 'Собственный урон Наналли за все пять опубликованных ступеней базовой атаки: 59,2% + 77,6% + (24,4% + 42% + 253,9%) + 13,8% × 7 + 154,1% + 154,5% = 862,3% АТК. Ответы Underboss и пассивные атаки сюда не входят.',
      en: 'Nanally own damage across all five published Basic stages: 59.2% + 77.6% + (24.4% + 42% + 253.9%) + 13.8% × 7 + 154.1% + 154.5% = 862.3% ATK. Underboss responses and passive follow-ups are excluded.',
    },
    multiplier: 59.2 + 77.6 + 24.4 + 42 + 253.9 + 13.8 * 7 + 154.1 + 154.5,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все удары пятиступенчатой базовой цепочки попали по одной проверяемой цели.',
      en: 'Every hit of the five-stage Basic string connects with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'nanally.underboss.basic-coordinated-full-sequence.level-10',
    characterName: 'Nanally',
    title: { ru: 'Underboss · ответы на полную базовую цепочку', en: 'Underboss: coordinated full Basic responses' },
    description: {
      ru: 'Согласованные ответы Underboss на пять ступеней базовой цепочки Наналли: 50% + 45% + (85% + 80%) + 63,4% × 3 + 90% + 119,9% = 660,1% АТК. Это не собственный урон базовых атак Наналли.',
      en: 'Underboss coordinated responses to Nanally five Basic stages: 50% + 45% + (85% + 80%) + 63.4% × 3 + 90% + 119.9% = 660.1% ATK. This is not Nanally own Basic Attack damage.',
    },
    multiplier: 50 + 45 + 85 + 80 + 63.4 * 3 + 90 + 119.9,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Underboss призван сверхспособностью и отвечает на каждую ступень полной базовой цепочки.',
        en: 'Underboss was summoned by the Ultimate and responds to every stage of the full Basic string.',
      },
      {
        ru: 'Fair Duel и дополнительная атака A3 считаются отдельными пассивными срабатываниями.',
        en: 'Fair Duel and the Awakening 3 follow-up remain separate passive triggers.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'nanally.heavy-hitter.full-sequence.level-10',
    characterName: 'Nanally',
    title: { ru: 'Heavy Hitter! · полная тяжёлая цепочка', en: 'Heavy Hitter!: full Heavy string' },
    description: {
      ru: 'Собственный урон Наналли за три опубликованные ступени тяжёлой базовой атаки: (12% + 134,5%) + (23,2% × 2 + 169,3%) + 316,8% = 679% АТК. Ответы Underboss не включены.',
      en: 'Nanally own damage across the three published Heavy Basic stages: (12% + 134.5%) + (23.2% × 2 + 169.3%) + 316.8% = 679% ATK. Underboss responses are excluded.',
    },
    multiplier: 12 + 134.5 + 23.2 * 2 + 169.3 + 316.8,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все удары трёхступенчатой тяжёлой цепочки попали по одной проверяемой цели.',
      en: 'Every hit of the three-stage Heavy string connects with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'nanally.underboss.heavy-coordinated-full-sequence.level-10',
    characterName: 'Nanally',
    title: { ru: 'Underboss · ответы на тяжёлую цепочку', en: 'Underboss: coordinated Heavy responses' },
    description: {
      ru: 'Согласованные ответы Underboss на три ступени Heavy Hitter!: 62,2% + (44% + 40,2% + 142,9%) + 93,2% × 3 = 568,9% АТК.',
      en: 'Underboss coordinated responses to the three Heavy Hitter! stages: 62.2% + (44% + 40.2% + 142.9%) + 93.2% × 3 = 568.9% ATK.',
    },
    multiplier: 62.2 + 44 + 40.2 + 142.9 + 93.2 * 3,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Underboss активен и отвечает на каждую ступень полной тяжёлой цепочки.',
        en: 'Underboss is active and responds to every stage of the full Heavy string.',
      },
      {
        ru: 'Fair Duel и дополнительная атака A3 не добавляются автоматически.',
        en: 'Fair Duel and the Awakening 3 follow-up are not added automatically.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'nanally.colucci-howling-technique.level-10',
    characterName: 'Nanally',
    title: { ru: 'Colucci Howling Technique · одно применение', en: 'Colucci Howling Technique: one cast' },
    description: {
      ru: 'Прямой урон одного применения навыка: 199,9% × 5 = 999,5% АТК. Двенадцатисекундный Ichi-daime’s Authority и его +30% крит. урона моделируются отдельно.',
      en: 'One Skill cast direct damage: 199.9% × 5 = 999.5% ATK. The twelve-second Ichi-daime’s Authority state and its +30% CRIT DMG are modeled separately.',
    },
    multiplier: 199.9 * 5,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Учитываются ровно пять опубликованных попаданий навыка по проверяемой цели.',
      en: 'Exactly the five published Skill hits connect with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'nanally.colucci-ultimate-technique.initial.level-10',
    characterName: 'Nanally',
    title: { ru: 'Colucci Ultimate Technique · входной урон', en: 'Colucci Ultimate Technique: initial damage' },
    description: {
      ru: 'Прямой входной урон сверхспособности: 585,9% + 84,6% × 5 + 990,3% = 1999,2% АТК. Последующие шестисекундные ответы Underboss хранятся отдельными действиями.',
      en: 'Direct Ultimate entry damage: 585.9% + 84.6% × 5 + 990.3% = 1999.2% ATK. The later six-second Underboss responses remain separate actions.',
    },
    multiplier: 585.9 + 84.6 * 5 + 990.3,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все семь опубликованных попаданий входной части сверхспособности попали по одной цели.',
      en: 'All seven published hits of the Ultimate entry connect with one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
