import { describe, expect, it } from 'vitest';
import {
  GAME_VISIBLE_BUILD_VERSION,
  createEmptyGameVisibleBuild,
  type GameVisibleTeamState,
} from './game-visible-build';
import {
  compileVerifiedActionScenario,
  compileVerifiedRotationFragment,
  validateVerifiedActionScenarioRecipes,
  verifiedActionScenarioCoverage,
  verifiedActionScenarioRecipeId,
  verifiedActionScenarioRecipes,
  verifiedActionTimingConstraints,
  verifiedRotationFragments,
} from './verified-action-scenario-recipes';
import { verifiedVisibleActions } from './verified-visible-actions';

function teamWith(characterName: string): GameVisibleTeamState {
  return {
    version: GAME_VISIBLE_BUILD_VERSION,
    activeSlot: 0,
    duration: 30,
    builds: [
      createEmptyGameVisibleBuild(characterName),
      createEmptyGameVisibleBuild('Shinku'),
      createEmptyGameVisibleBuild('Zero'),
      createEmptyGameVisibleBuild('Nanally'),
    ],
    target: {
      level: 70,
      resistance: 0,
      defenceReduction: 0,
      resistanceReduction: 0,
      boss: false,
    },
  };
}

describe('verified action scenario recipes', () => {
  it('covers all 86 verified actions exactly once across all 20 released characters', () => {
    expect(verifiedVisibleActions).toHaveLength(86);
    expect(verifiedActionScenarioRecipes).toHaveLength(86);
    expect(verifiedActionScenarioCoverage).toMatchObject({
      verifiedActionCount: 86,
      standaloneRecipeCount: 86,
      representedCharacterCount: 20,
      automaticRepeatCount: 0,
    });

    const recipeActionIds = verifiedActionScenarioRecipes.map((recipe) => recipe.actionId);
    expect(new Set(recipeActionIds).size).toBe(86);
    expect(new Set(recipeActionIds)).toEqual(new Set(verifiedVisibleActions.map((action) => action.id)));
    expect(validateVerifiedActionScenarioRecipes()).toEqual([]);
  });

  it('never stores an inferred automatic repeat count on standalone recipes', () => {
    expect(verifiedActionScenarioRecipes.every((recipe) => recipe.occurrencePolicy === 'one-record-once')).toBe(true);
    expect(verifiedActionScenarioRecipes.some((recipe) => 'repeatCount' in recipe)).toBe(false);
    expect(verifiedActionScenarioCoverage.automaticRepeatCount).toBe(0);
  });

  it('compiles every standalone recipe into one v1 action step when its character is present', () => {
    for (const recipe of verifiedActionScenarioRecipes) {
      const compiled = compileVerifiedActionScenario(recipe.id, teamWith(recipe.characterName), 'en');
      expect(compiled.ok, recipe.id).toBe(true);
      if (!compiled.ok) continue;
      expect(compiled.sourceSlot).toBe(0);
      expect(compiled.scenario.version).toBe(1);
      expect(compiled.scenario.steps).toHaveLength(1);
      expect(compiled.scenario.steps[0]).toMatchObject({
        kind: 'action',
        sourceSlot: 0,
        actionId: recipe.actionId,
        effectId: '',
        cycleId: '',
      });
    }
  });

  it('uses only directly sourced timing constraints', () => {
    expect(Object.keys(verifiedActionTimingConstraints).sort()).toEqual([
      'chaos.remora-enhancement.base-five-seconds',
      'chaos.remora-enhancement.maximum-twelve-seconds',
      'jiuyuan.know-every-secret.awakening-six',
    ]);
    expect(verifiedActionScenarioCoverage.explicitRelativeTimingCount).toBe(2);
    expect(verifiedActionScenarioCoverage.explicitMinimumSpacingCount).toBe(1);

    const base = compileVerifiedActionScenario(
      verifiedActionScenarioRecipeId('chaos.remora-enhancement.base-five-seconds'),
      teamWith('Chaos'),
      'ru',
    );
    const maximum = compileVerifiedActionScenario(
      verifiedActionScenarioRecipeId('chaos.remora-enhancement.maximum-twelve-seconds'),
      teamWith('Chaos'),
      'ru',
    );
    const jiuyuan = compileVerifiedActionScenario(
      verifiedActionScenarioRecipeId('jiuyuan.know-every-secret.awakening-six'),
      teamWith('Jiuyuan'),
      'ru',
    );

    expect(base.ok && base.scenario.steps[0]?.at).toBe(5);
    expect(maximum.ok && maximum.scenario.steps[0]?.at).toBe(12);
    expect(jiuyuan.ok && jiuyuan.scenario.steps).toHaveLength(1);
    expect(jiuyuan.ok && jiuyuan.scenario.steps[0]?.at).toBe(0);
    expect(jiuyuan.ok && jiuyuan.scenario.steps[0]?.note).toContain('Автоматический повтор не добавлен');
  });

  it('blocks a missing character without changing the current team', () => {
    const team = teamWith('Shinku');
    const before = JSON.stringify(team);
    const compiled = compileVerifiedActionScenario(
      verifiedActionScenarioRecipeId('adler.pristine-reflection.level-10'),
      team,
      'ru',
    );

    expect(compiled.ok).toBe(false);
    expect(compiled.ok ? '' : compiled.reason.ru).toContain('Состав не был изменён');
    expect(JSON.stringify(team)).toBe(before);
  });

  it('keeps the sourced Hathor fragment order-only with no invented seconds', () => {
    expect(verifiedRotationFragments).toHaveLength(1);
    expect(verifiedActionScenarioCoverage.rotationFragmentActionCount).toBe(4);

    const compiled = compileVerifiedRotationFragment(
      'hathor.emergency-delivery-burst.level-10',
      teamWith('Hathor'),
      'en',
    );
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    expect(compiled.scenario.steps.map((step) => step.actionId)).toEqual([
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ]);
    expect(compiled.scenario.steps.every((step) => step.at === 0)).toBe(true);
    expect(compiled.scenario.steps.every((step) => step.note.includes('Seconds are not verified'))).toBe(true);
  });
});
