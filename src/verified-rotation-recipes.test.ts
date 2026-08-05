import { describe, expect, it } from 'vitest';
import {
  GAME_VISIBLE_BUILD_VERSION,
  createEmptyGameVisibleBuild,
  type GameVisibleTeamState,
} from './game-visible-build';
import {
  compileVerifiedRotationRecipe,
  rotationConfirmedSecondEvidence,
  rotationPresetRecipeAuditById,
  rotationRepeatEvidence,
  validateVerifiedRotationRecipes,
  verifiedRotationRecipeCoverage,
  verifiedRotationRecipes,
} from './verified-rotation-recipes';

function teamWith(names: readonly string[]): GameVisibleTeamState {
  return {
    version: GAME_VISIBLE_BUILD_VERSION,
    activeSlot: 0,
    duration: 30,
    builds: names.map((name) => createEmptyGameVisibleBuild(name)),
    target: {
      level: 70,
      resistance: 0,
      defenceReduction: 0,
      resistanceReduction: 0,
      boss: false,
    },
  };
}

describe('verified Rotation Lab recipes', () => {
  it('audits every preset and every current exact binding', () => {
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      presetCount: 6,
      bindingCount: 17,
      totalSourceStepCount: 58,
      fullyBoundSourceStepCount: 3,
      partiallyBoundSourceStepCount: 14,
      unsupportedSourceStepCount: 41,
      boundActionStepCount: 22,
      promotedRecipeCount: 4,
      promotedActionStepCount: 20,
      completeActionOrderRecipeCount: 0,
      partialActionOrderRecipeCount: 4,
      orderOnlyRecipeCount: 4,
      confirmedSecondRecipeCount: 0,
      fixedRepeatEvidenceCount: 10,
      conditionBoundRepeatEvidenceCount: 2,
    });
    expect(validateVerifiedRotationRecipes()).toEqual([]);
  });

  it('keeps per-preset coverage honest', () => {
    expect(rotationPresetRecipeAuditById.get('shinku-charge')).toMatchObject({
      totalSourceSteps: 8,
      fullyBoundSourceSteps: 0,
      partiallyBoundSourceSteps: 1,
      unsupportedSourceSteps: 7,
      exactActionSourceSteps: 0,
      partialActionSourceSteps: 1,
      verifiedActionSteps: 1,
      omittedEffectConditions: 1,
      omittedCycleConditions: 0,
      promotedRecipeId: null,
    });
    expect(rotationPresetRecipeAuditById.get('hathor-hyper')).toMatchObject({
      totalSourceSteps: 11,
      fullyBoundSourceSteps: 1,
      partiallyBoundSourceSteps: 3,
      unsupportedSourceSteps: 7,
      exactActionSourceSteps: 1,
      partialActionSourceSteps: 1,
      verifiedActionSteps: 6,
      omittedEffectConditions: 2,
      omittedCycleConditions: 1,
      promotedCoverage: 'partial-action-order',
      promotedTimingMode: 'order-only',
    });
    expect(rotationPresetRecipeAuditById.get('chaos-remora-bomb')).toMatchObject({
      totalSourceSteps: 9,
      fullyBoundSourceSteps: 0,
      partiallyBoundSourceSteps: 3,
      unsupportedSourceSteps: 6,
      verifiedActionSteps: 3,
      omittedEffectConditions: 1,
      omittedCycleConditions: 1,
      promotedCoverage: 'partial-action-order',
    });
    expect(rotationPresetRecipeAuditById.get('nanally-hexed-dual')).toMatchObject({
      totalSourceSteps: 9,
      fullyBoundSourceSteps: 0,
      partiallyBoundSourceSteps: 1,
      unsupportedSourceSteps: 8,
      verifiedActionSteps: 1,
      omittedEffectConditions: 2,
      promotedRecipeId: null,
    });
    expect(rotationPresetRecipeAuditById.get('lacrimosa-discord-dot')).toMatchObject({
      totalSourceSteps: 11,
      fullyBoundSourceSteps: 0,
      partiallyBoundSourceSteps: 3,
      unsupportedSourceSteps: 8,
      verifiedActionSteps: 5,
      omittedEffectConditions: 3,
      promotedCoverage: 'partial-action-order',
    });
    expect(rotationPresetRecipeAuditById.get('baicang-firefly-hyper')).toMatchObject({
      totalSourceSteps: 10,
      fullyBoundSourceSteps: 2,
      partiallyBoundSourceSteps: 3,
      unsupportedSourceSteps: 5,
      exactActionSourceSteps: 2,
      partialActionSourceSteps: 3,
      verifiedActionSteps: 6,
      omittedEffectConditions: 2,
      promotedCoverage: 'partial-action-order',
    });
  });

  it('promotes only multi-action presets and preserves exact action order', () => {
    expect(verifiedRotationRecipes.map((recipe) => recipe.presetId)).toEqual([
      'hathor-hyper',
      'chaos-remora-bomb',
      'lacrimosa-discord-dot',
      'baicang-firefly-hyper',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'hathor-hyper')?.steps.map((step) => step.actionId)).toEqual([
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'chaos-remora-bomb')?.steps.map((step) => step.actionId)).toEqual([
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
      'hathor.rider-express.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'lacrimosa-discord-dot')?.steps.map((step) => step.actionId)).toEqual([
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
      'sakiri.feast-of-gluttony.level-10',
      'daffodill.finale.initial-composition.level-10',
      'daffodill.echoes.enhanced-sequence.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'baicang-firefly-hyper')?.steps.map((step) => step.actionId)).toEqual([
      'sakiri.feast-of-gluttony.level-10',
      'daffodill.finale.initial-composition.level-10',
      'daffodill.echoes.enhanced-sequence.level-10',
      'baicang.judgment-of-autumn.expansion.level-10',
      'baicang.heart-of-heaven-and-earth.level-10',
      'baicang.silenced-thought.full-composition.level-10',
    ]);
    expect(verifiedRotationRecipes.every((recipe) => recipe.gaps.length > 0)).toBe(true);
  });

  it('records sourced repetition without inventing missing action IDs or counts', () => {
    const hathorRepeat = rotationRepeatEvidence.find((entry) => entry.presetId === 'hathor-hyper');
    expect(hathorRepeat).toMatchObject({ kind: 'fixed-count', count: 3 });
    expect(hathorRepeat?.promotedActionIds).toEqual([
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ]);
    expect(rotationRepeatEvidence.filter((entry) => entry.kind === 'condition-bound')).toHaveLength(2);
    expect(rotationRepeatEvidence.filter((entry) => entry.kind === 'condition-bound').every((entry) => entry.count === null)).toBe(true);
    expect(rotationConfirmedSecondEvidence).toEqual([]);
  });

  it('compiles every recipe into order-only v1 actions with Rotation Lab provenance', () => {
    for (const recipe of verifiedRotationRecipes) {
      const compiled = compileVerifiedRotationRecipe(recipe.id, teamWith(recipe.team), 'ru');
      expect(compiled.ok, recipe.id).toBe(true);
      if (!compiled.ok) continue;
      expect(compiled.scenario.version).toBe(1);
      expect(compiled.scenario.steps).toHaveLength(recipe.steps.length);
      expect(compiled.scenario.steps.every((step) => step.kind === 'action')).toBe(true);
      expect(compiled.scenario.steps.every((step) => step.at === 0)).toBe(true);
      expect(compiled.scenario.steps.map((step) => step.actionId)).toEqual(recipe.steps.map((step) => step.actionId));
      expect(compiled.metadata.sourceRotationId).toBe(recipe.presetId);
      expect(compiled.metadata.timingStatus).toBe('order-only');
      expect(compiled.metadata.report).not.toBeNull();
      expect(compiled.metadata.pendingByStepId).toEqual({});
      expect(Object.keys(compiled.metadata.originsByStepId)).toHaveLength(recipe.steps.length);
    }
  });

  it('requires the complete source lineup and never mutates the current team', () => {
    const recipe = verifiedRotationRecipes.find((entry) => entry.presetId === 'hathor-hyper')!;
    const team = teamWith(['Hathor', 'Jiuyuan', 'Zero', 'Shinku']);
    const before = JSON.stringify(team);
    const compiled = compileVerifiedRotationRecipe(recipe.id, team, 'ru');
    expect(compiled.ok).toBe(false);
    if (compiled.ok) return;
    expect(compiled.missingCharacters).toEqual(['Haniel']);
    expect(compiled.reason.ru).toContain('Состав не был изменён');
    expect(JSON.stringify(team)).toBe(before);
  });
});
