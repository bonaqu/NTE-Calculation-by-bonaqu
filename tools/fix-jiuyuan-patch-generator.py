from pathlib import Path

# Remove one cumulative-test replacement already handled by the broad factual update.
path = Path('tools/apply-jiuyuan-direct-actions.py')
text = path.read_text(encoding='utf-8')
line = "replace_once(\"src/rotation-gap-audit.test.ts\", \"expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Jiuyuan'], [2, 'Hathor']]);\", \"expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Hathor']]);\")\n"
if text.count(line) != 1:
    raise RuntimeError(f'Expected one duplicate priority replacement, found {text.count(line)}')
path.write_text(text.replace(line, ''), encoding='utf-8')
print('Duplicate Jiuyuan priority replacement removed')
