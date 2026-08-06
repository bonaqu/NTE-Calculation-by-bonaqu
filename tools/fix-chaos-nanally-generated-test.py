from pathlib import Path

path = Path('src/nanally-chaos-integration.test.ts')
text = path.read_text(encoding='utf-8')
old = 'result?.normal'
if text.count(old) != 2:
    raise RuntimeError(f'Expected exactly two {old!r} references, found {text.count(old)}')
path.write_text(text.replace(old, 'result?.nonCrit'), encoding='utf-8')
print('Generated non-critical assertion corrected')
