import { describe, expect, it } from 'vitest';
import { esperCycles } from './esper-cycles';
import { rotationPresets } from './rotation-presets';

describe('rotation datasets', () => {
  it('ships all eight sourced Esper Cycles', () => {
    expect(esperCycles).toHaveLength(8);
    expect(esperCycles.filter((cycle) => cycle.category === 'pair')).toHaveLength(6);
    expect(esperCycles.filter((cycle) => cycle.category === 'triple')).toHaveLength(2);
    expect(esperCycles.every((cycle) => cycle.sourceUrl.startsWith('https://') && cycle.verifiedAt === '2026-08-04')).toBe(true);
  });

  it('ships two bilingual, source-backed rotation presets', () => {
    expect(rotationPresets).toHaveLength(2);
    for (const preset of rotationPresets) {
      expect(preset.team).toHaveLength(4);
      expect(new Set(preset.team).size).toBe(4);
      expect(preset.steps.length).toBeGreaterThanOrEqual(8);
      expect(new Set(preset.steps.map((step) => step.id)).size).toBe(preset.steps.length);
      expect(preset.steps.every((step) => step.instruction.ru && step.instruction.en && step.outcome.ru && step.outcome.en)).toBe(true);
      expect(preset.sourceUrl.startsWith('https://www.prydwen.gg/')).toBe(true);
      expect(preset.timingPolicy.ru.toLowerCase()).toMatch(/секунд|временн/u);
      expect(preset.timingPolicy.en.toLowerCase()).toContain('second');
    }
  });

  it('uses slomlenie terminology instead of proboy in Russian cycle copy', () => {
    const russian = esperCycles.map((cycle) => `${cycle.name.ru} ${cycle.effect.ru}`).join(' ').toLowerCase();
    expect(russian).toContain('сломления');
    expect(russian).not.toContain('пробой');
  });
});
