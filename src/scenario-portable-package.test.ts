import { describe, expect, it } from 'vitest';
import {
  initialCombatScenarioState,
  type CombatScenarioState,
} from './combat-scenario';
import {
  createEmptyGameVisibleBuild,
  initialGameVisibleTeamState,
} from './game-visible-build';
import { rotationPresetById } from './rotation-presets';
import {
  importRotationPresetToScenario,
  initialRotationScenarioImportMetadata,
} from './rotation-scenario-import';
import {
  applyScenarioPortablePackage,
  exportScenarioPortablePackage,
  parseScenarioPortablePackage,
  type ScenarioPortableEnvelope,
} from './scenario-portable-package';

function configuredTeam() {
  const team = initialGameVisibleTeamState();
  team.builds = [
    { ...createEmptyGameVisibleBuild('Hathor'), stats: { ...createEmptyGameVisibleBuild('Hathor').stats, atk: 2_100 }, skills: { basic: 10, skill: 10, ultimate: 10, support: 10 } },
    { ...createEmptyGameVisibleBuild('Haniel'), baseAtk: 500, stats: { ...createEmptyGameVisibleBuild('Haniel').stats, atk: 1_700 } },
    { ...createEmptyGameVisibleBuild('Zero'), stats: { ...createEmptyGameVisibleBuild('Zero').stats, atk: 1_900 } },
    { ...createEmptyGameVisibleBuild('Shinku'), stats: { ...createEmptyGameVisibleBuild('Shinku').stats, atk: 2_300 } },
  ];
  team.builds[0]!.activeTeamEffectIds = ['hathor.delay-warning.remora-crit-rate'];
  team.builds[0]!.arc.afterUltimateActive = true;
  team.builds[0]!.testMode = 'verified-action';
  team.builds[0]!.verifiedActionId = 'hathor.rider-express.level-10';
  team.target = { level: 82, resistance: 20, defenceReduction: 12, resistanceReduction: 5, boss: true };
  return team;
}

const smallScenario: CombatScenarioState = {
  version: 1,
  name: 'Portable test',
  steps: [
    { id: 'known', at: 0, kind: 'action', sourceSlot: 0, actionId: 'hathor.rider-express.level-10', effectId: '', cycleId: '', note: '' },
    { id: 'unknown', at: 1, kind: 'action', sourceSlot: 0, actionId: 'future.action.id', effectId: '', cycleId: '', note: 'Keep this row' },
    { id: 'wait', at: 2, kind: 'wait', sourceSlot: 1, actionId: '', effectId: '', cycleId: '', note: 'Manual remainder' },
  ],
};

describe('portable Combat Scenario package', () => {
  it('round-trips sanitized builds and exposes a useful preview', () => {
    const text = exportScenarioPortablePackage(
      configuredTeam(),
      smallScenario,
      initialRotationScenarioImportMetadata(),
      { includeBuilds: true, now: '2026-08-05T07:10:00Z' },
    );
    const parsed = parseScenarioPortablePackage(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.preview).toMatchObject({
      name: 'Portable test',
      buildMode: 'sanitized-builds',
      totalSteps: 3,
      actionSteps: 2,
      waitSteps: 1,
      blockedModelRows: 1,
    });
    const build = parsed.value.payload.team.builds?.[0];
    expect(build?.activeTeamEffectIds).toEqual([]);
    expect(build?.arc.afterUltimateActive).toBe(false);
    expect(build?.testMode).toBe('neutral-reference');
    expect(build?.verifiedActionId).toBe('');
  });

  it('rejects a changed payload through the checksum', () => {
    const text = exportScenarioPortablePackage(
      configuredTeam(),
      smallScenario,
      initialRotationScenarioImportMetadata(),
      { includeBuilds: false, now: '2026-08-05T07:10:00Z' },
    );
    const envelope = JSON.parse(text) as ScenarioPortableEnvelope;
    envelope.payload.team.target.level = 1;
    expect(parseScenarioPortablePackage(JSON.stringify(envelope))).toEqual({ ok: false, error: 'checksum-mismatch' });
  });

  it('preserves same-slot local builds in lineup-only mode and resets changed slots', () => {
    const source = configuredTeam();
    const text = exportScenarioPortablePackage(
      source,
      smallScenario,
      initialRotationScenarioImportMetadata(),
      { includeBuilds: false, now: '2026-08-05T07:10:00Z' },
    );
    const parsed = parseScenarioPortablePackage(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const local = configuredTeam();
    local.builds[0]!.stats.atk = 3_333;
    local.builds[1] = { ...createEmptyGameVisibleBuild('Sakiri'), stats: { ...createEmptyGameVisibleBuild('Sakiri').stats, atk: 2_222 } };
    const applied = applyScenarioPortablePackage(local, parsed.value);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.team.builds[0]?.stats.atk).toBe(3_333);
    expect(applied.team.builds[0]?.activeTeamEffectIds).toEqual([]);
    expect(applied.team.builds[1]?.characterName).toBe('Haniel');
    expect(applied.team.builds[1]?.stats.atk).toBe(0);
  });

  it('replaces builds with sanitized snapshots when included', () => {
    const source = configuredTeam();
    source.builds[0]!.stats.atk = 2_777;
    const text = exportScenarioPortablePackage(
      source,
      smallScenario,
      initialRotationScenarioImportMetadata(),
      { includeBuilds: true, now: '2026-08-05T07:10:00Z' },
    );
    const parsed = parseScenarioPortablePackage(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const local = configuredTeam();
    local.builds[0]!.stats.atk = 9_999;
    const applied = applyScenarioPortablePackage(local, parsed.value);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.team.builds[0]?.stats.atk).toBe(2_777);
    expect(applied.team.target.level).toBe(82);
  });

  it('preserves unsupported scenario rows instead of deleting them', () => {
    const text = exportScenarioPortablePackage(
      configuredTeam(),
      smallScenario,
      initialRotationScenarioImportMetadata(),
      { includeBuilds: false, now: '2026-08-05T07:10:00Z' },
    );
    const parsed = parseScenarioPortablePackage(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.payload.scenario.steps.find((step) => step.id === 'unknown')).toMatchObject({
      actionId: 'future.action.id',
      note: 'Keep this row',
    });
  });

  it('keeps valid Rotation Lab provenance and removes orphan references', () => {
    const preset = rotationPresetById.get('hathor-hyper');
    expect(preset).toBeDefined();
    if (!preset) return;
    const imported = importRotationPresetToScenario(preset, configuredTeam(), 'en');
    imported.metadata.originsByStepId.orphan = { sourceStepId: 'missing', part: 0, coverage: 'unsupported' };
    const text = exportScenarioPortablePackage(
      imported.team,
      imported.scenario,
      imported.metadata,
      { includeBuilds: false, now: '2026-08-05T07:10:00Z' },
    );
    const parsed = parseScenarioPortablePackage(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.preview.sourceRotationId).toBe('hathor-hyper');
    expect(parsed.value.preview.timingStatus).toBe('order-only');
    expect(parsed.value.payload.rotation.originsByStepId.orphan).toBeUndefined();
    expect(Object.keys(parsed.value.payload.rotation.originsByStepId).length).toBeGreaterThan(0);
  });

  it('allows an empty scenario package without inventing rows', () => {
    const text = exportScenarioPortablePackage(
      configuredTeam(),
      initialCombatScenarioState(),
      initialRotationScenarioImportMetadata(),
      { includeBuilds: false, now: '2026-08-05T07:10:00Z', name: 'Empty workspace' },
    );
    const parsed = parseScenarioPortablePackage(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.preview.totalSteps).toBe(0);
    expect(parsed.value.preview.name).toBe('Empty workspace');
  });
});
