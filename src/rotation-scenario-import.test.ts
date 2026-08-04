import { describe, expect, it } from 'vitest';
import { initialCombatScenarioState } from './combat-scenario';
import { createEmptyGameVisibleBuild, initialGameVisibleTeamState } from './game-visible-build';
import { rotationPresetById, rotationPresets } from './rotation-presets';
import {
  confirmRotationScenarioTiming,
  importRotationPresetToScenario,
  initialRotationScenarioImportMetadata,
  invalidateRotationScenarioTiming,
  normalizeRotationScenarioImportMetadata,
  previewRotationScenarioImport,
  rotationSourceStep,
  validateRotationScenarioBindings,
} from './rotation-scenario-import';

describe('Rotation Lab to Combat Scenario import', () => {
  it('imports all six sourced presets deterministically with exact lineups', () => {
    expect(rotationPresets).toHaveLength(6);
    for (const preset of rotationPresets) {
      const first = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
      const second = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
      expect(first).toEqual(second);
      expect(first.team.builds.map((build) => build.characterName)).toEqual(preset.team);
      expect(new Set(first.team.builds.map((build) => build.characterName)).size).toBe(4);
      expect(first.scenario.steps.length).toBeGreaterThanOrEqual(preset.steps.length);
      expect(first.metadata.sourceRotationId).toBe(preset.id);
      expect(first.metadata.timingStatus).toBe('order-only');
      expect(first.report.totalSourceSteps).toBe(preset.steps.length);
      expect(first.report.mappedSourceSteps + first.report.unsupportedSourceSteps).toBe(preset.steps.length);
    }
  });

  it('keeps a build only when the same character remains in the same slot', () => {
    const preset = rotationPresetById.get('hathor-hyper')!;
    const current = initialGameVisibleTeamState();
    current.builds[0] = {
      ...createEmptyGameVisibleBuild('Hathor'),
      stats: { ...createEmptyGameVisibleBuild('Hathor').stats, atk: 2_345 },
    };
    current.builds[1] = {
      ...createEmptyGameVisibleBuild('Hathor'),
      stats: { ...createEmptyGameVisibleBuild('Hathor').stats, atk: 9_999 },
    };
    const imported = importRotationPresetToScenario(preset, current, 'ru');
    expect(imported.team.builds[0]?.characterName).toBe('Hathor');
    expect(imported.team.builds[0]?.stats.atk).toBe(2_345);
    expect(imported.team.builds[1]?.characterName).toBe('Jiuyuan');
    expect(imported.team.builds[1]?.stats.atk).toBe(0);
  });

  it('expands the exact Hathor burst source step into four verified actions', () => {
    const preset = rotationPresetById.get('hathor-hyper')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
    const source = preset.steps.find((step) => step.id === 'hathor-ultimate')!;
    const generated = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === source.id
    ));
    expect(generated.map((step) => step.actionId)).toEqual([
      'hathor.rider-express.level-10',
      'hathor.cyclone-strike-first.level-10',
      'hathor.cyclone-strike-second.level-10',
      'hathor.cyclone-strike-third.level-10',
    ]);
    expect(generated.every((step) => step.kind === 'action')).toBe(true);
    expect(imported.report.generatedActionSteps).toBe(4);
  });

  it('keeps timed effects and cycles inert until seconds are explicitly confirmed', () => {
    const preset = rotationPresetById.get('hathor-hyper')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const pendingIds = Object.keys(imported.metadata.pendingByStepId);
    expect(pendingIds).toHaveLength(2);
    expect(imported.scenario.steps.filter((step) => pendingIds.includes(step.id)).every((step) => step.kind === 'wait')).toBe(true);

    const confirmed = confirmRotationScenarioTiming(imported.scenario, imported.metadata);
    expect(confirmed.metadata.timingStatus).toBe('confirmed-seconds');
    expect(confirmed.scenario.steps.find((step) => confirmed.metadata.pendingByStepId[step.id]?.kind === 'activate-effect')?.kind).toBe('activate-effect');
    expect(confirmed.scenario.steps.find((step) => confirmed.metadata.pendingByStepId[step.id]?.kind === 'activate-cycle')?.kind).toBe('activate-cycle');

    const invalidated = invalidateRotationScenarioTiming(confirmed.scenario, confirmed.metadata, 'ru');
    expect(invalidated.metadata.timingStatus).toBe('order-only');
    expect(invalidated.scenario.steps.filter((step) => pendingIds.includes(step.id)).every((step) => step.kind === 'wait')).toBe(true);
  });

  it('normalizes import metadata without changing the stable scenario v1 storage', () => {
    expect(initialCombatScenarioState()).toEqual({ version: 1, name: '', steps: [] });
    expect(initialRotationScenarioImportMetadata().timingStatus).toBe('none');
    expect(normalizeRotationScenarioImportMetadata({ version: 2 })).toBeNull();

    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const normalized = normalizeRotationScenarioImportMetadata(JSON.parse(JSON.stringify(imported.metadata)));
    expect(normalized).toEqual(imported.metadata);
  });

  it('reports source origins and validates every stable binding', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    for (const preset of rotationPresets) {
      const report = previewRotationScenarioImport(preset);
      expect(report.coveragePercent).toBeGreaterThanOrEqual(0);
      expect(report.coveragePercent).toBeLessThanOrEqual(100);
    }
    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const scenarioStep = imported.scenario.steps.find((step) => imported.metadata.originsByStepId[step.id]?.sourceStepId === 'chaos-stain')!;
    const origin = rotationSourceStep(imported.metadata, scenarioStep.id);
    expect(origin?.preset.id).toBe(preset.id);
    expect(origin?.step.id).toBe('chaos-stain');
  });
});
