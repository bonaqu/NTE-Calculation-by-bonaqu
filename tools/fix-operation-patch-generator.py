from pathlib import Path

# Narrow the current-audit replacement so the immutable baseline remains unchanged.
path = Path('tools/apply-typed-operation-markers.py')
text = path.read_text(encoding='utf-8')
old = "replace_once('src/rotation-gap-audit.test.ts', 'nonDamageOperation: 8,', 'nonDamageOperation: 0,')\n"
new = "replace_once('src/rotation-gap-audit.test.ts', '      nonDamageOperation: 8,\\n      ambiguousSourceStep: 5,', '      nonDamageOperation: 0,\\n      ambiguousSourceStep: 5,')\n"
if text.count(old) != 1:
    raise RuntimeError(f'Expected one broad non-damage replacement, found {text.count(old)}')
path.write_text(text.replace(old, new), encoding='utf-8')
print('Current non-damage audit replacement made baseline-safe')
