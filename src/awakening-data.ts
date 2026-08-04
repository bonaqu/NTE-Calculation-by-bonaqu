import type { LocalizedText } from './types';

export type AwakeningEvidence = 'current-russian-reference' | 'current-english-reference';

export interface AwakeningNode {
  characterName: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: LocalizedText;
  description: LocalizedText;
  evidence: AwakeningEvidence;
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
  calculationStatus: 'applied' | 'informational';
  relatedActionIds?: readonly string[];
}

const verifiedAt = '2026-08-04';
const prydwen = (character: string) => `https://www.prydwen.gg/neverness-to-everness/characters/${character}`;
const database = (id: number) => `https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-${id}/`;

const enNode = (
  characterName: string,
  level: AwakeningNode['level'],
  englishTitle: string,
  russianExplanation: string,
  englishExplanation: string,
  sourceUpdatedAt: string,
  relatedActionIds?: readonly string[],
): AwakeningNode => ({
  characterName,
  level,
  title: { ru: englishTitle, en: englishTitle },
  description: { ru: russianExplanation, en: englishExplanation },
  evidence: 'current-english-reference',
  sourcePublisher: 'Prydwen Institute',
  sourceUrl: prydwen(characterName.toLowerCase()),
  sourceUpdatedAt,
  verifiedAt,
  calculationStatus: relatedActionIds?.length ? 'applied' : 'informational',
  ...(relatedActionIds?.length ? { relatedActionIds } : {}),
});

const ruNode = (
  characterName: string,
  level: AwakeningNode['level'],
  russianTitle: string,
  englishTitle: string,
  russianExplanation: string,
  englishExplanation: string,
  esperId: number,
  sourceUpdatedAt: string,
  relatedActionIds?: readonly string[],
): AwakeningNode => ({
  characterName,
  level,
  title: { ru: russianTitle, en: englishTitle },
  description: { ru: russianExplanation, en: englishExplanation },
  evidence: 'current-russian-reference',
  sourcePublisher: 'NTE Neverness to Everness Database',
  sourceUrl: database(esperId),
  sourceUpdatedAt,
  verifiedAt,
  calculationStatus: relatedActionIds?.length ? 'applied' : 'informational',
  ...(relatedActionIds?.length ? { relatedActionIds } : {}),
});

export const awakeningNodes: readonly AwakeningNode[] = [
  enNode('Shinku', 1, 'Rain-Lashed Alley', 'Урон Шинку игнорирует 12% защиты цели.', "Shinku's damage ignores 12% of the target's DEF.", '2026-07-13'),
  enNode('Shinku', 2, 'Pre-Dawn Training Grounds', 'После попадания сверхспособности сопротивление цели космосу снижается на 10% на 20 секунд.', "Reduces the target's Cosmos Resistance by 10% for 20s after the Ultimate hits.", '2026-07-13'),
  enNode('Shinku', 3, 'Sunset Beach', 'Состояние Menacing Gaze сохраняется после переключения, а уровни состояния могут накапливаться вне поля.', 'Keeps Menacing Gaze active after switching and allows stacks to build while off-field.', '2026-07-13'),
  enNode('Shinku', 4, 'Snowfall Slope', 'Максимум Menacing Gaze повышается до 16; усиленный Instant Strike получает дополнительный удар в размере 20% его урона и эффекты контроля.', 'Raises the Menacing Gaze cap to 16 and adds control plus a 20% additional Instant Strike hit.', '2026-07-13'),
  enNode('Shinku', 5, 'Room of Laughter', 'Во время Surging Crimson защита и сопротивление прерыванию повышаются на 50%; после Scarlet Descent восстанавливаются ОЗ в размере 300% базовой Атаки.', 'Grants 50% DEF and interruption resistance during Surging Crimson and heals for 300% Base ATK after Scarlet Descent.', '2026-07-13'),
  enNode('Shinku', 6, "Dragon's Treasure", 'Коэффициенты Scarlet Descent, Crimson Judgment и Dragonflame Verdict повышаются на 30%; первые два действия также стягивают цели.', 'Raises the listed action ratios by 30% and adds pulling to Scarlet Descent and Crimson Judgment.', '2026-07-13'),

  ruNode('Nanally', 1, 'Сбор банды', 'Gang Formation', 'Даёт Наналли 2,5 ед. энергии сверхспособности за каждую последующую атаку, не чаще одного раза в секунду.', 'Grants 2.5 Ultimate Energy for each follow-up attack, at most once per second.', 1010, '2026-06-23'),
  ruNode('Nanally', 2, 'Второй член', 'Second Member', 'Младший босс остаётся на 3 секунды дольше.', 'Underboss lasts 3 seconds longer.', 1010, '2026-06-23'),
  ruNode('Nanally', 3, 'Называйте меня боссом', 'Call Me the Boss', 'В состоянии «Авторитет Ити-дайме» урон Наналли запускает дополнительную атаку; на 11-м уровне базовой атаки коэффициент равен 107,9% АТК.', "Nanally's damage during Ichi-daime's Authority triggers a follow-up, reaching 107.9% ATK at Basic Attack Lv.11.", 1010, '2026-06-23', ['nanally.awakening-three-follow-up.level-11']),
  ruNode('Nanally', 4, 'Не смутьян', 'Not a Troublemaker', 'Урон младшего босса увеличивается на 100%.', "Underboss's damage increases by 100%.", 1010, '2026-06-23'),
  ruNode('Nanally', 5, 'Последователи повсюду', 'Followers Everywhere', 'Каждая последующая атака повышает Атаку Наналли на 2%, максимум на 20%; эффект снимается при уходе с поля или выходе из боя.', "Each follow-up raises Nanally's ATK by 2%, up to 20%, until she leaves the field or combat.", 1010, '2026-06-23'),
  ruNode('Nanally', 6, 'Потому что мы семья', "Because We're Family", 'Длительность «Авторитета Ити-дайме» повышается до 15 секунд, а вне боя — до 20 секунд.', "Extends Ichi-daime's Authority to 15 seconds and to 20 seconds out of combat.", 1010, '2026-06-23'),

  enNode('Chaos', 1, 'Piercing Insight', 'Атаки по врагам с Warrant дополнительно дают 30% Crime.', 'Attacking enemies with Warrant grants an additional 30% Crime.', '2026-07-08'),
  enNode('Chaos', 2, 'Charge / Sin', 'Атаки по врагам с Warrant игнорируют 20% защиты цели.', "Attacks against enemies with Warrant ignore 20% of the target's DEF.", '2026-07-08'),
  enNode('Chaos', 3, 'Emberflare', 'После Retribution критический урон повышается на 30% на 20 секунд; повторное срабатывание обновляет длительность.', 'Casting Retribution increases CRIT DMG by 30% for 20 seconds and refreshes on retrigger.', '2026-07-08'),
  enNode('Chaos', 4, 'Drowning Tide', 'После победы над целью с Warrant метка переносится на ближайшего врага без метки, а её длительность пересчитывается.', 'Defeating a Warrant target transfers the mark to a nearby unmarked target and recalculates duration.', '2026-07-08'),
  enNode('Chaos', 5, 'Voidgaze', 'Когда на поле остаётся только одна цель с Warrant, наносимый ей урон повышается на 20%.', 'When only one Warrant target remains, damage dealt to it increases by 20%.', '2026-07-08'),
  enNode('Chaos', 6, 'False Origin', 'После Retribution запас Crime сразу восстанавливается до максимума.', 'Casting Retribution immediately restores Crime to its cap.', '2026-07-08'),

  ruNode('Lacrimosa', 1, 'Отсроченное милосердие', 'Clock Out Clemency', 'Коэффициент урона «Кошмара» повышается до 50% на текущем уровне навыка.', 'Increases the Nightmare damage ratio to 50% at the current skill level.', 1004, '2026-06-23'),
  ruNode('Lacrimosa', 2, 'Проснись и пой', 'Rise and Shine', 'После входа через навык поддержки наносимый Лакримозой урон повышается на 15% на 15 секунд.', "Switching in through the Support Skill increases Lacrimosa's damage by 15% for 15 seconds.", 1004, '2026-06-23'),
  ruNode('Lacrimosa', 3, 'Расплавленное мороженое', 'Molten Ice Cream', 'Пятый удар «Томатного металла» или «Томатной перкуссии» одновременно запускает все накопленные эффекты «Кошмара».', 'The fifth Tomato Metal or Tomato Percussion hit triggers all accumulated Nightmare effects at once.', 1004, '2026-06-23'),
  ruNode('Lacrimosa', 4, 'Всемогущий повелитель томатов', 'Almighty Lord of Tomatoes', 'Длительность «Кошмара» повышается до 6 секунд.', 'Extends Nightmare duration to 6 seconds.', 1004, '2026-06-23'),
  ruNode('Lacrimosa', 5, 'Приговор закалённого стекла', 'Tempered Glass Judgement', 'Исцеление цели больше не снимает уровни «Кошмара»; максимальные ОЗ цели снижаются на 200% урона одного экземпляра «Кошмара».', "Healing no longer removes Nightmare stacks and the target's Max HP is reduced by 200% of one Nightmare instance.", 1004, '2026-06-23'),
  ruNode('Lacrimosa', 6, 'Утреннее заклинание', 'Morning Spell', 'В течение 5 секунд после «Дьявольского подарка» переключение на Лакримозу с персонажа, запускающего Нову, Ожог или Диссонанс, автоматически применяет её навык поддержки и соответствующий цикл.', 'Within 5 seconds after Devilish Gift, switching to Lacrimosa from a Nova, Scorch or Discord enabler automatically casts her Support Skill and triggers the cycle.', 1004, '2026-06-23'),

  ruNode('Zero', 1, 'Цветущий взгляд', 'Blooming Gaze', 'При первом попадании по противнику ниже уровнем наносится дополнительный удар на 200% АТК, игнорирующий 75% защиты.', 'The first hit against a lower-level enemy adds a 200% ATK hit that ignores 75% DEF.', 1051, '2026-05-31', ['zero.blooming-gaze.awakening-one']),
  ruNode('Zero', 2, 'В поисках призвания', 'Finding the Calling', 'После успешной «Оценки и гравировки» восстанавливается 8 ед. энергии сверхспособности.', 'Successfully casting Appraise and Engrave grants 8 Ultimate Energy.', 1051, '2026-05-31'),
  ruNode('Zero', 3, 'Записи об аномалиях', 'Anomalies Record', 'Шанс критического удара «Деления на ноль» повышается на 50%.', "Divide by Zero's CRIT Rate increases by 50%.", 1051, '2026-05-31'),
  ruNode('Zero', 4, 'Неопределённые факторы', 'Undecided Factors', 'Каждая единица базовой Атаки Зеро повышает урон «Деления на ноль» на 0,1%, максимум на 25%.', "Each point of Zero's Base ATK raises Divide by Zero damage by 0.1%, up to 25%.", 1051, '2026-05-31'),
  ruNode('Zero', 5, 'Теопнеустос', 'Theopneustos', 'После применения навыка поддержки Атака Зеро повышается на 10% на 20 секунд.', "Using the Support Skill increases Zero's ATK by 10% for 20 seconds.", 1051, '2026-05-31'),
  ruNode('Zero', 6, 'Обманчивое освобождение', 'Deceptive Liberation', 'Дополнительный коэффициент урона «Оценки и гравировки» повышается до 300% АТК.', 'Raises the extra damage ratio of Appraise and Engrave to 300% ATK.', 1051, '2026-05-31', ['zero.appraise-and-engrave-extra.awakening-six']),
];

export const awakeningNodesByCharacter = new Map<string, readonly AwakeningNode[]>(
  [...new Set(awakeningNodes.map((node) => node.characterName))].map((characterName) => [
    characterName,
    awakeningNodes.filter((node) => node.characterName === characterName),
  ]),
);
