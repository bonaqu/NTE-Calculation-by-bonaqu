import { arcDirectory, type ArcDirectoryEntry } from './arc-directory';
import { normalizeRussianGameText } from './russian-game-text';

export type ArcCatalogEntry = Omit<ArcDirectoryEntry, 'sourceId'> & { sourceId: string };

const russianEffectCorrections: Partial<Record<string, string>> = {
  'Clear Skies': 'Повышает урон Анимы от навыка перенаправления и сверхспособности на 20/23.8/27.5/31.2/35%.',
  'Dangerous Game': 'При снижении шкалы разрушения повышает эффективность разрушения на 60/66/72/78/84 на 10 секунд. Перезарядка 20 секунд.',
  'Reality Refuge': 'Повышает урон Анимы на 15/17.5/20/22.5/25% и урон привязки на 10/11.2/12.5/13.8/15%. После сверхспособности второй бонус на 6 секунд удваивается.',
  'Shiny Days': 'Повышает эффективность разрушения на 48/57/66/75/84 и урон по сломленным целям на 10/12/14/16/18%.',
  'The Great Thief': 'Если в команде есть минимум 3 персонажа одного типа эспера, повышает эффективность разрушения всех персонажей этого типа на 70/84/98/112/126. Эффект не складывается.',
  'The Last Rose': 'Повышает АТК на 14/17.5/21/24.5/28%. Периодический урон даёт до 10 уровней «Шипа хаоса», каждый повышает критический урон; навык перенаправления сразу даёт все 10 уровней. Урон по сломленному врагу один раз за каждое разрушение продлевает его сломленное состояние на 3 секунды.',
  'The Wrong Gate': 'Повышает АТК на 16/20/24/28/32%. Когда носитель лечит, на 20 секунд повышает его урон Анимы на 30/37.5/45/52.5/60% и урон союзников на 15/18.75/22.5/26.25/30%.',
  'Time Bandit': 'После навыка перенаправления повышает эффективность разрушения на 90/108/126/144/162 на 10 секунд. Также открывает Отмычку, который способен открывать ближайшие запираемые объекты.',
  'Youthful Fantasy': 'Повышает эффективность разрушения на 60/67/74/81/88. Два применения навыка поддержки снимают цепи «Чёрного тома»; книга на 20 секунд отмечает врагов, повышает урон Хаоса по ним и наносит дополнительный урон разрушения.',
};

export const arcCatalog: ArcCatalogEntry[] = arcDirectory.map((arc): ArcCatalogEntry => {
  const correctedRussianEffect = russianEffectCorrections[arc.name] ?? arc.effect.ru;
  return {
    ...arc,
    effect: { ...arc.effect, ru: normalizeRussianGameText(correctedRussianEffect) },
    sourceId: arc.name === 'The Wrong Gate' ? 'gamewith-wrong-gate' : arc.sourceId,
  };
});

export const arcCatalogSourceIds = ['prydwen-arcs', 'gamewith-wrong-gate'] as const;
