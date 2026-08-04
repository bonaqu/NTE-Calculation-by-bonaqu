import type { AwakeningNode } from './awakening-data';

const verifiedAt = '2026-08-04';
const database = (id: number) => `https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-${id}/`;

const node = (
  characterName: 'Haniel' | 'Sakiri',
  level: AwakeningNode['level'],
  russianTitle: string,
  englishTitle: string,
  russianDescription: string,
  englishDescription: string,
  esperId: number,
  calculationStatus: AwakeningNode['calculationStatus'] = 'informational',
): AwakeningNode => ({
  characterName,
  level,
  title: { ru: russianTitle, en: englishTitle },
  description: { ru: russianDescription, en: englishDescription },
  evidence: 'current-russian-reference',
  sourcePublisher: 'NTE Neverness to Everness Database',
  sourceUrl: database(esperId),
  sourceUpdatedAt: '2026-05-26',
  verifiedAt,
  calculationStatus,
});

export const supportAwakeningNodes: readonly AwakeningNode[] = [
  node('Haniel', 1, 'Я тут новенькая! Встречайте отличницу по обмену!', 'New here! Genesse transfer student reporting in!', 'Максимум «Сюжетной брони» и предел отскоков «Паранормальной пушки» повышаются до 6.', "Raises Plot Armor's stack cap and Paranormal Cannon's ricochet limit to 6.", 1020),
  node('Haniel', 2, 'Всё, как в аниме! Задняя парта у окошка!', 'Legendary! The back-row window seat!', 'Длительность действия Фили увеличивается на 4 секунды.', "Increases Hootie's duration by 4 seconds.", 1020),
  node('Haniel', 3, 'Общий сбор! Герой созвал союзников!', 'Assembled! The hero team is formed!', 'В состоянии «Паранормального аса» шанс критического удара Ханиэль увеличивается на 20%.', "Increases Haniel's CRIT Rate by 20% while Paranormal Ace is active.", 1020),
  node('Haniel', 4, 'Морской бриз! Пляжный эпизод!', 'Seaside! Beach episode!', 'Если Ханиэль активирует «Ансамбль» в состоянии «Паранормального аса», дополнительный урон её следующей атаки увеличивается на 100%.', "If Haniel triggers Ensemble during Paranormal Ace, her next attack's additional damage increases by 100%.", 1020),
  node('Haniel', 5, 'Катастрофа! Доверие рушится!', 'Crisis! Shattering trust!', 'В состоянии «Паранормального аса» наносимый Ханиэль урон психики увеличивается на 30%.', "Increases Haniel's Psyche damage by 30% during Paranormal Ace.", 1020),
  node('Haniel', 6, 'Финал! Во имя рассвета!', 'Finale! For the coming dawn!', 'Перезарядка Фили уменьшается на 4 секунды.', "Reduces Hootie's cooldown by 4 seconds.", 1020),

  node('Sakiri', 1, 'Рассеянная дымка', 'Diffusive Haze', 'Эффект неподвижности от «Праздника обжорства» продлевается до 6 секунд.', 'Extends the immovable effect from Feast of Gluttony to 6 seconds.', 1003),
  node('Sakiri', 2, 'Ловкое разделение', 'Dextrous Separation', '«Праздник обжорства» наносит дополнительный урон целям в воздухе в зависимости от их массы, максимум 600% Атаки.', 'Feast of Gluttony deals mass-scaled bonus damage to airborne enemies, capped at 600% ATK.', 1003),
  node('Sakiri', 3, 'Клеевой захват', 'Adhesive Grip', 'За каждого побеждённого командой врага урон «Поглощения целиком» и «Праздника обжорства» повышается на 6% на 15 секунд, максимум на 60%.', 'Each enemy defeated by the team raises Devour Whole and Feast of Gluttony damage by 6% for 15 seconds, up to 60%.', 1003),
  node('Sakiri', 4, 'Жажда уверенности', 'Wishful Reliance', 'После «Праздника обжорства» Атака команды, кроме Сакири, повышается на 30% базовой Атаки Сакири на 20 секунд.', "After Feast of Gluttony, team ATK excluding Sakiri increases by 30% of Sakiri's Base ATK for 20 seconds.", 1003, 'applied'),
  node('Sakiri', 5, 'Перегрузка чувств', 'Sensory Collapse', 'Когда «Поглощение целиком» подбрасывает цель, энергия «Праздника обжорства» полностью восстанавливается, а его перезарядка сбрасывается.', "When Devour Whole makes a target airborne, Feast of Gluttony's energy is fully restored and its cooldown resets.", 1003),
  node('Sakiri', 6, 'Обжорное распутство', 'Gluttonous Dissolution', 'В режиме поедания Кирумару может одновременно пожирать и переваривать до трёх врагов с отдельным временем переваривания.', 'Kiroumaru can devour and digest up to three enemies simultaneously with independent digestion timers.', 1003),
];

export const supportAwakeningNodesByCharacter = new Map<string, readonly AwakeningNode[]>(
  ['Haniel', 'Sakiri'].map((characterName) => [
    characterName,
    supportAwakeningNodes.filter((entry) => entry.characterName === characterName),
  ]),
);
