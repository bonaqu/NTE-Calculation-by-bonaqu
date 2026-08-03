import { describe, expect, it } from 'vitest';
import { calculateDamage, type DamageInput } from '../../packages/calculation-core/src';
import { combinedDamageBonus, effectiveAtk, withCombinedDamageBonus, withEffectiveAtk } from './teamForm';

const input: DamageInput = {
  characterLevel: 80,
  baseAtk: 1450,
  arcAtk: 570,
  flatAtk: 240,
  atkPercent: 65,
  teamAtkPercent: 15,
  skillMultiplier: 420,
  hits: 2,
  damageBonus: 30,
  teamDamageBonus: 15,
  critRate: 60,
  critDamage: 120,
  enemy: { level: 82, resistance: 20, defenceReduction: 10, resistanceReduction: 0 },
};

describe('team quick-entry helpers', () => {
  it('matches the calculation engine effective ATK', () => {
    expect(effectiveAtk(input)).toBeCloseTo(calculateDamage(input).totalAtk, 8);
    expect(combinedDamageBonus(input)).toBe(45);
  });

  it('flattens ATK components without changing calculated damage', () => {
    const flattened = withEffectiveAtk(input, effectiveAtk(input));
    expect(flattened).toMatchObject({
      baseAtk: effectiveAtk(input),
      arcAtk: 0,
      flatAtk: 0,
      atkPercent: 0,
      teamAtkPercent: 0,
    });
    expect(calculateDamage(flattened).expected).toBeCloseTo(calculateDamage(input).expected, 8);
  });

  it('merges damage bonuses without changing calculated damage', () => {
    const merged = withCombinedDamageBonus(input, combinedDamageBonus(input));
    expect(merged.damageBonus).toBe(45);
    expect(merged.teamDamageBonus).toBe(0);
    expect(calculateDamage(merged).expected).toBeCloseTo(calculateDamage(input).expected, 8);
  });

  it('sanitizes non-finite quick input', () => {
    expect(withEffectiveAtk(input, Number.NaN).baseAtk).toBe(0);
    expect(withCombinedDamageBonus(input, Number.POSITIVE_INFINITY).damageBonus).toBe(0);
  });
});
