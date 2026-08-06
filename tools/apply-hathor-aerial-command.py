from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding='utf-8')


def write(path: str, content: str) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8')


def replace_once(path: str, old: str, new: str) -> None:
    content = read(path)
    count = content.count(old)
    if count != 1:
        raise RuntimeError(f'{path}: expected one anchor, found {count}: {old[:120]!r}')
    write(path, content.replace(old, new, 1))


batch_n = '''import type { VerifiedVisibleAction } from './verified-visible-actions';

/**
 * Exact level-10 maximum-hold Aerial Command. The direct hold composition and
 * twenty published DoT ticks are counted once. Five-Star Tracking, Express
 * Delivery Power, Remora and Awakenings remain separate mechanics.
 */
export const verifiedVisibleActionsBatchN: readonly VerifiedVisibleAction[] = [
  {
    id: 'hathor.aerial-command.full-hold.level-10',
    characterName: 'Hathor',
    title: { ru: 'Aerial Command · полное удержание', en: 'Aerial Command: full hold' },
    description: {
      ru: 'Полностью удерживаемый навык: 20,4% × 4 + 244,9% + 110,3% × 5 + 111,1% × 20 = 3100% АТК. Первые компоненты взяты из Hold Ratio, а 20 периодических попаданий — из подтверждённого максимума полного удержания. Five-Star Tracking, ресурсы Хатор и Ремора не включены.',
      en: 'Maximum hold: 20.4% × 4 + 244.9% + 110.3% × 5 + 111.1% × 20 = 3100% ATK. The first components come from the Hold Ratio and the twenty periodic hits from the sourced maximum full hold. Five-Star Tracking, Hathor resources, and Remora are excluded.',
    },
    multiplier: 20.4 * 4 + 244.9 + 110.3 * 5 + 111.1 * 20,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Навык удерживается до подтверждённого максимума в 20 периодических попаданий.',
        en: 'The skill is held through the sourced maximum of twenty periodic hits.',
      },
      {
        ru: 'Все компоненты Hold Ratio и все 20 периодических попаданий соединяются с проверяемой целью.',
        en: 'All Hold Ratio components and all twenty periodic hits connect with the tested target.',
      },
      {
        ru: 'Five-Star Tracking, Express Delivery Power, A1/A2/A5, Remora и Remora Enhancement рассчитываются отдельно.',
        en: 'Five-Star Tracking, Express Delivery Power, A1/A2/A5, Remora, and Remora Enhancement are calculated separately.',
      },
    ],
    sourcePublisher: 'Icy Veins / Prydwen Institute',
    sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/hathor-profile-skills',
    sourceUpdatedAt: '2026-06-27',
    verifiedAt: '2026-08-07',
  },
];
'''
write('src/verified-visible-actions-batch-n.ts', batch_n)

replace_once(
    'src/verified-visible-actions.ts',
    "import { verifiedVisibleActionsBatchM } from './verified-visible-actions-batch-m';\n",
    "import { verifiedVisibleActionsBatchM } from './verified-visible-actions-batch-m';\nimport { verifiedVisibleActionsBatchN } from './verified-visible-actions-batch-n';\n",
)
replace_once(
    'src/verified-visible-actions.ts',
    '  ...verifiedVisibleActionsBatchM,\n];',
    '  ...verifiedVisibleActionsBatchM,\n  ...verifiedVisibleActionsBatchN,\n];',
)
replace_once(
    'tsconfig.node.json',
    '    "src/verified-visible-actions-batch-m.ts",\n',
    '    "src/verified-visible-actions-batch-m.ts",\n    "src/verified-visible-actions-batch-n.ts",\n',
)

replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('chaos-remora-bomb', 'chaos-zero-remora')]: {",
    "  [binding('chaos-remora-bomb', 'chaos-hathor-redirect')]: {\n    coverage: 'partial',\n    items: [{ kind: 'action-sequence', actionIds: ['hathor.aerial-command.full-hold.level-10'] }],\n  },\n  [binding('chaos-remora-bomb', 'chaos-zero-remora')]: {",
)

# The immutable baseline remains unchanged; the last missing-action source step is now bound.
current = read('src/rotation-gap-audit-current.ts')
start = current.index('export const currentRotationMissingActionPriorities')
end = current.index('\n\nfunction currentUnsupportedKeys', start)
write(
    'src/rotation-gap-audit-current.ts',
    current[:start] + 'export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [];'
    + current[end:],
)
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 24) errors.push('Expected twenty-four source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 25) errors.push('Expected twenty-five source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 17) errors.push(`Expected 17 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 16) errors.push(`Expected 16 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.missingActionRecord !== 1) errors.push('Expected 1 current missing-action record');", "if (currentRotationGapAuditSummary.missingActionRecord !== 0) errors.push('Expected no current missing-action records');")

# Update exact global catalog and cumulative coverage expectations.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'expect(verifiedVisibleActions).toHaveLength(112);': 'expect(verifiedVisibleActions).toHaveLength(113);',
      'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(112);': 'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(113);',
      'verifiedActionCount: 112': 'verifiedActionCount: 113',
      'standaloneRecipeCount: 112': 'standaloneRecipeCount: 113',
      'verifiedActionCatalogCount: 112': 'verifiedActionCatalogCount: 113',
      'covers all 112 verified actions': 'covers all 113 verified actions',
      'expect(verifiedActionScenarioRecipes).toHaveLength(112);': 'expect(verifiedActionScenarioRecipes).toHaveLength(113);',
      'expect(new Set(recipeActionIds).size).toBe(112);': 'expect(new Set(recipeActionIds).size).toBe(113);',
      '112-action catalog': '113-action catalog',
      'bindingCount: 41': 'bindingCount: 42',
      'partiallyBoundSourceStepCount: 29': 'partiallyBoundSourceStepCount: 30',
      'unsupportedSourceStepCount: 17': 'unsupportedSourceStepCount: 16',
      'boundActionStepCount: 62': 'boundActionStepCount: 63',
      'promotedActionStepCount: 62': 'promotedActionStepCount: 63',
      'resolvedSinceBaseline: 24': 'resolvedSinceBaseline: 25',
      'total: 17': 'total: 16',
      'missingActionRecord: 1': 'missingActionRecord: 0',
      'toHaveLength(17)': 'toHaveLength(16)',
      "toEqual(['Hathor'])": 'toEqual([])',
      "[[1, 'Hathor']]": '[]',
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

replace_once('src/rotation-gap-audit.test.ts', "it('derives all 29 current gaps from exact bindings'", "it('derives all 16 current gaps from exact bindings'")
replace_once('src/rotation-gap-audit.test.ts', "it('leaves held Hathor Skill as the only missing-action priority'", "it('has no remaining missing-action priorities'")
replace_once('src/rotation-gap-audit.test.ts', "expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(8);", "expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(9);")

replace_once('src/rotation-gap-audit-ui.test.ts', "it('shows the updated missing-action backlog after Jiuyuan direct-action research'", "it('shows an empty missing-action backlog after Hathor full-hold research'")
replace_once('src/rotation-gap-audit-ui.test.ts', 'expect(currentRotationMissingActionPriorities).toHaveLength(1);', 'expect(currentRotationMissingActionPriorities).toHaveLength(0);')
replace_once("src/rotation-gap-audit-ui.test.ts", "    expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Hathor');\n", '')

recipe_test = read('src/verified-rotation-recipes.test.ts')
replacements = {
    "      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 2,\n      verifiedActionSteps: 8,": "      partiallyBoundSourceSteps: 6,\n      unsupportedSourceSteps: 1,\n      verifiedActionSteps: 9,",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'chaos-remora-bomb')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.divide-by-zero.level-10',": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'chaos-remora-bomb')?.steps.map((step) => step.actionId)).toEqual([\n      'hathor.aerial-command.full-hold.level-10',\n      'zero.divide-by-zero.level-10',",
}
for old, new in replacements.items():
    if old not in recipe_test:
        raise RuntimeError(f'verified-rotation-recipes.test.ts missing anchor: {old[:100]}')
    recipe_test = recipe_test.replace(old, new, 1)
write('src/verified-rotation-recipes.test.ts', recipe_test)

hathor_test = '''import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeById, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchN } from './verified-visible-actions-batch-n';
import { verifiedVisibleActions } from './verified-visible-actions';

const action = verifiedVisibleActionsBatchN[0];

describe('verified Hathor maximum-hold Aerial Command', () => {
  it('adds one exact level-10 action to the 113-action catalog', () => {
    expect(verifiedVisibleActionsBatchN).toHaveLength(1);
    expect(action).toMatchObject({
      id: 'hathor.aerial-command.full-hold.level-10',
      characterName: 'Hathor',
      requiredSkill: 'skill',
      requiredLevel: 10,
    });
    expect(action?.multiplier).toBeCloseTo(3100, 8);
    expect(20.4 * 4 + 244.9 + 110.3 * 5 + 111.1 * 20).toBeCloseTo(3100, 8);
    expect(verifiedVisibleActions).toHaveLength(113);
  });

  it('documents the twenty-tick full hold without folding in resources or Remora', () => {
    expect(action?.description.ru).toContain('111,1% × 20');
    expect(action?.description.ru).toContain('Five-Star Tracking');
    expect(action?.description.ru).toContain('Ремора не включены');
    expect(action?.assumedConditions?.some((condition) => condition.ru.includes('20 периодических'))).toBe(true);
    expect(action?.id).not.toContain('remora');
    expect(action?.id).not.toContain('awakening');
  });

  it('adds one partial binding and removes the final missing-action gap', () => {
    const key = 'chaos-remora-bomb:chaos-hathor-redirect';
    expect(rotationScenarioBindings[key]).toEqual({
      coverage: 'partial',
      items: [{ kind: 'action-sequence', actionIds: ['hathor.aerial-command.full-hold.level-10'] }],
    });
    expect(currentRotationGapAuditByKey.has(key)).toBe(false);
  });

  it('preserves action order and leaves the non-damage remainder visible', () => {
    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
    const generated = imported.scenario.steps.filter((step) => (
      imported.metadata.originsByStepId[step.id]?.sourceStepId === 'chaos-hathor-redirect'
    ));
    expect(generated.filter((step) => step.kind === 'action').map((step) => step.actionId)).toEqual([
      'hathor.aerial-command.full-hold.level-10',
    ]);
    expect(generated.filter((step) => step.kind === 'wait' && step.note.startsWith('Непокрытая часть'))).toHaveLength(1);
    expect(generated.every((step) => imported.metadata.originsByStepId[step.id]?.coverage === 'partial')).toBe(true);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps[0]?.actionId).toBe('hathor.aerial-command.full-hold.level-10');
  });

  it('derives 42 bindings, 63 promoted actions and zero missing-action records', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 42,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 30,
      unsupportedSourceStepCount: 16,
      boundActionStepCount: 63,
      promotedRecipeCount: 6,
      promotedActionStepCount: 63,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 25,
      total: 16,
      missingActionRecord: 0,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
    expect(currentRotationMissingActionPriorities).toEqual([]);
  });

  it('retains exact source provenance', () => {
    expect(action).toMatchObject({
      sourcePublisher: 'Icy Veins / Prydwen Institute',
      sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/hathor-profile-skills',
      sourceUpdatedAt: '2026-06-27',
      verifiedAt: '2026-08-07',
    });
  });
});
'''
write('src/hathor-aerial-command.test.ts', hathor_test)

write('docs/HATHOR_AERIAL_COMMAND_RECONCILIATION.md', '''# Hathor Aerial Command reconciliation\n\nVerified 2026-08-07.\n\n## Level-10 maximum hold\n\nIcy Veins publishes the hold composition and periodic-hit ratio:\n\n- Hold Ratio: `20.4% × 4 + 244.9% + 110.3% × 5 = 878% ATK`;\n- periodic hit: `111.1% ATK` each.\n\nPrydwen explicitly states that maximum hold produces 20 ticks. Therefore the exact maximum-hold action is:\n\n`878% + 111.1% × 20 = 3100% ATK`.\n\nSources: Icy Veins Hathor profile, updated 2026-06-27; Prydwen Hathor profile, updated 2026-06-23.\n\n## Exclusions\n\n- Five-Star Tracking is a five-second state and does not add a fixed direct-damage coefficient.\n- Express Delivery Power generation is a resource consequence, not direct damage.\n- A1, A2 and A5 remain optional Awakening effects.\n- Remora and Remora Enhancement are not attached to Aerial Command.\n- No seconds are assigned to the Combat Scenario action.\n\n## Rotation binding\n\n`chaos-remora-bomb:chaos-hathor-redirect` receives one partial binding containing `hathor.aerial-command.full-hold.level-10`. The direct damage is exact, while resource and Cycle consequences remain a visible partial remainder.\n\n## Coverage\n\n- action catalog: 112 → 113;\n- bindings: 41 → 42;\n- partial source steps: 29 → 30;\n- unsupported source steps: 17 → 16;\n- bound/promoted action steps: 62 → 63;\n- current missing-action records: 1 → 0.\n\nThe immutable 41-step baseline remains unchanged. The remaining 16 current gaps are effect/Cycle conditions, non-damage operations, or ambiguous source variants rather than absent direct-action records.\n''')

print('Hathor Aerial Command patch applied successfully')
