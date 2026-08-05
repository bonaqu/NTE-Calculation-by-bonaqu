import type { VerifiedVisibleAction } from './verified-visible-actions';

const verifiedAt = '2026-08-05';
const icy = (character: string) => `https://www.icy-veins.com/neverness-to-everness/${character}-profile-skills`;

/**
 * Batch F deliberately mixes ATK, DEF and Max-HP actions per character.
 * Shields, healing, redirected damage, duration repeats and Awakening ratio
 * replacements remain outside these standalone records.
 */
export const verifiedVisibleActionsBatchF: readonly VerifiedVisibleAction[] = [
  {
    id: 'adler.deliverance.full-sequence.level-10',
    characterName: 'Adler',
    title: { ru: 'Deliverance · полная последовательность', en: 'Deliverance: full sequence' },
    description: {
      ru: 'Все пять опубликованных ступеней обычной атаки: 24,8% + 71,2% + 19,1% × 2 + 27% + 28,5% + 92,2% + 108% = 389,9% АТК.',
      en: 'All five published Basic Attack stages total 389.9% ATK.',
    },
    multiplier: 24.8 + 71.2 + 19.1 * 2 + 27 + 28.5 + 92.2 + 108,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Все попадания пяти ступеней достигли цели.', en: 'Every hit of all five stages connects.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('adler'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'adler.evils-bane.initial-composition.level-10',
    characterName: 'Adler',
    title: { ru: 'Evil’s Bane · начальная композиция', en: 'Evil’s Bane: initial composition' },
    description: {
      ru: 'Три начальных попадания навыка: 139,9% ЗАЩ × 3 = 419,7% ЗАЩ. Периодический урон и щит считаются отдельно.',
      en: 'Three initial Skill hits: 139.9% DEF × 3 = 419.7% DEF. Damage over time and shield are separate.',
    },
    multiplier: 139.9 * 3,
    scalingStat: 'def',
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Все три начальных попадания достигли цели.', en: 'All three initial hits connect.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('adler'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'adler.evils-bane.one-dot-tick.level-10',
    characterName: 'Adler',
    title: { ru: 'Evil’s Bane · один тик', en: 'Evil’s Bane: one DoT tick' },
    description: {
      ru: 'Ровно один тик периодического урона: 40% ЗАЩ. Десятисекундная длительность не превращается в автоматическое число повторов.',
      en: 'Exactly one damage-over-time tick: 40% DEF. The ten-second duration is not converted into an automatic repeat count.',
    },
    multiplier: 40,
    scalingStat: 'def',
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Учитывается ровно один тик.', en: 'Exactly one tick is counted.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('adler'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'adler.tranquility.five-target-hits.level-10',
    characterName: 'Adler',
    title: { ru: 'Tranquility · пять попаданий', en: 'Tranquility: five hits' },
    description: {
      ru: 'Обычный вариант сверхспособности: 199,9% ЗАЩ × 5 = 999,5% ЗАЩ.',
      en: 'Standard Ultimate composition: 199.9% DEF × 5 = 999.5% DEF.',
    },
    multiplier: 199.9 * 5,
    scalingStat: 'def',
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Проверяемая цель получила пять попаданий.', en: 'The tested target received five hits.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('adler'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'adler.tranquility.single-enemy-ten-hits.level-10',
    characterName: 'Adler',
    title: { ru: 'Tranquility · одна цель, десять попаданий', en: 'Tranquility: single enemy, ten hits' },
    description: {
      ru: 'Вариант при единственном противнике: 199,9% ЗАЩ × 10 = 1999% ЗАЩ.',
      en: 'Single-enemy Ultimate composition: 199.9% DEF × 10 = 1999% DEF.',
    },
    multiplier: 199.9 * 10,
    scalingStat: 'def',
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'На поле остался один противник, поэтому сработал второй залп.', en: 'Only one enemy remained, so the second strike occurred.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('adler'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'adler.pristine-reflection.level-10',
    characterName: 'Adler',
    title: { ru: 'Pristine Reflection · одно применение', en: 'Pristine Reflection: one cast' },
    description: { ru: 'Один опубликованный удар навыка поддержки: 399,8% АТК.', en: 'One published Support Skill hit: 399.8% ATK.' },
    multiplier: 399.8,
    requiredSkill: 'support', requiredLevel: 10,
    sourcePublisher: 'Icy Veins', sourceUrl: icy('adler'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },

  {
    id: 'fadia.wordless-rejection.full-sequence.level-10',
    characterName: 'Fadia',
    title: { ru: 'Wordless Rejection · полная последовательность', en: 'Wordless Rejection: full sequence' },
    description: {
      ru: 'Все пять опубликованных ступеней: 86,6% + 59,4% + 72% + 154,1% + 56,6% + 66,4% + 54,6% + 160,5% = 710,2% АТК.',
      en: 'All five published Basic Attack stages total 710.2% ATK.',
    },
    multiplier: 86.6 + 59.4 + 72 + 154.1 + 56.6 + 66.4 + 54.6 + 160.5,
    requiredSkill: 'basic', requiredLevel: 10,
    assumedConditions: [{ ru: 'Все попадания пяти ступеней достигли цели.', en: 'Every hit of all five stages connects.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('fadia'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'fadia.existence.direct-composition.level-10',
    characterName: 'Fadia',
    title: { ru: 'Existence · прямая композиция', en: 'Existence: direct composition' },
    description: {
      ru: 'Три опубликованные части прямого урона: 3,2% + 5% + 5% = 13,2% максимальных ОЗ. Перенаправленный урон, его предел и длительность не включены.',
      en: 'Three published direct-damage parts: 3.2% + 5% + 5% = 13.2% Max HP. Redirected damage, its cap and duration are excluded.',
    },
    multiplier: 3.2 + 5 + 5,
    scalingStat: 'max-hp',
    requiredSkill: 'skill', requiredLevel: 10,
    assumedConditions: [{ ru: 'Все три прямые части достигли цели.', en: 'All three direct parts connect.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('fadia'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'fadia.agony-to-euphoria.initial-composition.level-10',
    characterName: 'Fadia',
    title: { ru: 'Agony to Euphoria · начальная композиция', en: 'Agony to Euphoria: initial composition' },
    description: {
      ru: 'Шесть начальных попаданий: 7,8% + 2,4% × 4 + 12,6% = 30% максимальных ОЗ. Лечение и последующие атаки считаются отдельно.',
      en: 'Six initial Ultimate hits: 7.8% + 2.4% × 4 + 12.6% = 30% Max HP. Healing and follow-up attacks are separate.',
    },
    multiplier: 7.8 + 2.4 * 4 + 12.6,
    scalingStat: 'max-hp',
    requiredSkill: 'ultimate', requiredLevel: 10,
    assumedConditions: [{ ru: 'Все шесть начальных попаданий достигли цели.', en: 'All six initial hits connect.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('fadia'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'fadia.agony-to-euphoria.full-follow-up-sequence.level-10',
    characterName: 'Fadia',
    title: { ru: 'Agony to Euphoria · все пять последующих атак', en: 'Agony to Euphoria: all five follow-up attacks' },
    description: {
      ru: 'Все пять опубликованных последующих ступеней: 4% + 6,4% + 7,2% + 1,8% × 2 + 3% + 4,6% × 5 + 11,2% + 11,8% = 70,2% максимальных ОЗ.',
      en: 'All five published follow-up stages total 70.2% Max HP.',
    },
    multiplier: 4 + 6.4 + 7.2 + 1.8 * 2 + 3 + 4.6 * 5 + 11.2 + 11.8,
    scalingStat: 'max-hp',
    requiredSkill: 'ultimate', requiredLevel: 10,
    assumedConditions: [{ ru: 'Выполнены все пять последующих атак до выхода из состояния Lilith.', en: 'All five follow-up attacks were completed before leaving Lilith state.' }],
    sourcePublisher: 'Icy Veins', sourceUrl: icy('fadia'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
  {
    id: 'fadia.outsider.level-10',
    characterName: 'Fadia',
    title: { ru: 'Outsider · одно применение', en: 'Outsider: one cast' },
    description: { ru: 'Один опубликованный удар навыка поддержки: 399,8% АТК.', en: 'One published Support Skill hit: 399.8% ATK.' },
    multiplier: 399.8,
    requiredSkill: 'support', requiredLevel: 10,
    sourcePublisher: 'Icy Veins', sourceUrl: icy('fadia'), sourceUpdatedAt: '2026-07-07', verifiedAt,
  },
];
