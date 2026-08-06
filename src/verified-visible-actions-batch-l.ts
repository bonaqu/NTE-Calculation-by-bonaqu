import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/zero-profile-skills';
const sourcePublisher = 'Icy Veins / Prydwen Institute';
const sourceUpdatedAt = '2026-07-07';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Zero direct actions. Lower-level-target hits, A1, A3, A4 and
 * A6 remain separate conditions and are never attached to Rotation Lab casts
 * automatically.
 */
export const verifiedVisibleActionsBatchL: readonly VerifiedVisibleAction[] = [
  {
    id: 'zero.appraise-and-engrave.main.level-10',
    characterName: 'Zero',
    title: { ru: 'Appraise and Engrave · основная часть', en: 'Appraise and Engrave: main sequence' },
    description: {
      ru: 'Основные четыре попадания навыка перенаправления: 40% + 40% + 251,1% + 268,7% = 599,8% АТК. Условный дополнительный выстрел по цели ниже уровнем и A6 хранятся отдельно.',
      en: 'The Redirect Skill four main hits: 40% + 40% + 251.1% + 268.7% = 599.8% ATK. The conditional lower-level-target extra shot and A6 remain separate.',
    },
    multiplier: 40 + 40 + 251.1 + 268.7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все четыре основных попадания соединяются с проверяемой целью; условный дополнительный выстрел не включён.',
      en: 'All four main hits connect with the tested target; the conditional extra shot is excluded.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'zero.appraise-and-engrave.extra-lower-level.base.level-10',
    characterName: 'Zero',
    title: { ru: 'Appraise and Engrave · условный выстрел', en: 'Appraise and Engrave: conditional extra shot' },
    description: {
      ru: 'Базовый дополнительный выстрел по первой цели ниже уровня Зеро: 200% АТК. При активном A6 вместо этой записи используется отдельный вариант на 300%; две записи не складываются.',
      en: 'Base extra shot against the first target below Zero level: 200% ATK. With A6 active, use the separate 300% record instead; the two records do not stack.',
    },
    multiplier: 200,
    requiredSkill: 'skill',
    requiredLevel: 10,
    requiresLowerLevelTarget: true,
    assumedConditions: [{
      ru: 'A6 Deceptive Liberation не выбран; учитывается базовый коэффициент 200%, а не вариант 300%.',
      en: 'A6 Deceptive Liberation is not selected; the base 200% ratio is used instead of the 300% variant.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'zero.divide-by-zero.level-10',
    characterName: 'Zero',
    title: { ru: 'Divide by Zero · полная прямая композиция', en: 'Divide by Zero: full direct composition' },
    description: {
      ru: 'Raw hit-композиция сверхспособности: 265,3% + 10,6% × 4 + 354,8% + 337% = 999,5% АТК. Безусловный пассив Anomaly Perception применяется отдельно как +25% к урону этого действия; A3 и A4 не включены.',
      en: 'Ultimate raw hit composition: 265.3% + 10.6% × 4 + 354.8% + 337% = 999.5% ATK. The unconditional Anomaly Perception passive is applied separately as +25% damage to this action; A3 and A4 are excluded.',
    },
    multiplier: 265.3 + 10.6 * 4 + 354.8 + 337,
    damageBonus: 25,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все семь опубликованных компонентов попадают по проверяемой цели. A3 (+50% шанса крит. удара) и A4 не моделируются этой записью.',
      en: 'All seven published components connect with the tested target. A3 (+50% CRIT Rate) and A4 are not modeled by this record.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
