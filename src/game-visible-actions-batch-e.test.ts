import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { calculateGameVisibleBuild, verifiedVisibleActions } from './game-visible-calculation';
import {
  combatCoverageByCharacter,
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';
import { verifiedVisibleActionsBatchE } from './verified-visible-actions-batch-e';

function combatBuild(characterName: string): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    stats: { ...build.stats, atk: 2_000, critRate: 50, critDamage: 100 },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
    testMode: 'verified-action',
  };
}

function multiplier(id: string): number | undefined {
  return verifiedVisibleActionsBatchE.find((action) => action.id === id)?.multiplier;
}

describe('verified game-visible actions batch E', () => {
  it('adds twenty-six unique ATK records inside the complete public catalog', () => {
    expect(verifiedVisibleActionsBatchE).toHaveLength(26);
    expect(verifiedVisibleActions).toHaveLength(106);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(106);
    expect(new Set(verifiedVisibleActionsBatchE.map((action) => action.characterName)))
      .toEqual(new Set(['Hotori', 'Iroi', 'Mint', 'Skia']));
    for (const action of verifiedVisibleActionsBatchE) {
      expect(action.sourcePublisher).toBe('Icy Veins');
      expect(action.sourceUrl).toMatch(/^https:\/\/www\.icy-veins\.com\/neverness-to-everness\//u);
      expect(action.verifiedAt).toBe('2026-08-05');
      expect(action.multiplier).toBeGreaterThan(0);
      expect(action).not.toHaveProperty('duration');
      expect(action).not.toHaveProperty('actionsPerRotation');
      expect(action).not.toHaveProperty('repeatCount');
      expect(action).not.toHaveProperty('scalingStat');
    }
  });

  it('locks Hotori direct, katana and Finisher compositions without replay reconstruction', () => {
    expect(multiplier('hotori.misty-moon-style.full-sequence.level-10')).toBeCloseTo(714.2, 8);
    expect(multiplier('hotori.rippling-waves.level-10')).toBe(192);
    expect(multiplier('hotori.present-replay.direct.level-10')).toBeCloseTo(600.1, 8);
    expect(multiplier('hotori.worlds-tide.initial-composition.level-10')).toBeCloseTo(1598.9, 8);
    expect(multiplier('hotori.worlds-tide.katana-full-sequence.level-10')).toBeCloseTo(1099.5, 8);
    expect(multiplier('hotori.worlds-tide.finisher.level-10')).toBeCloseTo(599.7, 8);
    expect(multiplier('hotori.shopkeepers-authority.level-10')).toBeCloseTo(399.8, 8);
    expect(verifiedVisibleActionsBatchE.some((action) => action.id.includes('ally-replay'))).toBe(false);
    expect(verifiedVisibleActionsBatchE.find((action) => action.id.includes('finisher'))?.assumedConditions?.[0]?.ru)
      .toContain('ровно один раз');
  });

  it('locks Iroi final-ATK actions while excluding Base-ATK Regression lamb ratios', () => {
    expect(multiplier('iroi.collaboration.full-sequence.level-10')).toBeCloseTo(707.2, 8);
    expect(multiplier('iroi.daydream.full-charge.level-10')).toBeCloseTo(477.1, 8);
    expect(multiplier('iroi.lucid-dream.full-burst.level-10')).toBe(1659);
    expect(multiplier('iroi.future-self-continuity.direct.level-10')).toBeCloseTo(800.4, 8);
    expect(multiplier('iroi.3-8-billion-year-mirage.post-cast.level-10')).toBeCloseTo(599.7, 8);
    expect(multiplier('iroi.3-8-billion-year-mirage.one-dot-tick.level-10')).toBe(50);
    expect(multiplier('iroi.bang.level-10')).toBeCloseTo(399.8, 8);
    expect(multiplier('iroi.strategy-tit-for-tat.awakening-two')).toBe(200);
    expect(verifiedVisibleActionsBatchE.some((action) => action.id.includes('regression-morpheus'))).toBe(false);
    expect(verifiedVisibleActionsBatchE.find((action) => action.id.includes('one-dot-tick'))?.assumedConditions?.[0]?.ru)
      .toContain('ровно один');
  });

  it('locks Mint direct compositions without held-attack repetition', () => {
    expect(multiplier('mint.perfect-containment.full-sequence.level-10')).toBeCloseTo(413.9, 8);
    expect(multiplier('mint.super-claws.level-10')).toBeCloseTo(359.8, 8);
    expect(multiplier('mint.thunderous-whirlwind-slash.full-composition.level-10')).toBeCloseTo(1599.2, 8);
    expect(multiplier('mint.invincible-tornado-slash.level-10')).toBeCloseTo(399.8, 8);
    expect(verifiedVisibleActionsBatchE.some((action) => action.id.includes('hold-basic-repeat'))).toBe(false);
  });

  it('locks Skia direct actions and only one explicit Fang trigger at a time', () => {
    expect(multiplier('skia.arresting-art.full-sequence.level-10')).toBeCloseTo(517.1, 8);
    expect(multiplier('skia.fang-thrust.one-basic-trigger.level-10')).toBe(20);
    expect(multiplier('skia.shadow-hound-chase.initial-composition.level-10')).toBe(300);
    expect(multiplier('skia.shadow-hound-chase.one-fang-extra.level-10')).toBeCloseTo(109.9, 8);
    expect(multiplier('skia.shadow-hound-gnaw.outro.level-10')).toBe(100);
    expect(multiplier('skia.the-pack.full-composition.level-10')).toBeCloseTo(999.2, 8);
    expect(multiplier('skia.arrest-warrant.level-10')).toBeCloseTo(399.8, 8);
    expect(verifiedVisibleActionsBatchE.find((action) => action.id.includes('one-fang-extra'))?.description.ru)
      .toContain('не превращается');
  });

  it('blocks the wrong skill level and applies the exact level-10 action', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Hotori'),
      verifiedActionId: 'hotori.worlds-tide.initial-composition.level-10',
      skills: { basic: 10, skill: 10, ultimate: 9, support: 10 },
    };
    expect(calculateGameVisibleBuild(build, state).supported).toBe(false);
    const active = calculateGameVisibleBuild({ ...build, skills: { ...build.skills, ultimate: 10 } }, state);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBeCloseTo(1598.9, 8);
  });

  it('keeps all Batch E characters on partial coverage after the final scaling pass', () => {
    for (const characterName of ['Hotori', 'Iroi', 'Mint', 'Skia', 'Adler', 'Fadia']) {
      const coverage = combatCoverageByCharacter.get(characterName);
      expect(coverage?.coverage).toBe('partial');
      expect(coverage?.supportedModes).toContain('verified-action');
    }
    expect([...combatCoverageByCharacter.values()]
      .filter((coverage) => coverage.coverage === 'relative-only')).toHaveLength(0);
  });

  it('reuses representative Batch E records in Combat Scenario', () => {
    const state = initialGameVisibleTeamState();
    state.builds = [combatBuild('Hotori'), combatBuild('Iroi'), combatBuild('Mint'), combatBuild('Skia')];
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'Batch E standalone actions',
      steps: [
        { id: 'hotori', at: 0, kind: 'action', sourceSlot: 0, actionId: 'hotori.worlds-tide.initial-composition.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'iroi', at: 1, kind: 'action', sourceSlot: 1, actionId: 'iroi.lucid-dream.full-burst.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'mint', at: 2, kind: 'action', sourceSlot: 2, actionId: 'mint.thunderous-whirlwind-slash.full-composition.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'skia', at: 3, kind: 'action', sourceSlot: 3, actionId: 'skia.the-pack.full-composition.level-10', effectId: '', cycleId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(state, scenario);
    expect(result.calculatedActionCount).toBe(4);
    expect(result.blockedActionCount).toBe(0);
    expect(result.coveragePercent).toBe(100);
    [1598.9, 1659, 1599.2, 999.2].forEach((expected, index) => {
      expect(result.steps[index]?.calculation?.multiplier).toBeCloseTo(expected, 8);
    });
  });
});
