import type { VerifiedVisibleAction } from './verified-visible-actions';

const hathorSource = 'https://www.icy-veins.com/neverness-to-everness/hathor-profile-skills';
const jiuyuanSource = 'https://www.prydwen.gg/neverness-to-everness/characters/jiuyuan';

/**
 * Batch B contains only standalone values whose hit composition and required
 * level are explicit in current references. It deliberately excludes Hathor's
 * held Aerial Command because the source publishes a per-tick DoT ratio without
 * a deterministic number of ticks for one real cast.
 */
export const verifiedVisibleActionsBatchB: readonly VerifiedVisibleAction[] = [
  {
    id: 'hathor.cyclone-strike-first.level-10',
    characterName: 'Hathor',
    title: { ru: 'Cyclone Strike · 1-е применение', en: 'Cyclone Strike: first use' },
    description: {
      ru: 'Первое применение усиленного перенаправляемого навыка: 85,8% АТК × 7 = 600,6% АТК. Русское клиентское название пока не подтверждено, поэтому сохранено английское Cyclone Strike.',
      en: 'First enhanced Redirect Skill use: 85.8% ATK × 7 = 600.6% ATK.',
    },
    multiplier: 85.8 * 7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Хатор находится в состоянии Emergency Delivery после сверхспособности.',
        en: 'Hathor is in Emergency Delivery after using her Ultimate.',
      },
      {
        ru: 'Это первое применение Cyclone Strike в текущем окне; бонусы пробуждений и Атака за заряды отдельно не добавляются.',
        en: 'This is the first Cyclone Strike in the current window; Awakening modifiers and stack-based ATK are not added automatically.',
      },
    ],
    sourcePublisher: 'Icy Veins',
    sourceUrl: hathorSource,
    sourceUpdatedAt: '2026-06-27',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'hathor.cyclone-strike-second.level-10',
    characterName: 'Hathor',
    title: { ru: 'Cyclone Strike · 2-е применение', en: 'Cyclone Strike: second use' },
    description: {
      ru: 'Второе применение: 286,3% + 227,1% + 286,3% = 799,7% АТК. Английское название оставлено до подтверждения русского клиента.',
      en: 'Second use: 286.3% + 227.1% + 286.3% = 799.7% ATK.',
    },
    multiplier: 286.3 + 227.1 + 286.3,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Хатор находится в состоянии Emergency Delivery.',
        en: 'Hathor is in Emergency Delivery.',
      },
      {
        ru: 'Это второе применение Cyclone Strike; нарастающий шанс критического удара A4 автоматически не применяется.',
        en: 'This is the second Cyclone Strike; the stacking A4 CRIT Rate is not applied automatically.',
      },
    ],
    sourcePublisher: 'Icy Veins',
    sourceUrl: hathorSource,
    sourceUpdatedAt: '2026-06-27',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'hathor.cyclone-strike-third.level-10',
    characterName: 'Hathor',
    title: { ru: 'Cyclone Strike · 3-е применение', en: 'Cyclone Strike: third use' },
    description: {
      ru: 'Третье применение: 393,6% + 705,8% = 1099,4% АТК. Это отдельное действие, а не автоматически собранный взрывной цикл.',
      en: 'Third use: 393.6% + 705.8% = 1099.4% ATK. This is one action, not an automatically assembled burst rotation.',
    },
    multiplier: 393.6 + 705.8,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Хатор находится в состоянии Emergency Delivery.',
        en: 'Hathor is in Emergency Delivery.',
      },
      {
        ru: 'Это третье применение Cyclone Strike; условные A4, A5, A6 и резонанс не подмешиваются без отдельной модели.',
        en: 'This is the third Cyclone Strike; conditional A4, A5, A6 and Resonance modifiers require separate models.',
      },
    ],
    sourcePublisher: 'Icy Veins',
    sourceUrl: hathorSource,
    sourceUpdatedAt: '2026-06-27',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'hathor.rider-express.level-10',
    characterName: 'Hathor',
    title: { ru: 'Rider Express · одно применение', en: 'Rider Express: one cast' },
    description: {
      ru: 'Одно применение сверхспособности: 192,3% АТК × 2 + 1014,7% АТК = 1399,3% АТК. Последующие Cyclone Strike сюда не входят.',
      en: 'One Ultimate cast: 192.3% ATK × 2 + 1014.7% ATK = 1399.3% ATK. Subsequent Cyclone Strikes are excluded.',
    },
    multiplier: 192.3 * 2 + 1014.7,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Учитывается только прямой урон Rider Express; Атака за заряды в состоянии Emergency Delivery не добавляется задним числом к этому действию.',
      en: 'Only Rider Express direct damage is included; stack-based Emergency Delivery ATK is not retroactively added to this action.',
    }],
    sourcePublisher: 'Icy Veins',
    sourceUrl: hathorSource,
    sourceUpdatedAt: '2026-06-27',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'jiuyuan.know-every-secret.awakening-six',
    characterName: 'Jiuyuan',
    title: { ru: 'Пробуждение 6: одно ответное срабатывание', en: 'Awakening 6: one retaliation trigger' },
    description: {
      ru: 'Одно срабатывание на 200% коэффициента урона, когда связанный «Смертельным пактом розы» враг использует навык. Сайт не повторяет его автоматически каждые 5 секунд.',
      en: 'One 200% DMG Ratio trigger when an enemy bound by Lethal Rose Pact casts a skill. The site does not repeat it automatically every five seconds.',
    },
    multiplier: 200,
    requiredSkill: 'basic',
    requiredLevel: '—',
    minimumAwakening: 6,
    assumedConditions: [
      {
        ru: 'Цель связана «Смертельным пактом розы» и использовала навык.',
        en: 'The target is bound by Lethal Rose Pact and cast a skill.',
      },
      {
        ru: 'С момента предыдущего срабатывания прошло не менее 5 секунд.',
        en: 'At least five seconds have passed since the previous trigger.',
      },
    ],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: jiuyuanSource,
    sourceUpdatedAt: '2026-05-26',
    verifiedAt: '2026-08-04',
  },
];
