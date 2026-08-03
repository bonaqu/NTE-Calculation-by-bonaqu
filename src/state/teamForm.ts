import type { DamageInput } from '../../packages/calculation-core/src';

export type AttackBreakdown = Pick<DamageInput, 'baseAtk' | 'arcAtk' | 'flatAtk' | 'atkPercent' | 'teamAtkPercent'>;
export type DamageBonusBreakdown = Pick<DamageInput, 'damageBonus' | 'teamDamageBonus'>;

const finite = (value: number, fallback = 0): number => Number.isFinite(value) ? value : fallback;

export function effectiveAtk(input: AttackBreakdown): number {
  return Math.max(
    0,
    (finite(input.baseAtk) + finite(input.arcAtk))
      * (1 + (finite(input.atkPercent) + finite(input.teamAtkPercent)) / 100)
      + finite(input.flatAtk),
  );
}

export function combinedDamageBonus(input: DamageBonusBreakdown): number {
  return finite(input.damageBonus) + finite(input.teamDamageBonus);
}

/**
 * Quick entry is explicit: the displayed effective ATK becomes the entire ATK
 * input and the detailed components are reset to zero. This keeps the result
 * deterministic and avoids silently reverse-engineering an arbitrary split.
 */
export function withEffectiveAtk<T extends AttackBreakdown>(input: T, value: number): T {
  return {
    ...input,
    baseAtk: Math.max(0, finite(value)),
    arcAtk: 0,
    flatAtk: 0,
    atkPercent: 0,
    teamAtkPercent: 0,
  };
}

/** Merge personal and team damage bonuses into one explicit quick-entry value. */
export function withCombinedDamageBonus<T extends DamageBonusBreakdown>(input: T, value: number): T {
  return {
    ...input,
    damageBonus: finite(value),
    teamDamageBonus: 0,
  };
}
