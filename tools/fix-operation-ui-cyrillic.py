from pathlib import Path

# One exact mixed-script correction; the guarded workflow runs the full project afterward.
path = Path('src/components/ManualTeamCombatScenarioEditor.tsx')
text = path.read_text(encoding='utf-8')
old = 'небoевую'
new = 'небоевую'
if text.count(old) != 1:
    raise RuntimeError(f'Expected one mixed-script operation label, found {text.count(old)}')
path.write_text(text.replace(old, new), encoding='utf-8')
print('Mixed-script operation label corrected')
