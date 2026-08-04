/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; the browser app intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import workflowSource from './components/RotationWorkflow.tsx?raw';
import stepTermsSource from './components/RotationStepTerms.tsx?raw';
import glossarySource from './components/TerminologyEvidenceTable.tsx?raw';
import termsSource from './character-terms.ts?raw';
import bindingsSource from './rotation-step-terms.ts?raw';

const css = readFileSync(new URL('./character-terms.css', import.meta.url), 'utf8');

describe('character terminology UI contracts', () => {
  it('renders bound terms in both plan and practice views', () => {
    expect(workflowSource).toContain("import { RotationStepTerms } from './RotationStepTerms'");
    expect(workflowSource.match(/<RotationStepTerms /gu)).toHaveLength(2);
    expect(workflowSource).toContain('presetId={preset.id} step={step} compact');
    expect(workflowSource).toContain('presetId={preset.id} step={currentStep}');
  });

  it('discloses unresolved Russian labels rather than hiding them', () => {
    expect(stepTermsSource).toContain("characterTermCoverage.get(step.actor) === 'unresolved'");
    expect(stepTermsSource).toContain('точное русское название действия');
    expect(stepTermsSource).toContain('Exact Russian label');
    expect(stepTermsSource).toContain('term.sourceUrl');
  });

  it('adds character terms to the same searchable Methodology glossary', () => {
    expect(glossarySource).toContain('character-specific');
    expect(glossarySource).toContain('characterTerms');
    expect(glossarySource).toContain('entry.alternatives');
    expect(glossarySource).toContain('Русская карточка');
    expect(glossarySource).toContain('English record');
  });

  it('uses a flat, responsive treatment without gradients or hover motion', () => {
    expect(css).toContain('.rotation-step-terms');
    expect(css).toContain('@media(max-width:760px)');
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).not.toMatch(/gradient\s*\(/iu);
    expect(css).not.toMatch(/transform\s*:/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });

  it('keeps all existing storage keys and calculations outside the new registry', () => {
    expect(termsSource).not.toContain('localStorage');
    expect(bindingsSource).not.toContain('localStorage');
    expect(bindingsSource).not.toContain('setItem(');
    expect(bindingsSource).not.toContain('actionsPerRotation');
  });
});