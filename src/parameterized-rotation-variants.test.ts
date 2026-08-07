import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAudit, currentRotationGapAuditSummary, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import {
  importRotationPresetToScenario,
  initialRotationScenarioImportMetadata,
  normalizeRotationScenarioImportMetadata,
  previewRotationScenarioImport,
  rotationScenarioVariantControls,
  rotationScenarioVariantRequirements,
  rotationScenarioVariantSourceKeys,
  unresolvedRotationScenarioVariantControls,
  validateRotationScenarioBindings,
  type RotationScenarioVariantSelections,
} from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { rotationPresetRecipeAuditById, verifiedRotationRecipeById } from './verified-rotation-recipes';

function actionsForSourceStep(presetId: string, sourceStepId: string, selections: RotationScenarioVariantSelections) {
  const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en', selections);
  return {
    imported,
    steps: imported.scenario.steps.filter((step) => imported.metadata.originsByStepId[step.id]?.sourceStepId === sourceStepId),
  };
}

describe('parameterized Rotation Lab variant choices', () => {
  it('publishes four controls covering five exact source requirements', () => {
    expect(rotationScenarioVariantControls).toHaveLength(4);
    expect(new Set(rotationScenarioVariantControls.map((control) => control.id)).size).toBe(4);
    expect(rotationScenarioVariantRequirements).toHaveLength(5);
    expect(rotationScenarioVariantSourceKeys.size).toBe(5);
    expect(validateRotationScenarioBindings()).toEqual([]);
  });

  it('reports variant-required rows instead of unsupported rows before selection', () => {
    const lacrimosa = previewRotationScenarioImport(rotationPresetById.get('lacrimosa-discord-dot')!);
    const baicang = previewRotationScenarioImport(rotationPresetById.get('baicang-firefly-hyper')!);
    expect(lacrimosa).toMatchObject({ variantRequiredSourceSteps: 3, unsupportedSourceSteps: 0 });
    expect(baicang).toMatchObject({ variantRequiredSourceSteps: 2, unsupportedSourceSteps: 0 });
    expect(unresolvedRotationScenarioVariantControls('lacrimosa-discord-dot', {})).toHaveLength(2);
    expect(unresolvedRotationScenarioVariantControls('baicang-firefly-hyper', {})).toHaveLength(2);
  });

  it('keeps import metadata v1 backward compatible and persists valid selections', () => {
    expect(initialRotationScenarioImportMetadata().variantSelections).toEqual({});
    const normalized = normalizeRotationScenarioImportMetadata({
      version: 1,
      sourceRotationId: 'lacrimosa-discord-dot',
      timingStatus: 'order-only',
      report: {},
      originsByStepId: {},
      pendingByStepId: {},
      variantSelections: { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato', junk: 'x' },
    });
    expect(normalized?.variantSelections).toEqual({
      'lacrimosa.form': 'tomato-metal',
      'lacrimosa.redirect-skill': 'morning-tomato',
    });
    expect(normalizeRotationScenarioImportMetadata({
      version: 1, sourceRotationId: '', timingStatus: 'none', report: null, originsByStepId: {}, pendingByStepId: {},
    })?.variantSelections).toEqual({});
  });

  it('applies one Lacrimosa form consistently to the full string and fifth attack', () => {
    const selections = { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato' } as const;
    const full = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-basic-five', selections);
    const redirect = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-redirect-five', selections);
    expect(full.steps.map((step) => step.actionId).filter(Boolean)).toEqual(['lacrimosa.tomato-metal.full-direct-sequence.level-10']);
    expect(redirect.steps.map((step) => step.actionId).filter(Boolean)).toEqual([
      'lacrimosa.morning-tomato.level-10',
      'lacrimosa.tomato-metal.fifth.level-10',
    ]);
    expect(full.imported.report.variantRequiredSourceSteps).toBe(0);
    expect(full.imported.metadata.variantSelections).toEqual(selections);
  });

  it('keeps Devilish Gift visible without inventing copied damage', () => {
    const selections = { 'lacrimosa.form': 'tomato-percussion', 'lacrimosa.redirect-skill': 'devilish-gift' } as const;
    const transform = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-transform', selections);
    const redirect = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-redirect-five', selections);
    expect(transform.steps).toHaveLength(1);
    expect(transform.steps[0]).toMatchObject({ kind: 'wait', actionId: '' });
    expect(transform.steps[0]?.note).toContain('copied external ability');
    expect(redirect.steps.map((step) => step.actionId).filter(Boolean)).toEqual(['lacrimosa.tomato-percussion.fifth.level-10']);
    expect(redirect.steps.some((step) => step.note.includes('copied external ability'))).toBe(true);
    expect(transform.imported.report.generatedVariantMarkerSteps).toBeGreaterThanOrEqual(2);
  });

  it('uses mutually exclusive Adler Ultimate variants before Evils Bane', () => {
    const five = actionsForSourceStep('baicang-firefly-hyper', 'baicang-adler-open', {
      'baicang.adler-ultimate-mode': 'five-target-hits',
      'baicang.dodge-charged-count': 1,
    });
    const ten = actionsForSourceStep('baicang-firefly-hyper', 'baicang-adler-open', {
      'baicang.adler-ultimate-mode': 'single-enemy-ten-hits',
      'baicang.dodge-charged-count': 1,
    });
    expect(five.steps.map((step) => step.actionId)).toEqual([
      'adler.tranquility.five-target-hits.level-10',
      'adler.evils-bane.initial-composition.level-10',
    ]);
    expect(ten.steps.map((step) => step.actionId)).toEqual([
      'adler.tranquility.single-enemy-ten-hits.level-10',
      'adler.evils-bane.initial-composition.level-10',
    ]);
  });

  it('uses the user-selected finite Baicang count and preserves the unknown mixture as a marker', () => {
    const result = actionsForSourceStep('baicang-firefly-hyper', 'baicang-dodge-spam', {
      'baicang.adler-ultimate-mode': 'single-enemy-ten-hits',
      'baicang.dodge-charged-count': 3,
    });
    expect(result.steps.filter((step) => step.actionId === 'baicang.silenced-thought.full-composition.level-10')).toHaveLength(3);
    expect(result.steps.filter((step) => step.kind === 'wait')).toHaveLength(1);
    expect(result.steps.find((step) => step.kind === 'wait')?.note).toContain('does not fix the count or order');
    expect(() => importRotationPresetToScenario(
      rotationPresetById.get('baicang-firefly-hyper')!,
      initialGameVisibleTeamState(),
      'en',
      { 'baicang.adler-ultimate-mode': 'five-target-hits', 'baicang.dodge-charged-count': 21 },
    )).toThrow(/requires variant selections/);
  });

  it('removes unsupported gaps while keeping five parameterized requirements visible', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAudit).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 41,
      total: 0,
      ambiguousSourceStep: 0,
      parameterizedVariantSourceSteps: 5,
    });
    expect(rotationPresetRecipeAuditById.get('lacrimosa-discord-dot')?.unsupportedSourceSteps).toBe(3);
    expect(rotationPresetRecipeAuditById.get('baicang-firefly-hyper')?.unsupportedSourceSteps).toBe(2);
    expect(verifiedRotationRecipeById.get('rotation-lab.lacrimosa-discord-dot.verified-actions')?.gaps.filter((gap) => gap.kind === 'variant-choice-required')).toHaveLength(3);
    expect(verifiedRotationRecipeById.get('rotation-lab.baicang-firefly-hyper.verified-actions')?.gaps.filter((gap) => gap.kind === 'variant-choice-required')).toHaveLength(2);
  });
});
