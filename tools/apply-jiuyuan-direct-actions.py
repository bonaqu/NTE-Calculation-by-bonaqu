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


batch_m = '''import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/jiuyuan-profile-skills';
const sourcePublisher = 'Icy Veins / Prydwen Institute';
const sourceUpdatedAt = '2026-07-07';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Jiuyuan direct actions. Lethal Rose Pact, Pact Settlement,
 * Blossom, Hexed and Awakening effects remain separate mechanics.
 */
export const verifiedVisibleActionsBatchM: readonly VerifiedVisibleAction[] = [
  {
    id: 'jiuyuan.intel-hunter.direct.level-10',
    characterName: 'Jiuyuan',
    title: { ru: 'Intel Hunter · прямой урон', en: 'Intel Hunter: direct damage' },
    description: {
      ru: 'Прямая hit-композиция навыка перенаправления: 72% + 76,4% × 4 + 222,7% = 600,3% АТК. Четыре Rose Pact Bullets и установление Lethal Rose Pact не превращаются в дополнительный фиксированный урон этой записи.',
      en: 'Redirect Skill direct hit composition: 72% + 76.4% × 4 + 222.7% = 600.3% ATK. The four Rose Pact Bullets and Lethal Rose Pact establishment do not become fixed extra damage in this record.',
    },
    multiplier: 72 + 76.4 * 4 + 222.7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все шесть опубликованных компонентов прямой атаки попадают по проверяемой цели.',
      en: 'All six published direct-hit components connect with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'jiuyuan.final-reckoning.direct.level-10',
    characterName: 'Jiuyuan',
    title: { ru: 'Final Reckoning · прямой урон', en: 'Final Reckoning: direct damage' },
    description: {
      ru: 'Raw hit-композиция сверхспособности: 123,5% + 156,7% × 3 + 48,8% × 7 + 264,1% = 1199,3% АТК. Одновременные Pact Settlement, их коэффициент 400%, энергия и A2–A6 не входят.',
      en: 'Ultimate raw hit composition: 123.5% + 156.7% × 3 + 48.8% × 7 + 264.1% = 1199.3% ATK. Simultaneous Pact Settlements, their 400% ratio, Energy, and A2–A6 are excluded.',
    },
    multiplier: 123.5 + 156.7 * 3 + 48.8 * 7 + 264.1,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все двенадцать опубликованных прямых компонентов сверхспособности попадают по проверяемой цели; Pact Settlement считается отдельно.',
      en: 'All twelve published direct Ultimate components connect with the tested target; Pact Settlement is calculated separately.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
'''
write('src/verified-visible-actions-batch-m.ts', batch_m)

replace_once(
    'src/verified-visible-actions.ts',
    "import { verifiedVisibleActionsBatchL } from './verified-visible-actions-batch-l';\n",
    "import { verifiedVisibleActionsBatchL } from './verified-visible-actions-batch-l';\nimport { verifiedVisibleActionsBatchM } from './verified-visible-actions-batch-m';\n",
)
replace_once(
    'src/verified-visible-actions.ts',
    '  ...verifiedVisibleActionsBatchL,\n];',
    '  ...verifiedVisibleActionsBatchL,\n  ...verifiedVisibleActionsBatchM,\n];',
)
replace_once(
    'tsconfig.node.json',
    '    "src/verified-visible-actions-batch-l.ts",\n',
    '    "src/verified-visible-actions-batch-l.ts",\n    "src/verified-visible-actions-batch-m.ts",\n',
)

# Two sourced Ultimate -> Redirect Skill partial bindings.
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('hathor-hyper', 'zero-blossom')]: {",
    "  [binding('hathor-hyper', 'jiuyuan-open')]: {\n    coverage: 'partial',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['jiuyuan.final-reckoning.direct.level-10', 'jiuyuan.intel-hunter.direct.level-10'],\n    }],\n  },\n  [binding('hathor-hyper', 'zero-blossom')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('nanally-hexed-dual', 'nanally-zero-blossom')]: {",
    "  [binding('nanally-hexed-dual', 'nanally-jiuyuan-hexed')]: {\n    coverage: 'partial',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['jiuyuan.final-reckoning.direct.level-10', 'jiuyuan.intel-hunter.direct.level-10'],\n    }],\n  },\n  [binding('nanally-hexed-dual', 'nanally-zero-blossom')]: {",
)

# Current audit after resolving the two Jiuyuan source steps.
current = read('src/rotation-gap-audit-current.ts')
start = current.index('export const currentRotationMissingActionPriorities')
end = current.index('\n\nfunction currentUnsupportedKeys', start)
priorities = '''export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Hathor',
    capability: { ru: 'полностью удерживаемое Aerial Command', en: 'fully held Aerial Command' },
    sourceSteps: ['chaos-hathor-redirect'],
    reason: { ru: 'Источник публикует коэффициент одного тика, но для exact action нужен доказанный состав полного удержания.', en: 'The source publishes a per-tick ratio, while an exact action requires a sourced full-hold composition.' },
  },
];'''
write('src/rotation-gap-audit-current.ts', current[:start] + priorities + current[end:])
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 22) errors.push('Expected twenty-two source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 24) errors.push('Expected twenty-four source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 19) errors.push(`Expected 19 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 17) errors.push(`Expected 17 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.missingActionRecord !== 3) errors.push('Expected 3 current missing-action records');", "if (currentRotationGapAuditSummary.missingActionRecord !== 1) errors.push('Expected 1 current missing-action record');")

# Update global catalog and cumulative audit/coverage expectations.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'expect(verifiedVisibleActions).toHaveLength(110);': 'expect(verifiedVisibleActions).toHaveLength(112);',
      'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(110);': 'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(112);',
      'verifiedActionCount: 110': 'verifiedActionCount: 112',
      'standaloneRecipeCount: 110': 'standaloneRecipeCount: 112',
      'verifiedActionCatalogCount: 110': 'verifiedActionCatalogCount: 112',
      'covers all 110 verified actions': 'covers all 112 verified actions',
      'expect(verifiedActionScenarioRecipes).toHaveLength(110);': 'expect(verifiedActionScenarioRecipes).toHaveLength(112);',
      'expect(new Set(recipeActionIds).size).toBe(110);': 'expect(new Set(recipeActionIds).size).toBe(112);',
      '110-action catalog': '112-action catalog',
      'bindingCount: 39': 'bindingCount: 41',
      'partiallyBoundSourceStepCount: 27': 'partiallyBoundSourceStepCount: 29',
      'unsupportedSourceStepCount: 19': 'unsupportedSourceStepCount: 17',
      'boundActionStepCount: 58': 'boundActionStepCount: 62',
      'promotedActionStepCount: 58': 'promotedActionStepCount: 62',
      'resolvedSinceBaseline: 22': 'resolvedSinceBaseline: 24',
      'total: 19': 'total: 17',
      'missingActionRecord: 3': 'missingActionRecord: 1',
      'toHaveLength(19)': 'toHaveLength(17)',
      "toEqual(['Jiuyuan', 'Hathor'])": "toEqual(['Hathor'])",
      "[[1, 'Jiuyuan'], [2, 'Hathor']]": "[[1, 'Hathor']]",
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

# UI priority count/name.
replace_once('src/rotation-gap-audit-ui.test.ts', 'expect(currentRotationMissingActionPriorities).toHaveLength(2);', 'expect(currentRotationMissingActionPriorities).toHaveLength(1);')
replace_once("src/rotation-gap-audit-ui.test.ts", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Jiuyuan');", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Hathor');")
replace_once('src/rotation-gap-audit-ui.test.ts', "it('shows the updated missing-action backlog after Zero direct-action research'", "it('shows the updated missing-action backlog after Jiuyuan direct-action research'")
replace_once('src/rotation-gap-audit.test.ts', "it('moves missing-action research priority to Jiuyuan and held Hathor Skill'", "it('leaves held Hathor Skill as the only missing-action priority'")
replace_once("src/rotation-gap-audit.test.ts", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Jiuyuan'], [2, 'Hathor']]);", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Hathor']]);")

# Per-preset audits and exact action order.
recipe_test = read('src/verified-rotation-recipes.test.ts')
replacements = {
    "      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 5,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 3,\n      verifiedActionSteps: 8,": "      partiallyBoundSourceSteps: 6,\n      unsupportedSourceSteps: 4,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 4,\n      verifiedActionSteps: 10,",
    "      partiallyBoundSourceSteps: 4,\n      unsupportedSourceSteps: 3,\n      verifiedActionSteps: 9,": "      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 2,\n      verifiedActionSteps: 11,",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'hathor-hyper')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.divide-by-zero.level-10',": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'hathor-hyper')?.steps.map((step) => step.actionId)).toEqual([\n      'jiuyuan.final-reckoning.direct.level-10',\n      'jiuyuan.intel-hunter.direct.level-10',\n      'zero.divide-by-zero.level-10',",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.appraise-and-engrave.main.level-10',": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'jiuyuan.final-reckoning.direct.level-10',\n      'jiuyuan.intel-hunter.direct.level-10',\n      'zero.appraise-and-engrave.main.level-10',",
}
for old, new in replacements.items():
    if old not in recipe_test:
        raise RuntimeError(f'verified-rotation-recipes.test.ts missing anchor: {old[:110]}')
    recipe_test = recipe_test.replace(old, new, 1)
write('src/verified-rotation-recipes.test.ts', recipe_test)

jiuyuan_test = '''import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeById, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchM } from './verified-visible-actions-batch-m';
import { verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchM.map((action) => [action.id, action]));

describe('verified Jiuyuan direct actions and Rotation Lab bindings', () => {
  it('adds two exact level-10 direct actions to the 112-action catalog', () => {
    expect(verifiedVisibleActionsBatchM).toHaveLength(2);
    expect(new Set(verifiedVisibleActionsBatchM.map((action) => action.id)).size).toBe(2);
    expect(verifiedVisibleActions).toHaveLength(112);
    expect(byId.get('jiuyuan.intel-hunter.direct.level-10')?.multiplier).toBeCloseTo(600.3, 8);
    expect(byId.get('jiuyuan.final-reckoning.direct.level-10')?.multiplier).toBeCloseTo(1199.3, 8);
  });

  it('keeps Pact Settlement, Rose Pact and A6 outside the direct ratios', () => {
    const skill = byId.get('jiuyuan.intel-hunter.direct.level-10')!;
    const ultimate = byId.get('jiuyuan.final-reckoning.direct.level-10')!;
    expect(skill.description.ru).toContain('не превращаются');
    expect(ultimate.description.ru).toContain('Pact Settlement');
    expect(ultimate.description.ru).toContain('A2–A6');
    expect(verifiedVisibleActionsBatchM.some((action) => action.id.includes('awakening'))).toBe(false);
    expect(verifiedVisibleActionsBatchM.some((action) => action.id.includes('settlement'))).toBe(false);
  });

  it('binds both source steps as Ultimate then Redirect Skill without A6 substitution', () => {
    for (const key of ['hathor-hyper:jiuyuan-open', 'nanally-hexed-dual:nanally-jiuyuan-hexed']) {
      expect(rotationScenarioBindings[key]).toEqual({
        coverage: 'partial',
        items: [{
          kind: 'action-sequence',
          actionIds: ['jiuyuan.final-reckoning.direct.level-10', 'jiuyuan.intel-hunter.direct.level-10'],
        }],
      });
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
  });

  it('preserves the exact action order in both promoted recipes', () => {
    for (const presetId of ['hathor-hyper', 'nanally-hexed-dual']) {
      const recipe = verifiedRotationRecipeById.get(`rotation-lab.${presetId}.verified-actions`)!;
      const actions = recipe.steps.map((step) => step.actionId);
      const ultimateIndex = actions.indexOf('jiuyuan.final-reckoning.direct.level-10');
      const skillIndex = actions.indexOf('jiuyuan.intel-hunter.direct.level-10');
      expect(ultimateIndex).toBeGreaterThanOrEqual(0);
      expect(skillIndex).toBe(ultimateIndex + 1);
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');
      const importedActions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
      expect(importedActions.indexOf('jiuyuan.intel-hunter.direct.level-10')).toBe(importedActions.indexOf('jiuyuan.final-reckoning.direct.level-10') + 1);
      expect(importedActions).not.toContain('jiuyuan.know-every-secret.awakening-six');
    }
  });

  it('derives 41 bindings, 62 promoted actions and the 17-gap audit', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 41,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 29,
      unsupportedSourceStepCount: 17,
      boundActionStepCount: 62,
      promotedRecipeCount: 6,
      promotedActionStepCount: 62,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 24,
      total: 17,
      missingActionRecord: 1,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 112,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual(['Hathor']);
  });
});
'''
write('src/jiuyuan-direct-actions.test.ts', jiuyuan_test)

write('docs/JIUYUAN_DIRECT_ACTION_RECONCILIATION.md', '''# Jiuyuan direct-action reconciliation\n\nVerified 2026-08-06.\n\n## Level-10 direct records\n\n- Intel Hunter: `72% + 76.4% × 4 + 222.7% = 600.3% ATK`.\n- Final Reckoning: `123.5% + 156.7% × 3 + 48.8% × 7 + 264.1% = 1199.3% ATK`.\n\nPrimary ratios: Icy Veins Jiuyuan profile, updated 2026-07-07. Rotation order and sub-DPS guidance: Prydwen Jiuyuan/Nanally profiles, updated 2026-05-26.\n\n## Exclusions\n\n- Intel Hunter's four Rose Pact Bullets and Lethal Rose Pact establishment are state/resource mechanics, not fixed extra direct damage.\n- Final Reckoning's simultaneous Pact Settlements, their published 400% ratio, Ultimate Energy and A2–A6 remain separate.\n- `jiuyuan.know-every-secret.awakening-six` stays a standalone conditional 200% trigger with a five-second internal cooldown.\n- Blossom and Hexed are not converted into direct Jiuyuan damage.\n\n## Rotation bindings\n\nBoth `hathor-hyper:jiuyuan-open` and `nanally-hexed-dual:nanally-jiuyuan-hexed` store the sourced order:\n\n1. Final Reckoning;\n2. Intel Hunter.\n\nThey remain partial because Pact/Settlement and Hexed consequences are not synthesized.\n\n## Coverage\n\n- action catalog: 110 → 112;\n- bindings: 39 → 41;\n- partial source steps: 27 → 29;\n- unsupported source steps: 19 → 17;\n- bound/promoted action steps: 58 → 62;\n- current missing-action gaps: 3 → 1.\n\nThe immutable 41-step baseline remains unchanged. Fully held Hathor Aerial Command becomes the only missing-action priority.\n''')

print('Jiuyuan direct-action patch applied successfully')
