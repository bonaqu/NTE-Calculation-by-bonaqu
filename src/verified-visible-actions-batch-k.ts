import type { VerifiedVisibleAction } from './verified-visible-actions';

/**
 * One raw level-10 Phantom Step use. Finale's +10% state increase, Cicada
 * Shell's +80%, successful-parry extra damage and Awakening modifiers remain
 * separate and are not baked into the published action ratio.
 */
export const verifiedVisibleActionsBatchK: readonly VerifiedVisibleAction[] = [
  {
    id: 'daffodill.phantom-step.level-10',
    characterName: 'Daffodill',
    title: { ru: 'Phantom Step · одно применение', en: 'Phantom Step: one use' },
    description: {
      ru: 'Одно применение Phantom Step: 136,1% + 110,5% × 4 + 220,9% = 799% АТК. Бонус +10% состояния Finale, +80% Cicada Shell и дополнительный урон успешного парирования 599,7% хранятся отдельно.',
      en: 'One Phantom Step use: 136.1% + 110.5% × 4 + 220.9% = 799% ATK. Finale state +10%, Cicada Shell +80%, and the 599.7% successful-parry extra damage remain separate.',
    },
    multiplier: 136.1 + 110.5 * 4 + 220.9,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Phantom Step уже открыт сверхспособностью Finale; учитывается ровно одно применение.',
        en: 'Phantom Step has already been unlocked by Finale; exactly one use is counted.',
      },
      {
        ru: 'Успешное парирование не предполагается и не добавляет отдельные 599,7% АТК.',
        en: 'A successful parry is not assumed and does not add the separate 599.7% ATK hit.',
      },
    ],
    sourcePublisher: 'Icy Veins / Prydwen Institute',
    sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/daffodill-profile-skills',
    sourceUpdatedAt: '2026-07-28',
    verifiedAt: '2026-08-06',
  },
];
