import { describe, expect, it } from 'vitest';
import { arcPresets, arcPresetToModel } from './arc-presets';

const preset = (id: string) => {
  const value = arcPresets.find((arc) => arc.id === id);
  if (!value) throw new Error(`Missing Arc preset: ${id}`);
  return value;
};

describe('Arc preset model conversion', () => {
  it('combines Wrong Gate M1 static substat and always-on ATK', () => {
    const model = arcPresetToModel(preset('wrong-gate-m1'), 100);
    expect(model.static).toEqual({
      atkPercent: 46,
      critRate: 0,
      critDamage: 0,
      damageBonus: 0,
      allyDamageBonus: 0,
    });
    expect(model.conditional).toEqual({
      atkPercent: 0,
      critRate: 0,
      critDamage: 0,
      damageBonus: 30,
      allyDamageBonus: 15,
    });
  });

  it('combines Wrong Gate M5 static values without multiplying them by uptime', () => {
    const zeroUptime = arcPresetToModel(preset('wrong-gate-m5'), 0);
    const fullUptime = arcPresetToModel(preset('wrong-gate-m5'), 100);
    expect(zeroUptime.static.atkPercent).toBe(62);
    expect(fullUptime.static.atkPercent).toBe(62);
    expect(zeroUptime.conditionalUptime).toBe(0);
    expect(fullUptime.conditionalUptime).toBe(100);
    expect(fullUptime.conditional.damageBonus).toBe(60);
    expect(fullUptime.conditional.allyDamageBonus).toBe(30);
  });

  it('includes Last Rose permanent ATK and CRIT Rate substat', () => {
    const model = arcPresetToModel(preset('last-rose-m1'), 100);
    expect(model.static.atkPercent).toBe(14);
    expect(model.static.critRate).toBe(24);
    expect(model.conditional.damageBonus).toBe(0);
    expect(model.conditional.allyDamageBonus).toBe(0);
  });
});
