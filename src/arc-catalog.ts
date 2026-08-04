import { arcDirectory, type ArcDirectoryEntry } from './arc-directory';

export type ArcCatalogEntry = Omit<ArcDirectoryEntry, 'sourceId'> & { sourceId: string };

const russianEffectCorrections: Partial<Record<string, string>> = {
  'Clear Skies': 'Повышает урон Анимы от навыка перенаправления и сверхспособности на 20/23.8/27.5/31.2/35%.',
  'Reality Refuge': 'Повышает урон Анимы на 15/17.5/20/22.5/25% и урон привязки на 10/11.2/12.5/13.8/15%. После сверхспособности второй бонус на 6 секунд удваивается.',
  'The Wrong Gate': 'Повышает ATK на 16/20/24/28/32%. Когда носитель лечит, на 20 секунд повышает его урон Анимы на 30/37.5/45/52.5/60% и урон союзников на 15/18.75/22.5/26.25/30%.',
  'Time Bandit': 'После навыка перенаправления повышает интенсивность сломления на 90/108/126/144/162 на 10 секунд. Также открывает Отмычку, который способен открывать ближайшие запираемые объекты.',
};

export const arcCatalog: ArcCatalogEntry[] = arcDirectory.map((arc): ArcCatalogEntry => {
  const correctedRussianEffect = russianEffectCorrections[arc.name];
  return {
    ...arc,
    effect: correctedRussianEffect ? { ...arc.effect, ru: correctedRussianEffect } : arc.effect,
    sourceId: arc.name === 'The Wrong Gate' ? 'gamewith-wrong-gate' : arc.sourceId,
  };
});

export const arcCatalogSourceIds = ['prydwen-arcs', 'gamewith-wrong-gate'] as const;
