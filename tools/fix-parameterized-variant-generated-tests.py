from pathlib import Path


def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


# Historical integration tests must now reflect zero unsupported gaps and five explicit variant requirements.
audit_paths = [
    'src/daffodill-phantom-step.test.ts',
    'src/hathor-aerial-command.test.ts',
    'src/jiuyuan-direct-actions.test.ts',
    'src/lacrimosa-exact-actions.test.ts',
    'src/nanally-chaos-integration.test.ts',
    'src/rotation-gap-audit-ui.test.ts',
    'src/rotation-gap-audit.test.ts',
    'src/typed-cycle-events.test.ts',
    'src/typed-operation-markers.test.ts',
    'src/zero-direct-actions.test.ts',
]
for path in audit_paths:
    replace_exact(path, 'resolvedSinceBaseline: 36', 'resolvedSinceBaseline: 41')
    replace_exact(path, 'total: 5', 'total: 0')
    replace_exact(path, 'ambiguousSourceStep: 5', 'ambiguousSourceStep: 0')

# Lacrimosa remains free of unsafe fixed bindings, but its three source rows are now parameterized.
replace_exact(
    'src/lacrimosa-exact-actions.test.ts',
    "import { importRotationPresetToScenario, rotationScenarioBindings } from './rotation-scenario-import';",
    "import { importRotationPresetToScenario, rotationScenarioBindings, rotationScenarioVariantSourceKeys } from './rotation-scenario-import';",
)
replace_exact(
    'src/lacrimosa-exact-actions.test.ts',
    "      expect(currentRotationGapAuditByKey.get(`lacrimosa-discord-dot:${stepId}`)?.classification).toBe('ambiguous-source-step');",
    "      expect(rotationScenarioVariantSourceKeys.has(`lacrimosa-discord-dot:${stepId}`)).toBe(true);\n      expect(currentRotationGapAuditByKey.has(`lacrimosa-discord-dot:${stepId}`)).toBe(false);",
)
replace_exact(
    'src/lacrimosa-exact-actions.test.ts',
    "it('keeps Lacrimosa ambiguity while Phantom Step reduces the current gap total'",
    "it('keeps Lacrimosa variants explicit while the unsupported gap total reaches zero'",
)

# Daffodill regression imports both parameterized presets with explicit neutral test choices.
replace_exact(
    'src/daffodill-phantom-step.test.ts',
    "      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');",
    "      const selections = presetId === 'lacrimosa-discord-dot'\n        ? { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato' }\n        : { 'baicang.adler-ultimate-mode': 'single-enemy-ten-hits', 'baicang.dodge-charged-count': 1 };\n      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en', selections);",
)

# Cycle regression supplies Lacrimosa selections while leaving Hathor parameter-free.
replace_exact(
    'src/typed-cycle-events.test.ts',
    "      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, team(), 'ru');",
    "      const selections = presetId === 'lacrimosa-discord-dot'\n        ? { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato' }\n        : {};\n      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, team(), 'ru', selections);",
)

# Operation regression imports parameterized presets with explicit values and previews the same branch.
replace_exact(
    'src/typed-operation-markers.test.ts',
    "      const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');",
    "      const selections = presetId === 'lacrimosa-discord-dot'\n        ? { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato' }\n        : presetId === 'baicang-firefly-hyper'\n          ? { 'baicang.adler-ultimate-mode': 'single-enemy-ten-hits', 'baicang.dodge-charged-count': 1 }\n          : {};\n      const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru', selections);",
)
replace_exact(
    'src/typed-operation-markers.test.ts',
    "      expect(previewRotationScenarioImport(preset).generatedOperationSteps).toBe(operations.length);",
    "      expect(previewRotationScenarioImport(preset, selections).generatedOperationSteps).toBe(operations.length);",
)
replace_exact(
    'src/typed-operation-markers.test.ts',
    "it('reduces current audit to five ambiguous variants only'",
    "it('reduces unsupported audit to zero while retaining five parameterized variants'",
)

# Rotation import tests use deterministic variant fixtures for the two parameterized presets.
rotation_test = Path('src/rotation-scenario-import.test.ts')
text = rotation_test.read_text(encoding='utf-8')
anchor = "describe('Rotation Lab to Combat Scenario import', () => {\n"
helper = """function variantSelectionsForPreset(presetId: string) {
  if (presetId === 'lacrimosa-discord-dot') return {
    'lacrimosa.form': 'tomato-metal',
    'lacrimosa.redirect-skill': 'morning-tomato',
  } as const;
  if (presetId === 'baicang-firefly-hyper') return {
    'baicang.adler-ultimate-mode': 'single-enemy-ten-hits',
    'baicang.dodge-charged-count': 2,
  } as const;
  return {};
}

describe('Rotation Lab to Combat Scenario import', () => {
"""
if text.count(anchor) != 1:
    raise RuntimeError('rotation-scenario-import.test.ts: describe anchor mismatch')
text = text.replace(anchor, helper, 1)
text = text.replace(
    "importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru')",
    "importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru', variantSelectionsForPreset(preset.id))",
)
text = text.replace(
    "importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en')",
    "importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en', variantSelectionsForPreset(preset.id))",
)
text = text.replace(
    "previewRotationScenarioImport(preset)",
    "previewRotationScenarioImport(preset, variantSelectionsForPreset(preset.id))",
)
rotation_test.write_text(text, encoding='utf-8')

replace_exact(
    'src/rotation-scenario-import.test.ts',
    "it('maps one explicit Baicang dodge attack but leaves open-ended spam unsupported'",
    "it('maps the explicit Baicang dodge attack and the selected finite spam count'",
)
replace_exact(
    'src/rotation-scenario-import.test.ts',
    "    expect(spam).toHaveLength(1);\n    expect(spam[0]).toMatchObject({ kind: 'wait', actionId: '' });\n    expect(imported.metadata.originsByStepId[spam[0]!.id]?.coverage).toBe('unsupported');",
    "    expect(spam.filter((step) => step.actionId === 'baicang.silenced-thought.full-composition.level-10')).toHaveLength(2);\n    expect(spam.filter((step) => step.kind === 'wait')).toHaveLength(1);\n    expect(spam.find((step) => step.kind === 'wait')?.note).toContain('Количество и порядок контратак');\n    expect(spam.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'partial')).toBe(true);",
)

# Current audit now excludes parameterized source keys rather than treating them as unsupported.
replace_exact(
    'src/rotation-gap-audit.test.ts',
    "import { rotationScenarioBindings } from './rotation-scenario-import';",
    "import { rotationScenarioBindings, rotationScenarioVariantSourceKeys } from './rotation-scenario-import';",
)
replace_exact(
    'src/rotation-gap-audit.test.ts',
    "it('derives the five remaining ambiguous gaps from exact bindings'",
    "it('derives zero unsupported gaps while preserving five parameterized requirements'",
)
replace_exact(
    'src/rotation-gap-audit.test.ts',
    "    const unsupportedKeys = rotationPresets.flatMap((preset) => preset.steps.filter((step) => !rotationScenarioBindings[`${preset.id}:${step.id}`]).map((step) => `${preset.id}:${step.id}`));\n    expect(unsupportedKeys).toHaveLength(5);\n    expect([...currentRotationGapAuditByKey.keys()].sort()).toEqual(unsupportedKeys.sort());",
    "    const unsupportedKeys = rotationPresets.flatMap((preset) => preset.steps\n      .filter((step) => !rotationScenarioBindings[`${preset.id}:${step.id}`]\n        && !rotationScenarioVariantSourceKeys.has(`${preset.id}:${step.id}`))\n      .map((step) => `${preset.id}:${step.id}`));\n    expect(unsupportedKeys).toEqual([]);\n    expect([...currentRotationGapAuditByKey.keys()]).toEqual([]);\n    expect(rotationScenarioVariantSourceKeys.size).toBe(5);",
)

# Audit UI reflects zero unsupported gaps and five explicit user choices.
replace_exact(
    'src/rotation-gap-audit-ui.test.ts',
    "      verifiedActionCatalogCount: 113,",
    "      verifiedActionCatalogCount: 113,\n      parameterizedVariantSourceSteps: 5,",
)
for old, new in [
    ('ТЕКУЩИХ ПРОБЕЛОВ', 'НЕПОДДЕРЖИВАЕМЫХ ПРОБЕЛОВ'),
    ('CURRENT GAPS', 'UNSUPPORTED GAPS'),
    ('ЗАКРЫТО С BASELINE', 'ВАРИАНТОВ С ВЫБОРОМ'),
    ('CLOSED SINCE BASELINE', 'USER-SELECTED VARIANTS'),
]:
    replace_exact('src/rotation-gap-audit-ui.test.ts', old, new)
replace_exact(
    'src/rotation-gap-audit-ui.test.ts',
    "    expect(panelSource).toContain('currentRotationGapAuditSummary.resolvedSinceBaseline');",
    "    expect(panelSource).toContain('currentRotationGapAuditSummary.resolvedSinceBaseline');\n    expect(panelSource).toContain('currentRotationGapAuditSummary.parameterizedVariantSourceSteps');\n    expect(panelSource).toContain('rotationScenarioVariantRequirements');",
)

print('Parameterized variant cumulative test expectations corrected')
