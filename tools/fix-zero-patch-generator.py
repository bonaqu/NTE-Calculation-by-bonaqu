from pathlib import Path

# Correct guarded-generator details before applying the main patch.
path = Path('tools/apply-zero-direct-actions.py')
text = path.read_text(encoding='utf-8')

duplicate = "replace_once(\"src/rotation-gap-audit.test.ts\", \"expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Zero']]);\", \"expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Jiuyuan'], [2, 'Hathor']]);\")\n"
if text.count(duplicate) != 1:
    raise RuntimeError(f'Expected one duplicate replacement line, found {text.count(duplicate)}')
text = text.replace(duplicate, '')

# The atoms live inside Python string literals, so the generator source contains literal backslash-n pairs.
blossom_atom = "      { kind: 'activate-cycle', cycleId: 'blossom' },\\n"
if text.count(blossom_atom) != 3:
    raise RuntimeError(f'Expected three unsupported Blossom atoms, found {text.count(blossom_atom)}')
text = text.replace(blossom_atom, '')

remora_atom = "      { kind: 'activate-cycle', cycleId: 'remora' },\\n"
if text.count(remora_atom) != 1:
    raise RuntimeError(f'Expected one unsupported Remora atom, found {text.count(remora_atom)}')
text = text.replace(remora_atom, '')

path.write_text(text, encoding='utf-8')
print('Duplicate replacement and unsupported Cycle atoms removed')
