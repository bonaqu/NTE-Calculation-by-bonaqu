/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates CSS source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/RotationGapAuditPanel.tsx?raw';
import compositionSource from './components/TeamCombatScenarioPanel.tsx?raw';
import currentDomainSource from './rotation-gap-audit-current.ts?raw';
import baselineDomainSource from './rotation-gap-audit.ts?raw';
import {
  currentRotationGapAuditSummary,
  currentRotationMissingActionPriorities,
} from './rotation-gap-audit-current';

const styles = readFileSync(new URL('./rotation-gap-audit.css', import.meta.url), 'utf8');

describe('Rotation Lab gap audit UI', () => {
  it('shows current and baseline totals in both locales', () => {
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 41,
      total: 0,
      verifiedActionCatalogCount: 113,
      parameterizedVariantSourceSteps: 5,
    });
    expect(panelSource).toContain('НЕПОДДЕРЖИВАЕМЫХ ПРОБЕЛОВ');
    expect(panelSource).toContain('UNSUPPORTED GAPS');
    expect(panelSource).toContain('ВАРИАНТОВ С ВЫБОРОМ');
    expect(panelSource).toContain('USER-SELECTED VARIANTS');
    expect(panelSource).toContain('currentRotationGapAuditSummary.missingActionRecord');
    expect(panelSource).toContain('currentRotationGapAuditSummary.effectOrCycleCondition');
    expect(panelSource).toContain('currentRotationGapAuditSummary.nonDamageOperation');
    expect(panelSource).toContain('currentRotationGapAuditSummary.ambiguousSourceStep');
    expect(panelSource).toContain('currentRotationGapAuditSummary.resolvedSinceBaseline');
    expect(panelSource).toContain('currentRotationGapAuditSummary.parameterizedVariantSourceSteps');
    expect(panelSource).toContain('rotationScenarioVariantRequirements');
  });

  it('exposes every current source preset, rationale and rejected look-alike IDs', () => {
    expect(panelSource).toContain('rotationPresets.map');
    expect(panelSource).toContain('currentRotationGapAudit.filter');
    expect(panelSource).toContain('item.rationale[locale]');
    expect(panelSource).toContain('item.rejectedActionIds.join');
    expect(panelSource).toContain('Отклонённые похожие ID');
    expect(panelSource).toContain('Rejected look-alike IDs');
  });

  it('shows an empty missing-action backlog after Hathor full-hold research', () => {
    expect(currentRotationMissingActionPriorities).toHaveLength(0);
    expect(panelSource).toContain('currentRotationMissingActionPriorities.map');
    expect(panelSource).toContain('Какие записи исследовать дальше');
    expect(panelSource).toContain('Next action records to research');
    expect(panelSource).toContain('verifiedActionCatalogCount');
    expect(panelSource).toContain('без fuzzy matching');
  });

  it('keeps the audit between recipes and the manual editor', () => {
    const recipesAt = compositionSource.indexOf('<VerifiedScenarioRecipePanel {...props} />');
    const auditAt = compositionSource.indexOf('<RotationGapAuditPanel {...props} />');
    const manualAt = compositionSource.indexOf('<ManualTeamCombatScenarioEditor {...props} />');
    expect(recipesAt).toBeGreaterThan(-1);
    expect(auditAt).toBeGreaterThan(recipesAt);
    expect(manualAt).toBeGreaterThan(auditAt);
  });

  it('preserves the baseline registry while deriving current gaps without fuzzy matching', () => {
    expect(baselineDomainSource).toContain('Baseline registry for all 41 source steps');
    expect(currentDomainSource).toContain('baselineRotationGapAudit.filter');
    expect(currentDomainSource).not.toMatch(/fuzzyMatch|similarityScore|levenshtein/iu);
    expect(currentDomainSource).toContain('safelyBindableUnsupportedSteps: 0');
    expect(currentDomainSource).toContain('existingCatalogExhausted: true');
    expect(baselineDomainSource).toContain('rejectedActionIds');
  });

  it('uses a responsive border-led layout without gradients or shadows', () => {
    expect(styles).toContain('.rotation-gap-audit__summary');
    expect(styles).toContain('.rotation-gap-audit__entries');
    expect(styles).toContain('@media (max-width: 1100px)');
    expect(styles).toContain('@media (max-width: 620px)');
    expect(styles).toContain('border-radius: 0');
    expect(styles).not.toMatch(/gradient/iu);
    expect(styles).not.toMatch(/box-shadow/iu);
  });
});
