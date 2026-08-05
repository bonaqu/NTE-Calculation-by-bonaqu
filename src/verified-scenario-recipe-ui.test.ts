/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates CSS source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/VerifiedScenarioRecipePanel.tsx?raw';
import compositionSource from './components/TeamCombatScenarioPanel.ts?raw';
import calculatorSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import {
  verifiedActionScenarioRecipes,
  verifiedRotationFragments,
} from './verified-action-scenario-recipes';

const styles = readFileSync(new URL('./verified-scenario-recipes.css', import.meta.url), 'utf8');

describe('verified scenario recipe UI', () => {
  it('keeps the complete recipe catalog and verified fragments available to the picker', () => {
    expect(verifiedActionScenarioRecipes).toHaveLength(86);
    expect(new Set(verifiedActionScenarioRecipes.map((recipe) => recipe.characterName)).size).toBe(20);
    expect(verifiedRotationFragments).toHaveLength(1);
    expect(panelSource).toContain('verifiedActionScenarioRecipes.filter');
    expect(panelSource).toContain('verifiedRotationFragments.filter');
    expect(panelSource).toContain('teamNames.has(recipe.characterName)');
    expect(panelSource).toContain('teamNames.has(fragment.characterName)');
  });

  it('applies only existing v1 scenario state and detaches Rotation Lab provenance', () => {
    expect(panelSource).toContain('compileVerifiedActionScenario');
    expect(panelSource).toContain('compileVerifiedRotationFragment');
    expect(panelSource).toContain('setScenario((current) =>');
    expect(panelSource).toContain('setImportMetadata(initialRotationScenarioImportMetadata())');
    expect(panelSource).not.toContain('setStoredTeam');
    expect(panelSource).not.toContain('createEmptyGameVisibleBuild');
  });

  it('requires replacement confirmation and explains non-inferred timing in both locales', () => {
    expect(panelSource).toContain('window.confirm');
    expect(panelSource).toContain('Состав и сборки не изменятся');
    expect(panelSource).toContain('The lineup and builds will not change');
    expect(panelSource).toContain('повторения и секунды не появляются без прямого источника');
    expect(panelSource).toContain('repeats and seconds appear only with direct evidence');
    expect(panelSource).toContain('это не посекундный таймлайн');
    expect(panelSource).toContain('this is not a second-by-second timeline');
  });

  it('shows action requirements, scaling, source provenance and order-only fragments', () => {
    expect(panelSource).toContain('requiredSkillLabel');
    expect(panelSource).toContain('scalingLabel');
    expect(panelSource).toContain('timingLabel');
    expect(panelSource).toContain('selectedAction.sourceUpdatedAt');
    expect(panelSource).toContain('selectedFragment.evidence.sourceUpdatedAt');
    expect(panelSource).toContain('Источник действия');
    expect(panelSource).toContain('Источник порядка');
  });

  it('composes the recipe picker before the existing manual scenario editor', () => {
    expect(calculatorSource).toContain("from '../components/TeamCombatScenarioPanel'");
    expect(compositionSource.indexOf('createElement(VerifiedScenarioRecipePanel')).toBeGreaterThan(-1);
    expect(compositionSource.indexOf('createElement(ManualTeamCombatScenarioPanel')).toBeGreaterThan(
      compositionSource.indexOf('createElement(VerifiedScenarioRecipePanel'),
    );
  });

  it('uses a border-led responsive layout without gradients or shadows', () => {
    expect(styles).toContain('.verified-scenario-recipes__grid');
    expect(styles).toContain('@media (max-width: 900px)');
    expect(styles).toContain('@media (max-width: 560px)');
    expect(styles).toContain('border-radius: 0');
    expect(styles).not.toMatch(/gradient/iu);
    expect(styles).not.toMatch(/box-shadow/iu);
  });
});
