from pathlib import Path


def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


# Applied only after the main guarded generator has created the integration test.
replace_exact('src/nanally-chaos-integration.test.ts', 'result?.normal', 'result?.nonCrit', 2)
replace_exact('src/nanally-chaos-integration.test.ts', 'promotedActionStepCount: 44', 'promotedActionStepCount: 45')
replace_exact('src/verified-rotation-recipes.test.ts', 'promotedActionStepCount: 44', 'promotedActionStepCount: 45')

replace_exact('src/rotation-gap-audit-ui.test.ts', 'resolvedSinceBaseline: 5', 'resolvedSinceBaseline: 12')
replace_exact('src/rotation-gap-audit-ui.test.ts', 'total: 36', 'total: 29')
replace_exact('src/rotation-gap-audit-ui.test.ts', 'verifiedActionCatalogCount: 91', 'verifiedActionCatalogCount: 100')
replace_exact('src/rotation-gap-audit-ui.test.ts', "it('shows the updated missing-action backlog after Shinku research'", "it('shows the updated missing-action backlog after Shinku, Nanally and Chaos research'")
replace_exact('src/rotation-gap-audit-ui.test.ts', 'currentRotationMissingActionPriorities).toHaveLength(5)', 'currentRotationMissingActionPriorities).toHaveLength(3)')
replace_exact("src/rotation-gap-audit-ui.test.ts", "currentRotationMissingActionPriorities[0]?.characterName).toBe('Nanally')", "currentRotationMissingActionPriorities[0]?.characterName).toBe('Lacrimosa')")

replace_exact('src/verified-action-scenario-recipes.test.ts', 'verifiedActionCount: 91', 'verifiedActionCount: 100')
replace_exact('src/verified-action-scenario-recipes.test.ts', 'standaloneRecipeCount: 91', 'standaloneRecipeCount: 100')
replace_exact('src/verified-action-scenario-recipes.test.ts', 'covers all 91 verified actions', 'covers all 100 verified actions')
replace_exact('src/verified-scenario-recipe-ui.test.ts', 'expect(verifiedRotationRecipes).toHaveLength(5);', 'expect(verifiedRotationRecipes).toHaveLength(6);')

print('Generated and legacy factual expectations corrected')
