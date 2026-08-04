import { describe, expect, it } from 'vitest';
import { emptyAscensionInventory } from './progression-engine';
import {
  aggregateNextAscensionRequirements,
  immediateCoinShortage,
  immediateMaterialBlockers,
  immediateTargetsReady,
  nextAscensionTarget,
  nextAscensionTargets,
} from './progression-next';

describe('immediate progression planning', () => {
  it('derives exactly one next unpaid ascension per unfinished character', () => {
    const targets = nextAscensionTargets([
      { characterName: 'Shinku', completedSteps: 0 },
      { characterName: 'Iroi', completedSteps: 2 },
      { characterName: 'Zero', completedSteps: 6 },
    ]);

    expect(targets).toHaveLength(2);
    expect(targets[0]).toMatchObject({
      characterName: 'Shinku',
      currentCap: 20,
      commonMaterial: 'lostWhispers',
      bossMaterial: 'chargingKnightSparkPlug',
      step: { atLevel: 20, unlocksLevel: 30, beetleCoin: 25_000, bossCount: 0, commonCount: 5 },
    });
    expect(targets[1]).toMatchObject({
      characterName: 'Iroi',
      currentCap: 40,
      commonMaterial: 'blurredSilhouette',
      bossMaterial: 'pageDelusionsShore',
      step: { atLevel: 40, unlocksLevel: 50, beetleCoin: 75_000, bossCount: 8, commonCount: 6 },
    });
    expect(nextAscensionTarget({ characterName: 'Zero', completedSteps: 6 })).toBeNull();
  });

  it('aggregates shared inventory requirements for immediate targets only', () => {
    const requirements = aggregateNextAscensionRequirements([
      { characterName: 'Shinku', completedSteps: 1 },
      { characterName: 'Zero', completedSteps: 1 },
      { characterName: 'Iroi', completedSteps: 0 },
    ]);

    expect(requirements.beetleCoin).toBe(125_000);
    expect(requirements.chargingKnightSparkPlug).toBe(4);
    expect(requirements.pageDelusionsShore).toBe(0);
    expect(requirements.lostWhispers).toBe(24);
    expect(requirements.fadingSilhouette).toBe(5);
  });

  it('subtracts shared inventory once and reports all immediate blockers', () => {
    const inventory = emptyAscensionInventory();
    inventory.beetleCoin = 50_000;
    inventory.chargingKnightSparkPlug = 1;
    inventory.lostWhispers = 10;

    const entries = [
      { characterName: 'Shinku', completedSteps: 1 },
      { characterName: 'Zero', completedSteps: 1 },
    ];
    const blockers = immediateMaterialBlockers(entries, inventory);
    const byId = new Map(blockers.map((blocker) => [blocker.materialId, blocker]));

    expect(byId.get('chargingKnightSparkPlug')).toMatchObject({
      required: 4,
      owned: 1,
      missing: 3,
      affectedCharacters: ['Shinku', 'Zero'],
    });
    expect(byId.get('lostWhispers')).toMatchObject({
      required: 24,
      owned: 10,
      missing: 14,
      affectedCharacters: ['Shinku', 'Zero'],
    });
    expect(immediateCoinShortage(entries, inventory)).toEqual({ required: 100_000, owned: 50_000, missing: 50_000 });
  });

  it('orders blockers by affected targets and keeps currency outside the ranking', () => {
    const blockers = immediateMaterialBlockers([
      { characterName: 'Shinku', completedSteps: 1 },
      { characterName: 'Zero', completedSteps: 1 },
      { characterName: 'Iroi', completedSteps: 0 },
    ], {});

    expect(blockers.map((blocker) => blocker.materialId)).toEqual([
      'chargingKnightSparkPlug',
      'lostWhispers',
      'fadingSilhouette',
    ]);
    expect(blockers.some((blocker) => blocker.materialId === 'beetleCoin')).toBe(false);
  });

  it('marks ready only when shared inventory covers all immediate targets simultaneously', () => {
    const entries = [
      { characterName: 'Shinku', completedSteps: 1 },
      { characterName: 'Zero', completedSteps: 1 },
    ];
    expect(immediateTargetsReady(entries, {
      beetleCoin: 100_000,
      chargingKnightSparkPlug: 4,
      lostWhispers: 24,
    })).toBe(true);
    expect(immediateTargetsReady(entries, {
      beetleCoin: 100_000,
      chargingKnightSparkPlug: 2,
      lostWhispers: 24,
    })).toBe(false);
    expect(immediateTargetsReady([{ characterName: 'Zero', completedSteps: 6 }], emptyAscensionInventory())).toBe(false);
  });
});
