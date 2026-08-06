import { describe, expect, it } from 'vitest';
import { createEmptyGameVisibleBuild, initialGameVisibleTeamState } from './game-visible-build';
import { calculateGameVisibleTeam } from './game-visible-calculation';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { deriveVerifiedTeamEffects, verifiedTeamEffects } from './team-effects';
import { verifiedRotationRecipeById, verifiedRotationRecipeCoverage, validateVerifiedRotationRecipes } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchH } from './verified-visible-actions-batch-h';
import { verifiedVisibleActionsBatchI } from './verified-visible-actions-batch-i';
import { verifiedVisibleActions } from './verified-visible-actions';

const byChaosId = new Map(verifiedVisibleActionsBatchI.map((action) => [action.id, action]));

describe('Nanally completion and Chaos exact action integration', () => {
  it('publishes 107 unique actions and exact Chaos arithmetic', () => {
    expect(verifiedVisibleActions).toHaveLength(112);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(112);
    expect(verifiedVisibleActionsBatchH).toHaveLength(6);
    expect(verifiedVisibleActionsBatchI).toHaveLength(3);
    expect(byChaosId.get('chaos.doubtmark.full-sequence.level-10')?.multiplier).toBeCloseTo(599.7, 8);
    expect(byChaosId.get('chaos.retribution.initial.level-10')?.multiplier).toBeCloseTo(1599.5, 8);
    expect(byChaosId.get('chaos.final-verdict.enhanced.level-10')?.multiplier).toBeCloseTo(1829, 8);
    expect(verifiedVisibleActionsBatchI.some((action) => action.id.includes('remora-enhancement'))).toBe(false);
  });

  it('applies Authority CRIT DMG only to Nanally without changing non-critical damage', () => {
    const state = initialGameVisibleTeamState();
    state.builds = ['Nanally', 'Jiuyuan', 'Zero', 'Sakiri'].map((name) => ({
      ...createEmptyGameVisibleBuild(name),
      level: 80,
      maxLevel: 80,
      stats: { ...createEmptyGameVisibleBuild(name).stats, atk: 1000, critRate: 50, critDamage: 100 },
    }));
    const baseline = calculateGameVisibleTeam(state);
    state.builds[0] = { ...state.builds[0]!, activeTeamEffectIds: ['nanally.ichi-daime-authority.crit-dmg'] };
    const enabled = calculateGameVisibleTeam(state);
    const derived = deriveVerifiedTeamEffects(state);
    expect(verifiedTeamEffects).toHaveLength(6);
    expect(derived.slotModifiers.map((modifier) => modifier.critDamage ?? 0)).toEqual([30, 0, 0, 0]);
    expect(enabled.rows[0]?.result?.nonCrit).toBe(baseline.rows[0]?.result?.nonCrit);
    expect(enabled.rows[0]?.result?.crit).toBeGreaterThan(baseline.rows[0]?.result?.crit ?? 0);
    expect(enabled.rows.slice(1).map((row) => row.result?.expected)).toEqual(baseline.rows.slice(1).map((row) => row.result?.expected));
  });

  it('binds Nanally direct strings without passive substitution', () => {
    expect(rotationScenarioBindings['nanally-hexed-dual:nanally-basic-string']).toMatchObject({ coverage: 'full' });
    expect(rotationScenarioBindings['nanally-hexed-dual:nanally-charged-string']).toMatchObject({ coverage: 'full' });
    const preset = rotationPresetById.get('nanally-hexed-dual')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
    const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
    expect(actions).toContain('nanally.colucci-secret-skill.full-sequence.level-10');
    expect(actions).toContain('nanally.underboss.basic-coordinated-full-sequence.level-10');
    expect(actions).toContain('nanally.heavy-hitter.full-sequence.level-10');
    expect(actions).toContain('nanally.underboss.heavy-coordinated-full-sequence.level-10');
    expect(actions).not.toContain('nanally.fair-duel.level-11');
    expect(actions).not.toContain('nanally.awakening-three-follow-up.level-11');
  });

  it('uses one exact Final Verdict record twice after Retribution', () => {
    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
    const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
    expect(actions.filter((id) => id === 'chaos.final-verdict.enhanced.level-10')).toHaveLength(2);
    expect(actions.indexOf('chaos.retribution.initial.level-10')).toBeLessThan(actions.indexOf('chaos.final-verdict.enhanced.level-10'));
    expect(actions).not.toContain('chaos.remora-enhancement.base-five-seconds');
    expect(actions).not.toContain('chaos.remora-enhancement.maximum-twelve-seconds');
  });

  it('preserves Nanally and Chaos while later bindings reduce the current audit', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 41,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 29,
      unsupportedSourceStepCount: 17,
      boundActionStepCount: 62,
      promotedRecipeCount: 6,
      promotedActionStepCount: 62,
    });
    expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(11);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(8);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 24,
      total: 17,
      missingActionRecord: 1,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 112,
    });
    for (const key of [
      'nanally-hexed-dual:nanally-redirect',
      'nanally-hexed-dual:nanally-ultimate',
      'nanally-hexed-dual:nanally-basic-string',
      'nanally-hexed-dual:nanally-charged-string',
      'chaos-remora-bomb:chaos-ultimate',
      'chaos-remora-bomb:chaos-heavy-one',
      'chaos-remora-bomb:chaos-heavy-two',
    ]) expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([
      [1, 'Hathor'],
    ]);
  });
});
