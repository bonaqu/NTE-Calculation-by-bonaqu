import { describe, expect, it } from 'vitest';
import {
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
} from './game-visible-build';
import { calculateGameVisibleTeam } from './game-visible-calculation';
import { deriveVerifiedTeamEffects, verifiedTeamEffects } from './team-effects';

function damageBuild(characterName: string, atk = 1_000, critRate = 0): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    stats: {
      ...build.stats,
      atk,
      critRate,
      critDamage: 100,
    },
  };
}

function team(builds: GameVisibleCharacterBuild[]): GameVisibleTeamState {
  const initial = initialGameVisibleTeamState();
  return {
    ...initial,
    builds,
    target: { ...initial.target, level: 80, resistance: 0 },
  };
}

describe('verified team support effects', () => {
  it('publishes five uniquely sourced temporary effects', () => {
    expect(verifiedTeamEffects).toHaveLength(5);
    expect(new Set(verifiedTeamEffects.map((effect) => effect.id)).size).toBe(5);
    expect(verifiedTeamEffects.map((effect) => effect.sourceCharacter)).toEqual(['Haniel', 'Sakiri', 'Sakiri', 'Hathor', 'Shinku']);
    for (const effect of verifiedTeamEffects) {
      expect(effect.sourceUrl).toMatch(/^https:\/\//u);
      expect(effect.supportingSourceUrl).toMatch(/^https:\/\//u);
      expect(effect.sourceUpdatedAt).toMatch(/^2026-\d{2}-\d{2}$/u);
      expect(effect.verifiedAt).toMatch(/^2026-\d{2}-\d{2}$/u);
    }
  });

  it('applies Haniel 8% Base ATK to all four slots without mutating saved final ATK', () => {
    const haniel = {
      ...damageBuild('Haniel'),
      baseAtk: 500,
      activeTeamEffectIds: ['haniel.friendship.nova-atk-drain'],
    };
    const state = team([
      damageBuild('Shinku'),
      haniel,
      damageBuild('Zero'),
      damageBuild('Nanally'),
    ]);
    const before = JSON.stringify(state);
    const calculation = calculateGameVisibleTeam(state);

    expect(calculation.teamEffects[0]?.active).toBe(true);
    expect(calculation.teamEffects[0]?.derivedAmount).toBe(40);
    expect(calculation.rows.every((row) => row.result?.totalAtk === 1_040)).toBe(true);
    expect(calculation.rows.every((row) => row.conditions.some((condition) => condition.id.startsWith('haniel.friendship.nova-atk-drain')))).toBe(true);
    expect(JSON.stringify(state)).toBe(before);
    expect(state.builds.every((build) => build.stats.atk === 1_000)).toBe(true);
  });

  it('blocks Sakiri A4 below A4 and excludes Sakiri when active', () => {
    const sakiriA3 = {
      ...damageBuild('Sakiri'),
      baseAtk: 600,
      awakeningLevel: 3,
      activeTeamEffectIds: ['sakiri.awakening-four.team-atk'],
    };
    const stateA3 = team([
      damageBuild('Shinku'),
      sakiriA3,
      damageBuild('Zero'),
      damageBuild('Nanally'),
    ]);
    const blocked = calculateGameVisibleTeam(stateA3);
    expect(blocked.teamEffects[0]?.active).toBe(false);
    expect(blocked.teamEffects[0]?.blockedReason?.ru).toContain('A4');
    expect(blocked.rows.every((row) => row.result?.totalAtk === 1_000)).toBe(true);

    const stateA4 = {
      ...stateA3,
      builds: stateA3.builds.map((build, index) => index === 1 ? { ...build, awakeningLevel: 4 } : build),
    };
    const active = calculateGameVisibleTeam(stateA4);
    expect(active.teamEffects[0]?.derivedAmount).toBe(180);
    expect(active.rows[0]?.result?.totalAtk).toBe(1_180);
    expect(active.rows[1]?.result?.totalAtk).toBe(1_000);
    expect(active.rows[2]?.result?.totalAtk).toBe(1_180);
    expect(active.rows[3]?.result?.totalAtk).toBe(1_180);
  });

  it('applies Sakiri 10% DEF reduction only while the explicit condition is enabled', () => {
    const baselineState = team([
      damageBuild('Shinku'),
      damageBuild('Sakiri'),
      damageBuild('Zero'),
      damageBuild('Nanally'),
    ]);
    const baseline = calculateGameVisibleTeam(baselineState);
    const enabledState = {
      ...baselineState,
      builds: baselineState.builds.map((build, index) => index === 1 ? {
        ...build,
        activeTeamEffectIds: ['sakiri.impish-trick.def-reduction'],
      } : build),
    };
    const enabled = calculateGameVisibleTeam(enabledState);

    expect(enabled.teamEffects[0]?.active).toBe(true);
    expect(enabled.teamEffects[0]?.derivedAmount).toBe(10);
    expect(enabled.rows[0]?.result?.expected).toBeGreaterThan(baseline.rows[0]?.result?.expected ?? 0);
    expect(enabled.rows.every((row) => row.conditions.some((condition) => condition.id.startsWith('sakiri.impish-trick.def-reduction')))).toBe(true);
  });

  it('applies Hathor +10 CRIT Rate to every slot only when Remora is explicitly enabled', () => {
    const baselineState = team([
      damageBuild('Shinku', 1_000, 50),
      damageBuild('Hathor', 1_000, 50),
      damageBuild('Zero', 1_000, 50),
      damageBuild('Nanally', 1_000, 50),
    ]);
    const baseline = calculateGameVisibleTeam(baselineState);
    const enabledState = {
      ...baselineState,
      builds: baselineState.builds.map((build, index) => index === 1 ? {
        ...build,
        activeTeamEffectIds: ['hathor.delay-warning.remora-crit-rate'],
      } : build),
    };
    const before = JSON.stringify(enabledState);
    const enabled = calculateGameVisibleTeam(enabledState);
    const derived = deriveVerifiedTeamEffects(enabledState);

    expect(enabled.teamEffects).toHaveLength(1);
    expect(enabled.teamEffects[0]).toMatchObject({ active: true, derivedAmount: 10, recipients: [0, 1, 2, 3] });
    expect(derived.slotModifiers.every((modifier) => modifier.critRate === 10)).toBe(true);
    expect(derived.slotModifiers.every((modifier) => modifier.flatAtk === 0)).toBe(true);
    expect(derived.slotModifiers.every((modifier) => modifier.damageBonus === 0)).toBe(true);
    expect(derived.slotModifiers.every((modifier) => modifier.provenance.some((entry) => entry.kind === 'crit-rate'))).toBe(true);
    expect(enabled.rows.every((row) => row.result?.totalAtk === 1_000)).toBe(true);
    expect(enabled.rows.every((row) => row.result?.expectedCritMultiplier === 1.6)).toBe(true);
    expect(enabled.rows.every((row, index) => (row.result?.expected ?? 0) > (baseline.rows[index]?.result?.expected ?? 0))).toBe(true);
    expect(enabled.rows.every((row) => row.conditions.some((condition) => condition.id.startsWith('hathor.delay-warning.remora-crit-rate')))).toBe(true);
    expect(JSON.stringify(enabledState)).toBe(before);
    expect(enabledState.builds.every((build) => build.stats.critRate === 50)).toBe(true);
  });

  it('applies Surging Crimson +30% DMG only to Shinku', () => {
    const baselineState = team([
      damageBuild('Shinku'),
      damageBuild('Hathor'),
      damageBuild('Zero'),
      damageBuild('Nanally'),
    ]);
    const baseline = calculateGameVisibleTeam(baselineState);
    const enabledState = {
      ...baselineState,
      builds: baselineState.builds.map((build, index) => index === 0 ? {
        ...build,
        activeTeamEffectIds: ['shinku.surging-crimson.damage'],
      } : build),
    };
    const before = JSON.stringify(enabledState);
    const enabled = calculateGameVisibleTeam(enabledState);
    const derived = deriveVerifiedTeamEffects(enabledState);

    expect(enabled.teamEffects).toHaveLength(1);
    expect(enabled.teamEffects[0]).toMatchObject({ active: true, derivedAmount: 30, recipients: [0] });
    expect(derived.slotModifiers.map((modifier) => modifier.damageBonus)).toEqual([30, 0, 0, 0]);
    expect(derived.slotModifiers[0]?.provenance).toContainEqual(expect.objectContaining({
      effectId: 'shinku.surging-crimson.damage',
      kind: 'damage-bonus',
      amount: 30,
    }));
    expect(enabled.rows[0]?.result?.expected).toBeCloseTo((baseline.rows[0]?.result?.expected ?? 0) * 1.3, 8);
    expect(enabled.rows.slice(1).map((row) => row.result?.expected)).toEqual(
      baseline.rows.slice(1).map((row) => row.result?.expected),
    );
    expect(enabled.rows[0]?.conditions.some((condition) => condition.id.startsWith('shinku.surging-crimson.damage'))).toBe(true);
    expect(enabled.rows.slice(1).every((row) => row.conditions.every((condition) => !condition.id.startsWith('shinku.surging-crimson.damage')))).toBe(true);
    expect(JSON.stringify(enabledState)).toBe(before);
  });

  it('clamps temporary Hathor CRIT Rate through calculation-core at 100%', () => {
    const state = team([
      damageBuild('Shinku', 1_000, 100),
      {
        ...damageBuild('Hathor', 1_000, 100),
        activeTeamEffectIds: ['hathor.delay-warning.remora-crit-rate'],
      },
      damageBuild('Zero', 1_000, 100),
      damageBuild('Nanally', 1_000, 100),
    ]);
    const result = calculateGameVisibleTeam(state);
    expect(result.rows.every((row) => row.result?.expectedCritMultiplier === 2)).toBe(true);
  });

  it('requires Base ATK only for enabled scaling effects', () => {
    const state = team([
      damageBuild('Shinku'),
      {
        ...damageBuild('Haniel'),
        activeTeamEffectIds: ['haniel.friendship.nova-atk-drain'],
      },
      damageBuild('Zero'),
      damageBuild('Nanally'),
    ]);
    const derived = deriveVerifiedTeamEffects(state);
    expect(derived.evaluations[0]?.active).toBe(false);
    expect(derived.evaluations[0]?.blockedReason?.ru).toContain('базовая Атака');
    expect(derived.slotModifiers.every((modifier) => modifier.flatAtk === 0)).toBe(true);
  });

  it('migrates old visible.v1 builds with safe empty support fields', () => {
    const old = initialGameVisibleTeamState();
    const legacy = JSON.parse(JSON.stringify(old)) as Record<string, unknown>;
    const legacyBuilds = legacy.builds as Array<Record<string, unknown>>;
    legacyBuilds.forEach((build) => {
      delete build.baseAtk;
      delete build.activeTeamEffectIds;
    });
    const normalized = normalizeGameVisibleTeamState(legacy);
    expect(normalized).not.toBeNull();
    expect(normalized?.builds.every((build) => build.baseAtk === 0)).toBe(true);
    expect(normalized?.builds.every((build) => build.activeTeamEffectIds.length === 0)).toBe(true);
  });
});
