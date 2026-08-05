import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { calculateGameVisibleBuild, verifiedVisibleActions } from './game-visible-calculation';
import {
  combatCoverageByCharacter,
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';
import { verifiedVisibleActionsBatchD } from './verified-visible-actions-batch-d';

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
    },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
    testMode: 'verified-action',
  };
}

function multiplier(id: string): number | undefined {
  return verifiedVisibleActionsBatchD.find((action) => action.id === id)?.multiplier;
}

describe('verified game-visible actions batch D', () => {
  it('adds fourteen unique ATK-scaling records inside the complete action catalog', () => {
    expect(verifiedVisibleActionsBatchD).toHaveLength(14);
    expect(verifiedVisibleActions).toHaveLength(86);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(86);
    expect(new Set(verifiedVisibleActionsBatchD.map((action) => action.characterName))).toEqual(
      new Set(['Aurelia', 'Chiz', 'Edgar']),
    );
    for (const action of verifiedVisibleActionsBatchD) {
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

  it('locks Aurelia direct compositions and one explicit Nova-end trigger', () => {
    expect(multiplier('aurelia.cappella.legato-full-sequence.level-10')).toBeCloseTo(454.5, 8);
    expect(multiplier('aurelia.cadenza-aria.direct.level-10')).toBeCloseTo(199.9, 8);
    expect(multiplier('aurelia.canon-chorus.full-composition.level-10')).toBeCloseTo(999.8, 8);
    expect(multiplier('aurelia.dissonance.level-10')).toBeCloseTo(399.8, 8);
    expect(multiplier('aurelia.harmonics.nova-end-trigger')).toBe(150);
    const harmonics = verifiedVisibleActionsBatchD.find((action) => action.id.includes('harmonics'))!;
    expect(harmonics.requiredLevel).toBe('—');
    expect(harmonics.assumedConditions?.some((condition) => condition.ru.includes('ровно три'))).toBe(true);
  });

  it('locks Chiz normal and branch attacks without Grain-dependent Skill reconstruction', () => {
    expect(multiplier('chiz.exiled-swordplay.full-sequence.level-10')).toBeCloseTo(651.3, 8);
    expect(multiplier('chiz.blighted-vale.normal-attack-branch.level-10')).toBeCloseTo(383.8, 8);
    expect(multiplier('chiz.blighted-vale.press.level-10')).toBeCloseTo(309.8, 8);
    expect(multiplier('chiz.zero-sum-game.direct.level-10')).toBeCloseTo(1000.1, 8);
    expect(multiplier('chiz.temporary-entry.level-10')).toBeCloseTo(399.8, 8);
    expect(verifiedVisibleActionsBatchD.some((action) => action.id.includes('grain-settlement'))).toBe(false);
    expect(verifiedVisibleActionsBatchD.some((action) => action.id.includes('pink-paws'))).toBe(false);
  });

  it('locks Edgar direct damage and keeps healing outside the damage model', () => {
    expect(multiplier('edgar.combat-practice.full-sequence.level-10')).toBeCloseTo(649.1, 8);
    expect(multiplier('edgar.wild-current.full-channel.level-10')).toBeCloseTo(1119.3, 8);
    expect(multiplier('edgar.finnegans-wake.direct.level-10')).toBeCloseTo(799.6, 8);
    expect(multiplier('edgar.weight-of-knowledge.level-10')).toBeCloseTo(399.8, 8);
    for (const action of verifiedVisibleActionsBatchD.filter((entry) => entry.characterName === 'Edgar')) {
      expect(`${action.description.ru} ${action.description.en}`).not.toMatch(/heal amount|восстановление:\s*\d/iu);
    }
  });

  it('keeps DEF and Max-HP scalers outside the ATK-only Batch D records', () => {
    expect(verifiedVisibleActionsBatchD.some((action) => action.characterName === 'Adler')).toBe(false);
    expect(verifiedVisibleActionsBatchD.some((action) => action.characterName === 'Fadia')).toBe(false);
    expect(combatCoverageByCharacter.get('Adler')?.coverage).toBe('partial');
    expect(combatCoverageByCharacter.get('Fadia')?.coverage).toBe('partial');
  });

  it('blocks unsourced skill levels and activates the exact level-10 record', () => {
    const state = initialGameVisibleTeamState();
    const build = {
      ...combatBuild('Chiz'),
      verifiedActionId: 'chiz.zero-sum-game.direct.level-10',
      skills: { basic: 10, skill: 10, ultimate: 9, support: 10 },
    };
    const blocked = calculateGameVisibleBuild(build, state);
    expect(blocked.supported).toBe(false);
    expect(blocked.blockedReason?.ru).toContain('уровень 10');
    const active = calculateGameVisibleBuild({
      ...build,
      skills: { ...build.skills, ultimate: 10 },
    }, state);
    expect(active.supported).toBe(true);
    expect(active.multiplier).toBeCloseTo(1000.1, 8);
  });

  it('promotes exactly the three Batch D characters to partial verified-action coverage', () => {
    for (const characterName of ['Aurelia', 'Chiz', 'Edgar']) {
      const coverage = combatCoverageByCharacter.get(characterName);
      expect(coverage?.coverage).toBe('partial');
      expect(coverage?.supportedModes).toContain('verified-action');
    }
  });

  it('makes representative actions reusable by the time-aware scenario engine', () => {
    const state = initialGameVisibleTeamState();
    state.builds = [
      combatBuild('Aurelia'),
      combatBuild('Chiz'),
      combatBuild('Edgar'),
      combatBuild('Zero'),
    ];
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'Batch D standalone actions',
      steps: [
        { id: 'aurelia', at: 0, kind: 'action', sourceSlot: 0, actionId: 'aurelia.canon-chorus.full-composition.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'chiz', at: 1, kind: 'action', sourceSlot: 1, actionId: 'chiz.zero-sum-game.direct.level-10', effectId: '', cycleId: '', note: '' },
        { id: 'edgar', at: 2, kind: 'action', sourceSlot: 2, actionId: 'edgar.wild-current.full-channel.level-10', effectId: '', cycleId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(state, scenario);
    expect(result.calculatedActionCount).toBe(3);
    expect(result.blockedActionCount).toBe(0);
    expect(result.coveragePercent).toBe(100);
    const values = result.steps.map((entry) => entry.calculation?.multiplier ?? 0);
    [999.8, 1000.1, 1119.3].forEach((expected, index) => {
      expect(values[index]).toBeCloseTo(expected, 8);
    });
  });
});
