from pathlib import Path

path = Path('tools/apply-parameterized-rotation-variants.py')
text = path.read_text(encoding='utf-8')
append = r'''

# Complete action-only recipe support for the new variant-marker atom and metadata field.
replace_once(
    'src/verified-rotation-recipes.ts',
    "  const operation = verifiedScenarioOperationById.get(atom.operationId);\n  return operation?.presetId === preset.id && operation.sourceStepId === step.id && operation.sourceCharacter === step.actor;\n}",
    "  if (atom.kind === 'operation-marker') {\n    const operation = verifiedScenarioOperationById.get(atom.operationId);\n    return operation?.presetId === preset.id && operation.sourceStepId === step.id && operation.sourceCharacter === step.actor;\n  }\n  return Boolean(atom.variantId && atom.note.ru && atom.note.en);\n}",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "      originsByStepId,\n      pendingByStepId: {},\n    },",
    "      originsByStepId,\n      pendingByStepId: {},\n      variantSelections: {},\n    },",
)
'''
marker = '# Complete action-only recipe support for the new variant-marker atom and metadata field.'
if marker in text:
    raise RuntimeError('Parameterized variant generator correction already present')
path.write_text(text + append, encoding='utf-8')
print('Parameterized variant recipe typing correction appended')
