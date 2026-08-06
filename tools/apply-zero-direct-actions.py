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


batch_l = '''import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/zero-profile-skills';
const sourcePublisher = 'Icy Veins / Prydwen Institute';
const sourceUpdatedAt = '2026-07-07';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Zero direct actions. Lower-level-target hits, A1, A3, A4 and
 * A6 remain separate conditions and are never attached to Rotation Lab casts
 * automatically.
 */
export const verifiedVisibleActionsBatchL: readonly VerifiedVisibleAction[] = [
  {
    id: 'zero.appraise-and-engrave.main.level-10',
    characterName: 'Zero',
    title: { ru: 'Appraise and Engrave · основная часть', en: 'Appraise and Engrave: main sequence' },
    description: {
      ru: 'Основные четыре попадания навыка перенаправления: 40% + 40% + 251,1% + 268,7% = 599,8% АТК. Условный дополнительный выстрел по цели ниже уровнем и A6 хранятся отдельно.',
      en: 'The Redirect Skill four main hits: 40% + 40% + 251.1% + 268.7% = 599.8% ATK. The conditional lower-level-target extra shot and A6 remain separate.',
    },
    multiplier: 40 + 40 + 251.1 + 268.7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все четыре основных попадания соединяются с проверяемой целью; условный дополнительный выстрел не включён.',
      en: 'All four main hits connect with the tested target; the conditional extra shot is excluded.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'zero.appraise-and-engrave.extra-lower-level.base.level-10',
    characterName: 'Zero',
    title: { ru: 'Appraise and Engrave · условный выстрел', en: 'Appraise and Engrave: conditional extra shot' },
    description: {
      ru: 'Базовый дополнительный выстрел по первой цели ниже уровня Зеро: 200% АТК. При активном A6 вместо этой записи используется отдельный вариант на 300%; две записи не складываются.',
      en: 'Base extra shot against the first target below Zero level: 200% ATK. With A6 active, use the separate 300% record instead; the two records do not stack.',
    },
    multiplier: 200,
    requiredSkill: 'skill',
    requiredLevel: 10,
    requiresLowerLevelTarget: true,
    assumedConditions: [{
      ru: 'A6 Deceptive Liberation не выбран; учитывается базовый коэффициент 200%, а не вариант 300%.',
      en: 'A6 Deceptive Liberation is not selected; the base 200% ratio is used instead of the 300% variant.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'zero.divide-by-zero.level-10',
    characterName: 'Zero',
    title: { ru: 'Divide by Zero · полная прямая композиция', en: 'Divide by Zero: full direct composition' },
    description: {
      ru: 'Raw hit-композиция сверхспособности: 265,3% + 10,6% × 4 + 354,8% + 337% = 999,5% АТК. Безусловный пассив Anomaly Perception применяется отдельно как +25% к урону этого действия; A3 и A4 не включены.',
      en: 'Ultimate raw hit composition: 265.3% + 10.6% × 4 + 354.8% + 337% = 999.5% ATK. The unconditional Anomaly Perception passive is applied separately as +25% damage to this action; A3 and A4 are excluded.',
    },
    multiplier: 265.3 + 10.6 * 4 + 354.8 + 337,
    damageBonus: 25,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все семь опубликованных компонентов попадают по проверяемой цели. A3 (+50% шанса крит. удара) и A4 не моделируются этой записью.',
      en: 'All seven published components connect with the tested target. A3 (+50% CRIT Rate) and A4 are not modeled by this record.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
'''
write('src/verified-visible-actions-batch-l.ts', batch_l)

replace_once(
    'src/verified-visible-actions.ts',
    "import { verifiedVisibleActionsBatchK } from './verified-visible-actions-batch-k';\n",
    "import { verifiedVisibleActionsBatchK } from './verified-visible-actions-batch-k';\nimport { verifiedVisibleActionsBatchL } from './verified-visible-actions-batch-l';\n",
)
replace_once(
    'src/verified-visible-actions.ts',
    '  multiplier: number;\n  /** Omitted values preserve the legacy final-ATK calculation path. */',
    '  multiplier: number;\n  /** Action-specific additive DMG bonus sourced from the character kit. */\n  damageBonus?: number;\n  /** Omitted values preserve the legacy final-ATK calculation path. */',
)
replace_once(
    'src/verified-visible-actions.ts',
    '  ...verifiedVisibleActionsBatchK,\n];',
    '  ...verifiedVisibleActionsBatchK,\n  ...verifiedVisibleActionsBatchL,\n];',
)
replace_once(
    'tsconfig.node.json',
    '    "src/verified-visible-actions-batch-k.ts",\n',
    '    "src/verified-visible-actions-batch-k.ts",\n    "src/verified-visible-actions-batch-l.ts",\n',
)

# Carry an action-specific additive damage bonus through the visible formula.
replace_once(
    'src/game-visible-calculation.ts',
    '  let actionDefenceIgnore = 0;\n  const conditions:',
    '  let actionDefenceIgnore = 0;\n  let actionDamageBonus = 0;\n  const conditions:',
)
replace_once(
    'src/game-visible-calculation.ts',
    '    actionDefenceIgnore = action.defenceIgnore ?? 0;\n    conditions.push({ id: action.id, label: action.title, source: \'verified-data\' });',
    '    actionDefenceIgnore = action.defenceIgnore ?? 0;\n    actionDamageBonus = action.damageBonus ?? 0;\n    conditions.push({ id: action.id, label: action.title, source: \'verified-data\' });',
)
replace_once(
    'src/game-visible-calculation.ts',
    "    if (action.defenceIgnore) {\n      conditions.push({",
    "    if (action.damageBonus) {\n      conditions.push({\n        id: `${action.id}.damage-bonus`,\n        label: {\n          ru: `Пассив действия: +${action.damageBonus}% к урону`,\n          en: `Action passive: +${action.damageBonus}% damage`,\n        },\n        source: 'verified-data',\n      });\n    }\n    if (action.defenceIgnore) {\n      conditions.push({",
)
replace_once(
    'src/game-visible-calculation.ts',
    '      + modifier.damageBonus\n      + conditional.damageBonus,',
    '      + modifier.damageBonus\n      + actionDamageBonus\n      + conditional.damageBonus,',
)

# Exact partial bindings for five Zero source steps plus the already sourced Nanally setup in Shinku.
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('shinku-charge', 'hathor-open')]: {\n    coverage: 'partial',\n    items: [\n      {\n        kind: 'action-sequence',\n        actionIds: [\n          'hathor.rider-express.level-10',\n          'hathor.cyclone-strike-first.level-10',\n        ],\n      },\n      { kind: 'activate-effect', effectId: 'hathor.delay-warning.remora-crit-rate' },\n    ],\n  },\n  [binding('shinku-charge', 'shinku-ultimate')]: {",
    "  [binding('shinku-charge', 'hathor-open')]: {\n    coverage: 'partial',\n    items: [\n      {\n        kind: 'action-sequence',\n        actionIds: [\n          'hathor.rider-express.level-10',\n          'hathor.cyclone-strike-first.level-10',\n        ],\n      },\n      { kind: 'activate-effect', effectId: 'hathor.delay-warning.remora-crit-rate' },\n    ],\n  },\n  [binding('shinku-charge', 'zero-fill')]: {\n    coverage: 'partial',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],\n    }],\n  },\n  [binding('shinku-charge', 'nanally-charge')]: {\n    coverage: 'partial',\n    items: [\n      {\n        kind: 'action-sequence',\n        actionIds: [\n          'nanally.colucci-ultimate-technique.initial.level-10',\n          'nanally.colucci-howling-technique.level-10',\n        ],\n      },\n      { kind: 'activate-cycle', cycleId: 'blossom' },\n    ],\n  },\n  [binding('shinku-charge', 'shinku-ultimate')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('hathor-hyper', 'haniel-buffs')]: {\n    coverage: 'partial',\n    items: hanielSetupItems,\n  },",
    "  [binding('hathor-hyper', 'zero-blossom')]: {\n    coverage: 'partial',\n    items: [\n      { kind: 'action-sequence', actionIds: ['zero.divide-by-zero.level-10'] },\n      { kind: 'activate-cycle', cycleId: 'blossom' },\n    ],\n  },\n  [binding('hathor-hyper', 'haniel-buffs')]: {\n    coverage: 'partial',\n    items: hanielSetupItems,\n  },",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('hathor-hyper', 'hathor-ultimate')]: {\n    coverage: 'full',\n    items: hathorBurstItems,\n  },\n\n  [binding('chaos-remora-bomb', 'chaos-haniel-buffs')]: {",
    "  [binding('hathor-hyper', 'hathor-ultimate')]: {\n    coverage: 'full',\n    items: hathorBurstItems,\n  },\n  [binding('hathor-hyper', 'zero-third-strike')]: {\n    coverage: 'partial',\n    items: [{ kind: 'action-sequence', actionIds: ['zero.appraise-and-engrave.main.level-10'] }],\n  },\n\n  [binding('chaos-remora-bomb', 'chaos-zero-remora')]: {\n    coverage: 'partial',\n    items: [\n      { kind: 'action-sequence', actionIds: ['zero.divide-by-zero.level-10'] },\n      { kind: 'activate-cycle', cycleId: 'remora' },\n    ],\n  },\n  [binding('chaos-remora-bomb', 'chaos-haniel-buffs')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('nanally-hexed-dual', 'nanally-sakiri-setup')]: {\n    coverage: 'partial',\n    items: sakiriSetupItems,\n  },",
    "  [binding('nanally-hexed-dual', 'nanally-zero-blossom')]: {\n    coverage: 'partial',\n    items: [\n      {\n        kind: 'action-sequence',\n        actionIds: ['zero.appraise-and-engrave.main.level-10', 'zero.divide-by-zero.level-10'],\n      },\n      { kind: 'activate-cycle', cycleId: 'blossom' },\n    ],\n  },\n  [binding('nanally-hexed-dual', 'nanally-sakiri-setup')]: {\n    coverage: 'partial',\n    items: sakiriSetupItems,\n  },",
)

# Current gap layer after resolving five Zero steps and the already sourced Nanally step.
current = read('src/rotation-gap-audit-current.ts')
start = current.index('export const currentRotationMissingActionPriorities')
end = current.index('\n\nfunction currentUnsupportedKeys', start)
priorities = '''export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Jiuyuan',
    capability: { ru: 'прямые сверхспособность и навык перенаправления', en: 'direct Ultimate and Redirect Skill' },
    sourceSteps: ['jiuyuan-open', 'nanally-jiuyuan-hexed'],
    reason: { ru: 'Одна точная пара действий закроет два шага в ротациях Хатор и Наналли; текущий A6-триггер относится к другой механике.', en: 'One exact action pair closes two steps in Hathor and Nanally rotations; the current A6 trigger is a different mechanic.' },
  },
  {
    rank: 2,
    characterName: 'Hathor',
    capability: { ru: 'полностью удерживаемое Aerial Command', en: 'fully held Aerial Command' },
    sourceSteps: ['chaos-hathor-redirect'],
    reason: { ru: 'Источник публикует коэффициент одного тика, но для exact action нужен доказанный состав полного удержания.', en: 'The source publishes a per-tick ratio, while an exact action requires a sourced full-hold composition.' },
  },
];'''
write('src/rotation-gap-audit-current.ts', current[:start] + priorities + current[end:])
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 16) errors.push('Expected sixteen source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 22) errors.push('Expected twenty-two source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 25) errors.push(`Expected 25 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 19) errors.push(`Expected 19 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.missingActionRecord !== 9) errors.push('Expected 9 current missing-action records');", "if (currentRotationGapAuditSummary.missingActionRecord !== 3) errors.push('Expected 3 current missing-action records');")

# Update global catalog assertions from 107 to 110.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'expect(verifiedVisibleActions).toHaveLength(107);': 'expect(verifiedVisibleActions).toHaveLength(110);',
      'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(107);': 'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(110);',
      'verifiedActionCount: 107': 'verifiedActionCount: 110',
      'standaloneRecipeCount: 107': 'standaloneRecipeCount: 110',
      'verifiedActionCatalogCount: 107': 'verifiedActionCatalogCount: 110',
      'covers all 107 verified actions': 'covers all 110 verified actions',
      'expect(verifiedActionScenarioRecipes).toHaveLength(107);': 'expect(verifiedActionScenarioRecipes).toHaveLength(110);',
      'expect(new Set(recipeActionIds).size).toBe(107);': 'expect(new Set(recipeActionIds).size).toBe(110);',
      '107-action catalog': '110-action catalog',
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

# Recipe aggregate, per-preset and exact order expectations.
recipe_test = read('src/verified-rotation-recipes.test.ts')
replacements = {
    'bindingCount: 33': 'bindingCount: 39',
    'partiallyBoundSourceStepCount: 21': 'partiallyBoundSourceStepCount: 27',
    'unsupportedSourceStepCount: 25': 'unsupportedSourceStepCount: 19',
    'boundActionStepCount: 49': 'boundActionStepCount: 58',
    'promotedActionStepCount: 49': 'promotedActionStepCount: 58',
    "      fullyBoundSourceSteps: 1,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 2,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 5,\n      verifiedActionSteps: 14,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 0,": "      fullyBoundSourceSteps: 1,\n      partiallyBoundSourceSteps: 7,\n      unsupportedSourceSteps: 0,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 7,\n      verifiedActionSteps: 18,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 1,",
    "      fullyBoundSourceSteps: 1,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 7,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 1,\n      verifiedActionSteps: 6,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 1,": "      fullyBoundSourceSteps: 1,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 5,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 3,\n      verifiedActionSteps: 8,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 2,",
    "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 4,\n      unsupportedSourceSteps: 3,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 1,\n      omittedCycleConditions: 1,": "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 2,\n      verifiedActionSteps: 8,\n      omittedEffectConditions: 1,\n      omittedCycleConditions: 2,",
    "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 4,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 3,": "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 4,\n      unsupportedSourceSteps: 3,\n      verifiedActionSteps: 9,\n      omittedEffectConditions: 3,",
    "      'hathor.cyclone-strike-first.level-10',\n      'shinku.crimson-fury.level-10',": "      'hathor.cyclone-strike-first.level-10',\n      'zero.divide-by-zero.level-10',\n      'zero.appraise-and-engrave.main.level-10',\n      'nanally.colucci-ultimate-technique.initial.level-10',\n      'nanally.colucci-howling-technique.level-10',\n      'shinku.crimson-fury.level-10',",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'shinku-charge')?.gaps).toHaveLength(9);": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'shinku-charge')?.gaps).toHaveLength(10);",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'hathor-hyper')?.steps.map((step) => step.actionId)).toEqual([\n      'haniel.silent-moonlit-forest-guardian.direct.level-10',": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'hathor-hyper')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.divide-by-zero.level-10',\n      'haniel.silent-moonlit-forest-guardian.direct.level-10',",
    "      'hathor.cyclone-strike-third.level-10',\n    ]);": "      'hathor.cyclone-strike-third.level-10',\n      'zero.appraise-and-engrave.main.level-10',\n    ]);",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'chaos-remora-bomb')?.steps.map((step) => step.actionId)).toEqual([\n      'haniel.silent-moonlit-forest-guardian.direct.level-10',": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'chaos-remora-bomb')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.divide-by-zero.level-10',\n      'haniel.silent-moonlit-forest-guardian.direct.level-10',",
    "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'sakiri.feast-of-gluttony.level-10',": "    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'zero.appraise-and-engrave.main.level-10',\n      'zero.divide-by-zero.level-10',\n      'sakiri.feast-of-gluttony.level-10',",
}
for old, new in replacements.items():
    if old not in recipe_test:
        raise RuntimeError(f'verified-rotation-recipes.test.ts missing anchor: {old[:110]}')
    recipe_test = recipe_test.replace(old, new, 1)
write('src/verified-rotation-recipes.test.ts', recipe_test)

# Current audit tests/UI and cumulative integration assertions.
for path in ['src/rotation-gap-audit.test.ts', 'src/rotation-gap-audit-ui.test.ts', 'src/nanally-chaos-integration.test.ts', 'src/lacrimosa-exact-actions.test.ts', 'src/daffodill-phantom-step.test.ts']:
    text = read(path)
    text = text.replace('resolvedSinceBaseline: 16', 'resolvedSinceBaseline: 22')
    text = text.replace('total: 25', 'total: 19')
    text = text.replace('missingActionRecord: 9', 'missingActionRecord: 3')
    text = text.replace('unsupportedSourceStepCount: 25', 'unsupportedSourceStepCount: 19')
    text = text.replace('bindingCount: 33', 'bindingCount: 39')
    text = text.replace('partiallyBoundSourceStepCount: 21', 'partiallyBoundSourceStepCount: 27')
    text = text.replace('boundActionStepCount: 49', 'boundActionStepCount: 58')
    text = text.replace('promotedActionStepCount: 49', 'promotedActionStepCount: 58')
    text = text.replace("toEqual(['Zero'])", "toEqual(['Jiuyuan', 'Hathor'])")
    text = text.replace("[[1, 'Zero']]", "[[1, 'Jiuyuan'], [2, 'Hathor']]")
    text = text.replace('toHaveLength(25)', 'toHaveLength(19)')
    write(path, text)

replace_once('src/rotation-gap-audit-ui.test.ts', "it('shows the updated missing-action backlog after Daffodill Phantom Step research'", "it('shows the updated missing-action backlog after Zero direct-action research'")
replace_once('src/rotation-gap-audit-ui.test.ts', 'expect(currentRotationMissingActionPriorities).toHaveLength(1);', 'expect(currentRotationMissingActionPriorities).toHaveLength(2);')
replace_once("src/rotation-gap-audit-ui.test.ts", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Zero');", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Jiuyuan');")
replace_once('src/rotation-gap-audit.test.ts', "it('moves missing-action research priority to Zero'", "it('moves missing-action research priority to Jiuyuan and held Hathor Skill'")
replace_once("src/rotation-gap-audit.test.ts", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Zero']]);", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Jiuyuan'], [2, 'Hathor']]);")

zero_test = '''import { describe, expect, it } from 'vitest';
import { createEmptyGameVisibleBuild, initialGameVisibleTeamState } from './game-visible-build';
import { calculateGameVisibleBuild } from './game-visible-calculation';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchL } from './verified-visible-actions-batch-l';
import { verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchL.map((action) => [action.id, action]));

function zeroBuild(actionId: string, damageBonus = 0) {
  const base = createEmptyGameVisibleBuild('Zero');
  return {
    ...base,
    level: 80,
    maxLevel: 80,
    stats: { ...base.stats, atk: 2000, critRate: 0, critDamage: 100, damageBonus, attributeDamageBonus: 0 },
    skills: { basic: 10, skill: 10, ultimate: 10, support: 10 },
    testMode: 'verified-action' as const,
    verifiedActionId: actionId,
  };
}

describe('verified Zero direct actions and Rotation Lab bindings', () => {
  it('adds three exact level-10 records to the 110-action catalog', () => {
    expect(verifiedVisibleActionsBatchL).toHaveLength(3);
    expect(new Set(verifiedVisibleActionsBatchL.map((action) => action.id)).size).toBe(3);
    expect(verifiedVisibleActions).toHaveLength(110);
    expect(byId.get('zero.appraise-and-engrave.main.level-10')?.multiplier).toBeCloseTo(599.8, 8);
    expect(byId.get('zero.appraise-and-engrave.extra-lower-level.base.level-10')?.multiplier).toBe(200);
    expect(byId.get('zero.divide-by-zero.level-10')?.multiplier).toBeCloseTo(999.5, 8);
    expect(byId.get('zero.divide-by-zero.level-10')?.damageBonus).toBe(25);
  });

  it('applies Anomaly Perception as an additive action bonus without changing the raw ratio', () => {
    const state = initialGameVisibleTeamState();
    state.target.level = 70;
    const withPassive = calculateGameVisibleBuild(zeroBuild('zero.divide-by-zero.level-10', 0), state);
    const cancelled = calculateGameVisibleBuild(zeroBuild('zero.divide-by-zero.level-10', -25), state);
    expect(withPassive.supported).toBe(true);
    expect(cancelled.supported).toBe(true);
    expect(withPassive.multiplier).toBeCloseTo(999.5, 8);
    expect(withPassive.result!.nonCrit / cancelled.result!.nonCrit).toBeCloseTo(1.25, 8);
    expect(withPassive.conditions.some((condition) => condition.id.endsWith('.damage-bonus'))).toBe(true);
  });

  it('keeps the lower-level extra shot separate from A1 and A6', () => {
    const action = byId.get('zero.appraise-and-engrave.extra-lower-level.base.level-10')!;
    expect(action.requiresLowerLevelTarget).toBe(true);
    const state = initialGameVisibleTeamState();
    state.target.level = 80;
    expect(calculateGameVisibleBuild(zeroBuild(action.id), state).supported).toBe(false);
    state.target.level = 79;
    expect(calculateGameVisibleBuild(zeroBuild(action.id), state).supported).toBe(true);
    expect(action.defenceIgnore).toBeUndefined();
    expect(action.id).not.toContain('awakening');
  });

  it('binds five Zero steps and one existing Nanally step without conditional-hit substitution', () => {
    const expected = {
      'shinku-charge:zero-fill': ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],
      'shinku-charge:nanally-charge': ['nanally.colucci-ultimate-technique.initial.level-10', 'nanally.colucci-howling-technique.level-10'],
      'hathor-hyper:zero-blossom': ['zero.divide-by-zero.level-10'],
      'hathor-hyper:zero-third-strike': ['zero.appraise-and-engrave.main.level-10'],
      'chaos-remora-bomb:chaos-zero-remora': ['zero.divide-by-zero.level-10'],
      'nanally-hexed-dual:nanally-zero-blossom': ['zero.appraise-and-engrave.main.level-10', 'zero.divide-by-zero.level-10'],
    } as const;
    for (const [key, actionIds] of Object.entries(expected)) {
      expect(rotationScenarioBindings[key]?.coverage).toBe('partial');
      const actual = rotationScenarioBindings[key]?.items.flatMap((item) => item.kind === 'action-sequence' ? item.actionIds : []);
      expect(actual).toEqual(actionIds);
      expect(actual).not.toContain('zero.blooming-gaze.awakening-one');
      expect(actual).not.toContain('zero.appraise-and-engrave-extra.awakening-six');
      expect(actual).not.toContain('zero.appraise-and-engrave.extra-lower-level.base.level-10');
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
  });

  it('preserves sourced action order in all four affected recipes', () => {
    const expectedSubsequences = {
      'shinku-charge': [
        'zero.divide-by-zero.level-10',
        'zero.appraise-and-engrave.main.level-10',
        'nanally.colucci-ultimate-technique.initial.level-10',
        'nanally.colucci-howling-technique.level-10',
      ],
      'hathor-hyper': ['zero.divide-by-zero.level-10', 'zero.appraise-and-engrave.main.level-10'],
      'chaos-remora-bomb': ['zero.divide-by-zero.level-10'],
      'nanally-hexed-dual': ['zero.appraise-and-engrave.main.level-10', 'zero.divide-by-zero.level-10'],
    } as const;
    for (const [presetId, expected] of Object.entries(expectedSubsequences)) {
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');
      const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
      let cursor = -1;
      for (const actionId of expected) {
        const next = actions.indexOf(actionId, cursor + 1);
        expect(next, `${presetId}:${actionId}`).toBeGreaterThan(cursor);
        cursor = next;
      }
    }
  });

  it('derives 39 bindings, 58 promoted actions and the 19-gap audit', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 39,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 27,
      unsupportedSourceStepCount: 19,
      boundActionStepCount: 58,
      promotedRecipeCount: 6,
      promotedActionStepCount: 58,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 22,
      total: 19,
      missingActionRecord: 3,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 110,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual(['Jiuyuan', 'Hathor']);
  });
});
'''
write('src/zero-direct-actions.test.ts', zero_test)

write('docs/ZERO_DIRECT_ACTION_RECONCILIATION.md', '''# Zero direct-action reconciliation\n\nVerified 2026-08-06.\n\n## Level-10 direct records\n\n- Appraise and Engrave main four-hit sequence: `40% + 40% + 251.1% + 268.7% = 599.8% ATK`.\n- Conditional extra shot against the first lower-level target: `200% ATK`. It is not bound into boss rotations. A6 replaces this ratio with the already separate 300% record; the two do not stack.\n- Divide by Zero raw composition: `265.3% + 10.6% × 4 + 354.8% + 337% = 999.5% ATK`.\n- Anomaly Perception is stored as an action-specific additive `+25% DMG` modifier rather than being baked into the raw coefficient.\n\nPrimary values: Icy Veins Zero profile, updated 2026-07-07. Rotation and Cycle-rate cross-check: Prydwen Zero profile, updated 2026-05-31.\n\n## Exclusions\n\n- A1 Blooming Gaze remains a separate 200% lower-level-target hit with 75% DEF Ignore.\n- A3 +50% Ultimate CRIT Rate and A4 Base-ATK-dependent Ultimate increase remain unmodeled by the direct action.\n- A6 uses the existing standalone 300% lower-level-target record and is never added to the 200% base record.\n- No animation seconds are inferred.\n\n## Rotation bindings\n\nExact source order is stored in six partial bindings:\n\n- Shinku Zero setup: Ultimate → Redirect Skill;\n- Shinku Nanally setup: Ultimate → Redirect Skill;\n- Hathor Blossom setup: Ultimate;\n- Hathor third-strike swap: Redirect Skill;\n- Chaos Remora setup: Ultimate;\n- Nanally Blossom setup: Redirect Skill → Ultimate.\n\nThe lower-level conditional shots and Awakening records are not inserted.\n\n## Coverage\n\n- action catalog: 107 → 110;\n- bindings: 33 → 39;\n- partial source steps: 21 → 27;\n- unsupported source steps: 25 → 19;\n- bound/promoted action steps: 49 → 58;\n- current missing-action gaps: 9 → 3.\n\nThe immutable 41-step baseline remains unchanged. Jiuyuan becomes the next direct-action priority, followed by the unresolved full-hold composition of Hathor Aerial Command.\n''')

print('Zero direct-action patch applied successfully')
