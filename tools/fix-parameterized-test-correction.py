from pathlib import Path

path = Path('tools/fix-parameterized-variant-generated-tests.py')
text = path.read_text(encoding='utf-8')
old = """for path in audit_paths:
    replace_exact(path, 'resolvedSinceBaseline: 36', 'resolvedSinceBaseline: 41')
    replace_exact(path, 'total: 5', 'total: 0')
    replace_exact(path, 'ambiguousSourceStep: 5', 'ambiguousSourceStep: 0')
"""
new = """for path in audit_paths:
    replace_exact(path, 'resolvedSinceBaseline: 36', 'resolvedSinceBaseline: 41')
    replace_exact(path, 'total: 5', 'total: 0')
for path in [entry for entry in audit_paths if entry != 'src/rotation-gap-audit-ui.test.ts']:
    replace_exact(path, 'ambiguousSourceStep: 5', 'ambiguousSourceStep: 0')
"""
if text.count(old) != 1:
    raise RuntimeError(f'Expected one combined audit-update loop, found {text.count(old)}')
path.write_text(text.replace(old, new), encoding='utf-8')
print('Parameterized audit summary and classification paths separated')
