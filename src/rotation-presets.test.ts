import { describe, expect, it } from 'vitest';
import { characterByName } from './characters';
import { esperCycles } from './esper-cycles';
import { rotationCoverage } from './rotation-coverage';
import { rotationPresets } from './rotation-presets';

describe('rotation datasets', () => {
  it('ships all eight sourced Esper Cycles', () => {
    expect(esperCycles).toHaveLength(8);
    expect(esperCycles.filter((cycle) => cycle.category === 'pair')).toHaveLength(6);
    expect(esperCycles.filter((cycle) => cycle.category === 'triple')).toHaveLength(2);
    expect(esperCycles.every((cycle) => cycle.sourceUrl.startsWith('https://') && cycle.verifiedAt === '2026-08-04')).toBe(true);
  });

  it('ships six bilingual, source-backed rotation presets', () => {
    expect(rotationPresets).toHaveLength(6);
    expect(rotationPresets.map((preset) => preset.id)).toEqual([
      'shinku-charge',
      'hathor-hyper',
      'chaos-remora-bomb',
      'nanally-hexed-dual',
      'lacrimosa-discord-dot',
      'baicang-firefly-hyper',
    ]);

    for (const preset of rotationPresets) {
      expect(preset.team).toHaveLength(4);
      expect(new Set(preset.team).size).toBe(4);
      expect(preset.team.every((name) => characterByName.get(name)?.releaseStatus === 'released')).toBe(true);
      expect(preset.steps.length).toBeGreaterThanOrEqual(8);
      expect(new Set(preset.steps.map((step) => step.id)).size).toBe(preset.steps.length);
      expect(preset.steps.every((step) => preset.team.includes(step.actor))).toBe(true);
      expect(preset.steps.every((step) => step.instruction.ru && step.instruction.en && step.outcome.ru && step.outcome.en)).toBe(true);
      expect(preset.sourceUrl).toMatch(/^https:\/\/www\.prydwen\.gg\/neverness-to-everness\/characters\/[a-z-]+$/u);
      expect(preset.sourceUpdatedAt).toMatch(/^2026-\d{2}-\d{2}$/u);
      expect(preset.verifiedAt).toBe('2026-08-04');
      expect(preset.timingPolicy.ru.toLowerCase()).toMatch(/секунд|временн/u);
      expect(preset.timingPolicy.en.toLowerCase()).toContain('second');
    }
  });

  it('derives coverage and freshness from the six-preset catalog', () => {
    expect(rotationCoverage.presetCount).toBe(rotationPresets.length);
    expect(rotationCoverage.representedMainCharacters).toEqual(['Baicang', 'Chaos', 'Hathor', 'Lacrimosa', 'Nanally', 'Shinku']);
    expect(rotationCoverage.newestGuideDate).toBe('2026-07-13');
    expect(rotationCoverage.oldestGuideDate).toBe('2026-06-23');
    expect(rotationCoverage.verifiedAt).toBe('2026-08-04');
    expect(rotationCoverage.missingReleasedCharacters).not.toContain('Shinku');
    expect(rotationCoverage.missingReleasedCharacters).not.toContain('Chaos');
    expect(rotationCoverage.missingReleasedCharacters.length).toBeGreaterThan(0);
  });

  it('keeps recovery branches optional where the source makes them conditional', () => {
    for (const id of ['chaos-remora-bomb', 'nanally-hexed-dual', 'lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const preset = rotationPresets.find((entry) => entry.id === id);
      expect(preset).toBeDefined();
      expect(preset?.steps.some((step) => step.phase === 'recovery' && step.optional)).toBe(true);
    }
  });

  it('does not invent exact Russian unique skill names in the added presets', () => {
    const added = rotationPresets.slice(2);
    const russian = added.flatMap((preset) => [
      ...preset.assumptions.map((item) => item.ru),
      ...preset.steps.flatMap((step) => [step.instruction.ru, step.outcome.ru]),
    ]).join('\n');
    expect(russian).toContain('не переводятся проектом');
    expect(russian).not.toMatch(/Emergency Delivery|Aerial Command|Cyclone Strike|Rider Express|Final Reckoning/iu);
  });

  it('uses destruction terminology instead of proboy or slomlenie nouns in Russian cycle copy', () => {
    const russian = esperCycles.map((cycle) => `${cycle.name.ru} ${cycle.effect.ru}`).join(' ').toLowerCase();
    expect(russian).toContain('шкалу разрушения');
    expect(russian).not.toContain('пробой');
    expect(russian).not.toMatch(/сломлени(?:е|я|ю|ем|и)/u);
  });
});
