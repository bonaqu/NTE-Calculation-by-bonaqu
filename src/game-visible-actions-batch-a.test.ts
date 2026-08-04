import { describe, expect, it } from 'vitest';
import { calculateGameVisibleBuild, verifiedVisibleActions } from './game-visible-calculation';
import { createEmptyGameVisibleBuild, initialGameVisibleTeamState, type GameVisibleCharacterBuild } from './game-visible-build';

function combatBuild(characterName: string): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    stats: {
      ...build.stats,
      atk: 2_000,
      critRate: 50,
      critDamage: 100,
      damageBonus: 10,
      attributeDamageBonus: 20,
    },
    testMode: 'verified-action',
  };
}

describe('verified game-visible actions batch A', () => {
  it('publishes nine unique standalone records for five characters', () => {
    expect(verifiedVisibleActions).toHaveLength(9);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(9);
    expect(new Set(verifiedVisibleActions.map((action) => action.characterName)))
      .toEqual(new Set(['Shinku', 'Nanally', 'Chaos', 'Lacrimosa', 'Zero']));
    for (const action of verifiedVisibleActions) {
      expect(action.multiplier).toBeGreaterThan(0);
      expect(action.title.ru.trim()).not.toBe('');
      expect(action.title.en.trim()).not.toBe('');
      expect(action.description.ru.trim()).not.toBe('');
      expect(action.description.en.trim()).not.toBe('');
      expect(action).not.toHaveProperty('actionsPerRotation');
      expect(action).not.toHaveProperty('duration');
      expect(action).not.toHaveProperty('hitCount');
    }
  });

  it('uses Nanally level-11 passive values and enforces Awakening 3 separately', () => {
    const state = initialGameVisibleTeamState();
    const fairDuel = {
      ...combatBuild('Nanally'),
      verifiedActionId: 'nanally.fair-duel.level-11',
      skills: { ...combatBuild('Nanally').skills, basic: 11 },
    };
    const fairResult = calculateGameVisibleBuild(fairDuel, state);
    expect(fairResult.supported).toBe(true);
    expect(fairResult.multiplier).toBe(129.5);
    expect(fairResult.conditions.some((condition) => condition.label.ru.includes('Авторитет Ити-дайме'))).toBe(true);

    const awakeningThree = {
      ...fairDuel,
      verifiedActionId: 'nanally.awakening-three-follow-up.level-11',
      awakeningLevel: 2,
    };
    const blocked = calculateGameVisibleBuild(awakeningThree, state);
    expect(blocked.supported).toBe(false);
    expect(blocked.blockedReason?.ru).toContain('пробуждение 3');

    const active = calculateGameVisibleBuild({ ...awakeningThree, awakeningLevel: 3 }, state);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBe(107.9);
  });

  it('models only the base and capped standalone Remora endings for Chaos', () => {
    const state = initialGameVisibleTeamState();
    const base = calculateGameVisibleBuild({
      ...combatBuild('Chaos'),
      verifiedActionId: 'chaos.remora-enhancement.base-five-seconds',
    }, state);
    const maximum = calculateGameVisibleBuild({
      ...combatBuild('Chaos'),
      verifiedActionId: 'chaos.remora-enhancement.maximum-twelve-seconds',
    }, state);
    expect(base.supported).toBe(true);
    expect(maximum.supported).toBe(true);
    expect(base.multiplier).toBe(800);
    expect(maximum.multiplier).toBe(3200);
    expect(maximum.result?.expected).toBeCloseTo((base.result?.expected ?? 0) * 4, 8);
    expect(maximum.conditions.some((condition) => condition.label.ru.includes('12 секунд'))).toBe(true);
  });

  it('keeps Lacrimosa Discord bonus separate from normal Discord damage', () => {
    const state = initialGameVisibleTeamState();
    const result = calculateGameVisibleBuild({
      ...combatBuild('Lacrimosa'),
      verifiedActionId: 'lacrimosa.discord-enhancement.broken-target',
    }, state);
    expect(result.supported).toBe(true);
    expect(result.multiplier).toBe(400);
    expect(result.explanation.ru).toContain('не включает обычный урон Диссонанса');
    expect(result.conditions.some((condition) => condition.label.ru.includes('уже сломлена'))).toBe(true);
  });

  it('validates Zero target level, Awakening and per-hit DEF Ignore', () => {
    const highTargetState = initialGameVisibleTeamState();
    const awakeningOne = {
      ...combatBuild('Zero'),
      level: 70,
      awakeningLevel: 1,
      verifiedActionId: 'zero.blooming-gaze.awakening-one',
    };
    const blockedByLevel = calculateGameVisibleBuild(awakeningOne, highTargetState);
    expect(blockedByLevel.supported).toBe(false);
    expect(blockedByLevel.blockedReason?.ru).toContain('Цель должна быть ниже уровня персонажа');

    const lowTargetState = {
      ...highTargetState,
      target: { ...highTargetState.target, level: 60 },
    };
    const active = calculateGameVisibleBuild(awakeningOne, lowTargetState);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBe(200);
    expect(active.conditions.some((condition) => condition.label.ru.includes('75% защиты'))).toBe(true);

    const awakeningSix = {
      ...awakeningOne,
      awakeningLevel: 5,
      verifiedActionId: 'zero.appraise-and-engrave-extra.awakening-six',
    };
    expect(calculateGameVisibleBuild(awakeningSix, lowTargetState).supported).toBe(false);
    const a6 = calculateGameVisibleBuild({ ...awakeningSix, awakeningLevel: 6 }, lowTargetState);
    expect(a6.supported).toBe(true);
    expect(a6.multiplier).toBe(300);
  });

  it('keeps no-skill-level passive records available at real upgraded skill levels', () => {
    const state = initialGameVisibleTeamState();
    const chaos = combatBuild('Chaos');
    const result = calculateGameVisibleBuild({
      ...chaos,
      skills: { basic: 9, skill: 9, ultimate: 9, support: 8 },
      verifiedActionId: 'chaos.remora-enhancement.base-five-seconds',
    }, state);
    expect(result.supported).toBe(true);
  });
});
