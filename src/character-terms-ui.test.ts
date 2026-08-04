import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('character terminology UI contracts', () => {
  it('renders bound terms in both plan and practice views', () => {
    const workflow = read('./components/RotationWorkflow.tsx');
    expect(workflow).toContain("import { RotationStepTerms } from './RotationStepTerms'");
    expect(workflow.match(/<RotationStepTerms /gu)).toHaveLength(2);
    expect(workflow).toContain('presetId={preset.id} step={step} compact');
    expect(workflow).toContain('presetId={preset.id} step={currentStep}');
  });

  it('discloses unresolved Russian labels rather than hiding them', () => {
    const component = read('./components/RotationStepTerms.tsx');
    expect(component).toContain("characterTermCoverage.get(step.actor) === 'unresolved'");
    expect(component).toContain('точное русское название действия');
    expect(component).toContain('Exact Russian label');
    expect(component).toContain('term.sourceUrl');
  });

  it('adds character terms to the same searchable Methodology glossary', () => {
    const glossary = read('./components/TerminologyEvidenceTable.tsx');
    expect(glossary).toContain("character-specific");
    expect(glossary).toContain('characterTerms');
    expect(glossary).toContain('entry.alternatives');
    expect(glossary).toContain('Русская карточка');
    expect(glossary).toContain('English record');
  });

  it('uses a flat, responsive treatment without gradients or hover motion', () => {
    const css = read('./character-terms.css');
    expect(css).toContain('.rotation-step-terms');
    expect(css).toContain('@media(max-width:760px)');
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).not.toMatch(/gradient\s*\(/iu);
    expect(css).not.toMatch(/transform\s*:/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });

  it('keeps all existing storage keys and rotation ids outside the new registry', () => {
    const terms = read('./character-terms.ts');
    const bindings = read('./rotation-step-terms.ts');
    expect(terms).not.toContain('localStorage');
    expect(bindings).not.toContain('localStorage');
    expect(bindings).not.toContain('setItem(');
    expect(bindings).not.toContain('actionsPerRotation');
  });
});
