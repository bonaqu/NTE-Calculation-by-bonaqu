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
  it('imports all six sourced presets deterministically with honest coverage accounting', () => {
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
      expect(
        first.report.fullyMappedSourceSteps
        + first.report.partiallyMappedSourceSteps
        + first.report.unsupportedSourceSteps,
      ).toBe(preset.steps.length);
      expect(first.report.mappedSourceSteps).toBe(
        first.report.fullyMappedSourceSteps + first.report.partiallyMappedSourceSteps,
      );
      expect(first.report.generatedPartialRemainderSteps).toBe(first.report.partiallyMappedSourceSteps);
      expect(first.report.coveragePercent).toBeGreaterThanOrEqual(0);
      expect(first.report.coveragePercent).toBeLessThanOrEqual(100);
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

  it('expands the exact Hathor burst source step into four fully mapped verified actions', () => {
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
    expect(generated.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'full')).toBe(true);
  });

  it('expands a Haniel source step into exact actions, a pending effect and one visible remainder', () => {
    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const generated = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'chaos-haniel-buffs'
    ));
    expect(generated.map((step) => step.actionId).filter(Boolean)).toEqual([
      'haniel.silent-moonlit-forest-guardian.direct.level-10',
      'haniel.a-melody-named-haniel.initial.level-10',
    ]);
    expect(generated.filter((step) => imported.metadata.pendingByStepId[step.id]?.kind === 'activate-effect')).toHaveLength(1);
    expect(generated.filter((step) => step.kind === 'wait' && step.note.startsWith('Непокрытая часть'))).toHaveLength(1);
    expect(generated.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'partial')).toBe(true);
  });

  it('keeps timed effects and cycles inert until seconds are explicitly confirmed', () => {
    const preset = rotationPresetById.get('hathor-hyper')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const pendingIds = Object.keys(imported.metadata.pendingByStepId);
    expect(imported.report.generatedEffectSteps).toBe(2);
    expect(imported.report.generatedCycleSteps).toBe(1);
    expect(pendingIds).toHaveLength(3);
    expect(imported.scenario.steps.filter((step) => pendingIds.includes(step.id)).every((step) => step.kind === 'wait')).toBe(true);

    const confirmed = confirmRotationScenarioTiming(imported.scenario, imported.metadata);
    expect(confirmed.metadata.timingStatus).toBe('confirmed-seconds');
    expect(confirmed.scenario.steps.filter((step) => confirmed.metadata.pendingByStepId[step.id]?.kind === 'activate-effect').every((step) => step.kind === 'activate-effect')).toBe(true);
    expect(confirmed.scenario.steps.filter((step) => confirmed.metadata.pendingByStepId[step.id]?.kind === 'activate-cycle').every((step) => step.kind === 'activate-cycle')).toBe(true);

    const invalidated = invalidateRotationScenarioTiming(confirmed.scenario, confirmed.metadata, 'ru');
    expect(invalidated.metadata.timingStatus).toBe('order-only');
    expect(invalidated.scenario.steps.filter((step) => pendingIds.includes(step.id)).every((step) => step.kind === 'wait')).toBe(true);
  });

  it('does not choose an ambiguous Sakiri press or hold action from generic rotation prose', () => {
    for (const presetId of ['nanally-hexed-dual', 'lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const preset = rotationPresetById.get(presetId)!;
      const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
      expect(imported.scenario.steps.some((step) => step.actionId.startsWith('sakiri.devour-whole.'))).toBe(false);
      expect(imported.scenario.steps.some((step) => step.actionId === 'sakiri.feast-of-gluttony.level-10')).toBe(true);
    }
  });

  it('maps one explicit Baicang dodge attack but leaves open-ended spam unsupported', () => {
    const preset = rotationPresetById.get('baicang-firefly-hyper')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const explicit = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'baicang-dodge-charged-one'
    ));
    expect(explicit).toHaveLength(1);
    expect(explicit[0]?.actionId).toBe('baicang.silenced-thought.full-composition.level-10');
    expect(imported.metadata.originsByStepId[explicit[0]!.id]?.coverage).toBe('full');

    const spam = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'baicang-dodge-spam'
    ));
    expect(spam).toHaveLength(1);
    expect(spam[0]).toMatchObject({ kind: 'wait', actionId: '' });
    expect(imported.metadata.originsByStepId[spam[0]!.id]?.coverage).toBe('unsupported');
  });

  it('normalizes legacy v1 import metadata without changing scenario storage', () => {
    expect(initialCombatScenarioState()).toEqual({ version: 1, name: '', steps: [] });
    expect(initialRotationScenarioImportMetadata().timingStatus).toBe('none');
    expect(normalizeRotationScenarioImportMetadata({ version: 2 })).toBeNull();

    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const legacy = JSON.parse(JSON.stringify(imported.metadata)) as {
      originsByStepId: Record<string, { sourceStepId: string; part: number; coverage?: string }>;
    };
    Object.values(legacy.originsByStepId).forEach((origin) => delete origin.coverage);
    const normalized = normalizeRotationScenarioImportMetadata(legacy);
    expect(normalized?.report).toEqual(imported.report);
    expect(Object.values(normalized?.originsByStepId ?? {}).every((origin) => Boolean(origin.coverage))).toBe(true);
  });

  it('reports source origins and validates every stable binding', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    const previews = new Map(rotationPresets.map((preset) => [preset.id, previewRotationScenarioImport(preset)]));
    expect([...previews.values()].every((report) => report.partiallyMappedSourceSteps > 0)).toBe(true);
    expect(previews.get('hathor-hyper')?.fullyMappedSourceSteps).toBeGreaterThan(0);
    expect(previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(4);

    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const scenarioStep = imported.scenario.steps.find((step) => imported.metadata.originsByStepId[step.id]?.sourceStepId === 'chaos-stain')!;
    const origin = rotationSourceStep(imported.metadata, scenarioStep.id);
    expect(origin?.preset.id).toBe(preset.id);
    expect(origin?.step.id).toBe('chaos-stain');
    expect(origin?.coverage).toBe('partial');
  });
});
