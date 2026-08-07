import { describe, expect, it } from 'vitest';
import { verifiedCombatCycleModelById, verifiedCombatCycleModels } from './combat-cycle-models';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { createEmptyGameVisibleBuild, type GameVisibleCharacterBuild, type GameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { confirmRotationScenarioTiming, importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';

function build(characterName: string, atk = 1000): GameVisibleCharacterBuild {
  const value = createEmptyGameVisibleBuild(characterName);
  return {
    ...value,
    level: 80,
    maxLevel: 80,
    stats: { ...value.stats, atk, critRate: 0, critDamage: 100 },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
  };
}

function team(): GameVisibleTeamState {
  return {
    version: 1,
    activeSlot: 0,
    duration: 30,
    builds: [build('Lacrimosa'), build('Sakiri'), build('Haniel'), build('Zero')],
    target: { level: 80, resistance: 0, defenceReduction: 0, resistanceReduction: 0, boss: true },
  };
}

function cycleScenario(cycleId: string, actionAt = 1): CombatScenarioState {
  return {
    version: 1,
    name: cycleId,
    steps: [
      { id: 'cycle', at: 0, kind: 'activate-cycle', sourceSlot: 0, actionId: '', effectId: '', cycleId, note: '' },
      { id: 'action', at: actionAt, kind: 'action', sourceSlot: 0, actionId: 'lacrimosa.morning-tomato.level-10', effectId: '', cycleId: '', note: '' },
    ],
  };
}

describe('typed verified Esper Cycle events', () => {
  it('publishes one damage window, one timed state and two instantaneous triggers', () => {
    expect(verifiedCombatCycleModels.map((model) => [model.id, model.kind])).toEqual([
      ['stain', 'damage-window'],
      ['scorch', 'timed-state'],
      ['charge', 'resource-trigger'],
      ['discord', 'break-trigger'],
    ]);
    expect(verifiedCombatCycleModelById.get('scorch')).toMatchObject({ durationSeconds: 15 });
    expect(verifiedCombatCycleModelById.get('charge')).toMatchObject({ durationSeconds: null, ultimateEnergyPerTrigger: 10 });
    expect(verifiedCombatCycleModelById.get('discord')).toMatchObject({ durationSeconds: null, breakReductionPercent: null });
  });

  it('keeps Scorch active for 15 seconds without changing direct action damage', () => {
    const inside = calculateCombatScenario(team(), cycleScenario('scorch', 14.9));
    const boundary = calculateCombatScenario(team(), cycleScenario('scorch', 15));
    const without = calculateCombatScenario(team(), { ...cycleScenario('scorch', 14.9), steps: [cycleScenario('scorch', 14.9).steps[1]!] });
    expect(inside.steps[0]?.activatedCycle).toMatchObject({ kind: 'timed-state', expiresAt: 15 });
    expect(inside.steps[1]?.activeCycles.some((cycle) => cycle.cycleId === 'scorch')).toBe(true);
    expect(boundary.steps[1]?.activeCycles).toHaveLength(0);
    expect(inside.steps[1]?.calculation?.result?.expected).toBeCloseTo(without.steps[0]?.calculation?.result?.expected ?? 0, 8);
    expect(inside.totalExpected).toBeCloseTo(without.totalExpected, 8);
  });

  it('records Charge as +10 Energy per trigger without creating an active window or hidden damage', () => {
    const chargeTeam: GameVisibleTeamState = {
      ...team(),
      builds: [build('Jiuyuan'), build('Zero'), build('Hathor'), build('Haniel')],
    };
    const state: CombatScenarioState = {
      version: 1,
      name: 'Charge',
      steps: [
        { id: 'charge', at: 0, kind: 'activate-cycle', sourceSlot: 0, actionId: '', effectId: '', cycleId: 'charge', note: '' },
        { id: 'hit', at: 1, kind: 'action', sourceSlot: 0, actionId: 'jiuyuan.intel-hunter.direct.level-10', effectId: '', cycleId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(chargeTeam, state);
    expect(result.steps[0]?.activatedCycle).toMatchObject({ kind: 'resource-trigger', ultimateEnergyPerTrigger: 10, expiresAt: null });
    expect(result.steps[0]?.activeCycles).toHaveLength(0);
    expect(result.steps[1]?.activeCycles).toHaveLength(0);
    expect(result.finalActiveCycles).toHaveLength(0);
    expect(result.steps[1]?.calculation?.conditions.some((condition) => condition.id.startsWith('cycle.charge'))).toBe(false);
  });

  it('records Discord with an unpublished Break percentage and no active damage window', () => {
    const result = calculateCombatScenario(team(), cycleScenario('discord'));
    expect(result.steps[0]?.activatedCycle).toMatchObject({ kind: 'break-trigger', breakReductionPercent: null, expiresAt: null });
    expect(result.steps[0]?.activeCycles).toHaveLength(0);
    expect(result.finalActiveCycles).toHaveLength(0);
    expect(result.steps[1]?.calculation?.conditions.some((condition) => condition.id.startsWith('cycle.discord'))).toBe(false);
  });

  it('binds Charge, Scorch and Discord as partial semantic events', () => {
    const expected = {
      'hathor-hyper:jiuyuan-second-charge': 'charge',
      'lacrimosa-discord-dot:lacrimosa-scorch': 'scorch',
      'lacrimosa-discord-dot:lacrimosa-discord': 'discord',
    } as const;
    for (const [key, cycleId] of Object.entries(expected)) {
      expect(rotationScenarioBindings[key]).toEqual({ coverage: 'partial', items: [{ kind: 'activate-cycle', cycleId }] });
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
    expect(validateRotationScenarioBindings()).toEqual([]);
  });

  it('imports semantic events as pending order markers and activates them only after timing confirmation', () => {
    for (const presetId of ['hathor-hyper', 'lacrimosa-discord-dot']) {
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, team(), 'ru');
      const relevant = Object.entries(imported.metadata.pendingByStepId).filter(([, pending]) => pending.kind === 'activate-cycle');
      expect(relevant.length).toBeGreaterThan(0);
      for (const [stepId] of relevant) expect(imported.scenario.steps.find((step) => step.id === stepId)?.kind).toBe('wait');
      const confirmed = confirmRotationScenarioTiming(imported.scenario, imported.metadata);
      for (const [stepId] of relevant) expect(confirmed.scenario.steps.find((step) => step.id === stepId)?.kind).toBe('activate-cycle');
    }
  });

  it('derives 45 bindings and a 13-gap audit with zero effect/Cycle gaps', () => {
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 45,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 13,
      boundActionStepCount: 63,
      promotedActionStepCount: 63,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 28,
      total: 13,
      effectOrCycleCondition: 0,
      missingActionRecord: 0,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
  });
});
