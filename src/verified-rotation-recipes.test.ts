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
      bindingCount: 53,
      totalSourceStepCount: 58,
      fullyBoundSourceStepCount: 20,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 5,
      boundActionStepCount: 63,
      promotedRecipeCount: 6,
      promotedActionStepCount: 63,
      completeActionOrderRecipeCount: 0,
      partialActionOrderRecipeCount: 6,
      orderOnlyRecipeCount: 6,
      confirmedSecondRecipeCount: 0,
      fixedRepeatEvidenceCount: 10,
      conditionBoundRepeatEvidenceCount: 2,
    });
    expect(validateVerifiedRotationRecipes()).toEqual([]);
  });

  it('keeps per-preset coverage honest', () => {
    expect(rotationPresetRecipeAuditById.get('shinku-charge')).toMatchObject({
      totalSourceSteps: 8,
      fullyBoundSourceSteps: 1,
      partiallyBoundSourceSteps: 7,
      unsupportedSourceSteps: 0,
      exactActionSourceSteps: 1,
      partialActionSourceSteps: 7,
      verifiedActionSteps: 18,
      omittedEffectConditions: 2,
      omittedCycleConditions: 0,
      omittedOperationMarkers: 0,
      promotedRecipeId: 'rotation-lab.shinku-charge.verified-actions',
      promotedCoverage: 'partial-action-order',
      promotedTimingMode: 'order-only',
    });
    expect(rotationPresetRecipeAuditById.get('hathor-hyper')).toMatchObject({
      totalSourceSteps: 11,
      fullyBoundSourceSteps: 4,
      partiallyBoundSourceSteps: 7,
      unsupportedSourceSteps: 0,
      exactActionSourceSteps: 1,
      partialActionSourceSteps: 4,
      verifiedActionSteps: 10,
      omittedEffectConditions: 2,
      omittedCycleConditions: 2,
      omittedOperationMarkers: 3,
      promotedCoverage: 'partial-action-order',
      promotedTimingMode: 'order-only',
    });
    expect(rotationPresetRecipeAuditById.get('chaos-remora-bomb')).toMatchObject({
      totalSourceSteps: 9,
      fullyBoundSourceSteps: 3,
      partiallyBoundSourceSteps: 6,
      unsupportedSourceSteps: 0,
      verifiedActionSteps: 9,
      omittedEffectConditions: 1,
      omittedCycleConditions: 1,
      omittedOperationMarkers: 1,
      promotedCoverage: 'partial-action-order',
    });
    expect(rotationPresetRecipeAuditById.get('nanally-hexed-dual')).toMatchObject({
      totalSourceSteps: 9,
      fullyBoundSourceSteps: 4,
      partiallyBoundSourceSteps: 5,
      unsupportedSourceSteps: 0,
      verifiedActionSteps: 11,
      omittedEffectConditions: 3,
      omittedOperationMarkers: 2,
      promotedRecipeId: 'rotation-lab.nanally-hexed-dual.verified-actions',
    });
    expect(rotationPresetRecipeAuditById.get('lacrimosa-discord-dot')).toMatchObject({
      totalSourceSteps: 11,
      fullyBoundSourceSteps: 3,
      partiallyBoundSourceSteps: 5,
      unsupportedSourceSteps: 3,
      verifiedActionSteps: 7,
      omittedEffectConditions: 3,
      omittedCycleConditions: 2,
      omittedOperationMarkers: 1,
      promotedCoverage: 'partial-action-order',
    });
    expect(rotationPresetRecipeAuditById.get('baicang-firefly-hyper')).toMatchObject({
      totalSourceSteps: 10,
      fullyBoundSourceSteps: 5,
      partiallyBoundSourceSteps: 3,
      unsupportedSourceSteps: 2,
      exactActionSourceSteps: 4,
      partialActionSourceSteps: 3,
      verifiedActionSteps: 8,
      omittedEffectConditions: 2,
      omittedOperationMarkers: 1,
      promotedCoverage: 'partial-action-order',
    });
  });

  it('promotes only multi-action presets and preserves exact action order', () => {
    expect(verifiedRotationRecipes.map((recipe) => recipe.presetId)).toEqual([
      'shinku-charge',
      'hathor-hyper',
      'chaos-remora-bomb',
      'nanally-hexed-dual',
      'lacrimosa-discord-dot',
      'baicang-firefly-hyper',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'shinku-charge')?.steps.map((step) => step.actionId)).toEqual([
      'shinku.high-speed-breach.level-10',
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'zero.divide-by-zero.level-10',
      'zero.appraise-and-engrave.main.level-10',
      'nanally.colucci-ultimate-technique.initial.level-10',
      'nanally.colucci-howling-technique.level-10',
      'shinku.crimson-fury.level-10',
      'shinku.scarlet-descent.level-10',
      'shinku.scarlet-descent.level-10',
      'shinku.scarlet-descent.level-10',
      'shinku.scarlet-descent.level-10',
      'shinku.scarlet-descent.level-10',
      'shinku.crimson-judgment.one-dash.level-10',
      'shinku.crimson-judgment.one-dash.level-10',
      'shinku.crimson-judgment.one-dash.level-10',
      'shinku.dragonflame-verdict.level-10',
      'shinku.high-speed-breach.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'shinku-charge')?.gaps).toHaveLength(9);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'hathor-hyper')?.steps.map((step) => step.actionId)).toEqual([
      'jiuyuan.final-reckoning.direct.level-10',
      'jiuyuan.intel-hunter.direct.level-10',
      'zero.divide-by-zero.level-10',
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
      'zero.appraise-and-engrave.main.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'chaos-remora-bomb')?.steps.map((step) => step.actionId)).toEqual([
      'hathor.aerial-command.full-hold.level-10',
      'zero.divide-by-zero.level-10',
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
      'chaos.doubtmark.full-sequence.level-10',
      'chaos.retribution.initial.level-10',
      'chaos.final-verdict.enhanced.level-10',
      'chaos.final-verdict.enhanced.level-10',
      'hathor.rider-express.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([
      'zero.appraise-and-engrave.main.level-10',
      'zero.divide-by-zero.level-10',
      'sakiri.feast-of-gluttony.level-10',
      'jiuyuan.final-reckoning.direct.level-10',
      'jiuyuan.intel-hunter.direct.level-10',
      'nanally.colucci-howling-technique.level-10',
      'nanally.colucci-ultimate-technique.initial.level-10',
      'nanally.colucci-secret-skill.full-sequence.level-10',
      'nanally.underboss.basic-coordinated-full-sequence.level-10',
      'nanally.heavy-hitter.full-sequence.level-10',
      'nanally.underboss.heavy-coordinated-full-sequence.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'lacrimosa-discord-dot')?.steps.map((step) => step.actionId)).toEqual([
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
      'sakiri.feast-of-gluttony.level-10',
      'daffodill.finale.initial-composition.level-10',
      'daffodill.echoes.enhanced-sequence.level-10',
      'daffodill.phantom-step.level-10',
      'daffodill.phantom-step.level-10',
    ]);
    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'baicang-firefly-hyper')?.steps.map((step) => step.actionId)).toEqual([
      'sakiri.feast-of-gluttony.level-10',
      'daffodill.finale.initial-composition.level-10',
      'daffodill.echoes.enhanced-sequence.level-10',
      'baicang.judgment-of-autumn.expansion.level-10',
      'baicang.heart-of-heaven-and-earth.level-10',
      'daffodill.phantom-step.level-10',
      'baicang.silenced-thought.full-composition.level-10',
      'daffodill.phantom-step.level-10',
    ]);
    expect(verifiedRotationRecipes.every((recipe) => recipe.gaps.length > 0)).toBe(true);
  });

  it('records sourced repetition without inventing missing action IDs or counts', () => {
    const shinkuSkills = rotationRepeatEvidence.find((entry) => entry.presetId === 'shinku-charge' && entry.count === 5);
    const shinkuDashes = rotationRepeatEvidence.find((entry) => entry.presetId === 'shinku-charge' && entry.count === 3);
    expect(shinkuSkills).toMatchObject({ kind: 'fixed-count', count: 5 });
    expect(shinkuDashes).toMatchObject({ kind: 'fixed-count', count: 3 });
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
