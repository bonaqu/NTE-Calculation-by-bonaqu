from pathlib import Path
import re

# Runs after the guarded product generator and updates cumulative factual tests only.

def replace_exact(path: str, old: str, new: str, expected: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrences of {old!r}, found {count}')
    target.write_text(text.replace(old, new), encoding='utf-8')


def set_preset_cycle_count(preset_id: str, expected_count: int) -> None:
    path = Path('src/verified-rotation-recipes.test.ts')
    text = path.read_text(encoding='utf-8')
    pattern = re.compile(
        rf"(presetId: '{re.escape(preset_id)}',[\s\S]*?omittedCycleConditions: )\d+(,)",
    )
    updated, count = pattern.subn(
        lambda match: f'{match.group(1)}{expected_count}{match.group(2)}',
        text,
        count=1,
    )
    if count != 1:
        raise RuntimeError(f'{path}: expected one Cycle-count block for {preset_id}, found {count}')
    path.write_text(updated, encoding='utf-8')


replace_exact('src/non-atk-action-scaling.test.ts', ').size).toBe(107);', ').size).toBe(110);')

replace_exact(
    'src/shinku-rotation-import.test.ts',
    "it('reports one full, five partial and two unsupported source steps', () => {\n    expect(previewRotationScenarioImport(preset)).toMatchObject({\n      presetId: 'shinku-charge',\n      totalSourceSteps: 8,\n      fullyMappedSourceSteps: 1,\n      partiallyMappedSourceSteps: 5,\n      mappedSourceSteps: 6,\n      generatedActionSteps: 14,\n      generatedEffectSteps: 2,\n      generatedCycleSteps: 0,\n      generatedPartialRemainderSteps: 5,\n      unsupportedSourceSteps: 2,\n      coveragePercent: 43.8,\n    });\n  });",
    "it('reports one full and seven partial source steps without unsupported setup', () => {\n    expect(previewRotationScenarioImport(preset)).toMatchObject({\n      presetId: 'shinku-charge',\n      totalSourceSteps: 8,\n      fullyMappedSourceSteps: 1,\n      partiallyMappedSourceSteps: 7,\n      mappedSourceSteps: 8,\n      generatedActionSteps: 18,\n      generatedEffectSteps: 2,\n      generatedCycleSteps: 0,\n      generatedPartialRemainderSteps: 7,\n      unsupportedSourceSteps: 0,\n      coveragePercent: 56.3,\n    });\n  });",
)
replace_exact(
    'src/shinku-rotation-import.test.ts',
    "it('leaves Zero and Nanally setup unsupported instead of synthesizing their actions', () => {\n    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');\n    for (const sourceStepId of ['zero-fill', 'nanally-charge']) {\n      const generated = imported.scenario.steps.filter((step) => (\n        imported.metadata.originsByStepId[step.id]?.sourceStepId === sourceStepId\n      ));\n      expect(generated).toHaveLength(1);\n      expect(generated[0]).toMatchObject({ kind: 'wait', actionId: '' });\n      expect(imported.metadata.originsByStepId[generated[0]!.id]?.coverage).toBe('unsupported');\n    }\n  });",
    "it('binds Zero and Nanally setup actions while leaving unsupported Cycle parts visible', () => {\n    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');\n    const expected = {\n      'zero-fill': ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],\n      'nanally-charge': ['nanally.colucci-ultimate-technique.initial.level-10', 'nanally.colucci-howling-technique.level-10'],\n    } as const;\n    for (const [sourceStepId, actionIds] of Object.entries(expected)) {\n      const generated = imported.scenario.steps.filter((step) => (\n        imported.metadata.originsByStepId[step.id]?.sourceStepId === sourceStepId\n      ));\n      expect(generated.filter((step) => step.kind === 'action').map((step) => step.actionId)).toEqual(actionIds);\n      expect(generated.filter((step) => step.kind === 'wait' && step.note.startsWith('Непокрытая часть'))).toHaveLength(1);\n      expect(generated.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'partial')).toBe(true);\n    }\n  });",
)

for path in ['src/nanally-chaos-integration.test.ts', 'src/rotation-gap-audit.test.ts']:
    replace_exact(
        path,
        "expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(7);",
        "expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(9);",
    )
    replace_exact(
        path,
        "expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(7);",
        "expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(8);",
    )

replace_exact(
    'src/nanally-chaos-integration.test.ts',
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Zero'],\n    ]);",
    "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([\n      [1, 'Jiuyuan'],\n      [2, 'Hathor'],\n    ]);",
)

replace_exact(
    'src/verified-rotation-recipes.test.ts',
    "expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'shinku-charge')?.gaps).toHaveLength(10);",
    "expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'shinku-charge')?.gaps).toHaveLength(9);",
)
set_preset_cycle_count('shinku-charge', 0)
set_preset_cycle_count('hathor-hyper', 1)
set_preset_cycle_count('chaos-remora-bomb', 1)

print('Zero cumulative test expectations corrected')
