import { describe, expect, it } from 'vitest';
import {
  characterTermById,
  characterTermCoverage,
  characterTerms,
  normalizeCharacterTermSearch,
  searchCharacterTerms,
} from './character-terms';
import { rotationPresets } from './rotation-presets';
import {
  rotationStepTermRefs,
  termsForBoundRotationStep,
  validateRotationStepTermBindings,
} from './rotation-step-terms';

describe('character-specific terminology', () => {
  it('ships a substantial bilingual evidence registry with unique stable ids', () => {
    expect(characterTerms.length).toBeGreaterThan(70);
    expect(new Set(characterTerms.map((term) => term.id)).size).toBe(characterTerms.length);
    for (const term of characterTerms) {
      expect(term.characterName).not.toBe('');
      expect(term.russian).not.toBe('');
      expect(term.english).not.toBe('');
      expect(term.verifiedAt).toBe('2026-08-04');
      expect(term.sourcePublisher).not.toBe('');
      if (term.resolution !== 'unresolved') {
        expect(term.level).toBe('current-russian-reference');
        expect(term.sourceUrl).toMatch(/^https:\/\/interactivemap\.app\/neverness-to-everness\/database\/ru\/espers\/esper-\d+\/$/u);
        expect(term.supportingSourceUrl).toMatch(/^https:\/\/interactivemap\.app\/neverness-to-everness\/database\/en\/espers\/esper-\d+\/$/u);
      }
    }
  });

  it('covers every actor used by the six sourced rotations', () => {
    const actors = [...new Set(rotationPresets.flatMap((preset) => preset.steps.map((step) => step.actor)))].sort();
    expect(actors).toEqual([
      'Adler',
      'Baicang',
      'Chaos',
      'Daffodill',
      'Haniel',
      'Hathor',
      'Jiuyuan',
      'Lacrimosa',
      'Nanally',
      'Sakiri',
      'Shinku',
      'Zero',
    ]);
    expect(actors.every((actor) => characterTermCoverage.has(actor))).toBe(true);
    expect([...characterTermCoverage.entries()].filter(([, resolution]) => resolution === 'unresolved').map(([name]) => name).sort())
      .toEqual(['Baicang', 'Chaos', 'Shinku']);
  });

  it('keeps Zero as the character while Appraiser is a passive term', () => {
    const appraiser = characterTermById.get('zero.passive.appraiser');
    expect(appraiser).toMatchObject({
      characterName: 'Zero',
      kind: 'passive',
      russian: 'Оценщик',
      english: 'Appraiser',
      resolution: 'exact',
    });
    expect(appraiser?.note.ru).toContain('не основное имя персонажа');
  });

  it('records the Jiuyuan Rose Pact source conflict instead of hiding it', () => {
    const pact = characterTermById.get('jiuyuan.mark.rose-pact');
    expect(pact).toMatchObject({
      resolution: 'conflicted',
      russian: 'Смертоносный договор розы',
      english: 'Fatal Rose Pact',
    });
    expect(pact?.alternatives).toEqual([expect.objectContaining({
      russian: 'Фатальный договор розы',
      english: 'Lethal Rose Pact',
    })]);
  });

  it('binds only existing terms belonging to the step actor', () => {
    expect(Object.keys(rotationStepTermRefs).length).toBeGreaterThan(25);
    expect(validateRotationStepTermBindings(rotationPresets)).toEqual([]);

    for (const preset of rotationPresets) {
      for (const step of preset.steps) {
        const terms = termsForBoundRotationStep(preset.id, step);
        expect(terms.every((term) => term.characterName === step.actor)).toBe(true);
        expect(terms.every((term) => term.resolution !== 'unresolved')).toBe(true);
      }
    }
  });

  it('does not invent exact labels for unresolved actors', () => {
    for (const actor of ['Shinku', 'Chaos', 'Baicang']) {
      const records = characterTerms.filter((term) => term.characterName === actor);
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({ kind: 'coverage', resolution: 'unresolved', level: 'project-fallback' });
      expect(records[0]?.sourceUrl).toBeUndefined();
    }
    expect(Object.values(rotationStepTermRefs).flat()).not.toContain('shinku.coverage.unresolved');
    expect(Object.values(rotationStepTermRefs).flat()).not.toContain('chaos.coverage.unresolved');
    expect(Object.values(rotationStepTermRefs).flat()).not.toContain('baicang.coverage.unresolved');
  });

  it('searches Russian, English, aliases and conflicting alternatives', () => {
    expect(searchCharacterTerms('Деление на ноль').map((term) => term.id)).toContain('zero.ultimate.divide-by-zero');
    expect(searchCharacterTerms('Final Reckoning').map((term) => term.id)).toContain('jiuyuan.ultimate.final-reckoning');
    expect(searchCharacterTerms('Техники Генесса').map((term) => term.id)).toContain('haniel.basic.genesse-technique');
    expect(searchCharacterTerms('Фатальный договор розы').map((term) => term.id)).toContain('jiuyuan.mark.rose-pact');
    expect(normalizeCharacterTermSearch('  ПЯТИЗВЁЗДОЧНОЕ   отслеживание ')).toBe('пятизвездочное отслеживание');
  });

  it('keeps exact records inside the daily hard freshness horizon', () => {
    const asOf = Date.parse('2026-08-04T00:00:00.000Z');
    const hardDays = 240;
    for (const term of characterTerms.filter((entry) => entry.resolution !== 'unresolved')) {
      const verified = Date.parse(`${term.verifiedAt}T00:00:00.000Z`);
      expect(Number.isFinite(verified)).toBe(true);
      expect((asOf - verified) / 86_400_000).toBeLessThanOrEqual(hardDays);
    }
  });
});
