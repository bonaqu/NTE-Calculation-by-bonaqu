import type { AwakeningNode } from './awakening-data';

const sourceUrl = 'https://www.prydwen.gg/neverness-to-everness/characters/jiuyuan';
const sourceUpdatedAt = '2026-05-26';
const verifiedAt = '2026-08-04';

const node = (
  level: AwakeningNode['level'],
  title: string,
  ru: string,
  en: string,
  relatedActionIds?: readonly string[],
): AwakeningNode => ({
  characterName: 'Jiuyuan',
  level,
  title: { ru: title, en: title },
  description: { ru, en },
  evidence: 'current-english-reference',
  sourcePublisher: 'Prydwen Institute',
  sourceUrl,
  sourceUpdatedAt,
  verifiedAt,
  calculationStatus: relatedActionIds?.length ? 'applied' : 'informational',
  ...(relatedActionIds?.length ? { relatedActionIds } : {}),
});

/**
 * Current English-reference fallback. These titles must not be presented as
 * confirmed Russian-client localization until first-party Russian evidence is
 * available.
 */
export const jiuyuanAwakeningNodes: readonly AwakeningNode[] = [
  node(
    1,
    'To Know, To Balance',
    'Каждая цель, связанная «Смертельным пактом розы», повышает Атаку Цзююань на 5%, максимум на 15%.',
    'Each target bound by Lethal Rose Pact increases Jiuyuan’s ATK by 5%, up to 15%.',
  ),
  node(
    2,
    'Intel Turns Into Blades',
    'Урон при завершении «Смертельного пакта розы» повышается на 100%; после завершения команда восстанавливает ОЗ в размере 5% накопленного пактом урона.',
    'Increases Lethal Rose Pact settlement damage by 100% and heals the team for 5% of the damage accumulated by the pact when it settles.',
  ),
  node(
    3,
    'Advantage Established',
    'Активное завершение «Смертельного пакта розы» дополнительно снижает стойкость цели на 4 ед.',
    'Actively settling Lethal Rose Pact deals 4 additional Break damage.',
  ),
  node(
    4,
    'Strike to Kill',
    'Коэффициент активного завершения «Смертельного пакта розы» повышается на 50%, а урон распространяется на ближайшие цели.',
    'Raises the active Lethal Rose Pact settlement ratio by 50% and extends the damage to nearby targets.',
  ),
  node(
    5,
    'Intel Superiority',
    'Урон Цзююань по целям, связанным «Смертельным пактом розы», повышается на 8%.',
    'Jiuyuan deals 8% more damage to targets bound by Lethal Rose Pact.',
  ),
  node(
    6,
    'Know Every Secret',
    'Когда связанная цель использует навык, Цзююань наносит отдельный урон с коэффициентом 200%. Эффект может сработать не чаще одного раза в 5 секунд.',
    'When a bound target casts a skill, Jiuyuan deals a separate hit with a 200% DMG Ratio. This can trigger once every five seconds.',
    ['jiuyuan.know-every-secret.awakening-six'],
  ),
];
