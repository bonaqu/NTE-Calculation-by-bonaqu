import { describe, expect, it } from 'vitest';
import {
  calculateCombatScenario,
  normalizeCombatScenarioState,
  type CombatScenarioState,
} from './combat-scenario';
import { createEmptyGameVisibleBuild, type GameVisibleCharacterBuild, type GameVisibleTeamState } from './game-visible-build';

function build(characterName: string, overrides: Partial<GameVisibleCharacterBuild> = {}): GameVisibleCharacterBuild {
  const value = createEmptyGameVisibleBuild(characterName);
  return {
    ...value,
    level: 80,
    maxLevel: 80,
    stats: {
      ...value.stats,
      atk: 1_000,
      critRate: 0,
      critDamage: 100,
    },
    ...overrides,
  };
}

function team(includePsyche = true): GameVisibleTeamState {
  return {
    version: 1,
    activeSlot: 0,
    duration: 20,
    builds: [
      build('Chaos'),
      includePsyche ? build('Haniel') : build('Hathor'),
      build('Shinku', { skills: { basic: 11, skill: 1, ultimate: 1, support: 1 } }),
      build('Zero'),
    ],
    target: {
      level: 80,
      resistance: 0,
      defenceReduction: 0,
      resistanceReduction: 0,
      boss: true,
    },
  };
}

const scenario: CombatScenarioState = {
  version: 1,
  name: 'Stain boundary',
  steps: [
    {
      id: 'activate-stain',
      at: 0,
      kind: 'activate-cycle',
      sourceSlot: 0,
      actionId: '',
      effectId: '',
      cycleId: 'stain',
      note: '',
    },
    {
      id: 'lakshana-inside',
      at: 11.9,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'chaos.remora-enhancement.maximum-twelve-seconds',
      effectId: '',
      cycleId: '',
      note: '',
    },
    {
      id: 'cosmos-inside',
      at: 11.9,
      kind: 'action',
      sourceSlot: 2,
      actionId: 'shinku.charge-enhancement.level-11',
      effectId: '',
      cycleId: '',
      note: '',
    },
    {
      id: 'lakshana-expired',
      at: 12,
      kind: 'action',
      sourceSlot: 0,
      actionId: 'chaos.remora-enhancement.maximum-twelve-seconds',
      effectId: '',
      cycleId: '',
      note: '',
    },
  ],
};

describe('Stain numerical Esper Cycle model', () => {
  it('applies +20% only to Lakshana/Psyche actions inside the 12-second window', () => {
    const state = team();
    const before = JSON.stringify(state);
    const result = calculateCombatScenario(state, scenario);
    const inside = result.steps.find((entry) => entry.step.id === 'lakshana-inside');
    const unrelated = result.steps.find((entry) => entry.step.id === 'cosmos-inside');
    const expired = result.steps.find((entry) => entry.step.id === 'lakshana-expired');

    expect(result.activatedCycleCount).toBe(1);
    expect(result.activatedEffectCount).toBe(0);
    expect(inside?.activeCycles.some((cycle) => cycle.cycleId === 'stain')).toBe(true);
    expect(unrelated?.activeCycles.some((cycle) => cycle.cycleId === 'stain')).toBe(true);
    expect(expired?.activeCycles).toHaveLength(0);
    expect(inside?.calculation?.result?.totalAtk).toBe(1_000);
    expect(expired?.calculation?.result?.totalAtk).toBe(1_000);
    expect(inside?.calculation?.result?.expected).toBeCloseTo((expired?.calculation?.result?.expected ?? 0) * 1.2, 8);
    expect(unrelated?.calculation?.conditions.some((condition) => condition.id === 'cycle.stain.target-window')).toBe(false);
    expect(inside?.calculation?.conditions.some((condition) => condition.id === 'cycle.stain.target-window')).toBe(true);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('blocks Stain when the team cannot form Lakshana + Psyche', () => {
    const result = calculateCombatScenario(team(false), {
      version: 1,
      name: 'Missing Psyche',
      steps: [scenario.steps[0]!],
    });
    expect(result.steps[0]?.status).toBe('blocked');
    expect(result.steps[0]?.blockedReason?.ru).toContain('Lakshana + Psyche');
    expect(result.activatedCycleCount).toBe(0);
  });

  it('blocks cycles without a verified scenario model', () => {
    const unsupported: CombatScenarioState = {
      version: 1,
      name: 'Unsupported Blossom',
      steps: [{
        id: 'blossom',
        at: 0,
        kind: 'activate-cycle',
        sourceSlot: 0,
        actionId: '',
        effectId: '',
        cycleId: 'blossom',
        note: '',
      }],
    };
    const result = calculateCombatScenario(team(), unsupported);
    expect(result.steps[0]?.status).toBe('blocked');
    expect(result.steps[0]?.blockedReason?.ru).toContain('нет подтверждённой модели сценария');
  });

  it('keeps old v1 payloads valid and normalizes the new optional cycle field', () => {
    const old = normalizeCombatScenarioState({
      version: 1,
      name: 'Old save',
      steps: [{
        id: 'old-action',
        at: 1,
        kind: 'action',
        sourceSlot: 0,
        actionId: 'chaos.remora-enhancement.maximum-twelve-seconds',
        effectId: '',
        note: '',
      }],
    });
    expect(old?.steps[0]?.cycleId).toBe('');

    const next = normalizeCombatScenarioState({
      version: 1,
      name: 'New save',
      steps: [{
        id: 'stain',
        at: 0,
        kind: 'activate-cycle',
        sourceSlot: 0,
        cycleId: ' stain ',
      }],
    });
    expect(next?.steps[0]).toMatchObject({ kind: 'activate-cycle', cycleId: 'stain' });
  });
});
