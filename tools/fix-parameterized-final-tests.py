from pathlib import Path

# Final historical preview invariants after explicit variant-marker support.
def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


replace_exact(
    'src/rotation-scenario-import.test.ts',
    '      expect(first.report.generatedPartialRemainderSteps).toBe(first.report.partiallyMappedSourceSteps);',
    '      expect(first.report.generatedPartialRemainderSteps + first.report.generatedVariantMarkerSteps)\n        .toBe(first.report.partiallyMappedSourceSteps);',
)
replace_exact(
    'src/rotation-scenario-import.test.ts',
    "    expect(previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(5);",
    "    expect(previews.get('baicang-firefly-hyper')?.fullyMappedSourceSteps).toBe(6);",
)

print('Final parameterized preview invariants corrected')
