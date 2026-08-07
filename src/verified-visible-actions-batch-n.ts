import type { VerifiedVisibleAction } from './verified-visible-actions';

/**
 * Exact level-10 maximum-hold Aerial Command. The direct hold composition and
 * twenty published DoT ticks are counted once. Five-Star Tracking, Express
 * Delivery Power, Remora and Awakenings remain separate mechanics.
 */
export const verifiedVisibleActionsBatchN: readonly VerifiedVisibleAction[] = [
  {
    id: 'hathor.aerial-command.full-hold.level-10',
    characterName: 'Hathor',
    title: { ru: 'Aerial Command · полное удержание', en: 'Aerial Command: full hold' },
    description: {
      ru: 'Полностью удерживаемый навык: 20,4% × 4 + 244,9% + 110,3% × 5 + 111,1% × 20 = 3100% АТК. Первые компоненты взяты из Hold Ratio, а 20 периодических попаданий — из подтверждённого максимума полного удержания. Five-Star Tracking, ресурсы Хатор и Ремора не включены.',
      en: 'Maximum hold: 20.4% × 4 + 244.9% + 110.3% × 5 + 111.1% × 20 = 3100% ATK. The first components come from the Hold Ratio and the twenty periodic hits from the sourced maximum full hold. Five-Star Tracking, Hathor resources, and Remora are excluded.',
    },
    multiplier: 20.4 * 4 + 244.9 + 110.3 * 5 + 111.1 * 20,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Навык удерживается до подтверждённого максимума в 20 периодических попаданий.',
        en: 'The skill is held through the sourced maximum of twenty periodic hits.',
      },
      {
        ru: 'Все компоненты Hold Ratio и все 20 периодических попаданий соединяются с проверяемой целью.',
        en: 'All Hold Ratio components and all twenty periodic hits connect with the tested target.',
      },
      {
        ru: 'Five-Star Tracking, Express Delivery Power, A1/A2/A5, Remora и Remora Enhancement рассчитываются отдельно.',
        en: 'Five-Star Tracking, Express Delivery Power, A1/A2/A5, Remora, and Remora Enhancement are calculated separately.',
      },
    ],
    sourcePublisher: 'Icy Veins / Prydwen Institute',
    sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/hathor-profile-skills',
    sourceUpdatedAt: '2026-06-27',
    verifiedAt: '2026-08-06',
  },
];
