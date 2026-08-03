import { describe, expect, it } from 'vitest';
import { calculateDamage, calculateTeam, defenceMultiplier, resistanceMultiplier } from './index';

const baseInput = {
  characterLevel: 80,
  baseAtk: 1000,
  arcAtk: 500,
  flatAtk: 0,
  atkPercent: 50,
  teamAtkPercent: 0,
  skillMultiplier: 100,
  hits: 1,
  damageBonus: 0,
  teamDamageBonus: 0,
  critRate: 50,
  critDamage: 100,
  enemy: { level: 80, resistance: 20, defenceReduction: 0, resistanceReduction: 0 },
};

describe('calculation core', () => {
  it('calculates deterministic expected damage', () => {
    const result = calculateDamage(baseInput);
    expect(result.totalAtk).toBe(2250);
    expect(result.expected).toBeCloseTo(1350, 6);
  });

  it('matches the documented equal-level DEF multiplier', () => {
    expect(defenceMultiplier(80, 80, 0)).toBeCloseTo(0.5, 10);
  });

  it('turns negative effective resistance into a damage bonus', () => {
    expect(resistanceMultiplier(20, 0)).toBe(0.8);
    expect(resistanceMultiplier(20, 30)).toBe(1.1);
    expect(resistanceMultiplier(0, 150)).toBe(2.5);
  });

  it('returns team shares that sum to one', () => {
    const team = calculateTeam([
      { ...baseInput, id: 'a', name: 'A', actionsPerRotation: 2 },
      { ...baseInput, id: 'b', name: 'B', actionsPerRotation: 1 },
    ], 30);
    expect(team.members.reduce((sum, row) => sum + row.share, 0)).toBeCloseTo(1, 8);
    expect(team.dps).toBeGreaterThan(0);
  });

  it('sanitizes non-finite numeric values instead of propagating NaN', () => {
    const result = calculateDamage({ ...baseInput, baseAtk: Number.NaN });
    expect(Number.isFinite(result.expected)).toBe(true);
  });
});
