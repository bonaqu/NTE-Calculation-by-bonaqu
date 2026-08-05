/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/ScenarioPortablePackagePanel.tsx?raw';
import readinessSource from './components/ScenarioBuildReadinessPanel.tsx?raw';
import mainSource from './main.tsx?raw';
import domainSource from './scenario-portable-package.ts?raw';

const css = readFileSync(new URL('./scenario-portable-package.css', import.meta.url), 'utf8');

describe('portable Combat Scenario package UI contract', () => {
  it('places transfer before scenario readiness without replacing readiness logic', () => {
    expect(readinessSource).toContain('ScenarioPortablePackagePanel');
    expect(readinessSource).toContain('<ScenarioPortablePackagePanel team={team} scenario={scenario} locale={locale} />');
    expect(readinessSource.indexOf('ScenarioPortablePackagePanel')).toBeLessThan(readinessSource.indexOf('scenario-build-readiness'));
    expect(readinessSource).toContain('evaluateScenarioBuildReadiness');
  });

  it('requires parse preview before applying all three existing workspace records', () => {
    expect(panelSource).toContain('parseScenarioPortablePackage');
    expect(panelSource).toContain('applyScenarioPortablePackage');
    expect(panelSource).toContain('setStoredTeam(applied.team)');
    expect(panelSource).toContain('setStoredScenario(applied.scenario)');
    expect(panelSource).toContain('setRotation(applied.rotation)');
    expect(panelSource).toContain('Применить проверенный пакет');
  });

  it('makes sanitized builds optional and warns about unsupported rows', () => {
    expect(panelSource).toContain('Включить очищенные сборки');
    expect(panelSource).toContain('blockedModelRows');
    expect(panelSource).toContain('сохранятся видимыми и заблокированными');
    expect(domainSource).toContain("'lineup-only'");
    expect(domainSource).toContain("'sanitized-builds'");
  });

  it('loads a responsive border-led interface without gradients or shadows', () => {
    expect(mainSource).toContain("import './scenario-portable-package.css'");
    expect(css).toContain('.scenario-portable-package');
    expect(css).toContain('.scenario-portable-preview');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
