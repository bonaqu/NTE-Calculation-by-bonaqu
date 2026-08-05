/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import domainSource from './build-profiles.ts?raw';
import managerSource from './components/BuildProfileManager.tsx?raw';
import scenarioSource from './components/ManualTeamCombatScenarioEditor.tsx?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./build-profiles.css', import.meta.url), 'utf8');

describe('build profile product contract', () => {
  it('integrates profiles after Rotation Lab import and before scenario totals', () => {
    expect(scenarioSource).toContain("import { BuildProfileManager }");
    expect(scenarioSource).toContain('<BuildProfileManager team={team} locale={locale} />');
    expect(scenarioSource.indexOf('<BuildProfileManager')).toBeGreaterThan(scenarioSource.indexOf('rotation-scenario-timing'));
    expect(scenarioSource.indexOf('<BuildProfileManager')).toBeLessThan(scenarioSource.indexOf('combat-scenario-summary'));
  });

  it('uses a versioned local library and current shared team storage', () => {
    expect(domainSource).toContain("BUILD_PROFILE_LIBRARY_STORAGE_KEY = 'nte.build-profiles.v1'");
    expect(domainSource).toContain('BUILD_PROFILE_LIBRARY_VERSION = 1');
    expect(domainSource).toContain('BUILD_PROFILE_MAX_COUNT = 50');
    expect(managerSource).toContain('GAME_VISIBLE_TEAM_STORAGE_KEY');
    expect(managerSource).toContain('{ normalize: normalizeBuildProfileLibrary }');
    expect(managerSource).toContain('{ normalize: normalizeGameVisibleTeamState }');
  });

  it('never transfers temporary combat state into a profile', () => {
    expect(domainSource).toContain('activeTeamEffectIds: []');
    expect(domainSource).toContain('afterUltimateActive: false');
    expect(domainSource).toContain("testMode: 'neutral-reference'");
    expect(domainSource).toContain("verifiedActionId: ''");
    expect(managerSource).toContain('Активные эффекты, цель и временные окна не переносятся');
    expect(managerSource).not.toContain('target:');
  });

  it('exposes explicit CRUD and checksummed JSON transfer controls', () => {
    expect(managerSource).toContain('Сохранить активную сборку');
    expect(managerSource).toContain('Применить');
    expect(managerSource).toContain('Обновить');
    expect(managerSource).toContain('Переименовать');
    expect(managerSource).toContain('Экспорт');
    expect(managerSource).toContain('Удалить');
    expect(managerSource).toContain('Проверить и импортировать');
    expect(domainSource).toContain('profileChecksum');
    expect(domainSource).toContain("error: 'checksum-mismatch'");
    expect(domainSource).toContain('canonicalProfileJson');
  });

  it('degrades clipboard export without losing the visible JSON', () => {
    expect(managerSource).toContain('setTransferText(text)');
    expect(managerSource).toContain('const write = navigator.clipboard?.writeText(text)');
    expect(managerSource).toContain('if (!write)');
    expect(managerSource).toContain('JSON подготовлен в поле ниже');
  });

  it('loads a responsive border-led UI without gradients or shadows', () => {
    expect(mainSource).toContain("import './build-profiles.css'");
    expect(css).toContain('.build-profile-manager');
    expect(css).toContain('.build-profile-list');
    expect(css).toContain('.build-profile-transfer');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
