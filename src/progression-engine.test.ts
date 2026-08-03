import { describe, expect, it } from 'vitest';
import {
  ascensionMaterialIds,
  ascensionMaterials,
  ascensionSteps,
  characterAscensionByName,
  characterAscensionProfiles,
} from './progression-data';
import {
  aggregateRosterRequirements,
  calculateMaterialShortages,
  charactersUsingMaterial,
  migrateLegacyIroiState,
  normalizeRosterProgressionState,
  requirementsForCharacter,
  totalForCategory,
} from './progression-engine';

const expectedSourceUpdatedAt: Record<string, string> = {
  Adler: '2026-07-28',
  Aurelia: '2026-07-28',
  Baicang: '2026-07-28',
  Chaos: '2026-07-28',
  Chiz: '2026-06-11',
  Daffodill: '2026-07-28',
  Edgar: '2026-07-28',
  Fadia: '2026-07-28',
  Haniel: '2026-07-28',
  Hathor: '2026-06-27',
  Hotori: '2026-07-01',
  Iroi: '2026-07-27',
  Jiuyuan: '2026-07-28',
  Lacrimosa: '2026-07-28',
  Mint: '2026-07-28',
  Nanally: '2026-07-31',
  Sakiri: '2026-07-28',
  Shinku: '2026-07-31',
  Skia: '2026-07-28',
  Zero: '2026-07-28',
};

describe('roster ascension dataset', () => {
  it('covers all 20 released characters with complete direct sources', () => {
    expect(characterAscensionProfiles).toHaveLength(20);
    expect(new Set(characterAscensionProfiles.map((profile) => profile.characterName)).size).toBe(20);
    expect(characterAscensionProfiles.every((profile) => profile.sourceUrl.startsWith('https://www.icy-veins.com/'))).toBe(true);
    expect(characterAscensionProfiles.every((profile) => profile.verifiedAt === '2026-08-04')).toBe(true);
    expect(characterAscensionProfiles.every((profile) => profile.commonMaterials.length === 3)).toBe(true);
  });

  it('matches the current guide update date for every direct character source', () => {
    expect(Object.keys(expectedSourceUpdatedAt)).toHaveLength(20);
    expect(Object.fromEntries(characterAscensionProfiles.map((profile) => [profile.characterName, profile.sourceUpdatedAt])))
      .toEqual(expectedSourceUpdatedAt);
  });

  it('uses the verified six-step cost curve through the level-80 unlock', () => {
    expect(ascensionSteps).toHaveLength(6);
    expect(ascensionSteps.map((step) => step.atLevel)).toEqual([20, 30, 40, 50, 60, 70]);
    expect(ascensionSteps.map((step) => step.unlocksLevel)).toEqual([30, 40, 50, 60, 70, 80]);
    expect(ascensionSteps.reduce((sum, step) => sum + step.beetleCoin, 0)).toBe(525_000);
    expect(ascensionSteps.reduce((sum, step) => sum + step.bossCount, 0)).toBe(86);
    expect(ascensionSteps.reduce((sum, step) => sum + step.commonCount, 0)).toBe(50);
  });

  it('maps newer characters to their individually verified materials', () => {
    expect(characterAscensionByName.get('Iroi')?.bossMaterial).toBe('pageDelusionsShore');
    expect(characterAscensionByName.get('Shinku')?.bossMaterial).toBe('chargingKnightSparkPlug');
    expect(characterAscensionByName.get('Chaos')?.bossMaterial).toBe('tearOfTheSea');
    expect(characterAscensionByName.get('Hotori')?.bossMaterial).toBe('confessionalFlowerSeed');
    expect(characterAscensionByName.get('Lacrimosa')?.bossMaterial).toBe('confessionalFlowerSeed');
  });

  it('defines Russian and English names for every material', () => {
    expect(ascensionMaterialIds).toHaveLength(20);
    expect(ascensionMaterialIds.every((id) => ascensionMaterials[id].name.ru && ascensionMaterials[id].name.en)).toBe(true);
    expect(ascensionMaterialIds.filter((id) => ascensionMaterials[id].category === 'boss')).toHaveLength(7);
  });
});

describe('roster ascension engine', () => {
  it('calculates exact remaining costs after completed breakpoints', () => {
    const shinku = characterAscensionByName.get('Shinku');
    expect(shinku).toBeDefined();
    const totals = requirementsForCharacter(shinku!, 2);
    expect(totals.beetleCoin).toBe(450_000);
    expect(totals.chargingKnightSparkPlug).toBe(84);
    expect(totals.lostWhispers).toBe(0);
    expect(totals.obscureWhispers).toBe(18);
    expect(totals.paradoxicalWhispers).toBe(15);
  });

  it('aggregates several characters and subtracts one shared inventory pool', () => {
    const required = aggregateRosterRequirements([
      { characterName: 'Iroi', completedSteps: 0 },
      { characterName: 'Shinku', completedSteps: 0 },
    ]);
    expect(required.beetleCoin).toBe(1_050_000);
    expect(required.pageDelusionsShore).toBe(86);
    expect(required.chargingKnightSparkPlug).toBe(86);
    expect(totalForCategory(required, 'boss')).toBe(172);
    expect(totalForCategory(required, 'common')).toBe(100);

    const shortages = calculateMaterialShortages(required, {
      beetleCoin: 100_000,
      pageDelusionsShore: 20,
      chargingKnightSparkPlug: 100,
      fadingSilhouette: 5,
    });
    expect(shortages.beetleCoin).toBe(950_000);
    expect(shortages.pageDelusionsShore).toBe(66);
    expect(shortages.chargingKnightSparkPlug).toBe(0);
    expect(shortages.fadingSilhouette).toBe(12);
  });

  it('migrates the old Iroi planner without losing inventory', () => {
    const state = migrateLegacyIroiState(3, {
      beetleCoin: 123_456,
      page: 9,
      fading: 4,
      blurred: 5,
      chaos: 6,
    });
    expect(state.entries).toEqual([{ characterName: 'Iroi', completedSteps: 3 }]);
    expect(state.inventory.beetleCoin).toBe(123_456);
    expect(state.inventory.pageDelusionsShore).toBe(9);
    expect(state.inventory.fadingSilhouette).toBe(4);
    expect(state.inventory.blurredSilhouette).toBe(5);
    expect(state.inventory.chaosSilhouette).toBe(6);
  });

  it('repairs duplicate, unknown and malformed stored state', () => {
    const normalized = normalizeRosterProgressionState({
      version: 999,
      entries: [
        { characterName: 'Iroi', completedSteps: 99 },
        { characterName: 'Iroi', completedSteps: 1 },
        { characterName: 'Linko', completedSteps: 2 },
        { characterName: 'Shinku', completedSteps: -5 },
        null,
      ],
      inventory: { beetleCoin: 100.9, pageDelusionsShore: -3, lostWhispers: 'broken' },
    });
    expect(normalized?.entries).toEqual([
      { characterName: 'Iroi', completedSteps: 6 },
      { characterName: 'Shinku', completedSteps: 0 },
    ]);
    expect(normalized?.inventory.beetleCoin).toBe(100);
    expect(normalized?.inventory.pageDelusionsShore).toBe(0);
    expect(normalized?.inventory.lostWhispers).toBe(0);
  });

  it('lists the planned characters that need a shared boss material', () => {
    expect(charactersUsingMaterial([
      { characterName: 'Shinku', completedSteps: 0 },
      { characterName: 'Zero', completedSteps: 0 },
      { characterName: 'Iroi', completedSteps: 0 },
    ], 'chargingKnightSparkPlug')).toEqual(['Shinku', 'Zero']);
  });
});
