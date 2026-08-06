import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import {
  confirmRotationScenarioTiming,
  importRotationPresetToScenario,
  previewRotationScenarioImport,
  rotationScenarioBindings,
} from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';

const preset = rotationPresetById.get('shinku-charge')!;

describe('Shinku Rotation Lab exact bindings', () => {
  it('reports one full, five partial and two unsupported source steps', () => {
    expect(previewRotationScenarioImport(preset)).toMatchObject({
      presetId: 'shinku-charge',
      totalSourceSteps: 8,
      fullyMappedSourceSteps: 1,
      partiallyMappedSourceSteps: 5,
      mappedSourceSteps: 6,
      generatedActionSteps: 14,
      generatedEffectSteps: 2,
      generatedCycleSteps: 0,
      generatedPartialRemainderSteps: 5,
      unsupportedSourceSteps: 2,
      coveragePercent: 43.8,
    });
  });

  it('binds five Scarlet Descent casts without inventing Basic Attack count', () => {
    const binding = rotationScenarioBindings['shinku-charge:shinku-enhanced-skills'];
    expect(binding).toEqual({
      coverage: 'partial',
      items: [{
        kind: 'action-sequence',
        actionIds: Array.from({ length: 5 }, () => 'shinku.scarlet-descent.level-10'),
      }],
    });
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const generated = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'shinku-enhanced-skills'
    ));
    expect(generated.filter((step) => step.kind === 'action').map((step) => step.actionId)).toEqual(
      Array.from({ length: 5 }, () => 'shinku.scarlet-descent.level-10'),
    );
    expect(generated.filter((step) => step.kind === 'wait' && step.note.startsWith('Непокрытая часть'))).toHaveLength(1);
  });

  it('binds three Crimson Judgment dashes followed by a separate finisher', () => {
    expect(rotationScenarioBindings['shinku-charge:shinku-dashes']).toEqual({
      coverage: 'full',
      items: [{
        kind: 'action-sequence',
        actionIds: [
          'shinku.crimson-judgment.one-dash.level-10',
          'shinku.crimson-judgment.one-dash.level-10',
          'shinku.crimson-judgment.one-dash.level-10',
          'shinku.dragonflame-verdict.level-10',
        ],
      }],
    });
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
    const generated = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'shinku-dashes'
    ));
    expect(generated.map((step) => step.actionId)).toEqual([
      'shinku.crimson-judgment.one-dash.level-10',
      'shinku.crimson-judgment.one-dash.level-10',
      'shinku.crimson-judgment.one-dash.level-10',
      'shinku.dragonflame-verdict.level-10',
    ]);
    expect(generated.every((step) => step.kind === 'action')).toBe(true);
    expect(generated.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'full')).toBe(true);
  });

  it('keeps Surging Crimson pending until timing is explicitly confirmed', () => {
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const pendingEntry = Object.entries(imported.metadata.pendingByStepId).find(([, pending]) => (
      pending.kind === 'activate-effect' && pending.effectId === 'shinku.surging-crimson.damage'
    ));
    expect(pendingEntry).toBeDefined();
    const [stepId] = pendingEntry!;
    expect(imported.scenario.steps.find((step) => step.id === stepId)?.kind).toBe('wait');

    const confirmed = confirmRotationScenarioTiming(imported.scenario, imported.metadata);
    expect(confirmed.scenario.steps.find((step) => step.id === stepId)).toMatchObject({
      kind: 'activate-effect',
      effectId: 'shinku.surging-crimson.damage',
      sourceSlot: 0,
    });
  });

  it('leaves Zero and Nanally setup unsupported instead of synthesizing their actions', () => {
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    for (const sourceStepId of ['zero-fill', 'nanally-charge']) {
      const generated = imported.scenario.steps.filter((step) => (
        imported.metadata.originsByStepId[step.id]?.sourceStepId === sourceStepId
      ));
      expect(generated).toHaveLength(1);
      expect(generated[0]).toMatchObject({ kind: 'wait', actionId: '' });
      expect(imported.metadata.originsByStepId[generated[0]!.id]?.coverage).toBe('unsupported');
    }
  });
});
