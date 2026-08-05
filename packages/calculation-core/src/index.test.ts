import { describe, expect, it } from 'vitest';
import { calculateDamage, calculateTeam, compareArcTeams, defenceMultiplier, resistanceMultiplier } from './index';

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

const emptyModifiers = {
  atkPercent: 0,
  critRate: 0,
  critDamage: 0,
  damageBonus: 0,
  allyDamageBonus: 0,
};

describe('calculation core', () => {
  it('calculates deterministic expected damage with legacy ATK behavior', () => {
    const result = calculateDamage(baseInput);
    expect(result.totalAtk).toBe(2250);
    expect(result.scalingValue).toBe(result.totalAtk);
    expect(result.expected).toBeCloseTo(1350, 6);
  });

  it('uses an explicit final scaling value without relabeling or mutating total ATK', () => {
    const result = calculateDamage({ ...baseInput, scalingValue: 3000 });
    expect(result.totalAtk).toBe(2250);
    expect(result.scalingValue).toBe(3000);
    expect(result.expected).toBeCloseTo(1800, 6);
  });

  it('does not apply ATK-only modifiers to an explicit DEF or Max-HP scaling value', () => {
    const baseline = calculateDamage({
      ...baseInput,
      baseAtk: 100,
      arcAtk: 0,
      flatAtk: 0,
      atkPercent: 0,
      teamAtkPercent: 0,
      scalingValue: 4000,
    });
    const withAtkModifiers = calculateDamage({
      ...baseInput,
      baseAtk: 100,
      arcAtk: 900,
      flatAtk: 700,
      atkPercent: 200,
      teamAtkPercent: 100,
      scalingValue: 4000,
    });
    expect(withAtkModifiers.totalAtk).not.toBe(baseline.totalAtk);
    expect(withAtkModifiers.scalingValue).toBe(4000);
    expect(withAtkModifiers.expected).toBeCloseTo(baseline.expected, 8);
  });

  it('sanitizes invalid explicit scaling values without falling back to ATK', () => {
    const result = calculateDamage({ ...baseInput, scalingValue: Number.NaN });
    expect(result.totalAtk).toBe(2250);
    expect(result.scalingValue).toBe(0);
    expect(result.expected).toBe(0);
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

  it('keeps static Arc stats independent from conditional uptime', () => {
    const base = { ...baseInput, teamDamageBonus: 0 };
    const rows = compareArcTeams(base, [
      {
        id: 'zero-uptime', name: 'Zero', arcAtk: 500,
        static: { ...emptyModifiers, atkPercent: 30 },
        conditional: emptyModifiers,
        conditionalUptime: 0,
      },
      {
        id: 'full-uptime', name: 'Full', arcAtk: 500,
        static: { ...emptyModifiers, atkPercent: 30 },
        conditional: emptyModifiers,
        conditionalUptime: 100,
      },
    ], 1000);
    expect(rows[0]!.wearerDamage).toBeCloseTo(rows[1]!.wearerDamage, 8);
    expect(rows[0]!.teamDamage).toBeCloseTo(rows[1]!.teamDamage, 8);
  });

  it('applies ally-only bonuses to fixed ally damage instead of wearer damage', () => {
    const base = { ...baseInput, teamDamageBonus: 0 };
    const [baseline, buffed] = [
      compareArcTeams(base, [{ id: 'base', name: 'Base', arcAtk: 500, static: emptyModifiers, conditional: emptyModifiers, conditionalUptime: 100 }], 1000)[0]!,
      compareArcTeams(base, [{ id: 'buff', name: 'Buff', arcAtk: 500, static: emptyModifiers, conditional: { ...emptyModifiers, allyDamageBonus: 15 }, conditionalUptime: 100 }], 1000)[0]!,
    ];
    expect(buffed.wearerDamage).toBeCloseTo(baseline.wearerDamage, 8);
    expect(buffed.allyDamage).toBe(1150);
    expect(buffed.teamDamage - baseline.teamDamage).toBeCloseTo(150, 8);
  });

  it('ranks Arc comparisons by total team damage', () => {
    const rows = compareArcTeams({ ...baseInput, teamDamageBonus: 0 }, [
      {
        id: 'wearer', name: 'Wearer Arc', arcAtk: 600,
        static: { ...emptyModifiers, damageBonus: 20 }, conditional: emptyModifiers, conditionalUptime: 100,
      },
      {
        id: 'team', name: 'Team Arc', arcAtk: 500,
        static: emptyModifiers, conditional: { ...emptyModifiers, allyDamageBonus: 50 }, conditionalUptime: 100,
      },
    ], 10000);
    expect(rows[0]!.id).toBe('team');
    expect(rows[0]!.relative).toBe(1);
  });
});
