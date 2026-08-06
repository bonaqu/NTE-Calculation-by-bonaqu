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


batch_j = '''import type { VerifiedVisibleAction } from './verified-visible-actions';

const sourceUrl = 'https://www.icy-veins.com/neverness-to-everness/lacrimosa-profile-skills';
const sourcePublisher = 'Icy Veins';
const sourceUpdatedAt = '2026-07-07';
const verifiedAt = '2026-08-06';

/**
 * Exact level-10 Lacrimosa actions for both Basic Attack forms. These records
 * intentionally do not decide which form or Redirect Skill branch the Rotation
 * Lab preset uses. Discord, Nightmare repeats and copied Devilish Gift damage
 * remain separate mechanics.
 */
export const verifiedVisibleActionsBatchJ: readonly VerifiedVisibleAction[] = [
  {
    id: 'lacrimosa.tomato-metal.full-direct-sequence.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Metal · полная прямая цепочка', en: 'Tomato Metal: full direct sequence' },
    description: {
      ru: 'Пять прямых ступеней ближней формы: (128,3% + 46,4%) + 39,8% × 2 + (49,2% + 29,4% × 3) + (141,7% + 54,6%) + (46,6% × 3 + 246,5%) = 974,3% АТК. Взрыв снаряда второй атаки хранится отдельно.',
      en: 'Five direct melee-form stages: (128.3% + 46.4%) + 39.8% × 2 + (49.2% + 29.4% × 3) + (141.7% + 54.6%) + (46.6% × 3 + 246.5%) = 974.3% ATK. The second-attack projectile explosion is stored separately.',
    },
    multiplier: (128.3 + 46.4) + 39.8 * 2 + (49.2 + 29.4 * 3) + (141.7 + 54.6) + (46.6 * 3 + 246.5),
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Лакримоза остаётся в ближней форме и выполняет ступени 1–5 по одной цели.',
      en: 'Lacrimosa remains in melee form and completes stages 1–5 against one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-metal.projectile-explosion.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Metal · взрыв снаряда', en: 'Tomato Metal: projectile explosion' },
    description: {
      ru: 'Один отдельный взрыв снаряда, созданного второй атакой ближней формы: 38,8% АТК. Запись не умножается на длительность и не прикрепляется к каждой базовой атаке.',
      en: 'One separate explosion of the projectile created by melee Basic Attack stage two: 38.8% ATK. The record is not duration-multiplied or attached to every Basic Attack.',
    },
    multiplier: 38.8,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Созданный второй атакой снаряд разрушен последующей подходящей атакой.',
      en: 'The projectile created by stage two is shattered by a subsequent eligible attack.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-percussion.full-sequence.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Percussion · полная цепочка', en: 'Tomato Percussion: full sequence' },
    description: {
      ru: 'Пять ступеней дальней формы: 74,2% + 32% × 3 + 227,7% + (31,6% × 3 + 387,2%) + 247,7% = 1127,6% АТК.',
      en: 'Five ranged-form stages: 74.2% + 32% × 3 + 227.7% + (31.6% × 3 + 387.2%) + 247.7% = 1127.6% ATK.',
    },
    multiplier: 74.2 + 32 * 3 + 227.7 + (31.6 * 3 + 387.2) + 247.7,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Лакримоза остаётся в дальней форме и выполняет ступени 1–5 по одной цели.',
      en: 'Lacrimosa remains in ranged form and completes stages 1–5 against one target.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-metal.fifth.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Metal · пятая атака', en: 'Tomato Metal: fifth attack' },
    description: {
      ru: 'Только пятая атака ближней формы: 46,6% × 3 + 246,5% = 386,3% АТК. Она не включает Morning Tomato или предыдущие четыре ступени.',
      en: 'Melee-form fifth attack only: 46.6% × 3 + 246.5% = 386.3% ATK. It excludes Morning Tomato and the preceding four stages.',
    },
    multiplier: 46.6 * 3 + 246.5,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Выполняется именно пятая ступень ближней формы.', en: 'The melee-form fifth stage is used.' }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.tomato-percussion.fifth.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Tomato Percussion · пятая атака', en: 'Tomato Percussion: fifth attack' },
    description: {
      ru: 'Только пятая атака дальней формы: 247,7% АТК. Она хранится отдельно от ближнего варианта на 386,3% АТК.',
      en: 'Ranged-form fifth attack only: 247.7% ATK. It remains separate from the 386.3% melee variant.',
    },
    multiplier: 247.7,
    requiredSkill: 'basic',
    requiredLevel: 10,
    assumedConditions: [{ ru: 'Выполняется именно пятая ступень дальней формы.', en: 'The ranged-form fifth stage is used.' }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
  {
    id: 'lacrimosa.morning-tomato.level-10',
    characterName: 'Lacrimosa',
    title: { ru: 'Morning Tomato · прямой урон', en: 'Morning Tomato: direct damage' },
    description: {
      ru: 'Прямой урон варианта навыка перенаправления: 599,7% АТК. Навык накладывает 5 Nightmare и переводит к пятой базовой атаке, но урон Nightmare и выбранная форма пятой атаки считаются отдельно.',
      en: 'Direct damage of the Redirect Skill variant: 599.7% ATK. It applies 5 Nightmare and advances to Basic Attack stage five, while Nightmare damage and the selected fifth-attack form remain separate.',
    },
    multiplier: 599.7,
    requiredSkill: 'skill',
    requiredLevel: 10,
    assumedConditions: [{
      ru: 'Выбран именно Morning Tomato, а не Devilish Gift с копированием внешнего навыка.',
      en: 'Morning Tomato is selected rather than Devilish Gift copying an external ability.',
    }],
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
  },
];
'''
write('src/verified-visible-actions-batch-j.ts', batch_j)

replace_once(
    'src/verified-visible-actions.ts',
    "import { verifiedVisibleActionsBatchI } from './verified-visible-actions-batch-i';\n",
    "import { verifiedVisibleActionsBatchI } from './verified-visible-actions-batch-i';\nimport { verifiedVisibleActionsBatchJ } from './verified-visible-actions-batch-j';\n",
)
replace_once(
    'src/verified-visible-actions.ts',
    '  ...verifiedVisibleActionsBatchI,\n];',
    '  ...verifiedVisibleActionsBatchI,\n  ...verifiedVisibleActionsBatchJ,\n];',
)
replace_once(
    'tsconfig.node.json',
    '    "src/verified-visible-actions-batch-i.ts",\n',
    '    "src/verified-visible-actions-batch-i.ts",\n    "src/verified-visible-actions-batch-j.ts",\n',
)

# Reclassify unresolved Lacrimosa steps without changing the immutable baseline.
overrides = '''const currentRotationGapOverrides = new Map<string, RotationGapAuditEntry>([
  [gapKey('lacrimosa-discord-dot', 'lacrimosa-transform'), {
    version: ROTATION_GAP_AUDIT_VERSION,
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-transform',
    classification: 'ambiguous-source-step',
    rationale: {
      ru: 'Точные записи Morning Tomato и обеих форм атак уже существуют, но шаг называет только «преобразующий навык». Источник допускает Morning Tomato либо Devilish Gift, который копирует внешний навык и не имеет фиксированного собственного коэффициента.',
      en: 'Exact Morning Tomato and both attack-form records now exist, but the step only says “transformation Skill.” The source allows Morning Tomato or Devilish Gift, which copies an external ability and has no fixed native ratio.',
    },
    rejectedActionIds: ['lacrimosa.morning-tomato.level-10'],
  }],
  [gapKey('lacrimosa-discord-dot', 'lacrimosa-basic-five'), {
    version: ROTATION_GAP_AUDIT_VERSION,
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-basic-five',
    classification: 'ambiguous-source-step',
    rationale: {
      ru: 'Каталог содержит полные ближнюю и дальнюю цепочки, но исходный шаг не фиксирует форму. Эти ветки имеют разные коэффициенты, поэтому выбор одной из них был бы догадкой.',
      en: 'The catalog contains complete melee and ranged strings, but the source step does not fix the form. Their ratios differ, so selecting either would be a guess.',
    },
    rejectedActionIds: [
      'lacrimosa.tomato-metal.full-direct-sequence.level-10',
      'lacrimosa.tomato-percussion.full-sequence.level-10',
    ],
  }],
  [gapKey('lacrimosa-discord-dot', 'lacrimosa-redirect-five'), {
    version: ROTATION_GAP_AUDIT_VERSION,
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-redirect-five',
    classification: 'ambiguous-source-step',
    rationale: {
      ru: 'Шаг требует навык перенаправления и переход к пятой атаке, но не выбирает Morning Tomato либо Devilish Gift и не указывает ближнюю или дальнюю пятую ступень.',
      en: 'The step requires a Redirect Skill and advancement to stage five, but it selects neither Morning Tomato versus Devilish Gift nor the melee versus ranged fifth stage.',
    },
    rejectedActionIds: [
      'lacrimosa.morning-tomato.level-10',
      'lacrimosa.tomato-metal.fifth.level-10',
      'lacrimosa.tomato-percussion.fifth.level-10',
    ],
  }],
]);
'''
replace_once(
    'src/rotation-gap-audit-current.ts',
    "const gapKey = (presetId: string, sourceStepId: string): string => `${presetId}:${sourceStepId}`;\n",
    "const gapKey = (presetId: string, sourceStepId: string): string => `${presetId}:${sourceStepId}`;\n\n" + overrides,
)
replace_once(
    'src/rotation-gap-audit-current.ts',
    "export const currentRotationGapAudit: readonly RotationGapAuditEntry[] = baselineRotationGapAudit.filter(\n  (item) => !rotationScenarioBindings[gapKey(item.presetId, item.sourceStepId)],\n);",
    "export const currentRotationGapAudit: readonly RotationGapAuditEntry[] = baselineRotationGapAudit.filter(\n  (item) => !rotationScenarioBindings[gapKey(item.presetId, item.sourceStepId)],\n).map((item) => currentRotationGapOverrides.get(gapKey(item.presetId, item.sourceStepId)) ?? item);",
)
start = read('src/rotation-gap-audit-current.ts').index('export const currentRotationMissingActionPriorities')
current = read('src/rotation-gap-audit-current.ts')
end = current.index('\n\nfunction currentUnsupportedKeys', start)
priorities = '''export const currentRotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Daffodill',
    capability: { ru: 'первая и вторая усиленные базовые атаки', en: 'first and second enhanced Basic Attacks' },
    sourceSteps: ['lacrimosa-phantom-one', 'lacrimosa-phantom-two', 'baicang-phantom-one', 'baicang-phantom-two'],
    reason: { ru: 'Одна пара точных записей закроет четыре повторно используемых шага двух пресетов.', en: 'One exact pair closes four reused source steps across two presets.' },
  },
  {
    rank: 2,
    characterName: 'Zero',
    capability: { ru: 'прямые сверхспособность и навык перенаправления', en: 'direct Ultimate and Redirect Skill' },
    sourceSteps: ['zero-fill', 'zero-blossom', 'zero-third-strike', 'nanally-zero-blossom', 'chaos-zero-remora'],
    reason: { ru: 'Зеро участвует в четырёх пресетах, а текущие A1/A6-записи покрывают только условные дополнительные удары.', en: 'Zero appears in four presets while current A1/A6 records cover only conditional extra hits.' },
  },
];'''
write('src/rotation-gap-audit-current.ts', current[:start] + priorities + current[end:])
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.missingActionRecord !== 16) errors.push('Expected 16 current missing-action records');", "if (currentRotationGapAuditSummary.missingActionRecord !== 13) errors.push('Expected 13 current missing-action records');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.ambiguousSourceStep !== 2) errors.push('Expected 2 current ambiguous source steps');", "if (currentRotationGapAuditSummary.ambiguousSourceStep !== 5) errors.push('Expected 5 current ambiguous source steps');")

# Update only exact global-catalog expectations.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'expect(verifiedVisibleActions).toHaveLength(100);': 'expect(verifiedVisibleActions).toHaveLength(106);',
      'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(100);': 'expect(new Set(verifiedVisibleActions.map((action) => action.id)).size).toBe(106);',
      'verifiedActionCount: 100': 'verifiedActionCount: 106',
      'standaloneRecipeCount: 100': 'standaloneRecipeCount: 106',
      'verifiedActionCatalogCount: 100': 'verifiedActionCatalogCount: 106',
      'covers all 100 verified actions': 'covers all 106 verified actions',
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

replace_once('src/rotation-gap-audit-ui.test.ts', "it('shows the updated missing-action backlog after Shinku, Nanally and Chaos research'", "it('shows the updated missing-action backlog after Lacrimosa variant research'")
replace_once('src/rotation-gap-audit-ui.test.ts', 'expect(currentRotationMissingActionPriorities).toHaveLength(3);', 'expect(currentRotationMissingActionPriorities).toHaveLength(2);')
replace_once("src/rotation-gap-audit-ui.test.ts", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Lacrimosa');", "expect(currentRotationMissingActionPriorities[0]?.characterName).toBe('Daffodill');")
replace_once('src/rotation-gap-audit.test.ts', 'missingActionRecord: 16,', 'missingActionRecord: 13,')
replace_once('src/rotation-gap-audit.test.ts', 'ambiguousSourceStep: 2,', 'ambiguousSourceStep: 5,')
replace_once("src/rotation-gap-audit.test.ts", "it('moves research priority to Lacrimosa, Daffodill and Zero'", "it('moves missing-action research priority to Daffodill and Zero'")
replace_once("src/rotation-gap-audit.test.ts", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Lacrimosa'], [2, 'Daffodill'], [3, 'Zero']]);", "expect(currentRotationMissingActionPriorities.map((item) => [item.rank, item.characterName])).toEqual([[1, 'Daffodill'], [2, 'Zero']]);")

lacrimosa_test = '''import { describe, expect, it } from 'vitest';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { verifiedVisibleActionsBatchJ } from './verified-visible-actions-batch-j';
import { verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchJ.map((action) => [action.id, action]));

describe('verified Lacrimosa exact action variants', () => {
  it('adds six unique level-10 records to the 106-action catalog', () => {
    expect(verifiedVisibleActionsBatchJ).toHaveLength(6);
    expect(new Set(verifiedVisibleActionsBatchJ.map((action) => action.id)).size).toBe(6);
    expect(verifiedVisibleActions).toHaveLength(106);
    expect(verifiedVisibleActionsBatchJ.every((action) => action.characterName === 'Lacrimosa')).toBe(true);
    expect(verifiedVisibleActionsBatchJ.every((action) => action.requiredLevel === 10)).toBe(true);
  });

  it('reproduces both full Basic strings without merging the projectile explosion', () => {
    expect(byId.get('lacrimosa.tomato-metal.full-direct-sequence.level-10')?.multiplier).toBeCloseTo(974.3, 8);
    expect(byId.get('lacrimosa.tomato-metal.projectile-explosion.level-10')?.multiplier).toBeCloseTo(38.8, 8);
    expect(byId.get('lacrimosa.tomato-percussion.full-sequence.level-10')?.multiplier).toBeCloseTo(1127.6, 8);
    expect(verifiedVisibleActionsBatchJ.find((action) => action.id.includes('full-direct'))?.description.ru).toContain('хранится отдельно');
  });

  it('keeps melee and ranged fifth attacks separate from Morning Tomato', () => {
    expect(byId.get('lacrimosa.tomato-metal.fifth.level-10')?.multiplier).toBeCloseTo(386.3, 8);
    expect(byId.get('lacrimosa.tomato-percussion.fifth.level-10')?.multiplier).toBeCloseTo(247.7, 8);
    expect(byId.get('lacrimosa.morning-tomato.level-10')?.multiplier).toBeCloseTo(599.7, 8);
    expect(byId.get('lacrimosa.morning-tomato.level-10')?.requiredSkill).toBe('skill');
  });

  it('does not substitute Discord Enhancement or create unsafe Rotation Lab bindings', () => {
    expect(verifiedVisibleActionsBatchJ.some((action) => action.id.includes('discord-enhancement'))).toBe(false);
    for (const stepId of ['lacrimosa-transform', 'lacrimosa-basic-five', 'lacrimosa-redirect-five']) {
      expect(rotationScenarioBindings[`lacrimosa-discord-dot:${stepId}`]).toBeUndefined();
      expect(currentRotationGapAuditByKey.get(`lacrimosa-discord-dot:${stepId}`)?.classification).toBe('ambiguous-source-step');
    }
  });

  it('keeps 29 gaps while moving three rows from missing to ambiguous', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 12,
      total: 29,
      missingActionRecord: 13,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 106,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual(['Daffodill', 'Zero']);
  });

  it('retains complete current source provenance', () => {
    for (const action of verifiedVisibleActionsBatchJ) {
      expect(action.sourcePublisher).toBe('Icy Veins');
      expect(action.sourceUrl).toBe('https://www.icy-veins.com/neverness-to-everness/lacrimosa-profile-skills');
      expect(action.sourceUpdatedAt).toBe('2026-07-07');
      expect(action.verifiedAt).toBe('2026-08-06');
    }
  });
});
'''
write('src/lacrimosa-exact-actions.test.ts', lacrimosa_test)

write('docs/LACRIMOSA_ACTION_RECONCILIATION.md', '''# Lacrimosa exact-action reconciliation\n\nVerified 2026-08-06.\n\n## Exact level-10 records\n\n- Tomato Metal direct stages 1–5: `974.3% ATK`.\n- Tomato Metal stage-two projectile explosion: `38.8% ATK`, stored separately because it requires a later shatter.\n- Tomato Percussion stages 1–5: `1127.6% ATK`.\n- Tomato Metal fifth attack: `386.3% ATK`.\n- Tomato Percussion fifth attack: `247.7% ATK`.\n- Morning Tomato direct damage: `599.7% ATK`; Nightmare and the selected fifth-attack form remain separate.\n\nPrimary ratios: Icy Veins Lacrimosa profile, updated 2026-07-07. Rotation and form guidance: Prydwen Lacrimosa profile, updated 2026-06-23.\n\n## Why the Rotation Lab steps remain gaps\n\nThe preset says “transformation Redirect Skill,” “Basic Attacks one through five,” and “Redirect Skill to advance to the fifth Basic Attack.” It does not select:\n\n1. Morning Tomato versus Devilish Gift, which copies an external enemy ability and has no fixed native damage ratio;\n2. Tomato Metal versus Tomato Percussion for the full Basic string;\n3. the melee versus ranged fifth attack after the Redirect Skill.\n\nTherefore no exact binding is added. The three steps move from `missing-action-record` to `ambiguous-source-step`. The immutable 41-step baseline and the current 29-gap total remain unchanged.\n\n## Exclusions\n\n- Discord Enhancement remains its own Broken-target passive trigger.\n- Nightmare is not duration-multiplied into a fixed tick count.\n- No animation seconds or complete-rotation DPS are inferred.\n- English ability names remain in Russian copy until client wording is directly confirmed.\n''')

print('Lacrimosa exact-action patch applied successfully')
