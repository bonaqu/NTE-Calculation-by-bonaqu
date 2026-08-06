import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/jiuyuan-profile-skills';
const sourcePublisher = 'Icy Veins / Prydwen Institute';
const sourceUpdatedAt = '2026-07-07';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Jiuyuan direct actions. Lethal Rose Pact, Pact Settlement,
 * Blossom, Hexed and Awakening effects remain separate mechanics.
 */
export const verifiedVisibleActionsBatchM: readonly VerifiedVisibleAction[] = [
  {
    id: 'jiuyuan.intel-hunter.direct.level-10',
    characterName: 'Jiuyuan',
    title: { ru: 'Intel Hunter · прямой урон', en: 'Intel Hunter: direct damage' },
    description: {
      ru: 'Прямая hit-композиция навыка перенаправления: 72% + 76,4% × 4 + 222,7% = 600,3% АТК. Четыре Rose Pact Bullets и установление Lethal Rose Pact не превращаются в дополнительный фиксированный урон этой записи.',
      en: 'Redirect Skill direct hit composition: 72% + 76.4% × 4 + 222.7% = 600.3% ATK. The four Rose Pact Bullets and Lethal Rose Pact establishment do not become fixed extra damage in this record.',
    },
    multiplier: 72 + 76.4 * 4 + 222.7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все шесть опубликованных компонентов прямой атаки попадают по проверяемой цели.',
      en: 'All six published direct-hit components connect with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'jiuyuan.final-reckoning.direct.level-10',
    characterName: 'Jiuyuan',
    title: { ru: 'Final Reckoning · прямой урон', en: 'Final Reckoning: direct damage' },
    description: {
      ru: 'Raw hit-композиция сверхспособности: 123,5% + 156,7% × 3 + 48,8% × 7 + 264,1% = 1199,3% АТК. Одновременные Pact Settlement, их коэффициент 400%, энергия и A2–A6 не входят.',
      en: 'Ultimate raw hit composition: 123.5% + 156.7% × 3 + 48.8% × 7 + 264.1% = 1199.3% ATK. Simultaneous Pact Settlements, their 400% ratio, Energy, and A2–A6 are excluded.',
    },
    multiplier: 123.5 + 156.7 * 3 + 48.8 * 7 + 264.1,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все двенадцать опубликованных прямых компонентов сверхспособности попадают по проверяемой цели; Pact Settlement считается отдельно.',
      en: 'All twelve published direct Ultimate components connect with the tested target; Pact Settlement is calculated separately.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
