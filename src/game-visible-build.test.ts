import { describe, expect, it } from 'vitest';
import { characterCatalog } from './characters';
import {
  characterCombatCoverage,
  GAME_VISIBLE_TEAM_STORAGE_KEY,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  screenshotConfirmedRussianLabels,
  shinkuScreenshotBuild,
} from './game-visible-build';
import { calculateGameVisibleBuild } from './game-visible-calculation';

describe('game-visible build profile', () => {
  it('covers every released character without pretending every kit is verified', () => {
    const released = characterCatalog.filter((character) => character.releaseStatus === 'released');
    const partialNames = [
      'Shinku',
      'Nanally',
      'Chaos',
      'Lacrimosa',
      'Zero',
      'Hathor',
      'Jiuyuan',
      'Haniel',
      'Sakiri',
      'Baicang',
      'Daffodill',
      'Aurelia',
      'Chiz',
      'Edgar',
      'Hotori',
      'Iroi',
      'Mint',
      'Skia',
    ];
    expect(characterCombatCoverage).toHaveLength(released.length);
    expect(new Set(characterCombatCoverage.map((record) => record.characterName)).size).toBe(released.length);
    expect(characterCombatCoverage.filter((record) => record.coverage === 'partial').map((record) => record.characterName).sort())
      .toEqual([...partialNames].sort());
    expect(characterCombatCoverage.filter((record) => !partialNames.includes(record.characterName))
      .every((record) => record.coverage === 'relative-only')).toBe(true);
    expect(characterCombatCoverage.filter((record) => record.coverage === 'partial')
      .every((record) => record.supportedModes.includes('verified-action'))).toBe(true);
  });

  it('uses the screenshot-confirmed Shinku values and exact current-client labels', () => {
    expect(shinkuScreenshotBuild.stats).toMatchObject({
      hp: 21316,
      atk: 2026,
      def: 968,
      critRate: 79,
      critDamage: 176.4,
      damageBonus: 8,
      attributeDamageBonus: 10,
      chargeSpeed: 100,
      cycleIntensity: 0,
      breakIntensity: 48,
    });
    expect(shinkuScreenshotBuild.arc).toMatchObject({
      arcName: 'Blushing Mirage',
      level: 80,
      baseAtk: 570,
      secondaryLabel: 'CRIT Rate',
      secondaryValue: 24,
      mixingRank: 1,
    });
    expect(screenshotConfirmedRussianLabels.critRate).toBe('Шанс крит. удара');
    expect(screenshotConfirmedRussianLabels.critDamage).toBe('Крит. урон');
    expect(screenshotConfirmedRussianLabels.chargeSpeed).toBe('Скорость зарядки');
    expect(screenshotConfirmedRussianLabels.breakIntensity).toBe('Интенсивность разрушения');
  });

  it('uses a separate storage version and normalizes malformed browser data', () => {
    expect(GAME_VISIBLE_TEAM_STORAGE_KEY).toBe('nte.team.visible.v1');
    const normalized = normalizeGameVisibleTeamState({
      ...initialGameVisibleTeamState(),
      activeSlot: 99,
      duration: -5,
      builds: [{
        ...shinkuScreenshotBuild,
        level: 999,
        stats: { ...shinkuScreenshotBuild.stats, critRate: 900, atk: -1 },
      }],
    });
    expect(normalized).not.toBeNull();
    expect(normalized?.activeSlot).toBe(3);
    expect(normalized?.duration).toBe(1);
    expect(normalized?.builds).toHaveLength(4);
    expect(normalized?.builds[0]?.level).toBe(80);
    expect(normalized?.builds[0]?.stats.critRate).toBe(100);
    expect(normalized?.builds[0]?.stats.atk).toBe(0);
  });

  it('never adds visible Arc ATK to final displayed ATK a second time', () => {
    const state = initialGameVisibleTeamState();
    const calculation = calculateGameVisibleBuild(state.builds[0]!, state);
    expect(calculation.supported).toBe(true);
    expect(calculation.result?.totalAtk).toBe(2026);
    expect(calculation.result?.totalAtk).not.toBe(2026 + 570);
  });

  it('applies Blushing Mirage conditional values only in the explicit post-Ultimate test', () => {
    const state = initialGameVisibleTeamState();
    const neutral = calculateGameVisibleBuild(state.builds[0]!, state);
    const burstBuild = {
      ...state.builds[0]!,
      testMode: 'burst-reference' as const,
      arc: { ...state.builds[0]!.arc, afterUltimateActive: true },
    };
    const burst = calculateGameVisibleBuild(burstBuild, state);
    expect(neutral.result?.totalAtk).toBe(burst.result?.totalAtk);
    expect(burst.result?.expected).toBeGreaterThan(neutral.result?.expected ?? 0);
    expect(burst.conditions.some((condition) => condition.id === 'arc.blushing-mirage.after-ultimate')).toBe(true);
  });

  it('blocks an exact action at the wrong level instead of interpolating a multiplier', () => {
    const state = initialGameVisibleTeamState();
    const levelNine = {
      ...state.builds[0]!,
      testMode: 'verified-action' as const,
      verifiedActionId: 'shinku.charge-enhancement.level-11',
    };
    const blocked = calculateGameVisibleBuild(levelNine, state);
    expect(blocked.supported).toBe(false);
    expect(blocked.blockedReason?.ru).toContain('нужен уровень 11');

    const levelEleven = {
      ...levelNine,
      skills: { ...levelNine.skills, basic: 11 },
    };
    const supported = calculateGameVisibleBuild(levelEleven, state);
    expect(supported.supported).toBe(true);
    expect(supported.multiplier).toBe(863.6);
  });
});
