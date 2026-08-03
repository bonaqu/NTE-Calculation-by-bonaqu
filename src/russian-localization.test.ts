import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { arcDirectory } from './arc-directory';
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
    ...arcDirectory.map((arc) => arc.effect.ru),
    ...presetText,
    ...scenarioText,
    ...esperCycles.flatMap((cycle) => [cycle.name.ru, cycle.effect.ru]),
    ...rotationText,
    ...Object.values(ascensionMaterials).flatMap((material) => [material.name.ru, material.farm?.ru ?? '']),
    ...progressionDatasetSources.map((source) => source.scope.ru),
  ];
}

type SourceString = { file: string; line: number; text: string };

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!['.ts', '.tsx'].includes(extname(entry.name)) || entry.name.endsWith('.test.ts')) return [];
    return [path];
  });
}

function sourceRussianStrings(): SourceString[] {
  const root = dirname(fileURLToPath(import.meta.url));
  return sourceFiles(root).flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const found: SourceString[] = [];
    const push = (node: ts.Node, text: string) => {
      if (!/[А-Яа-яЁё]/u.test(text)) return;
      found.push({
        file: relative(root, file).replaceAll('\\', '/'),
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        text,
      });
    };
    const visit = (node: ts.Node) => {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) push(node, node.text);
      if (ts.isTemplateExpression(node)) {
        push(node.head, node.head.text);
        for (const span of node.templateSpans) push(span.literal, span.literal.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return found;
  });
}

const forbiddenPrimaryTerms: RegExp[] = [
  /\bШинку\b/u,
  /\bНулевой эспер\b/u,
  /Esper Cycle/iu,
  /пробой|пробит/iu,
  /сила пробоя/iu,
  /\bЗаклинани(?:е|я|ю|ем|и)\b/iu,
  /\bСинтез\b/iu,
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

  it('keeps Russian primary display labels free of canonical English names', () => {
    expect(Object.values(characterRussianNames)).toEqual(expect.arrayContaining(['Синку', 'Оценщик', 'Даффодил']));
    expect(Object.values(characterRussianNames)).not.toEqual(expect.arrayContaining(['Shinku', 'Zero', 'Daffodill']));
    expect(Object.values(arcRussianNames)).not.toEqual(expect.arrayContaining(['Blushing Mirage', "What's Desired"]));
  });

  it('rejects outdated client terms and avoidable guide jargon in every visible Russian source string', () => {
    const strings = sourceRussianStrings();
    const failures = strings.flatMap((entry) => forbiddenVisibleJargon.flatMap((pattern) => pattern.test(entry.text)
      ? [`${entry.file}:${entry.line} ${pattern} → ${entry.text}`]
      : []));
    expect(failures).toEqual([]);
  });
});
