/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { arcCatalog } from './arc-catalog';
import { arcPresets } from './arc-presets';
import { characterCatalog } from './characters';
import { arcBenchmarkScenarios } from './data';
import { esperCycles } from './esper-cycles';
import {
  arcRussianNames,
  characterRussianNames,
  localizedArcType,
  localizedRole,
  localizedStatLabel,
} from './gameTerms';
import { ascensionMaterials, progressionDatasetSources } from './progression-data';
import { rotationPresets } from './rotation-presets';

function russianRuntimeCorpus(): string[] {
  return [
    ...Object.values(characterRussianNames),
    ...Object.values(arcRussianNames),
    ...characterCatalog.map((character) => character.summary.ru),
    ...arcCatalog.map((arc) => arc.effect.ru),
    ...arcPresets.flatMap((preset) => [preset.benchmarkNote.ru, preset.model.trigger.ru]),
    ...arcBenchmarkScenarios.flatMap((scenario) => [
      scenario.title.ru,
      scenario.description.ru,
      ...scenario.meta.map((item) => item.ru),
      ...scenario.rows.map((row) => row.note.ru),
    ]),
    ...esperCycles.flatMap((cycle) => [cycle.name.ru, cycle.effect.ru]),
    ...rotationPresets.flatMap((preset) => [
      preset.title.ru,
      preset.description.ru,
      preset.timingPolicy.ru,
      ...preset.assumptions.map((item) => item.ru),
      ...preset.steps.flatMap((step) => [step.instruction.ru, step.outcome.ru]),
    ]),
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
      : []);
  });
}

const forbiddenPrimaryTerms: RegExp[] = [
  /\bСинку\b/u,
  /Слезы с маской/iu,
  /\bATK\b|\bDEF\b|\bHP\b/u,
  /\bбаффер\w*/iu,
  /Esper Cycle/iu,
  /пробой|пробит/iu,
  /сила пробоя/iu,
  /\bЗаклинани(?:е|я|ю|ем|и)\b/iu,
  /\bСинтез\b/iu,
  /сломлени(?:е|я|ю|ем|и|й|ям|ями|ях)/iu,
  /интенсивност(?:ь|и|ью) (?:сломления|разрушения)/iu,
  /эффективност(?:ь|и|ью) заряда/iu,
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

  it('uses the exact current primary character, Arc-type, role and stat labels', () => {
    expect(Object.values(characterRussianNames)).toEqual(expect.arrayContaining(['Шинку', 'Зеро', 'Даффодил']));
    expect(Object.values(characterRussianNames)).not.toEqual(expect.arrayContaining(['Shinku', 'Zero', 'Daffodill', 'Синку', 'Оценщик']));
    expect(localizedArcType('Gas', 'ru')).toBe('Газовый');
    expect(localizedArcType('Plasma', 'ru')).toBe('Плазменный');
    expect(localizedRole('Buff', 'ru')).toBe('Усиление');
    expect(localizedStatLabel('Break Intensity', 'ru')).toBe('Эффективность разрушения');
    expect(localizedStatLabel('Charge Efficiency', 'ru')).toBe('Эффективность зарядки');
  });

  it('normalizes imported Arc copy without changing sourced numeric values', () => {
    const corpus = arcCatalog.map((arc) => arc.effect.ru).join('\n');
    expect(corpus).toContain('шкалы разрушения');
    expect(corpus).toContain('эффективность разрушения');
    expect(corpus).toContain('урон разрушения');
    expect(corpus).toContain('сломленным');
    expect(corpus).toContain('АТК');
    expect(corpus).toContain('ОЗ');
    expect(corpus).not.toMatch(/\bATK\b|\bDEF\b|\bHP\b/u);
    expect(arcCatalog.find((arc) => arc.name === 'Dangerous Game')?.effect.ru).toContain('60/66/72/78/84');
    expect(arcCatalog.find((arc) => arc.name === "Good Boy's Grand Adventure")?.effect.ru).toContain('18/21/24/27/30%');
  });

  it('keeps polished Russian Arc grammar in the public catalog', () => {
    const byName = new Map(arcCatalog.map((arc) => [arc.name, arc.effect.ru]));
    expect(byName.get('Clear Skies')).toContain('урон Анимы');
    expect(byName.get('Reality Refuge')).toContain('урон Анимы');
    expect(byName.get('The Wrong Gate')).toContain('урон Анимы');
    expect(byName.get('Time Bandit')).toContain('который способен');
  });

  it('does not duplicate primary terminology examples inside Methodology', () => {
    const methodology = rawSourceModules['./pages/MethodologyPage.tsx'] ?? '';
    expect(methodology).not.toContain('основное имя здесь');
    expect(methodology).not.toContain('Синку');
    expect(methodology).not.toContain('Плазма');
    expect(methodology).not.toContain('Бафф');
    expect(methodology).toContain('TerminologyEvidenceTable');
  });

  it('keeps Russian primary display labels free of canonical English names', () => {
    expect(Object.values(arcRussianNames)).not.toEqual(expect.arrayContaining(['Blushing Mirage', "What's Desired"]));
  });

  it('rejects avoidable guide jargon in every visible Russian source string', () => {
    const failures = sourceRussianStrings().flatMap((entry) => forbiddenVisibleJargon.flatMap((pattern) => pattern.test(entry.text)
      ? [`${entry.file}:${entry.line} ${pattern} → ${entry.text}`]
      : []));
    expect(failures).toEqual([]);
  });
});
