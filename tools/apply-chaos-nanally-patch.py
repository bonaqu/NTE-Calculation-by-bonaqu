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
        raise RuntimeError(f'{path}: expected one anchor, found {count}: {old[:100]!r}')
    write(path, content.replace(old, new, 1))


batch_i = '''import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/chaos-profile-skills';
const sourcePublisher = 'Icy Veins';
const sourceUpdatedAt = '2026-07-28';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Chaos direct actions. Dread Echo resource generation,
 * Warrant amplification, Awakening modifiers and Remora detonations remain
 * separate mechanics and are not baked into these ratios.
 */
export const verifiedVisibleActionsBatchI: readonly VerifiedVisibleAction[] = [
  {
    id: 'chaos.doubtmark.full-sequence.level-10',
    characterName: 'Chaos',
    title: { ru: 'Doubtmark · полная прямая последовательность', en: 'Doubtmark: full direct sequence' },
    description: {
      ru: 'Прямой урон навыка перенаправления: 164,9% + 434,8% = 599,7% АТК. Метка Warrant и её усиление урона моделируются отдельно.',
      en: 'Redirect Skill direct damage: 164.9% + 434.8% = 599.7% ATK. Warrant and its damage amplification are modeled separately.',
    },
    multiplier: 164.9 + 434.8,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Оба опубликованных попадания навыка попали по проверяемой цели.',
      en: 'Both published Skill hits connect with the tested target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'chaos.retribution.initial.level-10',
    characterName: 'Chaos',
    title: { ru: 'Retribution · входной урон', en: 'Retribution: initial damage' },
    description: {
      ru: 'Прямой входной урон сверхспособности: 254,5% × 4 + 581,5% = 1599,5% АТК. Состояние Dread Echo только ускоряет набор Crime и не добавляется к коэффициенту.',
      en: 'Ultimate entry damage: 254.5% × 4 + 581.5% = 1599.5% ATK. Dread Echo accelerates Crime generation and is not added to the ratio.',
    },
    multiplier: 254.5 * 4 + 581.5,
    requiredSkill: 'ultimate',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Все пять опубликованных попаданий входной части сверхспособности попали по одной цели.',
      en: 'All five published hits of the Ultimate entry connect with one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'chaos.final-verdict.enhanced.level-10',
    characterName: 'Chaos',
    title: { ru: 'Final Verdict · усиленная тяжёлая атака', en: 'Final Verdict: enhanced Heavy Attack' },
    description: {
      ru: 'Одна полностью усиленная тяжёлая атака при 1000 Crime: 114,9% × 2 + 799,6% × 2 = 1829% АТК. В ротации действие применяется дважды как два экземпляра одного action ID.',
      en: 'One fully enhanced Heavy Attack at 1000 Crime: 114.9% × 2 + 799.6% × 2 = 1829% ATK. The rotation uses two instances of this same action ID.',
    },
    multiplier: 114.9 * 2 + 799.6 * 2,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [
      {
        ru: 'Перед атакой накоплено 1000 Crime, поэтому обе ветви используют максимальный опубликованный коэффициент.',
        en: 'Chaos has 1000 Crime before the attack, so both branches use the published maximum ratio.',
      },
      {
        ru: 'Взрыв Remora Enhancement, Warrant, A2, A3 и A6 не добавляются автоматически.',
        en: 'Remora Enhancement detonation, Warrant, A2, A3 and A6 are not added automatically.',
      },
    ],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
'''
write('src/verified-visible-actions-batch-i.ts', batch_i)

replace_once(
    'src/verified-visible-actions.ts',
    "import { verifiedVisibleActionsBatchH } from './verified-visible-actions-batch-h';\n",
    "import { verifiedVisibleActionsBatchH } from './verified-visible-actions-batch-h';\nimport { verifiedVisibleActionsBatchI } from './verified-visible-actions-batch-i';\n",
)
replace_once(
    'src/verified-visible-actions.ts',
    '  ...verifiedVisibleActionsBatchH,\n];',
    '  ...verifiedVisibleActionsBatchH,\n  ...verifiedVisibleActionsBatchI,\n];',
)
replace_once(
    'tsconfig.node.json',
    '    "src/verified-visible-actions-batch-g.ts",\n',
    '    "src/verified-visible-actions-batch-g.ts",\n    "src/verified-visible-actions-batch-h.ts",\n    "src/verified-visible-actions-batch-i.ts",\n',
)

# Nanally Authority: source-only +30% CRIT DMG.
replace_once(
    'src/team-effects.ts',
    "  | 'shinku.surging-crimson.damage';",
    "  | 'shinku.surging-crimson.damage'\n  | 'nanally.ichi-daime-authority.crit-dmg';",
)
replace_once(
    'src/team-effects.ts',
    "  sourceCharacter: 'Haniel' | 'Sakiri' | 'Hathor' | 'Shinku';",
    "  sourceCharacter: 'Haniel' | 'Sakiri' | 'Hathor' | 'Shinku' | 'Nanally';",
)
replace_once('src/team-effects.ts', '  critRate?: number;\n  damageBonus?: number;', '  critRate?: number;\n  critDamage?: number;\n  damageBonus?: number;')
replace_once('src/team-effects.ts', '  critRate: number;\n  damageBonus: number;', '  critRate: number;\n  critDamage?: number;\n  damageBonus: number;')
replace_once(
    'src/team-effects.ts',
    "  kind: 'flat-atk' | 'enemy-defence-reduction' | 'crit-rate' | 'damage-bonus';",
    "  kind: 'flat-atk' | 'enemy-defence-reduction' | 'crit-rate' | 'crit-damage' | 'damage-bonus';",
)
replace_once(
    'src/team-effects.ts',
    "  },\n];\n\nexport const verifiedTeamEffectById",
    "  },\n  {\n    id: 'nanally.ichi-daime-authority.crit-dmg',\n    sourceCharacter: 'Nanally',\n    title: { ru: 'Ichi-daime’s Authority · крит. урон', en: 'Ichi-daime’s Authority · CRIT DMG' },\n    description: {\n      ru: 'После применения Colucci Howling Technique Наналли входит в Ichi-daime’s Authority на 12 секунд или до переключения и получает +30% к критическому урону. Ответы Underboss, Fair Duel и A3 считаются отдельно.',\n      en: 'After Colucci Howling Technique, Nanally enters Ichi-daime’s Authority for 12 seconds or until swapping out and gains +30% CRIT DMG. Underboss responses, Fair Duel and A3 remain separate.',\n    },\n    trigger: { ru: 'Применена Colucci Howling Technique', en: 'Colucci Howling Technique was cast' },\n    durationSeconds: 12,\n    recipientPolicy: 'source-only',\n    critDamage: 30,\n    sourcePublisher: 'Icy Veins / Prydwen Institute',\n    sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/nanally-profile-skills',\n    supportingSourceUrl: prydwen('nanally'),\n    sourceUpdatedAt: '2026-07-31',\n    verifiedAt: '2026-08-06',\n  },\n];\n\nexport const verifiedTeamEffectById",
)
replace_once(
    'src/team-effects.ts',
    "  if (characterName === 'Shinku') return 'Шинку';\n  return 'Хатор';",
    "  if (characterName === 'Shinku') return 'Шинку';\n  if (characterName === 'Nanally') return 'Наналли';\n  return 'Хатор';",
)
replace_once(
    'src/team-effects.ts',
    '  if (effect.critRate !== undefined) return effect.critRate;\n  return effect.damageBonus ?? 0;',
    '  if (effect.critRate !== undefined) return effect.critRate;\n  if (effect.critDamage !== undefined) return effect.critDamage;\n  return effect.damageBonus ?? 0;',
)
replace_once(
    'src/team-effects.ts',
    '    critRate: 0,\n    damageBonus: 0,',
    '    critRate: 0,\n    critDamage: 0,\n    damageBonus: 0,',
)
replace_once(
    'src/team-effects.ts',
    "        if (effect.damageBonus !== undefined) {",
    "        if (effect.critDamage !== undefined) {\n          target.critDamage = (target.critDamage ?? 0) + effect.critDamage;\n          target.provenance.push({\n            effectId: effect.id,\n            sourceSlot,\n            sourceCharacter: sourceBuild.characterName,\n            amount: effect.critDamage,\n            kind: 'crit-damage',\n            label: {\n              ru: `${effect.title.ru}: +${effect.critDamage}% к крит. урону Наналли на ${effect.durationSeconds} секунд`,\n              en: `${effect.title.en}: +${effect.critDamage}% Nanally CRIT DMG for ${effect.durationSeconds} seconds`,\n            },\n          });\n        }\n        if (effect.damageBonus !== undefined) {",
)
replace_once(
    'src/game-visible-calculation.ts',
    '  critRate: 0,\n  damageBonus: 0,',
    '  critRate: 0,\n  critDamage: 0,\n  damageBonus: 0,',
)
replace_once(
    'src/game-visible-calculation.ts',
    '    critDamage: build.stats.critDamage,',
    '    critDamage: build.stats.critDamage + (modifier.critDamage ?? 0),',
)

# Exact Rotation Lab bindings for the previously omitted Nanally integration and Chaos.
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('chaos-remora-bomb', 'chaos-stain')]: {\n    coverage: 'partial',\n    items: [{ kind: 'activate-cycle', cycleId: 'stain' }],\n  },\n  [binding('chaos-remora-bomb', 'chaos-return-hathor')]: {",
    "  [binding('chaos-remora-bomb', 'chaos-stain')]: {\n    coverage: 'partial',\n    items: [\n      { kind: 'action-sequence', actionIds: ['chaos.doubtmark.full-sequence.level-10'] },\n      { kind: 'activate-cycle', cycleId: 'stain' },\n    ],\n  },\n  [binding('chaos-remora-bomb', 'chaos-ultimate')]: {\n    coverage: 'partial',\n    items: [{ kind: 'action-sequence', actionIds: ['chaos.retribution.initial.level-10'] }],\n  },\n  [binding('chaos-remora-bomb', 'chaos-heavy-one')]: {\n    coverage: 'full',\n    items: [{ kind: 'action-sequence', actionIds: ['chaos.final-verdict.enhanced.level-10'] }],\n  },\n  [binding('chaos-remora-bomb', 'chaos-heavy-two')]: {\n    coverage: 'full',\n    items: [{ kind: 'action-sequence', actionIds: ['chaos.final-verdict.enhanced.level-10'] }],\n  },\n  [binding('chaos-remora-bomb', 'chaos-return-hathor')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('nanally-hexed-dual', 'nanally-sakiri-setup')]: {\n    coverage: 'partial',\n    items: sakiriSetupItems,\n  },\n\n  [binding('lacrimosa-discord-dot', 'lacrimosa-haniel-open')]: {",
    "  [binding('nanally-hexed-dual', 'nanally-sakiri-setup')]: {\n    coverage: 'partial',\n    items: sakiriSetupItems,\n  },\n  [binding('nanally-hexed-dual', 'nanally-redirect')]: {\n    coverage: 'partial',\n    items: [\n      { kind: 'action-sequence', actionIds: ['nanally.colucci-howling-technique.level-10'] },\n      { kind: 'activate-effect', effectId: 'nanally.ichi-daime-authority.crit-dmg' },\n    ],\n  },\n  [binding('nanally-hexed-dual', 'nanally-ultimate')]: {\n    coverage: 'partial',\n    items: [{ kind: 'action-sequence', actionIds: ['nanally.colucci-ultimate-technique.initial.level-10'] }],\n  },\n  [binding('nanally-hexed-dual', 'nanally-basic-string')]: {\n    coverage: 'full',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: [\n        'nanally.colucci-secret-skill.full-sequence.level-10',\n        'nanally.underboss.basic-coordinated-full-sequence.level-10',\n      ],\n    }],\n  },\n  [binding('nanally-hexed-dual', 'nanally-charged-string')]: {\n    coverage: 'full',\n    items: [{\n      kind: 'action-sequence',\n      actionIds: [\n        'nanally.heavy-hitter.full-sequence.level-10',\n        'nanally.underboss.heavy-coordinated-full-sequence.level-10',\n      ],\n    }],\n  },\n\n  [binding('lacrimosa-discord-dot', 'lacrimosa-haniel-open')]: {",
)

# Repeat evidence now points to the exact promoted records.
replace_once(
    'src/verified-rotation-recipes.ts',
    "      ru: 'Первая и вторая атаки опубликованы отдельными шагами, но текущие exact bindings не связывают их с action ID.',\n      en: 'The first and second attacks are published as separate steps, but current exact bindings do not map them to action IDs.',\n    },\n  },",
    "      ru: 'Источник публикует два отдельных применения одной полностью усиленной Final Verdict. Рецепт хранит два экземпляра одного точного action ID.',\n      en: 'The source publishes two separate uses of the same fully enhanced Final Verdict. The recipe stores two instances of one exact action ID.',\n    },\n    promotedActionIds: Array.from({ length: 2 }, () => 'chaos.final-verdict.enhanced.level-10'),\n  },",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "      ru: 'Источник публикует полную пятиударную цепочку; она не заменяется одним пассивным срабатыванием Наналли.',\n      en: 'The source publishes a full five-hit string; it is not replaced by one Nanally passive trigger.',\n    },\n  },",
    "      ru: 'Пять ступеней собраны в одну точную запись собственного урона Наналли и отдельную запись согласованных ответов Underboss.',\n      en: 'The five stages are represented by one exact Nanally-own record and a separate coordinated Underboss response record.',\n    },\n    promotedActionIds: [\n      'nanally.colucci-secret-skill.full-sequence.level-10',\n      'nanally.underboss.basic-coordinated-full-sequence.level-10',\n    ],\n  },",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "      ru: 'Три заряженные атаки прямо указаны источником, но пока не имеют отдельных точных action ID.',\n      en: 'Three Charged Attacks are directly stated by the source but do not yet have separate exact action IDs.',\n    },\n  },",
    "      ru: 'Три ступени тяжёлой цепочки собраны в одну точную запись Наналли и отдельную запись ответов Underboss.',\n      en: 'The three Heavy stages are represented by one exact Nanally record and a separate Underboss response record.',\n    },\n    promotedActionIds: [\n      'nanally.heavy-hitter.full-sequence.level-10',\n      'nanally.underboss.heavy-coordinated-full-sequence.level-10',\n    ],\n  },",
)

# Current gap layer: baseline remains 41; 12 steps are now resolved.
current = read('src/rotation-gap-audit-current.ts')
start = current.index('export const currentRotationMissingActionPriorities')
end = current.index('\n\nfunction currentUnsupportedKeys', start)
new_priorities = '''export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Lacrimosa',
    capability: { ru: 'преобразование, базовая цепочка и переход к пятой атаке', en: 'transformation, Basic string and fifth-attack advance' },
    sourceSteps: ['lacrimosa-transform', 'lacrimosa-basic-five', 'lacrimosa-redirect-five'],
    reason: { ru: 'Добавит действия самой Лакримозы в её частичный рецепт.', en: 'Adds Lacrimosa own actions to her partial recipe.' },
  },
  {
    rank: 2,
    characterName: 'Daffodill',
    capability: { ru: 'первая и вторая усиленные базовые атаки', en: 'first and second enhanced Basic Attacks' },
    sourceSteps: ['lacrimosa-phantom-one', 'lacrimosa-phantom-two', 'baicang-phantom-one', 'baicang-phantom-two'],
    reason: { ru: 'Одна пара точных записей закроет четыре повторно используемых шага двух пресетов.', en: 'One exact pair closes four reused source steps across two presets.' },
  },
  {
    rank: 3,
    characterName: 'Zero',
    capability: { ru: 'прямые сверхспособность и навык перенаправления', en: 'direct Ultimate and Redirect Skill' },
    sourceSteps: ['zero-fill', 'zero-blossom', 'zero-third-strike', 'nanally-zero-blossom', 'chaos-zero-remora'],
    reason: { ru: 'Зеро участвует в четырёх пресетах, а текущие A1/A6-записи покрывают только условные дополнительные удары.', en: 'Zero appears in four presets while current A1/A6 records cover only conditional extra hits.' },
  },
];'''
write('src/rotation-gap-audit-current.ts', current[:start] + new_priorities + current[end:])
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 5) errors.push('Expected five Shinku source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 12) errors.push('Expected twelve source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 36) errors.push(`Expected 36 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 29) errors.push(`Expected 29 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.missingActionRecord !== 23) errors.push('Expected 23 current missing-action records');", "if (currentRotationGapAuditSummary.missingActionRecord !== 16) errors.push('Expected 16 current missing-action records');")

# Dynamic global catalog expectations previously locked to 91.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    updated = text.replace('toHaveLength(91)', 'toHaveLength(100)').replace('toBe(91)', 'toBe(100)')
    if updated != text:
        path.write_text(updated, encoding='utf-8')

integration_test = '''import { describe, expect, it } from 'vitest';
import { createEmptyGameVisibleBuild, initialGameVisibleTeamState } from './game-visible-build';
import { calculateGameVisibleTeam } from './game-visible-calculation';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { deriveVerifiedTeamEffects, verifiedTeamEffects } from './team-effects';
import { verifiedRotationRecipeById, verifiedRotationRecipeCoverage, validateVerifiedRotationRecipes } from './verified-rotation-recipes';
import { verifiedVisibleActionsBatchH } from './verified-visible-actions-batch-h';
import { verifiedVisibleActionsBatchI } from './verified-visible-actions-batch-i';
import { verifiedVisibleActions } from './verified-visible-actions';

const byChaosId = new Map(verifiedVisibleActionsBatchI.map((action) => [action.id, action]));

describe('Nanally completion and Chaos exact action integration', () => {
  it('publishes 100 unique actions and exact Chaos arithmetic', () => {
    expect(verifiedVisibleActions).toHaveLength(100);
    expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(100);
    expect(verifiedVisibleActionsBatchH).toHaveLength(6);
    expect(verifiedVisibleActionsBatchI).toHaveLength(3);
    expect(byChaosId.get('chaos.doubtmark.full-sequence.level-10')?.multiplier).toBeCloseTo(599.7, 8);
    expect(byChaosId.get('chaos.retribution.initial.level-10')?.multiplier).toBeCloseTo(1599.5, 8);
    expect(byChaosId.get('chaos.final-verdict.enhanced.level-10')?.multiplier).toBeCloseTo(1829, 8);
    expect(verifiedVisibleActionsBatchI.some((action) => action.id.includes('remora-enhancement'))).toBe(false);
  });

  it('applies Authority CRIT DMG only to Nanally without changing non-critical damage', () => {
    const state = initialGameVisibleTeamState();
    state.builds = ['Nanally', 'Jiuyuan', 'Zero', 'Sakiri'].map((name) => ({
      ...createEmptyGameVisibleBuild(name),
      level: 80,
      maxLevel: 80,
      stats: { ...createEmptyGameVisibleBuild(name).stats, atk: 1000, critRate: 50, critDamage: 100 },
    }));
    const baseline = calculateGameVisibleTeam(state);
    state.builds[0] = { ...state.builds[0]!, activeTeamEffectIds: ['nanally.ichi-daime-authority.crit-dmg'] };
    const enabled = calculateGameVisibleTeam(state);
    const derived = deriveVerifiedTeamEffects(state);
    expect(verifiedTeamEffects).toHaveLength(6);
    expect(derived.slotModifiers.map((modifier) => modifier.critDamage ?? 0)).toEqual([30, 0, 0, 0]);
    expect(enabled.rows[0]?.result?.normal).toBe(baseline.rows[0]?.result?.normal);
    expect(enabled.rows[0]?.result?.crit).toBeGreaterThan(baseline.rows[0]?.result?.crit ?? 0);
    expect(enabled.rows.slice(1).map((row) => row.result?.expected)).toEqual(baseline.rows.slice(1).map((row) => row.result?.expected));
  });

  it('binds Nanally direct strings without passive substitution', () => {
    expect(rotationScenarioBindings['nanally-hexed-dual:nanally-basic-string']).toMatchObject({ coverage: 'full' });
    expect(rotationScenarioBindings['nanally-hexed-dual:nanally-charged-string']).toMatchObject({ coverage: 'full' });
    const preset = rotationPresetById.get('nanally-hexed-dual')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
    const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
    expect(actions).toContain('nanally.colucci-secret-skill.full-sequence.level-10');
    expect(actions).toContain('nanally.underboss.basic-coordinated-full-sequence.level-10');
    expect(actions).toContain('nanally.heavy-hitter.full-sequence.level-10');
    expect(actions).toContain('nanally.underboss.heavy-coordinated-full-sequence.level-10');
    expect(actions).not.toContain('nanally.fair-duel.level-11');
    expect(actions).not.toContain('nanally.awakening-three-follow-up.level-11');
  });

  it('uses one exact Final Verdict record twice after Retribution', () => {
    const preset = rotationPresetById.get('chaos-remora-bomb')!;
    const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'en');
    const actions = imported.scenario.steps.map((step) => step.actionId).filter(Boolean);
    expect(actions.filter((id) => id === 'chaos.final-verdict.enhanced.level-10')).toHaveLength(2);
    expect(actions.indexOf('chaos.retribution.initial.level-10')).toBeLessThan(actions.indexOf('chaos.final-verdict.enhanced.level-10'));
    expect(actions).not.toContain('chaos.remora-enhancement.base-five-seconds');
    expect(actions).not.toContain('chaos.remora-enhancement.maximum-twelve-seconds');
  });

  it('promotes both recipes and derives the 29-gap current audit', () => {
    expect(validateRotationScenarioBindings()).toEqual([]);
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 29,
      fullyBoundSourceStepCount: 8,
      partiallyBoundSourceStepCount: 21,
      unsupportedSourceStepCount: 29,
      boundActionStepCount: 45,
      promotedRecipeCount: 6,
      promotedActionStepCount: 44,
    });
    expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(7);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(7);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 12,
      total: 29,
      missingActionRecord: 16,
      effectOrCycleCondition: 3,
      nonDamageOperation: 8,
      ambiguousSourceStep: 2,
      verifiedActionCatalogCount: 100,
    });
    for (const key of [
      'nanally-hexed-dual:nanally-redirect',
      'nanally-hexed-dual:nanally-ultimate',
      'nanally-hexed-dual:nanally-basic-string',
      'nanally-hexed-dual:nanally-charged-string',
      'chaos-remora-bomb:chaos-ultimate',
      'chaos-remora-bomb:chaos-heavy-one',
      'chaos-remora-bomb:chaos-heavy-two',
    ]) expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([
      [1, 'Lacrimosa'],
      [2, 'Daffodill'],
      [3, 'Zero'],
    ]);
  });
});
'''
write('src/nanally-chaos-integration.test.ts', integration_test)

# Replace stale current-audit regression file with the corrected factual contract.
gap_test = '''import { describe, expect, it } from 'vitest';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { rotationGapAudit, rotationGapAuditSummary } from './rotation-gap-audit';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresets } from './rotation-presets';
import { verifiedRotationRecipeById } from './verified-rotation-recipes';

describe('Rotation Lab gap audit', () => {
  it('preserves the immutable 41-step baseline', () => {
    expect(rotationGapAuditSummary).toMatchObject({ total: 41, effectOrCycleCondition: 3, missingActionRecord: 26, nonDamageOperation: 8, ambiguousSourceStep: 4 });
    expect(new Set(rotationGapAudit.map((item) => `${item.presetId}:${item.sourceStepId}`)).size).toBe(41);
  });

  it('derives all 29 current gaps from exact bindings', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 12,
      total: 29,
      effectOrCycleCondition: 3,
      missingActionRecord: 16,
      nonDamageOperation: 8,
      ambiguousSourceStep: 2,
      verifiedActionCatalogCount: 100,
    });
    const unsupportedKeys = rotationPresets.flatMap((preset) => preset.steps.filter((step) => !rotationScenarioBindings[`${preset.id}:${step.id}`]).map((step) => `${preset.id}:${step.id}`));
    expect(unsupportedKeys).toHaveLength(29);
    expect([...currentRotationGapAuditByKey.keys()].sort()).toEqual(unsupportedKeys.sort());
  });

  it('promotes Nanally and expands Chaos without semantic substitutions', () => {
    expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.steps).toHaveLength(7);
    expect(verifiedRotationRecipeById.get('rotation-lab.nanally-hexed-dual.verified-actions')?.gaps).toHaveLength(10);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.steps).toHaveLength(7);
    expect(verifiedRotationRecipeById.get('rotation-lab.chaos-remora-bomb.verified-actions')?.gaps).toHaveLength(9);
    expect(currentRotationGapAuditByKey.has('nanally-hexed-dual:nanally-energy-recovery')).toBe(true);
    expect(currentRotationGapAuditByKey.has('chaos-remora-bomb:chaos-restart')).toBe(true);
  });

  it('moves research priority to Lacrimosa, Daffodill and Zero', () => {
    expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Lacrimosa'], [2, 'Daffodill'], [3, 'Zero']]);
  });
});
'''
write('src/rotation-gap-audit.test.ts', gap_test)

# Update the central recipe assertions to the new deterministic aggregates/order.
recipe_test = read('src/verified-rotation-recipes.test.ts')
replacements = {
    'bindingCount: 22': 'bindingCount: 29',
    'fullyBoundSourceStepCount: 4': 'fullyBoundSourceStepCount: 8',
    'partiallyBoundSourceStepCount: 18': 'partiallyBoundSourceStepCount: 21',
    'unsupportedSourceStepCount: 36': 'unsupportedSourceStepCount: 29',
    'boundActionStepCount: 35': 'boundActionStepCount: 45',
    'promotedRecipeCount: 5': 'promotedRecipeCount: 6',
    'promotedActionStepCount: 34': 'promotedActionStepCount: 44',
    'partialActionOrderRecipeCount: 5': 'partialActionOrderRecipeCount: 6',
    'orderOnlyRecipeCount: 5': 'orderOnlyRecipeCount: 6',
    "      fullyBoundSourceSteps: 0,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 6,\n      verifiedActionSteps: 3,": "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 4,\n      unsupportedSourceSteps: 3,\n      verifiedActionSteps: 7,",
    "      fullyBoundSourceSteps: 0,\n      partiallyBoundSourceSteps: 1,\n      unsupportedSourceSteps: 8,\n      verifiedActionSteps: 1,\n      omittedEffectConditions: 2,\n      promotedRecipeId: null,": "      fullyBoundSourceSteps: 2,\n      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 4,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 3,\n      promotedRecipeId: 'rotation-lab.nanally-hexed-dual.verified-actions',",
    "      'chaos-remora-bomb',\n      'lacrimosa-discord-dot',": "      'chaos-remora-bomb',\n      'nanally-hexed-dual',\n      'lacrimosa-discord-dot',",
    "      'haniel.a-melody-named-haniel.initial.level-10',\n      'hathor.rider-express.level-10',\n    ]);": "      'haniel.a-melody-named-haniel.initial.level-10',\n      'chaos.doubtmark.full-sequence.level-10',\n      'chaos.retribution.initial.level-10',\n      'chaos.final-verdict.enhanced.level-10',\n      'chaos.final-verdict.enhanced.level-10',\n      'hathor.rider-express.level-10',\n    ]);\n    expect(verifiedRotationRecipes.find((recipe) => recipe.presetId === 'nanally-hexed-dual')?.steps.map((step) => step.actionId)).toEqual([\n      'sakiri.feast-of-gluttony.level-10',\n      'nanally.colucci-howling-technique.level-10',\n      'nanally.colucci-ultimate-technique.initial.level-10',\n      'nanally.colucci-secret-skill.full-sequence.level-10',\n      'nanally.underboss.basic-coordinated-full-sequence.level-10',\n      'nanally.heavy-hitter.full-sequence.level-10',\n      'nanally.underboss.heavy-coordinated-full-sequence.level-10',\n    ]);",
}
for old, new in replacements.items():
    if old not in recipe_test:
        raise RuntimeError(f'verified-rotation-recipes.test.ts missing anchor: {old[:80]}')
    recipe_test = recipe_test.replace(old, new, 1)
write('src/verified-rotation-recipes.test.ts', recipe_test)

# Team-effect catalog expectation and a direct Authority regression.
replace_once(
    'src/team-effects.test.ts',
    "it('publishes five uniquely sourced temporary effects', () => {\n    expect(verifiedTeamEffects).toHaveLength(5);\n    expect(new Set(verifiedTeamEffects.map((effect) => effect.id)).size).toBe(5);\n    expect(verifiedTeamEffects.map((effect) => effect.sourceCharacter)).toEqual(['Haniel', 'Sakiri', 'Sakiri', 'Hathor', 'Shinku']);",
    "it('publishes six uniquely sourced temporary effects', () => {\n    expect(verifiedTeamEffects).toHaveLength(6);\n    expect(new Set(verifiedTeamEffects.map((effect) => effect.id)).size).toBe(6);\n    expect(verifiedTeamEffects.map((effect) => effect.sourceCharacter)).toEqual(['Haniel', 'Sakiri', 'Sakiri', 'Hathor', 'Shinku', 'Nanally']);",
)

# Evidence docs.
write('docs/CHAOS_NANALLY_ACTION_RECONCILIATION.md', '''# Chaos and Nanally exact-action reconciliation\n\nVerified 2026-08-06.\n\n## Chaos\n\n- Doubtmark level 10: `164.9 + 434.8 = 599.7% ATK`.\n- Retribution level 10: `254.5 × 4 + 581.5 = 1599.5% ATK`.\n- Enhanced Final Verdict at 1000 Crime: `114.9 × 2 + 799.6 × 2 = 1829% ATK`.\n- The sourced rotation uses two separate instances of the same enhanced Final Verdict record.\n- Dread Echo is a Crime-generation state, not an extra damage ratio.\n- Warrant, Remora Enhancement, A2, A3 and A6 remain separate.\n\nPrimary ratio source: Icy Veins Chaos profile, updated 2026-07-28. Rotation cross-check: Prydwen Chaos profile, updated 2026-07-08.\n\n## Nanally corrective integration\n\nPR #127 added six exact Batch H records but did not include its described effect, bindings, tests or audit updates. This change completes that missing integration.\n\n- Ichi-daime’s Authority is a source-only 12-second `+30% CRIT DMG` modifier.\n- It ends on swap according to the source description; the current scenario remains order-only until seconds are explicitly confirmed by the user.\n- Nanally own Basic/Heavy strings and Underboss responses stay separate.\n- Fair Duel and Awakening 3 are never substituted for direct strings.\n\n## Audit result\n\nThe immutable 41-step baseline remains unchanged. Exact bindings resolve five Shinku, four Nanally and three Chaos source steps, leaving 29 current gaps.\n''')

print('Chaos/Nanally patch applied successfully')
