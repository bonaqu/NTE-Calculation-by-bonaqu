/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import componentSource from './components/TeamCombatScenarioPanel.tsx?raw';
import engineSource from './combat-scenario.ts?raw';
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

  it('stores and normalizes the scenario separately from character builds', () => {
    expect(engineSource).toContain("COMBAT_SCENARIO_STORAGE_KEY = 'nte.team.scenario.v1'");
    expect(engineSource).toContain('COMBAT_SCENARIO_VERSION = 1');
    expect(engineSource).toContain('normalizeCombatScenarioState');
    expect(componentSource).toContain('COMBAT_SCENARIO_STORAGE_KEY');
    expect(componentSource).toContain('{ normalize: normalizeCombatScenarioState }');
  });

  it('exposes only verified actions, effects and timing instead of hidden formula inputs', () => {
    expect(componentSource).toContain("addStep('action')");
    expect(componentSource).toContain("addStep('activate-effect')");
    expect(componentSource).toContain("addStep('wait')");
    expect(componentSource).toContain('actionsForCharacter');
    expect(componentSource).toContain('teamEffectsForCharacter');
    expect(componentSource).toContain('Коэффициенты вручную вводить не нужно');
    expect(componentSource).not.toContain('skillMultiplier');
    expect(componentSource).not.toContain('actionsPerRotation');
    expect(componentSource).not.toContain('hitCount');
  });

  it('states partial verified coverage instead of claiming full rotation DPS', () => {
    expect(componentSource).toContain('Это не полный DPS ротации');
    expect(componentSource).toContain('Покрытие действий');
    expect(engineSource).toContain('coveragePercent');
    expect(engineSource).toContain("status: 'blocked'");
    expect(engineSource).toContain("status: 'wait'");
  });

  it('publishes the versioned Worker endpoint and scenario metadata', () => {
    expect(wranglerSource).toContain('src/index-v0.9.ts');
    expect(workerSource).toContain("SERVICE_VERSION = '0.9.0'");
    expect(workerSource).toContain("'/api/v1/calculate/combat-scenario'");
    expect(workerSource).toContain('normalizeGameVisibleTeamState(input.team)');
    expect(workerSource).toContain('normalizeCombatScenarioState(input.scenario)');
    expect(workerSource).toContain('calculateCombatScenario(team, scenario)');
    expect(workerSource).toContain("policy: 'verified-actions-and-timed-effects-only'");
  });

  it('loads a responsive border-led scenario interface without gradients or shadows', () => {
    expect(mainSource).toContain("import './combat-scenario.css'");
    expect(css).toContain('.combat-scenario-editor-row');
    expect(css).toContain('.combat-scenario-results li');
    expect(css).toContain('.nte-calc-layout.scenario-active');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
