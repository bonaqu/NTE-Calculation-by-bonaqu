import { describe, expect, it } from 'vitest';
import { clampPracticeStepIndex, firstIncompleteStepIndex, nextPracticeStepIndex, phaseStepPosition, previousPracticeStepIndex, requiredRotationStepsComplete } from './rotation-practice';
import type { RotationStep } from './types';

const step = (id: string, phase: RotationStep['phase'], optional = false): RotationStep => ({
  id,
  actor: 'Iroi',
  phase,
  action: 'skill',
  instruction: { ru: id, en: id },
  outcome: { ru: id, en: id },
  ...(optional ? { optional: true } : {}),
});

const steps = [step('s1', 'setup'), step('s2', 'setup'), step('s3', 'burst'), step('s4', 'burst'), step('s5', 'recovery')];

describe('rotation practice navigation', () => {
  it('starts at the first incomplete step', () => {
    expect(firstIncompleteStepIndex(steps, new Set())).toBe(0);
    expect(firstIncompleteStepIndex(steps, new Set(['s1']))).toBe(1);
    expect(firstIncompleteStepIndex(steps, new Set(['s1', 's2', 's3']))).toBe(3);
  });

  it('returns to the first step when every step is complete', () => {
    expect(firstIncompleteStepIndex(steps, new Set(steps.map((entry) => entry.id)))).toBe(0);
    expect(firstIncompleteStepIndex([], new Set())).toBe(0);
  });

  it('does not make optional steps block rotation completion', () => {
    const withOptional = [step('required-1', 'setup'), step('optional', 'burst', true), step('required-2', 'recovery')];
    expect(requiredRotationStepsComplete(withOptional, new Set(['required-1']))).toBe(false);
    expect(requiredRotationStepsComplete(withOptional, new Set(['required-1', 'required-2']))).toBe(true);
    expect(requiredRotationStepsComplete(withOptional, new Set(['optional']))).toBe(false);
    expect(requiredRotationStepsComplete([], new Set())).toBe(false);
  });

  it('clamps previous and next navigation to valid bounds', () => {
    expect(clampPracticeStepIndex(-10, steps.length)).toBe(0);
    expect(clampPracticeStepIndex(99, steps.length)).toBe(4);
    expect(clampPracticeStepIndex(Number.NaN, steps.length)).toBe(0);
    expect(previousPracticeStepIndex(0, steps.length)).toBe(0);
    expect(nextPracticeStepIndex(4, steps.length)).toBe(4);
    expect(nextPracticeStepIndex(1, steps.length)).toBe(2);
  });

  it('reports position inside the current phase', () => {
    expect(phaseStepPosition(steps, 0)).toEqual({ current: 1, total: 2 });
    expect(phaseStepPosition(steps, 1)).toEqual({ current: 2, total: 2 });
    expect(phaseStepPosition(steps, 3)).toEqual({ current: 2, total: 2 });
    expect(phaseStepPosition(steps, 4)).toEqual({ current: 1, total: 1 });
    expect(phaseStepPosition([], 0)).toEqual({ current: 0, total: 0 });
  });
});
