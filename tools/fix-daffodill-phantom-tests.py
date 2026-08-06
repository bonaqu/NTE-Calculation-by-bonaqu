from pathlib import Path


def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


# Lacrimosa's own action research remains valid, but the cumulative audit moves forward.
replace_exact('src/lacrimosa-exact-actions.test.ts', '106-action catalog', '107-action catalog')
replace_exact('src/lacrimosa-exact-actions.test.ts', 'expect(verifiedVisibleActions).toHaveLength(106);', 'expect(verifiedVisibleActions).toHaveLength(107);')
replace_exact('src/lacrimosa-exact-actions.test.ts', "it('keeps 29 gaps while moving three rows from missing to ambiguous'", "it('keeps Lacrimosa ambiguity while Phantom Step reduces the current gap total'")
replace_exact('src/lacrimosa-exact-actions.test.ts', 'resolvedSinceBaseline: 12', 'resolvedSinceBaseline: 16')
replace_exact('src/lacrimosa-exact-actions.test.ts', 'total: 29', 'total: 25')
replace_exact('src/lacrimosa-exact-actions.test.ts', 'missingActionRecord: 13', 'missingActionRecord: 9')
replace_exact('src/lacrimosa-exact-actions.test.ts', 'verifiedActionCatalogCount: 106', 'verifiedActionCatalogCount: 107')
replace_exact("src/lacrimosa-exact-actions.test.ts", "toEqual(['Daffodill', 'Zero'])", "toEqual(['Zero'])")

# Nanally/Chaos integration test is cumulative and must reflect the later exact bindings.
replace_exact('src/nanally-chaos-integration.test.ts', 'publishes 106 unique actions', 'publishes 107 unique actions')
replace_exact('src/nanally-chaos-integration.test.ts', 'expect(verifiedVisibleActions).toHaveLength(106);', 'expect(verifiedVisibleActions).toHaveLength(107);')
replace_exact('src/nanally-chaos-integration.test.ts', ').size).toBe(106);', ').size).toBe(107);')
replace_exact('src/nanally-chaos-integration.test.ts', "it('promotes both recipes and derives the 29-gap current audit'", "it('preserves Nanally and Chaos while later bindings reduce the current audit'")
replace_exact('src/nanally-chaos-integration.test.ts', 'bindingCount: 29', 'bindingCount: 33')
replace_exact('src/nanally-chaos-integration.test.ts', 'fullyBoundSourceStepCount: 8', 'fullyBoundSourceStepCount: 12')
replace_exact('src/nanally-chaos-integration.test.ts', 'unsupportedSourceStepCount: 29', 'unsupportedSourceStepCount: 25')
replace_exact('src/nanally-chaos-integration.test.ts', 'boundActionStepCount: 45', 'boundActionStepCount: 49')
replace_exact('src/nanally-chaos-integration.test.ts', 'promotedActionStepCount: 45', 'promotedActionStepCount: 49')
replace_exact('src/nanally-chaos-integration.test.ts', 'resolvedSinceBaseline: 12', 'resolvedSinceBaseline: 16')
replace_exact('src/nanally-chaos-integration.test.ts', 'total: 29', 'total: 25')
replace_exact('src/nanally-chaos-integration.test.ts', 'missingActionRecord: 13', 'missingActionRecord: 9')
replace_exact('src/nanally-chaos-integration.test.ts', 'verifiedActionCatalogCount: 106', 'verifiedActionCatalogCount: 107')
replace_exact(
    'src/nanally-chaos-integration.test.ts',
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Daffodill'],\n      [2, 'Zero'],\n    ]);",
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Zero'],\n    ]);",
)

replace_exact('src/non-atk-action-scaling.test.ts', ').size).toBe(106);', ').size).toBe(107);')
replace_exact("src/rotation-scenario-import.test.ts", "previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(2)", "previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(4)")

print('Cumulative Daffodill Phantom Step expectations corrected')
