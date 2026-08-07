from pathlib import Path

path = Path('tools/apply-hathor-aerial-command.py')
text = path.read_text(encoding='utf-8')
old = '2026-08-07'
new = '2026-08-06'
count = text.count(old)
if count != 3:
    raise RuntimeError(f'Expected three Hathor verification-date occurrences, found {count}')
path.write_text(text.replace(old, new), encoding='utf-8')
print('Hathor verification date aligned to UTC freshness baseline')
