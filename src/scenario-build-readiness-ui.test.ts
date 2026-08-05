/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import managerSource from './components/BuildProfileManager.tsx?raw';
import panelSource from './components/ScenarioBuildReadinessPanel.tsx?raw';
import mainSource from './main.tsx?raw';
import modelSource from './scenario-build-readiness.ts?raw';

const css = readFileSync(new URL('./scenario-build-readiness.css', import.meta.url), 'utf8');

describe('scenario build readiness UI contract', () => {
  it('places readiness before the existing profile library and reads the same scenario record', () => {
    expect(managerSource).toContain('ScenarioBuildReadinessPanel');
    expect(managerSource.indexOf('<ScenarioBuildReadinessPanel')).toBeLessThan(managerSource.indexOf('<section className="build-profile-manager"'));
    expect(managerSource).toContain('COMBAT_SCENARIO_STORAGE_KEY');
    expect(managerSource).toContain('{ normalize: normalizeCombatScenarioState }');
  });

  it('shows exact requirements without ranking builds by damage or ATK', () => {
    expect(panelSource).toContain('Готовность сборок к сценарию');
    expect(panelSource).toContain('Профили не ранжируются по силе');
    expect(panelSource).toContain('Нужны сценарию');
    expect(panelSource).toContain('Есть готовый профиль');
    expect(modelSource).not.toMatch(/bestProfile|profileScore|sort\([^)]*(?:atk|damage|crit)/iu);
  });

  it('keeps automatic help selection-only and requires an explicit atomic apply action', () => {
    expect(panelSource).toContain('uniqueReadyScenarioProfileSelections');
    expect(panelSource).toContain('Подставить однозначные');
    expect(panelSource).toContain('Применить выбранные');
    expect(panelSource).toContain('applySelectedScenarioProfiles');
    expect(modelSource).toContain("error: 'character-mismatch'");
    expect(modelSource).toContain("error: 'duplicate-selection'");
  });

  it('loads a separate responsive stylesheet without gradients or shadows', () => {
    expect(mainSource).toContain("import './scenario-build-readiness.css'");
    expect(css).toContain('.scenario-build-readiness');
    expect(css).toContain('.scenario-build-slot-list');
    expect(css).toContain('@media(max-width:560px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
