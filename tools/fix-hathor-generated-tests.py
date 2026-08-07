from pathlib import Path


def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


replace_exact(
    'src/game-visible-actions-batch-b.test.ts',
    "expect(verifiedVisibleActions.some((action) => action.id.includes('aerial-command'))).toBe(false);",
    "expect(verifiedVisibleActions.find((action) => action.id === 'hathor.aerial-command.full-hold.level-10')?.multiplier).toBeCloseTo(3100, 8);",
)
replace_exact(
    'src/nanally-chaos-integration.test.ts',
    "expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(8);",
    "expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(9);",
)
replace_exact(
    'src/non-atk-action-scaling.test.ts',
    'expect(new Set(verifiedVisibleActions.map((entry) => entry.id)).size).toBe(112);',
    'expect(new Set(verifiedVisibleActions.map((entry) => entry.id)).size).toBe(113);',
)

print('Hathor cumulative test expectations corrected')
