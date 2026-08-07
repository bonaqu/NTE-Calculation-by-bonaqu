import type { CharacterAttribute, EsperCycleId, LocalizedText } from './types';

interface VerifiedCombatCycleModelBase {
  id: EsperCycleId;
  kind: 'damage-window' | 'timed-state' | 'resource-trigger' | 'break-trigger';
  summary: LocalizedText;
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export interface VerifiedDamageWindowCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'damage-window';
  durationSeconds: number;
  affectedAttributes: readonly CharacterAttribute[];
  damageBonus: number;
}

export interface VerifiedTimedStateCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'timed-state';
  durationSeconds: number;
  stateEffect: LocalizedText;
}

export interface VerifiedResourceTriggerCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'resource-trigger';
  durationSeconds: null;
  ultimateEnergyPerTrigger: number;
  triggerCondition: LocalizedText;
}

export interface VerifiedBreakTriggerCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'break-trigger';
  durationSeconds: null;
  /** The source confirms a percentage reduction but does not publish its value. */
  breakReductionPercent: null;
  triggerCondition: LocalizedText;
}

export type VerifiedCombatCycleModel =
  | VerifiedDamageWindowCycleModel
  | VerifiedTimedStateCycleModel
  | VerifiedResourceTriggerCycleModel
  | VerifiedBreakTriggerCycleModel;

const sourcePublisher = 'Prydwen Institute';
const sourceUrl = 'https://www.prydwen.gg/neverness-to-everness/guides/esper-cycles';
const sourceUpdatedAt = '2026-04-23';

/**
 * Tagged Cycle semantics for Combat Scenario. Only `damage-window` models may
 * modify action damage. Timed states and instantaneous resource/Break triggers
 * remain visible evidence without invented ticks, totals or percentages.
 */
export const verifiedCombatCycleModels: readonly VerifiedCombatCycleModel[] = [
  {
    id: 'stain',
    kind: 'damage-window',
    durationSeconds: 12,
    affectedAttributes: ['Lakshana', 'Psyche'],
    damageBonus: 20,
    summary: {
      ru: 'На 12 секунд увеличивает урон Психики и Лакшаны по общей цели на 20%.',
      en: 'Increases Psyche and Lakshana damage against the shared target by 20% for 12 seconds.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-04',
  },
  {
    id: 'scorch',
    kind: 'timed-state',
    durationSeconds: 15,
    stateEffect: {
      ru: 'Цель находится под Поджогом и получает периодический урон; total damage не вычисляется без tick ratio и числа тиков.',
      en: 'The target is Scorched and takes damage over time; total damage is not calculated without a tick ratio and tick count.',
    },
    summary: {
      ru: 'Подтверждённое 15-секундное состояние DoT без выдуманного total damage.',
      en: 'A verified 15-second DoT state without invented total damage.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  },
  {
    id: 'charge',
    kind: 'resource-trigger',
    durationSeconds: null,
    ultimateEnergyPerTrigger: 10,
    triggerCondition: {
      ru: 'Лепесток Цветения попадает по цели под Реморой.',
      en: 'A Blossom pistil hits a target affected by Remora.',
    },
    summary: {
      ru: '+10 энергии сверхспособности активному персонажу за одно квалифицирующее попадание; total Energy не заявляется.',
      en: '+10 Ultimate Energy to the active character per qualifying hit; total Energy is not claimed.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  },
  {
    id: 'discord',
    kind: 'break-trigger',
    durationSeconds: null,
    breakReductionPercent: null,
    triggerCondition: {
      ru: 'Нова и Поджог одновременно действуют на одной цели.',
      en: 'Nova and Scorch are active on the same target at the same time.',
    },
    summary: {
      ru: 'Мгновенно уменьшает шкалу разрушения цели на процент, числовое значение которого источник не публикует.',
      en: 'Instantly reduces the target Break gauge by a percentage whose numerical value is not published.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  },
];

export const verifiedCombatCycleModelById = new Map<EsperCycleId, VerifiedCombatCycleModel>(
  verifiedCombatCycleModels.map((model) => [model.id, model]),
);
