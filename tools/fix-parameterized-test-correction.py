from pathlib import Path

# Rewrite strict cumulative-test corrections before they run.
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
text = text.replace(old, new)
old_import = "\"import { importRotationPresetToScenario, rotationScenarioBindings } from './rotation-scenario-import';\",\n    \"import { importRotationPresetToScenario, rotationScenarioBindings, rotationScenarioVariantSourceKeys } from './rotation-scenario-import';\","
new_import = "\"import { rotationScenarioBindings } from './rotation-scenario-import';\",\n    \"import { rotationScenarioBindings, rotationScenarioVariantSourceKeys } from './rotation-scenario-import';\","
if text.count(old_import) != 1:
    raise RuntimeError(f'Expected one Lacrimosa import correction, found {text.count(old_import)}')
path.write_text(text.replace(old_import, new_import), encoding='utf-8')
print('Parameterized audit paths and Lacrimosa import correction aligned')
