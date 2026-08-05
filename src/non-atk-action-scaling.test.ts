import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { calculateGameVisibleBuild, verifiedVisibleActions } from './game-visible-calculation';
import {
  combatCoverageByCharacter,
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';
import type { TeamEffectSlotModifier } from './team-effects';
import { verifiedVisibleActionsBatchF } from './verified-visible-actions-batch-f';

function combatBuild(characterName: string): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    stats: {
      ...build.stats,
      hp: 30_000,
      atk: 2_000,
      def: 3_000,
      critRate: 0,
      critDamage: 100,
      damageBonus: 0,
      attributeDamageBonus: 0,
    },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
    testMode: 'verified-action',
  };
}

function action(id: string) {
  return verifiedVisibleActionsBatchF.find((entry) => entry.id === id)!;
}

const noModifier: TeamEffectSlotModifier = {
  flatAtk: 0,
  enemyDefenceReduction: 0,
  critRate: 0,
  provenance: [],
};

describe('verified non-ATK action scaling', () => {
  it('adds eleven unique records and completes partial coverage for all released characters', () => {
    expect(verifiedVisibleActionsBatchF).toHaveLength(11);
    expect(verifiedVisibleActions).toHaveLength(86);
    expect(new Set(verifiedVisibleActions.map((entry) => entry.id)).size).toBe(86);
    expect(new Set(verifiedVisibleActionsBatchF.map((entry) => entry.characterName)))
      .toEqual(new Set(['Adler', 'Fadia']));
    expect([...combatCoverageByCharacter.values()].filter((coverage) => coverage.coverage === 'partial')).toHaveLength(20);
    expect([...combatCoverageByCharacter.values()].filter((coverage) => coverage.coverage === 'relative-only')).toHaveLength(0);
  });

  it('locks Adler ATK and DEF compositions without duration-derived DoT repeats', () => {
    expect(action('adler.deliverance.full-sequence.level-10')).toMatchObject({ multiplier: 389.9, scalingStat: undefined });
    expect(action('adler.evils-bane.initial-composition.level-10')).toMatchObject({ multiplier: 419.7, scalingStat: 'def' });
    expect(action('adler.evils-bane.one-dot-tick.level-10')).toMatchObject({ multiplier: 40, scalingStat: 'def' });
    expect(action('adler.tranquility.five-target-hits.level-10')).toMatchObject({ multiplier: 999.5, scalingStat: 'def' });
    expect(action('adler.tranquility.single-enemy-ten-hits.level-10')).toMatchObject({ multiplier: 1999, scalingStat: 'def' });
    expect(action('adler.pristine-reflection.level-10')).toMatchObject({ multiplier: 399.8, scalingStat: undefined });
    expect(verifiedVisibleActionsBatchF.some((entry) => entry.id.includes('ten-dot-ticks'))).toBe(false);
  });

  it('locks Fadia ATK and Max-HP compositions without healing or redirected damage', () => {
    expect(action('fadia.wordless-rejection.full-sequence.level-10')).toMatchObject({ multiplier: 710.2, scalingStat: undefined });
    expect(action('fadia.existence.direct-composition.level-10')).toMatchObject({ multiplier: 13.2, scalingStat: 'max-hp' });
    expect(action('fadia.agony-to-euphoria.initial-composition.level-10')).toMatchObject({ multiplier: 30, scalingStat: 'max-hp' });
    expect(action('fadia.agony-to-euphoria.full-follow-up-sequence.level-10')).toMatchObject({ multiplier: 70.2, scalingStat: 'max-hp' });
    expect(action('fadia.outsider.level-10')).toMatchObject({ multiplier: 399.8, scalingStat: undefined });
    expect(verifiedVisibleActionsBatchF.some((entry) => entry.id.includes('healing'))).toBe(false);
    expect(verifiedVisibleActionsBatchF.some((entry) => entry.id.includes('redirection'))).toBe(false);
  });

  it('uses final DEF for Adler while keeping total ATK separately visible', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Adler'),
      verifiedActionId: 'adler.evils-bane.initial-composition.level-10',
    };
    const result = calculateGameVisibleBuild(build, state, noModifier);
    expect(result.supported).toBe(true);
    expect(result.result?.totalAtk).toBe(2_000);
    expect(result.result?.scalingValue).toBe(3_000);
    expect(result.conditions.some((condition) => condition.id === 'visible.final-def')).toBe(true);
    expect(result.conditions.some((condition) => condition.id === 'visible.final-atk')).toBe(false);
  });

  it('does not let an ATK-only team effect change DEF-scaled damage', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Adler'),
      verifiedActionId: 'adler.tranquility.single-enemy-ten-hits.level-10',
    };
    const baseline = calculateGameVisibleBuild(build, state, noModifier);
    const buffed = calculateGameVisibleBuild(build, state, {
      ...noModifier,
      flatAtk: 5_000,
      provenance: [{
        effectId: 'haniel.friendship.nova-atk-drain',
        sourceSlot: 1,
        sourceCharacter: 'Haniel',
        amount: 5_000,
        kind: 'flat-atk',
        label: { ru: 'Проверенный бонус Атаки', en: 'Verified ATK bonus' },
      }],
    });
    expect(buffed.result?.totalAtk).toBe(7_000);
    expect(buffed.result?.scalingValue).toBe(3_000);
    expect(buffed.result?.expected).toBeCloseTo(baseline.result?.expected ?? 0, 8);
  });

  it('uses final Max HP for Fadia and blocks a missing required visible stat', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Fadia'),
      verifiedActionId: 'fadia.agony-to-euphoria.initial-composition.level-10',
    };
    const active = calculateGameVisibleBuild(build, state);
    expect(active.supported).toBe(true);
    expect(active.result?.totalAtk).toBe(2_000);
    expect(active.result?.scalingValue).toBe(30_000);
    expect(active.conditions.some((condition) => condition.id === 'visible.final-max-hp')).toBe(true);

    const blocked = calculateGameVisibleBuild({
      ...build,
      stats: { ...build.stats, hp: 0 },
    }, state);
    expect(blocked.supported).toBe(false);
    expect(blocked.blockedReason?.ru).toContain('максимальные ОЗ');
  });

  it('keeps legacy ATK actions on total ATK including explicit flat ATK modifiers', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Adler'),
      verifiedActionId: 'adler.pristine-reflection.level-10',
    };
    const baseline = calculateGameVisibleBuild(build, state, noModifier);
    const buffed = calculateGameVisibleBuild(build, state, { ...noModifier, flatAtk: 500 });
    expect(baseline.result?.scalingValue).toBe(2_000);
    expect(buffed.result?.totalAtk).toBe(2_500);
    expect(buffed.result?.scalingValue).toBe(2_500);
    expect(buffed.result?.expected).toBeGreaterThan(baseline.result?.expected ?? 0);
  });

  it('reuses DEF and Max-HP actions in Combat Scenario', () => {
    const state = initialGameVisibleTeamState();
    state.builds = [combatBuild('Adler'), combatBuild('Fadia'), combatBuild('Zero'), combatBuild('Shinku')];
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'Non-ATK scaling actions',
      steps: [
        { id: 'adler', at: 0, kind: 'action', sourceSlot: 0, actionId: 'adler.tranquility.single-enemy-ten-hits.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'fadia', at: 1, kind: 'action', sourceSlot: 1, actionId: 'fadia.agony-to-euphoria.initial-composition.level-10', effectId: '', cycleId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(state, scenario);
    expect(result.calculatedActionCount).toBe(2);
    expect(result.blockedActionCount).toBe(0);
    expect(result.steps[0]?.calculation?.result?.scalingValue).toBe(3_000);
    expect(result.steps[1]?.calculation?.result?.scalingValue).toBe(30_000);
  });
});
