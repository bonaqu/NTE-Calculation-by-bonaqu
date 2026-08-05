/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import componentSource from './components/TeamCombatScenarioPanel.tsx?raw';
import engineSource from './combat-scenario.ts?raw';
import importSource from './rotation-scenario-import.ts?raw';
import mainSource from './main.tsx?raw';
import pageSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import workerSource from '../workers/api/src/index-v0.9.ts?raw';
import wranglerSource from '../workers/api/wrangler.jsonc?raw';

const css = readFileSync(new URL('./combat-scenario.css', import.meta.url), 'utf8');

describe('verified team combat scenario product contract', () => {
  it('adds a dedicated scenario workspace to Team Calculator', () => {
    expect(pageSource).toContain("import { TeamCombatScenarioPanel }");
    expect(pageSource).toContain("'scenario'");
    expect(pageSource).toContain("scenario: { ru: 'Сценарий', en: 'Scenario' }");
    expect(pageSource).toContain('<TeamCombatScenarioPanel team={state} locale={locale} />');
    expect(pageSource).toContain("tab !== 'scenario'");
  });

  it('stores the scenario and Rotation Lab provenance in independent v1 records', () => {
    expect(engineSource).toContain("COMBAT_SCENARIO_STORAGE_KEY = 'nte.team.scenario.v1'");
    expect(engineSource).toContain('COMBAT_SCENARIO_VERSION = 1');
    expect(engineSource).toContain('normalizeCombatScenarioState');
    expect(importSource).toContain("ROTATION_SCENARIO_IMPORT_STORAGE_KEY = 'nte.team.scenario.rotation-import.v1'");
    expect(importSource).toContain("timingStatus: 'order-only'");
    expect(componentSource).toContain('{ normalize: normalizeCombatScenarioState }');
    expect(componentSource).toContain('{ normalize: normalizeRotationScenarioImportMetadata }');
  });

  it('imports sourced rotations without fuzzy matching or invented seconds', () => {
    expect(componentSource).toContain('Импорт из Rotation Lab');
    expect(componentSource).toContain('Порядок без подтверждённых секунд');
    expect(componentSource).toContain('Полный шаг = 1, частичный = 0,5');
    expect(componentSource).toContain('Взвешенное покрытие');
    expect(componentSource).toContain('confirmRotationScenarioTiming');
    expect(componentSource).toContain('invalidateRotationScenarioTiming');
    expect(importSource).toContain('Exact source-step bindings only');
    expect(importSource).toContain('RotationScenarioBindingAtom');
    expect(importSource).toContain('generatedPartialRemainderSteps');
    expect(importSource).not.toMatch(/fuzzyMatch|similarityScore|levenshtein/iu);
  });

  it('exposes only verified actions, effects, supported cycles and timing instead of hidden formula inputs', () => {
    expect(componentSource).toContain("addStep('action')");
    expect(componentSource).toContain("addStep('activate-effect')");
    expect(componentSource).toContain("addStep('activate-cycle')");
    expect(componentSource).toContain("addStep('wait')");
    expect(componentSource).toContain('actionsForCharacter');
    expect(componentSource).toContain('teamEffectsForCharacter');
    expect(componentSource).toContain('verifiedCombatCycleModels');
    expect(componentSource).not.toContain('skillMultiplier');
    expect(componentSource).not.toContain('actionsPerRotation');
    expect(componentSource).not.toContain('hitCount');
  });

  it('states partial verified coverage instead of claiming full rotation DPS', () => {
    expect(componentSource).toContain('Это не полный DPS ротации');
    expect(componentSource).toContain('Покрытие действий');
    expect(componentSource).toContain('Остальные циклы не превращаются в выдуманный урон');
    expect(componentSource).toContain("coverage-${origin.coverage}");
    expect(engineSource).toContain('coveragePercent');
    expect(engineSource).toContain("status: 'blocked'");
    expect(engineSource).toContain("status: 'wait'");
  });

  it('publishes the versioned Worker endpoint and scenario metadata', () => {
    expect(wranglerSource).toContain('src/index-v0.9.ts');
    expect(workerSource).toContain("SERVICE_VERSION = '0.9.0'");
    expect(workerSource).toContain("'/api/v1/calculate/combat-scenario'");
    expect(workerSource).toContain("'activate-cycle'");
    expect(workerSource).toContain('verifiedCombatCycleModelCount');
    expect(workerSource).toContain('normalizeGameVisibleTeamState(input.team)');
    expect(workerSource).toContain('normalizeCombatScenarioState(input.scenario)');
    expect(workerSource).toContain('calculateCombatScenario(team, scenario)');
    expect(workerSource).toContain("policy: 'verified-actions-timed-effects-and-supported-cycles-only'");
  });

  it('loads a responsive border-led scenario interface without gradients or shadows', () => {
    expect(mainSource).toContain("import './combat-scenario.css'");
    expect(css).toContain('.rotation-scenario-import');
    expect(css).toContain('.rotation-scenario-timing');
    expect(css).toContain('.rotation-origin.coverage-partial');
    expect(css).toContain('.combat-scenario-value-cell');
    expect(css).toContain('.combat-scenario-editor-row');
    expect(css).toContain('.combat-scenario-results li');
    expect(css).toContain('.combat-scenario-cycle-policy');
    expect(css).toContain('.combat-scenario-shared-target');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
