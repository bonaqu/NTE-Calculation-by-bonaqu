import { describe, expect, it } from 'vitest';
import { arcDirectory } from './arc-directory';
import { characterArcGuides } from './arc-recommendations';
import { arcBenchmarkScenarios } from './data';
import { homeProductStats } from './home-product-stats';

describe('lightweight home product counters', () => {
  it('matches the current validated datasets without importing them at runtime on Home', () => {
    expect(homeProductStats).toEqual({
      arcGuideCharacters: characterArcGuides.length,
      sourcedArcs: arcDirectory.length,
      iroiBenchmarkScenarios: arcBenchmarkScenarios.length,
    });
  });
});
