import type { RotationStep } from './types';

export function firstIncompleteStepIndex(steps: readonly RotationStep[], completed: ReadonlySet<string>): number {
  if (steps.length === 0) return 0;
  const index = steps.findIndex((step) => !completed.has(step.id));
  return index >= 0 ? index : 0;
}

export function requiredRotationStepsComplete(steps: readonly RotationStep[], completed: ReadonlySet<string>): boolean {
  const required = steps.filter((step) => !step.optional);
  return required.length > 0 && required.every((step) => completed.has(step.id));
}

export function clampPracticeStepIndex(index: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(stepCount - 1, Math.max(0, Math.trunc(index)));
}

export function nextPracticeStepIndex(index: number, stepCount: number): number {
  return clampPracticeStepIndex(index + 1, stepCount);
}

export function previousPracticeStepIndex(index: number, stepCount: number): number {
  return clampPracticeStepIndex(index - 1, stepCount);
}

export function phaseStepPosition(steps: readonly RotationStep[], index: number): { current: number; total: number } {
  if (steps.length === 0) return { current: 0, total: 0 };
  const safeIndex = clampPracticeStepIndex(index, steps.length);
  const phase = steps[safeIndex]?.phase;
  const phaseSteps = steps.filter((step) => step.phase === phase);
  const phaseIndex = steps.slice(0, safeIndex + 1).filter((step) => step.phase === phase).length;
  return { current: phaseIndex, total: phaseSteps.length };
}
