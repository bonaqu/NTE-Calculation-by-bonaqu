/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { arcCatalog } from './arc-catalog';
import { arcPresets } from './arc-presets';
import { characterCatalog } from './characters';
import { arcBenchmarkScenarios } from './data';
import { esperCycles } from './esper-cycles';
import { arcRussianNames, characterRussianNames } from './gameTerms';
import { ascensionMaterials, progressionDatasetSources } from './progression-data';
import { rotationPresets } from './rotation-presets';

function russianRuntimeCorpus(): string[] {
  const scenarioText = arcBenchmarkScenarios.flatMap((scenario) => [
    scenario.title.ru,
    scenario.description.ru,
    ...scenario.meta.map((item) => item.ru),
    ...scenario.rows.map((row) => row.note.ru),
  ]);
  const presetText = arcPresets.flatMap((preset) => [
    preset.benchmarkNote.ru,
    preset.model.trigger.ru,
  ]);
  const rotationText = rotationPresets.flatMap((preset) => [
    preset.title.ru,
    preset.description.ru,
    preset.timingPolicy.ru,
    ...preset.assumptions.map((item) => item.ru),
    ...preset.steps.flatMap((step) => [step.instruction.ru, step.outcome.ru]),
  ]);

  return [
    ...Object.values(characterRussianNames),
    ...Object.values(arcRussianNames),
    ...characterCatalog.map((character) => character.summary.ru),
    ...arcCatalog.map((arc) => arc.effect.ru),
    ...presetText,
    ...scenarioText,
    ...esperCycles.flatMap((cycle) => [cycle.name.ru, cycle.effect.ru]),
    ...rotationText,
    ...Object.values(ascensionMaterials).flatMap((material) => [material.name.ru, material.farm?.ru ?? '']),
    ...progressionDatasetSources.map((source) => source.scope.ru),
  ];
}

type SourceString = { file: string; line: number; text: string };

const rawSourceModules = import.meta.glob('./**/*.{ts,tsx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function sourceRussianStrings(): SourceString[] {
  return Object.entries(rawSourceModules).flatMap(([file, source]) => {
    if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return [];
    return source.split('\n').flatMap((text, index) => /[А-Яа-яЁё]/u.test(text)
      ? [{ file: file.replace(/^\.\//u, ''), line: index + 1, text }]
      : [];
  });
}

const forbiddenPrimaryTerms: RegExp[] = [
  /\bСинку\b/u,
  /\bНулевой эспер\b/u,
  /Esper Cycle/iu,
  /пробой|пробит/iu,
  /сила пробоя/iu,
  /\bЗаклинани(?:е|я|ю|ем|и)\b/iu,
  /\bСинтез\b/iu,
  /\bГазовый\b/iu,
  /сломлени(?:е|я|ю|ем|и|й|ям|ями|ях)/iu,
  /перенаправленн(?:ый|ого|ым) навык/iu,
  /\bультимейт(?:а|е|ом|ы|ов)?\b/iu,
  /Emergency Delivery|Aerial Command|Cyclone Strike|Rider Express|Final Reckoning/iu,
  /Жучиная монета|Утраченные шёпоты|Смутные шёпоты|Парадоксальные шёпоты/iu,
];

const forbiddenVisibleJargon: RegExp[] = [
  /\bста(?:к|ка|ки|ков|кам|ками|ках)\b/iu,
  /\b(?:вознес|возвыш)\w*/iu,
  /босс-дроп/iu,
  /\bсигнатур\w*/iu,
  /\bростер\w*/iu,
  /\bбилд\w*/iu,
  /\bтаймлайн\w*/iu,
  /Ураганный удар|Экспресс всадника/iu,
  /Берега Заблуждений|билетный корешок/iu,
];

describe('Russian localization regression contract', () => {
  it('does not expose deprecated or untranslated terminology in primary RU data', () => {
    const corpus = russianRuntimeCorpus().join('\n');
    for (const pattern of forbiddenPrimaryTerms) expect(corpus).not.toMatch(pattern);
  });

  it('uses the exact current Arc-type, role and destruction labels', () => {
    const corpus = russianRuntimeCorpus().join('\n');
    expect(corpus).toContain('шкалу разрушения');
    expect(corpus).toContain('интенсивность разрушения');
    expect(corpus).toContain('урона разрушения');
    expect(corpus).toContain('сломленным');
  });

  it('keeps polished Russian Arc grammar in the public catalog', () => {
    const byName = new Map(arcCatalog.map((arc) => [arc.name, arc.effect.ru]));
    expect(byName.get('Clear Skies')).toContain('урон Анимы');
    expect(byName.get('Reality Refuge')).toContain('урон Анимы');
    expect(byName.get('The Wrong Gate')).toContain('урон Анимы');
    expect(byName.get('Time Bandit')).toContain('который способен');
  });

  it('keeps Russian primary display labels free of canonical English names', () => {
    expect(Object.values(characterRussianNames)).toEqual(expect.arrayContaining(['Шинку', 'Оценщик', 'Даффодил']));
    expect(Object.values(characterRussianNames)).not.toEqual(expect.arrayContaining(['Shinku', 'Zero', 'Daffodill', 'Синку']));
    expect(Object.values(arcRussianNames)).not.toEqual(expect.arrayContaining(['Blushing Mirage', "What's Desired"]));
  });

  it('rejects avoidable guide jargon in every visible Russian source string', () => {
    const strings = sourceRussianStrings();
    const failures = strings.flatMap((entry) => forbiddenVisibleJargon.flatMap((pattern) => pattern.test(entry.text)
      ? [`${entry.file}:${entry.line} ${pattern} → ${entry.text}`]
      : []));
    expect(failures).toEqual([]);
  });
});
