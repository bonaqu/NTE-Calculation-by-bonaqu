from pathlib import Path

path = Path('tools/apply-zero-direct-actions.py')
text = path.read_text(encoding='utf-8')
line = "replace_once(\"src/rotation-gap-audit.test.ts\", \"expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Zero']]);\", \"expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Jiuyuan'], [2, 'Hathor']]);\")\n"
if text.count(line) != 1:
    raise RuntimeError(f'Expected one duplicate replacement line, found {text.count(line)}')
path.write_text(text.replace(line, ''), encoding='utf-8')
print('Duplicate Zero audit replacement removed')
