import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, normalizeCombatScenarioState, type CombatScenarioState } from './combat-scenario';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditSummary, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, previewRotationScenarioImport, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { verifiedScenarioOperationById, verifiedScenarioOperations } from './scenario-operations';
import { rotationPresetRecipeAuditById, validateVerifiedRotationRecipes, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';

const bindingMap = {
  'hathor-hyper:hathor-quickswap': 'zero.quick-swap-return-hathor',
  'hathor-hyper:energy-routing': 'hathor.reaction-energy-routing',
  'hathor-hyper:haniel-rebuild': 'haniel.energy-cycle-rebuild',
  'chaos-remora-bomb:chaos-restart': 'hathor.cooldown-restart-chaos',
  'nanally-hexed-dual:nanally-jiuyuan-open': 'jiuyuan.start-position-nanally',
  'nanally-hexed-dual:nanally-energy-recovery': 'sakiri.energy-recovery-preserve-hexed',
  'lacrimosa-discord-dot:lacrimosa-repeat-loop': 'lacrimosa.conditional-support-energy-loop',
  'baicang-firefly-hyper:baicang-restart': 'adler.energy-check-restart',
} as const;

describe('typed verified non-damage operation markers', () => {
  it('publishes eight unique source-backed zero-damage operations', () => {
    expect(verifiedScenarioOperations).toHaveLength(8);
    expect(new Set(verifiedScenarioOperations.map((operation) => operation.id)).size).toBe(8);
    for (const operation of verifiedScenarioOperations) {
      expect(operation.damageContribution).toBe(0);
      expect(operation.durationSeconds).toBeNull();
      expect(operation.sourceUrl.startsWith('https://')).toBe(true);
      expect(operation.sourceCharacter).toBeTruthy();
      expect(operation.summary.ru).toBeTruthy();
      expect(operation.verifiedAt).toBe('2026-08-06');
    }
  });

  it('keeps schema v1 backward compatible through an additive operationId', () => {
    const normalized = normalizeCombatScenarioState({
      version: 1,
      name: 'legacy',
      steps: [{ id: 'old', at: 0, kind: 'wait', sourceSlot: 0, actionId: '', effectId: '', cycleId: '', note: '' }],
    });
    expect(normalized?.steps[0]?.operationId).toBe('');
  });

  it('executes a valid operation without changing damage or active windows', () => {
    const team = initialGameVisibleTeamState();
    team.builds[0] = { ...team.builds[0]!, characterName: 'Jiuyuan' };
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'operation',
      steps: [{
        id: 'op', at: 0, kind: 'operation', sourceSlot: 0,
        actionId: '', effectId: '', cycleId: '', operationId: 'jiuyuan.start-position-nanally', note: '',
      }],
    };
    const result = calculateCombatScenario(team, scenario);
    expect(result.steps[0]).toMatchObject({ status: 'operation', sourceCharacter: 'Jiuyuan' });
    expect(result.steps[0]?.operation?.damageContribution).toBe(0);
    expect(result.totalExpected).toBe(0);
    expect(result.totalNonCrit).toBe(0);
    expect(result.totalCrit).toBe(0);
    expect(result.operationStepCount).toBe(1);
    expect(result.completedOperationCount).toBe(1);
    expect(result.blockedStepCount).toBe(0);
    expect(result.finalActiveEffects).toEqual([]);
    expect(result.finalActiveCycles).toEqual([]);
  });

  it('blocks an unknown or wrong-character operation', () => {
    const team = initialGameVisibleTeamState();
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'invalid',
      steps: [{
        id: 'op', at: 0, kind: 'operation', sourceSlot: 0,
        actionId: '', effectId: '', cycleId: '', operationId: 'jiuyuan.start-position-nanally', note: '',
      }],
    };
    const result = calculateCombatScenario(team, scenario);
    expect(result.steps[0]?.status).toBe('blocked');
    expect(result.completedOperationCount).toBe(0);
    expect(result.blockedStepCount).toBe(1);
  });

  it('adds eight exact full operation-marker bindings', () => {
    for (const [key, operationId] of Object.entries(bindingMap)) {
      expect(rotationScenarioBindings[key]).toEqual({
        coverage: 'full',
        items: [{ kind: 'operation-marker', operationId }],
      });
      expect(verifiedScenarioOperationById.get(operationId as never)).toBeTruthy();
    }
    expect(validateRotationScenarioBindings()).toEqual([]);
  });

  it('imports operations directly and reports them separately from actions and windows', () => {
    let operationSteps = 0;
    for (const presetId of ['hathor-hyper', 'chaos-remora-bomb', 'nanally-hexed-dual', 'lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const preset = rotationPresetById.get(presetId)!;
      const selections: Record<string, string | number> = presetId === 'lacrimosa-discord-dot'
        ? { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato' }
        : presetId === 'baicang-firefly-hyper'
          ? { 'baicang.adler-ultimate-mode': 'single-enemy-ten-hits', 'baicang.dodge-charged-count': 1 }
          : {};
      const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru', selections);
      const operations = imported.scenario.steps.filter((step) => step.kind === 'operation');
      operationSteps += operations.length;
      expect(imported.report.generatedOperationSteps).toBe(operations.length);
      for (const step of operations) {
        expect(step.operationId).toBeTruthy();
        expect(imported.metadata.pendingByStepId[step.id]).toBeUndefined();
        expect(imported.metadata.originsByStepId[step.id]?.coverage).toBe('full');
      }
      expect(previewRotationScenarioImport(preset, selections).generatedOperationSteps).toBe(operations.length);
    }
    expect(operationSteps).toBe(8);
  });

  it('keeps operations out of action-only recipes with a separate audit counter', () => {
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    const omitted = [...rotationPresetRecipeAuditById.values()].reduce((sum, audit) => sum + audit.omittedOperationMarkers, 0);
    expect(omitted).toBe(8);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 53,
      fullyBoundSourceStepCount: 20,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 5,
      boundActionStepCount: 63,
      promotedActionStepCount: 63,
    });
  });

  it('reduces unsupported audit to zero while retaining five parameterized variants', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 41,
      total: 0,
      missingActionRecord: 0,
      effectOrCycleCondition: 0,
      nonDamageOperation: 0,
      ambiguousSourceStep: 0,
      verifiedActionCatalogCount: 113,
    });
  });
});
