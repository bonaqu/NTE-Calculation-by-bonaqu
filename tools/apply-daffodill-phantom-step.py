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


batch_k = '''import type { VerifiedVisibleAction } from './verified-visible-actions';

/**
 * One raw level-10 Phantom Step use. Finale's +10% state increase, Cicada
 * Shell's +80%, successful-parry extra damage and Awakening modifiers remain
 * separate and are not baked into the published action ratio.
 */
export const verifiedVisibleActionsBatchK: readonly VerifiedVisibleAction[] = [
  {
    id: 'daffodill.phantom-step.level-10',
    characterName: 'Daffodill',
    title: { ru: 'Phantom Step · одно применение', en: 'Phantom Step: one use' },
    description: {
      ru: 'Одно применение Phantom Step: 136,1% + 110,5% × 4 + 220,9% = 799% АТК. Бонус +10% состояния Finale, +80% Cicada Shell и дополнительный урон успешного парирования 599,7% хранятся отдельно.',
      en: 'One Phantom Step use: 136.1% + 110.5% × 4 + 220.9% = 799% ATK. Finale state +10%, Cicada Shell +80%, and the 599.7% successful-parry extra damage remain separate.',
    },
    multiplier: 136.1 + 110.5 * 4 + 220.9,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Phantom Step уже открыт сверхспособностью Finale; учитывается ровно одно применение.',
        en: 'Phantom Step has already been unlocked by Finale; exactly one use is counted.',
      },
      {
        ru: 'Успешное парирование не предполагается и не добавляет отдельные 599,7% АТК.',
        en: 'A successful parry is not assumed and does not add the separate 599.7% ATK hit.',
      },
    ],
    sourcePublisher: 'Icy Veins / Prydwen Institute',
    sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/daffodill-profile-skills',
    sourceUpdatedAt: '2026-07-28',
    verifiedAt: '2026-08-06',
  },
];
'''
write('src/verified-visible-actions-batch-k.ts', batch_k)

replace_once(
    'src/verified-visible-actions.ts',
    "import { verifiedVisibleActionsBatchJ } from './verified-visible-actions-batch-j';\n",
    "import { verifiedVisibleActionsBatchJ } from './verified-visible-actions-batch-j';\nimport { verifiedVisibleActionsBatchK } from './verified-visible-actions-batch-k';\n",
)
replace_once(
    'src/verified-visible-actions.ts',
    '  ...verifiedVisibleActionsBatchJ,\n];',
    '  ...verifiedVisibleActionsBatchJ,\n  ...verifiedVisibleActionsBatchK,\n];',
)
replace_once(
    'tsconfig.node.json',
    '    "src/verified-visible-actions-batch-j.ts",\n',
    '    "src/verified-visible-actions-batch-j.ts",\n    "src/verified-visible-actions-batch-k.ts",\n',
)

# Four exact full bindings: two uses in each sourced rotation.
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('lacrimosa-discord-dot', 'lacrimosa-daffodill-open')]: {\n    coverage: 'partial',\n    items: daffodillUltimateRedirectItems,\n  },\n\n  [binding('baicang-firefly-hyper', 'baicang-sakiri-buff')]: {",
    "  [binding('lacrimosa-discord-dot', 'lacrimosa-daffodill-open')]: {\n    coverage: 'partial',\n    items: daffodillUltimateRedirectItems,\n  },\n  [binding('lacrimosa-discord-dot', 'lacrimosa-phantom-one')]: {\n    coverage: 'full',\n    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],\n  },\n  [binding('lacrimosa-discord-dot', 'lacrimosa-phantom-two')]: {\n    coverage: 'full',\n    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],\n  },\n\n  [binding('baicang-firefly-hyper', 'baicang-sakiri-buff')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('baicang-firefly-hyper', 'baicang-basic-three')]: {\n    coverage: 'partial',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['baicang.heart-of-heaven-and-earth.level-10'],\n    }],\n  },\n  [binding('baicang-firefly-hyper', 'baicang-dodge-charged-one')]: {",
    "  [binding('baicang-firefly-hyper', 'baicang-basic-three')]: {\n    coverage: 'partial',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['baicang.heart-of-heaven-and-earth.level-10'],\n    }],\n  },\n  [binding('baicang-firefly-hyper', 'baicang-phantom-one')]: {\n    coverage: 'full',\n    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],\n  },\n  [binding('baicang-firefly-hyper', 'baicang-dodge-charged-one')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('baicang-firefly-hyper', 'baicang-dodge-charged-one')]: {\n    coverage: 'full',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['baicang.silenced-thought.full-composition.level-10'],\n    }],\n  },\n};",
    "  [binding('baicang-firefly-hyper', 'baicang-dodge-charged-one')]: {\n    coverage: 'full',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: ['baicang.silenced-thought.full-composition.level-10'],\n    }],\n  },\n  [binding('baicang-firefly-hyper', 'baicang-phantom-two')]: {\n    coverage: 'full',\n    items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],\n  },\n};",
)

# Repeat evidence: two separate uses of one exact action in each preset.
replace_once(
    'src/verified-rotation-recipes.ts',
    "      ru: 'Первая и вторая атаки перечислены отдельно, но exact bindings для этих двух исходных шагов пока отсутствуют.',\n      en: 'The first and second attacks are listed separately, but exact bindings for those source steps are not available yet.',\n    },\n  },",
    "      ru: 'Первая и вторая атаки представлены двумя отдельными экземплярами одного точного Phantom Step action ID.',\n      en: 'The first and second attacks are represented by two separate instances of one exact Phantom Step action ID.',\n    },\n    promotedActionIds: Array.from({ length: 2 }, () => 'daffodill.phantom-step.level-10'),\n  },",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "      ru: 'Две атаки опубликованы отдельными шагами, но не повышаются до рецепта без exact bindings именно этих шагов.',\n      en: 'Two attacks are published as separate steps but are not promoted without exact bindings for those steps.',\n    },\n  },",
    "      ru: 'Два быстрого переключения представлены двумя отдельными экземплярами одного точного Phantom Step action ID.',\n      en: 'The two quick swaps are represented by two separate instances of one exact Phantom Step action ID.',\n    },\n    promotedActionIds: Array.from({ length: 2 }, () => 'daffodill.phantom-step.level-10'),\n  },",
)

# Current audit: four missing-action gaps are now exact bindings.
current = read('src/rotation-gap-audit-current.ts')
start = current.index('export const currentRotationMissingActionPriorities')
end = current.index('\n\nfunction currentUnsupportedKeys', start)
priorities = '''export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Zero',
    capability: { ru: 'прямые сверхспособность и навык перенаправления', en: 'direct Ultimate and Redirect Skill' },
    sourceSteps: ['zero-fill', 'zero-blossom', 'zero-third-strike', 'nanally-zero-blossom', 'chaos-zero-remora'],
    reason: { ru: 'Зеро участвует в четырёх пресетах, а текущие A1/A6-записи покрывают только условные дополнительные удары.', en: 'Zero appears in four presets while current A1/A6 records cover only conditional extra hits.' },
  },
];'''
write('src/rotation-gap-audit-current.ts', current[:start] + priorities + current[end:])
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 12) errors.push('Expected twelve source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 16) errors.push('Expected sixteen source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 29) errors.push(`Expected 29 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 25) errors.push(`Expected 25 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.missingActionRecord !== 13) errors.push('Expected 13 current missing-action records');", "if (currentRotationGapAuditSummary.missingActionRecord !== 9) errors.push('Expected 9 current missing-action records');")

# Update exact catalog and aggregate expectations.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'expect(verifiedVisibleActions).toHaveLength(106);': 'expect(verifiedVisibleActions).toHaveLength(107);',
      'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(106);': 'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(107);',
      'verifiedActionCount: 106': 'verifiedActionCount: 107',
      'standaloneRecipeCount: 106': 'standaloneRecipeCount: 107',
      'verifiedActionCatalogCount: 106': 'verifiedActionCatalogCount: 107',
      'covers all 106 verified actions': 'covers all 107 verified actions',
      'expect(verifiedActionScenarioRecipes).toHaveLength(106);': 'expect(verifiedActionScenarioRecipes).toHaveLength(107);',
      'expect(new Set(recipeActionIds).size).toBe(106);': 'expect(new Set(recipeActionIds).size).toBe(107);',
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

# Rotation recipe global/per-preset/order assertions.
recipe_test = read('src/verified-rotation-recipes.test.ts')
replacements = {
    'bindingCount: 29': 'bindingCount: 33',
    'fullyBoundSourceStepCount: 8': 'fullyBoundSourceStepCount: 12',
    'unsupportedSourceStepCount: 29': 'unsupportedSourceStepCount: 25',
    'boundActionStepCount: 45': 'boundActionStepCount: 49',
    'promotedActionStepCount: 45': 'promotedActionStepCount: 49',
    "      fullyBoundSourceSteps: 0,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 8,\n      verifiedActionSteps: 5,": "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 6,\n      verifiedActionSteps: 7,",
    "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 5,\n      exactActionSourceSteps: 2,\n      partialActionSourceSteps: 3,\n      verifiedActionSteps: 6,": "      fullyBoundSourceSteps: 4,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 3,\n      exactActionSourceSteps: 4,\n      partialActionSourceSteps: 3,\n      verifiedActionSteps: 8,",
    "      'daffodill.echoes.enhanced-sequence.level-10',\n    ]);\n    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'baicang-firefly-hyper')": "      'daffodill.echoes.enhanced-sequence.level-10',\n      'daffodill.phantom-step.level-10',\n      'daffodill.phantom-step.level-10',\n    ]);\n    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'baicang-firefly-hyper')",
    "      'baicang.heart-of-heaven-and-earth.level-10',\n      'baicang.silenced-thought.full-composition.level-10',\n    ]);": "      'baicang.heart-of-heaven-and-earth.level-10',\n      'daffodill.phantom-step.level-10',\n      'baicang.silenced-thought.full-composition.level-10',\n      'daffodill.phantom-step.level-10',\n    ]);",
}
for old, new in replacements.items():
    if old not in recipe_test:
        raise RuntimeError(f'verified-rotation-recipes.test.ts missing anchor: {old[:100]}')
    recipe_test = recipe_test.replace(old, new, 1)
write('src/verified-rotation-recipes.test.ts', recipe_test)

# Current gap tests and UI.
replace_once('src/rotation-gap-audit.test.ts', 'resolvedSinceBaseline: 12', 'resolvedSinceBaseline: 16')
replace_once('src/rotation-gap-audit.test.ts', 'total: 29', 'total: 25')
replace_once('src/rotation-gap-audit.test.ts', 'missingActionRecord: 13', 'missingActionRecord: 9')
replace_once('src/rotation-gap-audit.test.ts', 'unsupportedKeys).toHaveLength(29)', 'unsupportedKeys).toHaveLength(25)')
replace_once("src/rotation-gap-audit.test.ts", "it('moves missing-action research priority to Daffodill and Zero'", "it('moves missing-action research priority to Zero'")
replace_once("src/rotation-gap-audit.test.ts", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Daffodill'], [2, 'Zero']]);", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Zero']]);")
replace_once('src/rotation-gap-audit-ui.test.ts', 'resolvedSinceBaseline: 12', 'resolvedSinceBaseline: 16')
replace_once('src/rotation-gap-audit-ui.test.ts', 'total: 29', 'total: 25')
replace_once('src/rotation-gap-audit-ui.test.ts', "it('shows the updated missing-action backlog after Lacrimosa variant research'", "it('shows the updated missing-action backlog after Daffodill Phantom Step research'")
replace_once('src/rotation-gap-audit-ui.test.ts', 'expect(currentRotationMissingActionPriorities).toHaveLength(2);', 'expect(currentRotationMissingActionPriorities).toHaveLength(1);')
replace_once("src/rotation-gap-audit-ui.test.ts", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Daffodill');", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Zero');")

phantom_test = '''import { describe, expect, it } from 'vitest';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { initialGameVisibleTeamState } from './game-visible-build';
import { rotationRepeatEvidence, validateVerifiedRotationRecipes, verifiedRotationRecipeById, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchK } from './verified-visible-actions-batch-k';
import { verifiedVisibleActions } from './verified-visible-actions';

const action = verifiedVisibleActionsBatchK[0];

describe('verified Daffodill Phantom Step integration', () => {
  it('adds one exact raw Phantom Step to the 107-action catalog', () => {
    expect(verifiedVisibleActionsBatchK).toHaveLength(1);
    expect(action).toMatchObject({
      id: 'daffodill.phantom-step.level-10',
      characterName: 'Daffodill',
      multiplier: 799,
      requiredSkill: 'basic',
      requiredLevel: 10,
    });
    expect(136.1 + 110.5 * 4 + 220.9).toBeCloseTo(799, 8);
    expect(verifiedVisibleActions).toHaveLength(107);
  });

  it('keeps Finale, Cicada Shell and successful-parry extra damage outside the ratio', () => {
    expect(action?.description.ru).toContain('+80% Cicada Shell');
    expect(action?.description.ru).toContain('599,7%');
    expect(action?.assumedConditions?.some((condition) => condition.ru.includes('не предполагается'))).toBe(true);
    expect(action?.id).not.toContain('parry');
  });

  it('binds four source steps as four separate uses of one action ID', () => {
    const keys = [
      'lacrimosa-discord-dot:lacrimosa-phantom-one',
      'lacrimosa-discord-dot:lacrimosa-phantom-two',
      'baicang-firefly-hyper:baicang-phantom-one',
      'baicang-firefly-hyper:baicang-phantom-two',
    ];
    for (const key of keys) {
      expect(rotationScenarioBindings[key]).toEqual({
        coverage: 'full',
        items: [{ kind: 'action-sequence', actionIds: ['daffodill.phantom-step.level-10'] }],
      });
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
  });

  it('preserves exact order in both promoted recipes', () => {
    const lacrimosa = verifiedRotationRecipeById.get('rotation-lab.lacrimosa-discord-dot.verified-actions')!;
    const baicang = verifiedRotationRecipeById.get('rotation-lab.baicang-firefly-hyper.verified-actions')!;
    expect(lacrimosa.steps.filter((step) => step.actionId === action?.id)).toHaveLength(2);
    expect(baicang.steps.filter((step) => step.actionId === action?.id)).toHaveLength(2);
    expect(lacrimosa.steps.map((step) => step.sourceStepId).filter((id) => id.includes('phantom'))).toEqual(['lacrimosa-phantom-one', 'lacrimosa-phantom-two']);
    expect(baicang.steps.map((step) => step.sourceStepId).filter((id) => id.includes('phantom'))).toEqual(['baicang-phantom-one', 'baicang-phantom-two']);
  });

  it('records fixed-count evidence without aggregating the two uses', () => {
    for (const presetId of ['lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const evidence = rotationRepeatEvidence.find((entry) => entry.presetId === presetId && entry.action.en.includes('Daffodill'));
      expect(evidence).toMatchObject({ kind: 'fixed-count', count: 2 });
      expect(evidence?.promotedActionIds).toEqual([
        'daffodill.phantom-step.level-10',
        'daffodill.phantom-step.level-10',
      ]);
    }
  });

  it('derives the 25-gap audit and leaves Zero as the only action priority', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 33,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 21,
      unsupportedSourceStepCount: 25,
      boundActionStepCount: 49,
      promotedRecipeCount: 6,
      promotedActionStepCount: 49,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 16,
      total: 25,
      missingActionRecord: 9,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 107,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual(['Zero']);
  });

  it('imports two independent Phantom Step actions per preset without parry-extra', () => {
    for (const presetId of ['lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en');
      const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
      expect(actions.filter((id) => id === 'daffodill.phantom-step.level-10')).toHaveLength(2);
      expect(actions).not.toContain('daffodill.finale.one-parry-extra.level-10');
      expect(actions).not.toContain('daffodill.echoes.enhanced-sequence.level-10', actions.filter((id) => id === 'daffodill.phantom-step.level-10'));
    }
  });
});
'''
# Fix invalid two-argument assertion before writing.
phantom_test = phantom_test.replace("      expect(actions).not.toContain('daffodill.echoes.enhanced-sequence.level-10', actions.filter((id) => id === 'daffodill.phantom-step.level-10'));\n", "      expect(actions.filter((id) => id === 'daffodill.echoes.enhanced-sequence.level-10')).toHaveLength(1);\n")
write('src/daffodill-phantom-step.test.ts', phantom_test)

write('docs/DAFFODILL_PHANTOM_STEP_RECONCILIATION.md', '''# Daffodill Phantom Step reconciliation\n\nVerified 2026-08-06.\n\n## Exact action\n\nIcy Veins publishes the level-10 Phantom Step ratio as:\n\n`136.1% + 110.5% × 4 + 220.9% = 799% ATK`.\n\nThe raw action is stored as `daffodill.phantom-step.level-10`. The following remain separate:\n\n- Finale's state-wide +10% damage increase;\n- Cicada Shell's +80% Phantom Step damage;\n- `daffodill.finale.one-parry-extra.level-10` at 599.7% ATK, which requires a successful parry;\n- Awakening and Resonance modifiers.\n\nSources: Icy Veins Daffodill profile, updated 2026-07-28; Prydwen Daffodill profile, updated 2026-05-26.\n\n## Rotation mapping\n\nFinale unlocks Phantom Step for up to two uses and resets its charges. Prydwen describes Phantom Step as activating when switching to Daffodill. Both `lacrimosa-discord-dot` and `baicang-firefly-hyper` explicitly contain first and second enhanced Daffodill attacks after Finale and require quick swaps during their animations.\n\nEach source step therefore maps to one standalone instance of the same action ID. The two uses are not aggregated into one 1598% action.\n\n## Coverage result\n\n- action catalog: 106 → 107;\n- exact bindings: 29 → 33;\n- full source-step bindings: 8 → 12;\n- current unsupported steps: 29 → 25;\n- bound/promoted action steps: 45 → 49;\n- current missing-action gaps: 13 → 9.\n\nThe immutable 41-step baseline remains unchanged. Zero becomes the only remaining missing-action research priority.\n''')

print('Daffodill Phantom Step patch applied successfully')
