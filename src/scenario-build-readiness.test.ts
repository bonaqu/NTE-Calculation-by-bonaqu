import { describe, expect, it } from 'vitest';
import {
  createBuildProfile,
  initialBuildProfileLibrary,
  type BuildProfileLibrary,
} from './build-profiles';
import type { CombatScenarioState } from './combat-scenario';
import {
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
  type GameVisibleCharacterBuild,
} from './game-visible-build';
import {
  applySelectedScenarioProfiles,
  evaluateScenarioBuildReadiness,
  uniqueReadyScenarioProfileSelections,
} from './scenario-build-readiness';

function configuredBuild(characterName: string): GameVisibleCharacterBuild {
  const build = createEmptyGameVisibleBuild(characterName);
  return {
    ...build,
    level: 80,
    maxLevel: 80,
    awakeningLevel: 0,
    baseAtk: 0,
    stats: {
      ...build.stats,
      atk: 2_000,
      critRate: 60,
      critDamage: 120,
    },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
  };
}

function libraryWithProfiles(): BuildProfileLibrary {
  let library = initialBuildProfileLibrary();
  library = createBuildProfile(library, configuredBuild('Hathor'), 'Hathor ready', {
    id: 'hathor-ready',
    now: '2026-08-05T00:00:00Z',
  });
  library = createBuildProfile(library, {
    ...configuredBuild('Haniel'),
    baseAtk: 500,
  }, 'Haniel ready', {
    id: 'haniel-ready',
    now: '2026-08-05T00:01:00Z',
  });
  library = createBuildProfile(library, configuredBuild('Haniel'), 'Haniel missing Base ATK', {
    id: 'haniel-incomplete',
    now: '2026-08-05T00:02:00Z',
  });
  library = createBuildProfile(library, {
    ...configuredBuild('Sakiri'),
    baseAtk: 600,
    awakeningLevel: 4,
  }, 'Sakiri A4 ready', {
    id: 'sakiri-ready',
    now: '2026-08-05T00:03:00Z',
  });
  return library;
}

const scenario: CombatScenarioState = {
  version: 1,
  name: 'Readiness test',
  steps: [
    { id: 'hathor-action', at: 0, kind: 'action', sourceSlot: 0, actionId: 'hathor.rider-express.level-10', effectId: '', cycleId: '', note: '' },
    { id: 'haniel-action', at: 1, kind: 'action', sourceSlot: 1, actionId: 'haniel.a-melody-named-haniel.initial.level-10', effectId: '', cycleId: '', note: '' },
    { id: 'haniel-effect', at: 2, kind: 'activate-effect', sourceSlot: 1, actionId: '', effectId: 'haniel.friendship.nova-atk-drain', cycleId: '', note: '' },
    { id: 'sakiri-action', at: 3, kind: 'action', sourceSlot: 2, actionId: 'sakiri.feast-of-gluttony.level-10', effectId: '', cycleId: '', note: '' },
    { id: 'sakiri-effect', at: 4, kind: 'activate-effect', sourceSlot: 2, actionId: '', effectId: 'sakiri.awakening-four.team-atk', cycleId: '', note: '' },
  ],
};

function emptyScenarioTeam() {
  const team = initialGameVisibleTeamState();
  team.builds = [
    createEmptyGameVisibleBuild('Hathor'),
    createEmptyGameVisibleBuild('Haniel'),
    createEmptyGameVisibleBuild('Sakiri'),
    createEmptyGameVisibleBuild('Zero'),
  ];
  return team;
}

describe('imported-scenario build readiness', () => {
  it('reports exact current-build requirements without ranking profiles', () => {
    const report = evaluateScenarioBuildReadiness(emptyScenarioTeam(), scenario, libraryWithProfiles());
    expect(report.requiredSlotCount).toBe(3);
    expect(report.readySlotCount).toBe(0);
    expect(report.slots[3]?.status).toBe('not-used');

    const hathor = report.slots[0]!;
    expect(hathor.currentIssues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['missing-final-atk', 'skill-level']));
    expect(hathor.matchingProfiles).toHaveLength(1);
    expect(hathor.matchingProfiles[0]?.ready).toBe(true);

    const haniel = report.slots[1]!;
    expect(haniel.matchingProfiles).toHaveLength(2);
    expect(haniel.matchingProfiles.filter((profile) => profile.ready).map((profile) => profile.profile.id)).toEqual(['haniel-ready']);
    expect(haniel.matchingProfiles.find((profile) => profile.profile.id === 'haniel-incomplete')?.issues.map((issue) => issue.code)).toContain('base-atk');

    const sakiri = report.slots[2]!;
    expect(sakiri.currentIssues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['awakening', 'base-atk']));
    expect(sakiri.matchingProfiles[0]?.ready).toBe(true);
  });

  it('selects only one unambiguous ready profile per required non-ready slot', () => {
    const report = evaluateScenarioBuildReadiness(emptyScenarioTeam(), scenario, libraryWithProfiles());
    expect(uniqueReadyScenarioProfileSelections(report)).toEqual({
      0: 'hathor-ready',
      1: 'haniel-ready',
      2: 'sakiri-ready',
    });
  });

  it('applies selected profiles atomically and clears temporary combat state', () => {
    const team = emptyScenarioTeam();
    team.builds[0]!.activeTeamEffectIds = ['hathor.delay-warning.remora-crit-rate'];
    team.builds[0]!.arc.afterUltimateActive = true;
    const library = libraryWithProfiles();
    const result = applySelectedScenarioProfiles(team, library, {
      0: 'hathor-ready',
      1: 'haniel-ready',
      2: 'sakiri-ready',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.appliedSlots).toEqual([0, 1, 2]);
    expect(result.team.builds[0]?.activeTeamEffectIds).toEqual([]);
    expect(result.team.builds[0]?.arc.afterUltimateActive).toBe(false);
    expect(evaluateScenarioBuildReadiness(result.team, scenario, library).readySlotCount).toBe(3);
  });

  it('rejects a mismatched selection without returning a partly modified team', () => {
    const team = emptyScenarioTeam();
    const result = applySelectedScenarioProfiles(team, libraryWithProfiles(), {
      0: 'hathor-ready',
      1: 'sakiri-ready',
    });
    expect(result).toEqual({ ok: false, error: 'character-mismatch' });
    expect(team.builds.every((build) => build.stats.atk === 0)).toBe(true);
  });

  it('keeps target-level requirements separate and lets a compatible profile resolve them', () => {
    const team = initialGameVisibleTeamState();
    team.builds[0] = createEmptyGameVisibleBuild('Zero');
    team.target.level = 60;
    const zeroScenario: CombatScenarioState = {
      version: 1,
      name: 'Zero target gate',
      steps: [{
        id: 'zero-a1',
        at: 0,
        kind: 'action',
        sourceSlot: 0,
        actionId: 'zero.blooming-gaze.awakening-one',
        effectId: '',
        cycleId: '',
        note: '',
      }],
    };
    let library = initialBuildProfileLibrary();
    library = createBuildProfile(library, {
      ...configuredBuild('Zero'),
      level: 70,
      maxLevel: 70,
      awakeningLevel: 1,
    }, 'Zero target-ready', {
      id: 'zero-target-ready',
      now: '2026-08-05T00:00:00Z',
    });
    const report = evaluateScenarioBuildReadiness(team, zeroScenario, library);
    expect(report.slots[0]?.currentIssues.map((issue) => issue.scope)).toContain('target');
    expect(report.slots[0]?.matchingProfiles[0]?.ready).toBe(true);
  });

  it('reports unsupported Cycle composition as a global scenario issue', () => {
    const team = emptyScenarioTeam();
    const cycleScenario: CombatScenarioState = {
      version: 1,
      name: 'Invalid Stain team',
      steps: [{ id: 'stain', at: 0, kind: 'activate-cycle', sourceSlot: 0, actionId: '', effectId: '', cycleId: 'stain', note: '' }],
    };
    const report = evaluateScenarioBuildReadiness(team, cycleScenario, initialBuildProfileLibrary());
    expect(report.globalIssues.map((issue) => issue.code)).toContain('cycle-attributes');
  });
});
