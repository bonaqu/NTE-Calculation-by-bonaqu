/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates CSS source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/VerifiedScenarioRecipePanel.tsx?raw';
import compositionSource from './components/TeamCombatScenarioPanel.tsx?raw';
import manualEditorSource from './components/ManualTeamCombatScenarioEditor.tsx?raw';
import calculatorSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import {
  verifiedActionScenarioRecipes,
  verifiedRotationFragments,
} from './verified-action-scenario-recipes';
import { verifiedRotationRecipes } from './verified-rotation-recipes';

const styles = readFileSync(new URL('./verified-scenario-recipes.css', import.meta.url), 'utf8');

describe('verified scenario recipe UI', () => {
  it('keeps standalone actions, exact fragments and audited rotation recipes separate', () => {
    expect(verifiedActionScenarioRecipes).toHaveLength(100);
    expect(new Set(verifiedActionScenarioRecipes.map((recipe) => recipe.characterName)).size).toBe(20);
    expect(verifiedRotationFragments).toHaveLength(1);
    expect(verifiedRotationRecipes).toHaveLength(6);
    expect(panelSource).toContain('const verifiedActionCount = verifiedActionScenarioRecipes.length');
    expect(panelSource).toContain('`${verifiedActionCount} ДЕЙСТВИЙ + АУДИТ ROTATION LAB`');
    expect(panelSource).toContain('{availableRecipes.length} / {verifiedActionCount}');
    expect(panelSource).toContain('verifiedActionScenarioRecipes.filter');
    expect(panelSource).toContain('verifiedRotationFragments.filter');
    expect(panelSource).toContain('verifiedRotationRecipes.filter');
    expect(panelSource).toContain('teamNames.has(recipe.characterName)');
    expect(panelSource).toContain('recipe.team.every((characterName) => teamNames.has(characterName))');
  });

  it('uses the existing v1 scenario state and handles provenance by recipe source', () => {
    expect(panelSource).toContain('compileVerifiedActionScenario');
    expect(panelSource).toContain('compileVerifiedRotationFragment');
    expect(panelSource).toContain('compileVerifiedRotationRecipe');
    expect(panelSource).toContain('setScenario((current) =>');
    expect(panelSource).toContain('setImportMetadata(initialRotationScenarioImportMetadata())');
    expect(panelSource).toContain('setImportMetadata(compiled.metadata)');
    expect(panelSource).toContain('provenance Rotation Lab сохранён');
    expect(panelSource).not.toContain('setStoredTeam');
    expect(panelSource).not.toContain('createEmptyGameVisibleBuild');
  });

  it('requires replacement confirmation and explains non-inferred timing in both locales', () => {
    expect(panelSource).toContain('window.confirm');
    expect(panelSource).toContain('Состав и сборки не изменятся');
    expect(panelSource).toContain('The lineup and builds will not change');
    expect(panelSource).toContain('Повторения, эффекты, циклы и секунды появляются только при прямом подтверждении');
    expect(panelSource).toContain('Repeats, effects, Cycles and seconds appear only with direct evidence');
    expect(panelSource).toContain('это не посекундный таймлайн');
    expect(panelSource).toContain('this is not a second-by-second timeline');
    expect(panelSource).toContain('Только порядок · секунды не подтверждены');
  });

  it('shows action requirements, recipe coverage, gaps and source provenance', () => {
    expect(panelSource).toContain('requiredSkillLabel');
    expect(panelSource).toContain('scalingLabel');
    expect(panelSource).toContain('timingLabel');
    expect(panelSource).toContain('rotationCoverageLabel');
    expect(panelSource).toContain('rotationTimingLabel');
    expect(panelSource).toContain('selectedAction.sourceUpdatedAt');
    expect(panelSource).toContain('selectedFragment.evidence.sourceUpdatedAt');
    expect(panelSource).toContain('selectedRotationRecipe.gaps.length');
    expect(panelSource).toContain('Что не вошло');
    expect(panelSource).toContain('Источник действия');
    expect(panelSource).toContain('Источник порядка');
    expect(panelSource).toContain('Источник ротации');
    expect(panelSource).toContain('verifiedRotationRecipes.length');
  });

  it('composes recipes, the gap audit and manual editor through one canonical TSX entry', () => {
    expect(calculatorSource).toContain("from '../components/TeamCombatScenarioPanel'");
    expect(compositionSource).toContain("from './ManualTeamCombatScenarioEditor'");
    expect(compositionSource).toContain("from './RotationGapAuditPanel'");
    const recipesAt = compositionSource.indexOf('<VerifiedScenarioRecipePanel {...props} />');
    const auditAt = compositionSource.indexOf('<RotationGapAuditPanel {...props} />');
    const manualAt = compositionSource.indexOf('<ManualTeamCombatScenarioEditor {...props} />');
    expect(recipesAt).toBeGreaterThan(-1);
    expect(auditAt).toBeGreaterThan(recipesAt);
    expect(manualAt).toBeGreaterThan(auditAt);
    expect(compositionSource).not.toContain('createElement');
    expect(compositionSource).not.toContain('@ts-ignore');
    expect(compositionSource).not.toMatch(/\.tsx['"]/u);
    expect(manualEditorSource).toContain('export function TeamCombatScenarioPanel');
  });

  it('uses a border-led responsive layout without gradients or shadows', () => {
    expect(styles).toContain('.verified-scenario-recipes__grid');
    expect(styles).toContain('.verified-scenario-recipes__gaps');
    expect(styles).toContain('@media (max-width: 900px)');
    expect(styles).toContain('@media (max-width: 560px)');
    expect(styles).toContain('border-radius: 0');
    expect(styles).not.toMatch(/gradient/iu);
    expect(styles).not.toMatch(/box-shadow/iu);
  });
});
