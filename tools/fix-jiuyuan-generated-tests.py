from pathlib import Path

# Runs after the guarded product generator and updates cumulative factual tests only.

def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


replace_exact('src/non-atk-action-scaling.test.ts', ').size).toBe(110);', ').size).toBe(112);')

for path in ['src/nanally-chaos-integration.test.ts', 'src/rotation-gap-audit.test.ts']:
    replace_exact(
        path,
        "expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(9);",
        "expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(11);",
    )

replace_exact(
    'src/verified-rotation-recipes.test.ts',
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'jiuyuan.final-reckoning.direct.level-10',\n      'jiuyuan.intel-hunter.direct.level-10',\n      'zero.appraise-and-engrave.main.level-10',\n      'zero.divide-by-zero.level-10',\n      'sakiri.feast-of-gluttony.level-10',",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.appraise-and-engrave.main.level-10',\n      'zero.divide-by-zero.level-10',\n      'sakiri.feast-of-gluttony.level-10',\n      'jiuyuan.final-reckoning.direct.level-10',\n      'jiuyuan.intel-hunter.direct.level-10',",
)

replace_exact(
    'src/nanally-chaos-integration.test.ts',
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Jiuyuan'],\n      [2, 'Hathor'],\n    ]);",
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Hathor'],\n    ]);",
)

print('Jiuyuan cumulative test expectations corrected')
