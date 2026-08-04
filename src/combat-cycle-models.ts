import type { CharacterAttribute, EsperCycleId } from './types';

export interface VerifiedCombatCycleModel {
  id: EsperCycleId;
  durationSeconds: number;
  affectedAttributes: readonly CharacterAttribute[];
  damageBonus: number;
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

/**
 * Only cycles with a deterministic modifier that can be applied to one action
 * without inventing tick counts, stored damage, energy-to-damage conversion or
 * Break-gauge math belong in this registry.
 */
export const verifiedCombatCycleModels: readonly VerifiedCombatCycleModel[] = [
  {
    id: 'stain',
    durationSeconds: 12,
    affectedAttributes: ['Lakshana', 'Psyche'],
    damageBonus: 20,
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: 'https://www.prydwen.gg/neverness-to-everness/guides/esper-cycles',
    sourceUpdatedAt: '2026-04-23',
    verifiedAt: '2026-08-04',
  },
];

export const verifiedCombatCycleModelById = new Map<EsperCycleId, VerifiedCombatCycleModel>(
  verifiedCombatCycleModels.map((model) => [model.id, model]),
);
