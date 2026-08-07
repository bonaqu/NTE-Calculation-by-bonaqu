from pathlib import Path

# Runs after the guarded product generator and updates cumulative factual tests only.
def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


# Later operation bindings resolve the remaining current non-damage gaps.
for path in [
    'src/daffodill-phantom-step.test.ts',
    'src/hathor-aerial-command.test.ts',
    'src/jiuyuan-direct-actions.test.ts',
    'src/nanally-chaos-integration.test.ts',
    'src/typed-cycle-events.test.ts',
    'src/zero-direct-actions.test.ts',
]:
    replace_exact(path, 'nonDamageOperation: 8,', 'nonDamageOperation: 0,')

# Baicang restart becomes its fifth fully mapped source step.
replace_exact(
    'src/rotation-scenario-import.test.ts',
    "expect(previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(4);",
    "expect(previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(5);",
)

# Action-only recipe audit counts operation markers separately while preserving action totals.
replacements = {
    "      omittedCycleConditions: 0,\n      promotedRecipeId: 'rotation-lab.shinku-charge.verified-actions',":
        "      omittedCycleConditions: 0,\n      omittedOperationMarkers: 0,\n      promotedRecipeId: 'rotation-lab.shinku-charge.verified-actions',",
    "      fullyBoundSourceSteps: 1,\n      partiallyBoundSourceSteps: 7,\n      unsupportedSourceSteps: 3,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 4,\n      verifiedActionSteps: 10,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 2,":
        "      fullyBoundSourceSteps: 4,\n      partiallyBoundSourceSteps: 7,\n      unsupportedSourceSteps: 0,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 4,\n      verifiedActionSteps: 10,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 2,\n      omittedOperationMarkers: 3,",
    "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 6,\n      unsupportedSourceSteps: 1,\n      verifiedActionSteps: 9,\n      omittedEffectConditions: 1,\n      omittedCycleConditions: 1,":
        "      fullyBoundSourceSteps: 3,\n      partiallyBoundSourceSteps: 6,\n      unsupportedSourceSteps: 0,\n      verifiedActionSteps: 9,\n      omittedEffectConditions: 1,\n      omittedCycleConditions: 1,\n      omittedOperationMarkers: 1,",
    "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 2,\n      verifiedActionSteps: 11,\n      omittedEffectConditions: 3,":
        "      fullyBoundSourceSteps: 4,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 0,\n      verifiedActionSteps: 11,\n      omittedEffectConditions: 3,\n      omittedOperationMarkers: 2,",
    "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 4,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 3,\n      omittedCycleConditions: 2,":
        "      fullyBoundSourceSteps: 3,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 3,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 3,\n      omittedCycleConditions: 2,\n      omittedOperationMarkers: 1,",
    "      fullyBoundSourceSteps: 4,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 3,\n      exactActionSourceSteps: 4,\n      partialActionSourceSteps: 3,\n      verifiedActionSteps: 8,\n      omittedEffectConditions: 2,":
        "      fullyBoundSourceSteps: 5,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 2,\n      exactActionSourceSteps: 4,\n      partialActionSourceSteps: 3,\n      verifiedActionSteps: 8,\n      omittedEffectConditions: 2,\n      omittedOperationMarkers: 1,",
}
for old, new in replacements.items():
    replace_exact('src/verified-rotation-recipes.test.ts', old, new)

print('Operation-marker cumulative test expectations corrected')
