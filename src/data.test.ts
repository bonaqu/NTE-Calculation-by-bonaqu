import { describe, expect, it } from 'vitest';
import { arcPresets } from './arc-presets';
import { arcBenchmarkScenarios } from './data';

const arcIds = new Set(arcPresets.map((arc) => arc.id));

describe('Arc benchmark scenarios', () => {
  it('references existing Arc presets without duplicate rows', () => {
    for (const scenario of arcBenchmarkScenarios) {
      const rowIds = scenario.rows.map((row) => row.arcId);
      expect(new Set(rowIds).size).toBe(rowIds.length);
      for (const arcId of rowIds) expect(arcIds.has(arcId)).toBe(true);
    }
  });

  it('keeps public Prydwen values separate from the Rivyn screenshot', () => {
    const publicScenario = arcBenchmarkScenarios.find((scenario) => scenario.id === 'prydwen-public');
    const rivynScenario = arcBenchmarkScenarios.find((scenario) => scenario.id === 'rivyn-support');

    expect(publicScenario?.rows.map((row) => [row.arcId, row.percent])).toEqual([
      ['wrong-gate-m1', 100],
      ['last-rose-m1', 92.97],
      ['youthful-fantasy-m1', 92.55],
      ['fluff-fleetness-m1', 92],
      ['shiny-days-m5', 91.88],
      ['clear-skies-m5', 91.63],
    ]);
    expect(rivynScenario?.rows[0]).toMatchObject({ arcId: 'wrong-gate-m5', percent: 107.77, teamDamage: 2_912_618, teamDps: 83_218 });
    expect(publicScenario?.rows.some((row) => row.arcId === 'wrong-gate-m5')).toBe(false);
  });

  it('keeps each scenario sorted by relative result', () => {
    for (const scenario of arcBenchmarkScenarios) {
      for (let index = 1; index < scenario.rows.length; index += 1) {
        expect(scenario.rows[index - 1]!.percent).toBeGreaterThanOrEqual(scenario.rows[index]!.percent);
      }
    }
  });
});

describe('calculator Arc presets', () => {
  it('stores actual Wrong Gate substat separately from always-on and triggered effects', () => {
    const m1 = arcPresets.find((arc) => arc.id === 'wrong-gate-m1');
    const m5 = arcPresets.find((arc) => arc.id === 'wrong-gate-m5');

    expect(m1).toMatchObject({
      secondaryLabel: 'ATK%',
      secondaryValue: 30,
      model: {
        static: { atkPct: 16 },
        conditional: { dmgBonus: 30, allyDmgBonus: 15 },
      },
    });
    expect(m5).toMatchObject({
      secondaryLabel: 'ATK%',
      secondaryValue: 30,
      model: {
        static: { atkPct: 32 },
        conditional: { dmgBonus: 60, allyDmgBonus: 30 },
      },
    });
  });

  it('includes Last Rose always-on ATK without inventing conditional uptime', () => {
    const lastRose = arcPresets.find((arc) => arc.id === 'last-rose-m1');
    expect(lastRose).toMatchObject({
      secondaryLabel: 'CRIT Rate',
      secondaryValue: 24,
      model: { static: { atkPct: 14 }, conditional: {} },
    });
  });
});
