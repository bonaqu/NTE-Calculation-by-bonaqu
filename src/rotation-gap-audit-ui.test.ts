/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates CSS source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/RotationGapAuditPanel.tsx?raw';
import compositionSource from './components/TeamCombatScenarioPanel.tsx?raw';
import domainSource from './rotation-gap-audit.ts?raw';
import {
  rotationGapAuditSummary,
  rotationMissingActionPriorities,
} from './rotation-gap-audit';

const styles = readFileSync(new URL('./rotation-gap-audit.css', import.meta.url), 'utf8');

describe('Rotation Lab gap audit UI', () => {
  it('shows the complete classification totals in both locales', () => {
    expect(rotationGapAuditSummary.total).toBe(41);
    expect(panelSource).toContain('41 ШАГ · КАТАЛОГ ИСЧЕРПАН БЕЗ ПОДМЕН');
    expect(panelSource).toContain('41 STEPS · CATALOG EXHAUSTED WITHOUT SUBSTITUTION');
    expect(panelSource).toContain('rotationGapAuditSummary.missingActionRecord');
    expect(panelSource).toContain('rotationGapAuditSummary.effectOrCycleCondition');
    expect(panelSource).toContain('rotationGapAuditSummary.nonDamageOperation');
    expect(panelSource).toContain('rotationGapAuditSummary.ambiguousSourceStep');
    expect(panelSource).toContain('rotationGapAuditSummary.safelyBindableUnsupportedSteps');
  });

  it('exposes every source preset, rationale and rejected look-alike IDs', () => {
    expect(panelSource).toContain('rotationPresets.map');
    expect(panelSource).toContain('rotationGapAudit.filter');
    expect(panelSource).toContain('item.rationale[locale]');
    expect(panelSource).toContain('item.rejectedActionIds.join');
    expect(panelSource).toContain('Отклонённые похожие ID');
    expect(panelSource).toContain('Rejected look-alike IDs');
  });

  it('shows the ranked missing-action backlog after catalog exhaustion', () => {
    expect(rotationMissingActionPriorities).toHaveLength(6);
    expect(panelSource).toContain('rotationMissingActionPriorities.map');
    expect(panelSource).toContain('Какие записи исследовать дальше');
    expect(panelSource).toContain('Next action records to research');
    expect(panelSource).toContain('ни один из 41 шага не был связан ценой семантической подмены');
  });

  it('keeps the audit between recipes and the manual editor', () => {
    const recipesAt = compositionSource.indexOf('<VerifiedScenarioRecipePanel {...props} />');
    const auditAt = compositionSource.indexOf('<RotationGapAuditPanel {...props} />');
    const manualAt = compositionSource.indexOf('<ManualTeamCombatScenarioEditor {...props} />');
    expect(recipesAt).toBeGreaterThan(-1);
    expect(auditAt).toBeGreaterThan(recipesAt);
    expect(manualAt).toBeGreaterThan(auditAt);
  });

  it('contains no fuzzy matcher or generic automatic action substitution', () => {
    expect(domainSource).not.toMatch(/fuzzyMatch|similarityScore|levenshtein/iu);
    expect(domainSource).toContain('safelyBindableUnsupportedSteps: 0');
    expect(domainSource).toContain('existingCatalogExhausted: true');
    expect(domainSource).toContain('rejectedActionIds');
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
