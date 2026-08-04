import type { LocalizedText } from './types';

export type ArcRecommendationCategory = 'standard' | 'specialist';

export interface CharacterArcRecommendation {
  arcName: string;
  mixing: 1 | 2 | 3 | 4 | 5;
  relativePercent?: number;
  category?: ArcRecommendationCategory;
  note: LocalizedText;
}

export interface CharacterArcGuide {
  characterName: string;
  sourcePublisher: 'Prydwen Institute';
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
  recommendations: readonly CharacterArcRecommendation[];
}

const verifiedAt = '2026-08-04';
const source = (slug: string) => `https://www.prydwen.gg/neverness-to-everness/characters/${slug}`;
const guide = (
  characterName: string,
  slug: string,
  sourceUpdatedAt: string,
  recommendations: readonly CharacterArcRecommendation[],
): CharacterArcGuide => ({
  characterName,
  sourcePublisher: 'Prydwen Institute',
  sourceUrl: source(slug),
  sourceUpdatedAt,
  verifiedAt,
  recommendations,
});

const measured = (
  arcName: string,
  mixing: CharacterArcRecommendation['mixing'],
  relativePercent: number,
  ru: string,
  en: string,
): CharacterArcRecommendation => ({ arcName, mixing, relativePercent, note: { ru, en } });

const ordered = (
  arcName: string,
  mixing: CharacterArcRecommendation['mixing'],
  ru: string,
  en: string,
  category: ArcRecommendationCategory = 'standard',
): CharacterArcRecommendation => ({ arcName, mixing, category, note: { ru, en } });

export const characterArcGuides: readonly CharacterArcGuide[] = [
  guide('Adler', 'adler', '2026-05-26', [
    ordered('Umbrella', 5, 'Первый вариант в гайде для защиты и выживаемости; источник не публикует относительный процент.', 'The guide lists it first for defensive utility and sustain; no relative percentage is published.'),
    ordered('The Great Thief', 5, 'Альтернатива с командной пользой для разрушения; источник не публикует относительный процент.', 'An alternative focused on team Break utility; no relative percentage is published.'),
  ]),
  guide('Aurelia', 'aurelia', '2026-06-23', [
    measured('Ready-Ready', 5, 111.39, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Stellar Veil', 5, 103.7, 'Сильный вариант M5, уступающий лидеру в исходном расчёте.', 'A strong M5 option below the leader in the source calculation.'),
    measured('Ready-Ready', 1, 103.66, 'Даже на M1 остаётся выше базового результата источника.', 'Even at M1 it remains above the source baseline.'),
    measured('Stellar Veil', 1, 100, 'Базовый результат, относительно которого показаны остальные значения.', 'The baseline used for the other relative values.'),
    measured('Fluff of Fortitude', 1, 99.14, 'Близкий к базовому результат без повышения M.', 'A near-baseline result without higher Mixing.'),
    measured('Song of the Whale', 1, 97.71, 'Ниже базового варианта в условиях этого расчёта.', 'Below the baseline under this calculation setup.'),
  ]),
  guide('Baicang', 'baicang', '2026-06-23', [
    ordered('Camellia Society', 1, 'Первый вариант в гайде; относительный процент не опубликован.', 'The guide lists it first; no relative percentage is published.'),
    ordered('A Time Will Come', 5, 'Доступная альтернатива при выполнении условия состава команды.', 'An accessible alternative when its team-composition condition is met.'),
  ]),
  guide('Chaos', 'chaos', '2026-07-08', [
    measured("What's Desired", 1, 100, 'Лучший и базовый результат опубликованного сравнения.', 'The best and baseline result in the published comparison.'),
    measured('Fluff of Ferocity', 1, 86.28, 'Второй результат источника на M1.', 'The source calculation’s second result at M1.'),
    measured('Camellia Society', 1, 82.97, 'Уступает двум верхним вариантам в этом сценарии.', 'Below the two leading options in this scenario.'),
    measured('A Time Will Come', 5, 80.32, 'Бюджетная альтернатива, показанная источником на M5.', 'A budget alternative shown by the source at M5.'),
  ]),
  guide('Chiz', 'chiz', '2026-06-23', [
    ordered('Contemplative Cat', 1, 'Основная рекомендация гайда; относительный процент не опубликован.', 'The guide’s primary recommendation; no relative percentage is published.'),
  ]),
  guide('Daffodill', 'daffodil', '2026-05-26', [
    measured('Youthful Fantasy', 5, 102.32, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Youthful Fantasy', 3, 101.16, 'Промежуточный M‑уровень остаётся выше базовой точки.', 'The intermediate Mixing level remains above the baseline.'),
    measured('Fluff of Fleetness', 5, 100.99, 'M5 немного превосходит базовую точку источника.', 'M5 slightly exceeds the source baseline.'),
    measured('Youthful Fantasy', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured('Fluff of Fleetness', 1, 98.57, 'M1 немного уступает базовой точке.', 'M1 sits slightly below the baseline.'),
    measured('Shiny Days', 5, 95.41, 'Более низкий результат в опубликованных условиях.', 'A lower result under the published conditions.'),
  ]),
  guide('Edgar', 'edgar', '2026-06-23', [
    ordered('Call of the Twisted City', 5, 'Первый вариант гайда для лечения; относительный процент не опубликован.', 'The guide lists it first for healing; no relative percentage is published.'),
    ordered('Mind Royale', 5, 'Вторая рекомендация источника без опубликованного относительного процента.', 'The source’s second recommendation without a published relative percentage.'),
  ]),
  guide('Fadia', 'fadia', '2026-05-26', [
    ordered('Eternal Waltz', 1, 'Первая рекомендация гайда; относительный процент не опубликован.', 'The guide’s first recommendation; no relative percentage is published.'),
    ordered('The Great Thief', 5, 'Альтернатива с командной пользой для разрушения.', 'An alternative focused on team Break utility.'),
  ]),
  guide('Haniel', 'haniel', '2026-05-26', [
    measured('Blow up the Crowd', 5, 101.11, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Blow up the Crowd', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured("Hethereau's Keeper", 5, 98.88, 'Близкий к базовому результат на M5.', 'A near-baseline result at M5.'),
    measured('Day Off', 5, 98.81, 'Почти равен предыдущему варианту в условиях источника.', 'Nearly tied with the previous option under the source conditions.'),
    measured("Hethereau's Keeper", 1, 98.6, 'M1 немного уступает версии M5.', 'M1 is slightly below the M5 version.'),
  ]),
  guide('Hathor', 'hathor', '2026-06-23', [
    measured('Raging Flames', 5, 103.88, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Raging Flames', 3, 101.94, 'Промежуточный M‑уровень выше базовой точки.', 'The intermediate Mixing level is above the baseline.'),
    measured('Raging Flames', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured('Fluff of Fortitude', 1, 96.18, 'Альтернатива M1 ниже базового результата.', 'An M1 alternative below the baseline.'),
    measured('Song of the Whale', 5, 93.38, 'M5 остаётся ниже верхних вариантов в этом сценарии.', 'M5 remains below the leading options in this scenario.'),
    measured('Song of the Whale', 1, 92.55, 'Самый низкий из перенесённых результатов источника.', 'The lowest of the source results included here.'),
  ]),
  guide('Hotori', 'hotori', '2026-07-02', [
    measured('Marching Beyond Time', 5, 108.91, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Marching Beyond Time', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured('Fluff of Fearlessness', 5, 97.27, 'Альтернатива M5 ниже сигнатурной базовой точки.', 'An M5 alternative below the signature baseline.'),
    measured('Fluff of Fearlessness', 1, 94.59, 'M1 уступает версии M5 в условиях источника.', 'M1 is below its M5 version under the source conditions.'),
  ]),
  guide('Iroi', 'iroi', '2026-07-29', [
    measured('The Wrong Gate', 1, 100, 'Лучший и базовый результат опубликованного сравнения поддержки.', 'The best and baseline result in the published support comparison.'),
    measured('The Last Rose', 1, 92.97, 'Второй результат источника, но часть эффекта зависит от периодического урона.', 'The source’s second result, with part of the effect depending on damage over time.'),
    measured('Youthful Fantasy', 1, 92.55, 'Основная ценность в этом сравнении приходит от постоянных характеристик.', 'Most of its value in this comparison comes from permanent stats.'),
    measured('Fluff of Fleetness', 1, 92, 'Короткое время на поле ограничивает накопление эффекта.', 'Short field time limits effect buildup.'),
    measured('Shiny Days', 5, 91.88, 'Зависит от возможности реализовать урон по сломленной цели.', 'Depends on realizing damage against a broken target.'),
    measured('Clear Skies', 5, 91.63, 'Усиляет только часть профиля урона Ирой.', 'It buffs only part of Iroi’s damage profile.'),
  ]),
  guide('Jiuyuan', 'jiuyuan', '2026-05-26', [
    measured('Reality Refuge', 5, 103.12, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Reality Refuge', 3, 101.56, 'Промежуточный M‑уровень выше базовой точки.', 'The intermediate Mixing level is above the baseline.'),
    measured('Reality Refuge', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured('Fluff of Fearlessness', 1, 96.3, 'Альтернатива M1 ниже базовой точки.', 'An M1 alternative below the baseline.'),
    measured("Hethereau's Keeper", 5, 96.26, 'Почти совпадает с предыдущим вариантом в условиях источника.', 'Nearly tied with the previous option under the source conditions.'),
    measured("Hethereau's Keeper", 1, 95.22, 'M1 немного уступает версии M5.', 'M1 is slightly below the M5 version.'),
  ]),
  guide('Lacrimosa', 'lacrimosa', '2026-06-23', [
    measured('The Last Rose', 1, 100, 'Лучший и базовый результат опубликованного сравнения.', 'The best and baseline result in the published comparison.'),
    measured('Youthful Fantasy', 1, 87.89, 'Второй результат источника на M1.', 'The source calculation’s second result at M1.'),
    measured('Fluff of Fleetness', 1, 87.64, 'Почти совпадает с предыдущим вариантом.', 'Nearly tied with the previous option.'),
    measured('Shiny Days', 5, 79.69, 'Заметно ниже лидера в опубликованном сценарии.', 'Well below the leader in the published scenario.'),
  ]),
  guide('Mint', 'mint', '2026-06-23', [
    measured('Fluff of Fleetness', 5, 101.91, 'Лучший опубликованный результат; совпадает с условным вариантом Mind Royale.', 'The highest published result, tied with the conditional Mind Royale result.'),
    measured('Mind Royale', 5, 101.91, 'Равный верхний результат требует дополнительного применения сверхспособности.', 'The tied top result requires an additional Ultimate use.'),
    measured('Fluff of Fleetness', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured('Shiny Days', 5, 97.88, 'Ниже базовой точки в условиях источника.', 'Below the baseline under the source conditions.'),
    measured('Clear Skies', 5, 95.87, 'Самый низкий из перенесённых результатов источника.', 'The lowest of the source results included here.'),
  ]),
  guide('Nanally', 'nanally', '2026-06-23', [
    measured('Ready-Ready', 5, 105.91, 'Лучший опубликованный результат этого сравнения.', 'The highest published result in this comparison.'),
    measured('Ready-Ready', 1, 100, 'Базовый результат опубликованного сравнения.', 'The baseline of the published comparison.'),
    measured('Fluff of Fortitude', 1, 95.73, 'Альтернатива M1 ниже базовой точки.', 'An M1 alternative below the baseline.'),
    measured('Raging Flames', 1, 93.13, 'Ниже двух верхних вариантов в этом сценарии.', 'Below the two leading options in this scenario.'),
    measured('Oraora!', 5, 92.84, 'Самый низкий из перенесённых результатов источника.', 'The lowest of the source results included here.'),
  ]),
  guide('Sakiri', 'sakiri', '2026-05-26', [
    ordered("Good Boy's Grand Adventure", 1, 'Основная рекомендация гайда; относительный процент не опубликован.', 'The guide’s primary recommendation; no relative percentage is published.'),
  ]),
  guide('Shinku', 'shinku', '2026-07-13', [
    measured('Blushing Mirage', 1, 100, 'Лучший и базовый результат опубликованного сравнения.', 'The best and baseline result in the published comparison.'),
    measured('Fluff of Ferocity', 1, 83.18, 'Второй результат источника на M1.', 'The source calculation’s second result at M1.'),
    measured('Camellia Society', 1, 80.6, 'Уступает двум верхним вариантам в этом сценарии.', 'Below the two leading options in this scenario.'),
    measured('A Time Will Come', 5, 80.38, 'Бюджетная альтернатива M5, близкая к предыдущему результату.', 'An M5 budget alternative close to the previous result.'),
  ]),
  guide('Skia', 'skia', '2026-06-23', [
    ordered('Watch Your Heads!', 5, 'Основная рекомендация гайда; относительный процент не опубликован.', 'The guide’s primary recommendation; no relative percentage is published.'),
  ]),
  guide('Zero', 'zero', '2026-05-31', [
    measured('Day Off', 5, 100.65, 'Лучший опубликованный стандартный результат.', 'The highest published standard result.'),
    measured('Day Off', 1, 100, 'Базовый результат стандартного сравнения.', 'The baseline of the standard comparison.'),
    measured('Fluff of Fearlessness', 1, 99.06, 'Близкий к базовой точке вариант M1.', 'An M1 option close to the baseline.'),
    measured('The Rain That Shook the World', 5, 98.84, 'Немного ниже предыдущего результата.', 'Slightly below the previous result.'),
    measured("Hethereau's Keeper", 1, 98.68, 'Ниже базовой точки в опубликованном сравнении.', 'Below the baseline in the published comparison.'),
    ordered('Your Happiness is Priceless', 1, 'Специализированный вариант, когда Оценщик используется как псевдолекарь; процент с основной таблицей не опубликован.', 'A specialist option when Zero is used as a pseudo-healer; no percentage comparable with the main table is published.', 'specialist'),
  ]),
];

export const characterArcGuideByName = new Map(characterArcGuides.map((entry) => [entry.characterName, entry]));

export function guideMeasurementKind(guideEntry: CharacterArcGuide): 'quantitative' | 'qualitative' | 'mixed' {
  const measuredCount = guideEntry.recommendations.filter((entry) => entry.relativePercent !== undefined).length;
  if (measuredCount === 0) return 'qualitative';
  if (measuredCount === guideEntry.recommendations.length) return 'quantitative';
  return 'mixed';
}
