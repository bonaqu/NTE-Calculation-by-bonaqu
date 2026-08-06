from pathlib import Path

# Runs after the main guarded generator and updates only stale factual tests.

def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


replace_exact('src/nanally-chaos-integration.test.ts', 'missingActionRecord: 16', 'missingActionRecord: 13')
replace_exact('src/nanally-chaos-integration.test.ts', 'ambiguousSourceStep: 2', 'ambiguousSourceStep: 5')
replace_exact('src/non-atk-action-scaling.test.ts', ').size).toBe(100);', ').size).toBe(106);')
replace_exact('src/verified-action-scenario-recipes.test.ts', 'expect(verifiedActionScenarioRecipes).toHaveLength(100);', 'expect(verifiedActionScenarioRecipes).toHaveLength(106);')
replace_exact('src/verified-action-scenario-recipes.test.ts', 'expect(new Set(recipeActionIds).size).toBe(100);', 'expect(new Set(recipeActionIds).size).toBe(106);')
replace_exact('src/verified-scenario-recipe-ui.test.ts', 'expect(verifiedActionScenarioRecipes).toHaveLength(100);', 'expect(verifiedActionScenarioRecipes).toHaveLength(106);')
replace_exact('src/nanally-chaos-integration.test.ts', 'publishes 100 unique actions', 'publishes 106 unique actions')
replace_exact(
    'src/nanally-chaos-integration.test.ts',
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Lacrimosa'],\n      [2, 'Daffodill'],\n      [3, 'Zero'],\n    ]);",
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Daffodill'],\n      [2, 'Zero'],\n    ]);",
)

print('Lacrimosa generated-test expectations corrected')
