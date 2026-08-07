from pathlib import Path


def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


# Immutable baseline classifications never change when current bindings improve.
replace_exact(
    'src/rotation-gap-audit.test.ts',
    'expect(rotationGapAuditSummary).toMatchObject({ total: 41, effectOrCycleCondition: 0, missingActionRecord: 26, nonDamageOperation: 8, ambiguousSourceStep: 4 });',
    'expect(rotationGapAuditSummary).toMatchObject({ total: 41, effectOrCycleCondition: 3, missingActionRecord: 26, nonDamageOperation: 8, ambiguousSourceStep: 4 });',
)

# Hathor now imports two Cycle markers: Stain and the later Charge event.
replace_exact('src/rotation-scenario-import.test.ts', 'expect(imported.report.generatedCycleSteps).toBe(1);', 'expect(imported.report.generatedCycleSteps).toBe(2);')
replace_exact('src/rotation-scenario-import.test.ts', 'expect(pendingIds).toHaveLength(3);', 'expect(pendingIds).toHaveLength(4);')

# The visible action used by semantic-cycle tests must satisfy its published level requirement.
replace_exact(
    'src/typed-cycle-events.test.ts',
    "    stats: { ...value.stats, atk, critRate: 0, critDamage: 100 },\n  };",
    "    stats: { ...value.stats, atk, critRate: 0, critDamage: 100 },\n    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },\n  };",
)

# Recipe audit counts confirmed Cycle atoms that remain excluded from action-only recipes.
replace_exact(
    'src/verified-rotation-recipes.test.ts',
    "      omittedEffectConditions: 2,\n      omittedCycleConditions: 0,\n      promotedCoverage: 'partial-action-order',",
    "      omittedEffectConditions: 2,\n      omittedCycleConditions: 2,\n      promotedCoverage: 'partial-action-order',",
)
replace_exact(
    'src/verified-rotation-recipes.test.ts',
    "      verifiedActionSteps: 7,\n      omittedEffectConditions: 1,\n      promotedCoverage: 'partial-action-order',",
    "      verifiedActionSteps: 7,\n      omittedEffectConditions: 3,\n      omittedCycleConditions: 2,\n      promotedCoverage: 'partial-action-order',",
)

print('Typed Cycle cumulative test expectations corrected')
