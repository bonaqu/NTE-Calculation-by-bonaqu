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
        raise RuntimeError(f'{path}: expected one anchor, found {count}: {old[:140]!r}')
    write(path, content.replace(old, new, 1))


cycle_models = '''import type { CharacterAttribute, EsperCycleId, LocalizedText } from './types';

interface VerifiedCombatCycleModelBase {
  id: EsperCycleId;
  kind: 'damage-window' | 'timed-state' | 'resource-trigger' | 'break-trigger';
  summary: LocalizedText;
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export interface VerifiedDamageWindowCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'damage-window';
  durationSeconds: number;
  affectedAttributes: readonly CharacterAttribute[];
  damageBonus: number;
}

export interface VerifiedTimedStateCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'timed-state';
  durationSeconds: number;
  stateEffect: LocalizedText;
}

export interface VerifiedResourceTriggerCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'resource-trigger';
  durationSeconds: null;
  ultimateEnergyPerTrigger: number;
  triggerCondition: LocalizedText;
}

export interface VerifiedBreakTriggerCycleModel extends VerifiedCombatCycleModelBase {
  kind: 'break-trigger';
  durationSeconds: null;
  /** The source confirms a percentage reduction but does not publish its value. */
  breakReductionPercent: null;
  triggerCondition: LocalizedText;
}

export type VerifiedCombatCycleModel =
  | VerifiedDamageWindowCycleModel
  | VerifiedTimedStateCycleModel
  | VerifiedResourceTriggerCycleModel
  | VerifiedBreakTriggerCycleModel;

const sourcePublisher = 'Prydwen Institute';
const sourceUrl = 'https://www.prydwen.gg/neverness-to-everness/guides/esper-cycles';
const sourceUpdatedAt = '2026-04-23';

/**
 * Tagged Cycle semantics for Combat Scenario. Only `damage-window` models may
 * modify action damage. Timed states and instantaneous resource/Break triggers
 * remain visible evidence without invented ticks, totals or percentages.
 */
export const verifiedCombatCycleModels: readonly VerifiedCombatCycleModel[] = [
  {
    id: 'stain',
    kind: 'damage-window',
    durationSeconds: 12,
    affectedAttributes: ['Lakshana', 'Psyche'],
    damageBonus: 20,
    summary: {
      ru: 'На 12 секунд увеличивает урон Психики и Лакшаны по общей цели на 20%.',
      en: 'Increases Psyche and Lakshana damage against the shared target by 20% for 12 seconds.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-04',
  },
  {
    id: 'scorch',
    kind: 'timed-state',
    durationSeconds: 15,
    stateEffect: {
      ru: 'Цель находится под Поджогом и получает периодический урон; total damage не вычисляется без tick ratio и числа тиков.',
      en: 'The target is Scorched and takes damage over time; total damage is not calculated without a tick ratio and tick count.',
    },
    summary: {
      ru: 'Подтверждённое 15-секундное состояние DoT без выдуманного total damage.',
      en: 'A verified 15-second DoT state without invented total damage.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  },
  {
    id: 'charge',
    kind: 'resource-trigger',
    durationSeconds: null,
    ultimateEnergyPerTrigger: 10,
    triggerCondition: {
      ru: 'Лепесток Цветения попадает по цели под Реморой.',
      en: 'A Blossom pistil hits a target affected by Remora.',
    },
    summary: {
      ru: '+10 энергии сверхспособности активному персонажу за одно квалифицирующее попадание; total Energy не заявляется.',
      en: '+10 Ultimate Energy to the active character per qualifying hit; total Energy is not claimed.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  },
  {
    id: 'discord',
    kind: 'break-trigger',
    durationSeconds: null,
    breakReductionPercent: null,
    triggerCondition: {
      ru: 'Нова и Поджог одновременно действуют на одной цели.',
      en: 'Nova and Scorch are active on the same target at the same time.',
    },
    summary: {
      ru: 'Мгновенно уменьшает шкалу разрушения цели на процент, числовое значение которого источник не публикует.',
      en: 'Instantly reduces the target Break gauge by a percentage whose numerical value is not published.',
    },
    sourcePublisher,
    sourceUrl,
    sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  },
];

export const verifiedCombatCycleModelById = new Map<EsperCycleId, VerifiedCombatCycleModel>(
  verifiedCombatCycleModels.map((model) => [model.id, model]),
);
'''
write('src/combat-cycle-models.ts', cycle_models)

# Generalize ActiveScenarioCycle into an evidence-safe tagged union.
replace_once(
    'src/combat-scenario.ts',
    "export interface ActiveScenarioCycle {\n  key: string;\n  cycleId: EsperCycleId;\n  startedAt: number;\n  expiresAt: number;\n  name: LocalizedText;\n  affectedAttributes: VerifiedCombatCycleModel['affectedAttributes'];\n  damageBonus: number;\n}\n",
    "interface ActiveScenarioCycleBase {\n  key: string;\n  cycleId: EsperCycleId;\n  kind: VerifiedCombatCycleModel['kind'];\n  startedAt: number;\n  name: LocalizedText;\n  summary: LocalizedText;\n}\n\nexport type ActiveScenarioCycle =\n  | (ActiveScenarioCycleBase & {\n    kind: 'damage-window';\n    expiresAt: number;\n    affectedAttributes: readonly CharacterAttribute[];\n    damageBonus: number;\n  })\n  | (ActiveScenarioCycleBase & {\n    kind: 'timed-state';\n    expiresAt: number;\n    stateEffect: LocalizedText;\n  })\n  | (ActiveScenarioCycleBase & {\n    kind: 'resource-trigger';\n    expiresAt: null;\n    ultimateEnergyPerTrigger: number;\n    triggerCondition: LocalizedText;\n  })\n  | (ActiveScenarioCycleBase & {\n    kind: 'break-trigger';\n    expiresAt: null;\n    breakReductionPercent: null;\n    triggerCondition: LocalizedText;\n  });\n",
)

replace_once(
    'src/combat-scenario.ts',
    "  const applicable = cycles.filter((cycle) => cycle.affectedAttributes.includes(attribute));\n  return {\n    damageBonus: applicable.reduce((sum, cycle) => sum + cycle.damageBonus, 0),",
    "  const applicable = cycles.filter((cycle): cycle is Extract<ActiveScenarioCycle, { kind: 'damage-window' }> => (\n    cycle.kind === 'damage-window' && cycle.affectedAttributes.includes(attribute)\n  ));\n  return {\n    damageBonus: applicable.reduce((sum, cycle) => sum + cycle.damageBonus, 0),",
)

# Add a total constructor that makes impossible model states unrepresentable.
replace_once(
    'src/combat-scenario.ts',
    "function damageOf(calculation: VisibleBuildCalculation | undefined): DamageResult | null {\n  return calculation?.supported && calculation.result ? calculation.result : null;\n}\n\nexport function calculateCombatScenario(",
    "function damageOf(calculation: VisibleBuildCalculation | undefined): DamageResult | null {\n  return calculation?.supported && calculation.result ? calculation.result : null;\n}\n\nfunction activatedCycleFromModel(\n  model: VerifiedCombatCycleModel,\n  name: LocalizedText,\n  startedAt: number,\n): ActiveScenarioCycle {\n  const base = { key: model.id, cycleId: model.id, kind: model.kind, startedAt, name, summary: model.summary };\n  if (model.kind === 'damage-window') return {\n    ...base,\n    kind: model.kind,\n    expiresAt: startedAt + model.durationSeconds,\n    affectedAttributes: model.affectedAttributes,\n    damageBonus: model.damageBonus,\n  };\n  if (model.kind === 'timed-state') return {\n    ...base,\n    kind: model.kind,\n    expiresAt: startedAt + model.durationSeconds,\n    stateEffect: model.stateEffect,\n  };\n  if (model.kind === 'resource-trigger') return {\n    ...base,\n    kind: model.kind,\n    expiresAt: null,\n    ultimateEnergyPerTrigger: model.ultimateEnergyPerTrigger,\n    triggerCondition: model.triggerCondition,\n  };\n  return {\n    ...base,\n    kind: model.kind,\n    expiresAt: null,\n    breakReductionPercent: model.breakReductionPercent,\n    triggerCondition: model.triggerCondition,\n  };\n}\n\nexport function calculateCombatScenario(",
)

replace_once(
    'src/combat-scenario.ts',
    "            'Для выбранного цикла эспера ещё нет подтверждённой числовой модели сценария.',\n            'The selected Esper Cycle does not have a verified numerical scenario model yet.',",
    "            'Для выбранного цикла эспера ещё нет подтверждённой модели сценария.',\n            'The selected Esper Cycle does not have a verified scenario model yet.',",
)

replace_once(
    'src/combat-scenario.ts',
    "      const activeCycle: ActiveScenarioCycle = {\n        key: cycle.id,\n        cycleId: cycle.id,\n        startedAt: step.at,\n        expiresAt: step.at + model.durationSeconds,\n        name: cycle.name,\n        affectedAttributes: model.affectedAttributes,\n        damageBonus: model.damageBonus,\n      };\n      cycleWindows.set(activeCycle.key, activeCycle);\n      results.push({\n        step,\n        originalIndex,\n        status: 'activated',\n        sourceCharacter: sourceBuild.characterName,\n        activatedCycle: activeCycle,\n        activeEffects: beforeEffects,\n        activeCycles: snapshotActiveCycles(cycleWindows, step.at),\n      });",
    "      const activeCycle = activatedCycleFromModel(model, cycle.name, step.at);\n      if (activeCycle.expiresAt !== null) cycleWindows.set(activeCycle.key, activeCycle);\n      results.push({\n        step,\n        originalIndex,\n        status: 'activated',\n        sourceCharacter: sourceBuild.characterName,\n        activatedCycle: activeCycle,\n        activeEffects: beforeEffects,\n        activeCycles: activeCycle.expiresAt === null\n          ? beforeCycles\n          : snapshotActiveCycles(cycleWindows, step.at),\n      });",
)

# UI helpers and tagged display labels.
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "import { verifiedCombatCycleModels } from '../combat-cycle-models';",
    "import { verifiedCombatCycleModels, type VerifiedCombatCycleModel } from '../combat-cycle-models';",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  type CombatScenarioState,\n  type CombatScenarioStep,",
    "  type ActiveScenarioCycle,\n  type CombatScenarioState,\n  type CombatScenarioStep,",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "function coverageLabel(coverage: RotationScenarioSourceCoverage, ru: boolean): string {\n  if (coverage === 'full') return ru ? 'полностью' : 'full';\n  if (coverage === 'partial') return ru ? 'частично' : 'partial';\n  return ru ? 'не связано' : 'unsupported';\n}\n",
    "function coverageLabel(coverage: RotationScenarioSourceCoverage, ru: boolean): string {\n  if (coverage === 'full') return ru ? 'полностью' : 'full';\n  if (coverage === 'partial') return ru ? 'частично' : 'partial';\n  return ru ? 'не связано' : 'unsupported';\n}\n\nfunction cycleModelOptionLabel(model: VerifiedCombatCycleModel, name: string, ru: boolean): string {\n  if (model.kind === 'damage-window') return `${name} · ${model.durationSeconds}${ru ? 'с' : 's'} · +${model.damageBonus}%`;\n  if (model.kind === 'timed-state') return `${name} · ${model.durationSeconds}${ru ? 'с' : 's'} · ${ru ? 'состояние DoT' : 'DoT state'}`;\n  if (model.kind === 'resource-trigger') return `${name} · +${model.ultimateEnergyPerTrigger} ${ru ? 'энергии / триггер' : 'Energy / trigger'}`;\n  return `${name} · ${ru ? 'снижение Break, % не опубликован' : 'Break reduction, % unpublished'}`;\n}\n\nfunction cycleActivationDisplay(cycle: ActiveScenarioCycle, ru: boolean): { value: string; label: string; kindLabel: string } {\n  if (cycle.kind === 'damage-window') return {\n    value: `${cycle.expiresAt - cycle.startedAt}${ru ? 'с' : 's'}`,\n    label: ru ? 'окно урона' : 'damage window',\n    kindLabel: ru ? 'Числовое окно общей цели' : 'Numerical shared-target window',\n  };\n  if (cycle.kind === 'timed-state') return {\n    value: `${cycle.expiresAt - cycle.startedAt}${ru ? 'с' : 's'}`,\n    label: ru ? 'состояние' : 'state',\n    kindLabel: ru ? 'Состояние общей цели без total damage' : 'Shared-target state without total damage',\n  };\n  if (cycle.kind === 'resource-trigger') return {\n    value: `+${cycle.ultimateEnergyPerTrigger}`,\n    label: ru ? 'энергии / триггер' : 'Energy / trigger',\n    kindLabel: ru ? 'Мгновенный ресурсный триггер' : 'Instant resource trigger',\n  };\n  return {\n    value: ru ? 'не указан' : 'unpublished',\n    label: ru ? 'процент Break' : 'Break percentage',\n    kindLabel: ru ? 'Мгновенный Break-триггер' : 'Instant Break trigger',\n  };\n}\n",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "      ? 'Числовая модель сейчас подтверждена только для цикла «След»: +20% урона Психики и Лакшаны по общей цели на 12 секунд. Остальные циклы не превращаются в выдуманный урон.'\n      : 'Only Stain currently has a verified numerical model: +20% Psyche and Lakshana damage against the shared target for 12 seconds. Other cycles are not converted into invented damage.'",
    "      ? 'След изменяет формулу урона. Поджог хранится как 15-секундное состояние, Заряд — как +10 энергии за триггер, Дискорд — как Break-событие без опубликованного процента. Семантические модели не создают скрытый урон.'\n      : 'Stain changes the damage formula. Scorch is a 15-second state, Charge is +10 Energy per trigger, and Discord is a Break event with an unpublished percentage. Semantic models create no hidden damage.'",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "            <option value=\"\">{ru ? 'Выбери численно поддержанный цикл' : 'Select a numerically supported cycle'}</option>\n            {supportedCycles.map(({ model, cycle }) => <option value={model.id} key={model.id}>{cycle?.name[locale]} · {model.durationSeconds}{ru ? 'с' : 's'} · +{model.damageBonus}%</option>)}",
    "            <option value=\"\">{ru ? 'Выбери подтверждённую модель цикла' : 'Select a verified Cycle model'}</option>\n            {supportedCycles.map(({ model, cycle }) => <option value={model.id} key={model.id}>{cycleModelOptionLabel(model, cycle?.name[locale] ?? model.id, ru)}</option>)}",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "        const activatedTitle = entry.activatedCycle?.name[locale] ?? entry.effectEvaluation?.effect.title[locale];\n        const activeWindowCount = entry.activeEffects.length + entry.activeCycles.length;\n        const activatedDuration = entry.activatedCycle\n          ? entry.activatedCycle.expiresAt - entry.activatedCycle.startedAt\n          : entry.effectEvaluation?.effect.durationSeconds;",
    "        const activatedTitle = entry.activatedCycle?.name[locale] ?? entry.effectEvaluation?.effect.title[locale];\n        const activeWindowCount = entry.activeEffects.length + entry.activeCycles.length;\n        const cycleDisplay = entry.activatedCycle ? cycleActivationDisplay(entry.activatedCycle, ru) : null;\n        const activatedDuration = entry.effectEvaluation?.effect.durationSeconds;",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "          <div className=\"combat-scenario-result-copy\"><b>{entry.status === 'calculated'\n            ? entry.calculation?.title[locale]\n            : entry.status === 'activated'\n              ? activatedTitle\n              : entry.status === 'wait'\n                ? (entry.step.note || (ru ? 'Непокрытый промежуток' : 'Unsupported interval'))\n                : (ru ? 'Шаг заблокирован' : 'Step blocked')}</b><small>{entry.step.kind === 'activate-cycle'\n                  ? (ru ? 'Состояние общей цели' : 'Shared target state')",
    "          <div className=\"combat-scenario-result-copy\"><b>{entry.status === 'calculated'\n            ? entry.calculation?.title[locale]\n            : entry.status === 'activated'\n              ? activatedTitle\n              : entry.status === 'wait'\n                ? (entry.step.note || (ru ? 'Непокрытый промежуток' : 'Unsupported interval'))\n                : (ru ? 'Шаг заблокирован' : 'Step blocked')}</b><small>{entry.step.kind === 'activate-cycle'\n                  ? (cycleDisplay?.kindLabel ?? (ru ? 'Состояние общей цели' : 'Shared target state'))",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "          <div className=\"combat-scenario-result-value\">{damage ? <><strong>{format(damage.expected)}</strong><small>{ru ? 'ожидаемый' : 'expected'}</small></> : entry.status === 'activated' ? <><strong>{activatedDuration === 'combat' ? '∞' : `${activatedDuration}${ru ? 'с' : 's'}`}</strong><small>{ru ? 'окно' : 'window'}</small></> : null}</div>",
    "          <div className=\"combat-scenario-result-value\">{damage ? <><strong>{format(damage.expected)}</strong><small>{ru ? 'ожидаемый' : 'expected'}</small></> : entry.status === 'activated' ? cycleDisplay ? <><strong>{cycleDisplay.value}</strong><small>{cycleDisplay.label}</small></> : <><strong>{activatedDuration === 'combat' ? '∞' : `${activatedDuration}${ru ? 'с' : 's'}`}</strong><small>{ru ? 'окно' : 'window'}</small></> : null}</div>",
)

# Source annotation: this step models the resulting Charge; Blossom remains the partial remainder.
replace_once(
    'src/rotation-presets-base.ts',
    "id: 'jiuyuan-second-charge', actor: 'Jiuyuan', phase: 'recovery', action: 'swap', cycle: 'blossom',",
    "id: 'jiuyuan-second-charge', actor: 'Jiuyuan', phase: 'recovery', action: 'swap', cycle: 'charge',",
)

# Three exact semantic Cycle bindings.
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('hathor-hyper', 'zero-third-strike')]: {\n    coverage: 'partial',\n    items: [{ kind: 'action-sequence', actionIds: ['zero.appraise-and-engrave.main.level-10'] }],\n  },\n\n  [binding('chaos-remora-bomb', 'chaos-hathor-redirect')]: {",
    "  [binding('hathor-hyper', 'zero-third-strike')]: {\n    coverage: 'partial',\n    items: [{ kind: 'action-sequence', actionIds: ['zero.appraise-and-engrave.main.level-10'] }],\n  },\n  [binding('hathor-hyper', 'jiuyuan-second-charge')]: {\n    coverage: 'partial',\n    items: [{ kind: 'activate-cycle', cycleId: 'charge' }],\n  },\n\n  [binding('chaos-remora-bomb', 'chaos-hathor-redirect')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('lacrimosa-discord-dot', 'lacrimosa-sakiri-buffs')]: {\n    coverage: 'partial',\n    items: sakiriSetupItems,\n  },",
    "  [binding('lacrimosa-discord-dot', 'lacrimosa-sakiri-buffs')]: {\n    coverage: 'partial',\n    items: sakiriSetupItems,\n  },\n  [binding('lacrimosa-discord-dot', 'lacrimosa-scorch')]: {\n    coverage: 'partial',\n    items: [{ kind: 'activate-cycle', cycleId: 'scorch' }],\n  },\n  [binding('lacrimosa-discord-dot', 'lacrimosa-discord')]: {\n    coverage: 'partial',\n    items: [{ kind: 'activate-cycle', cycleId: 'discord' }],\n  },",
)

# Current audit now contains only non-damage and ambiguous gaps.
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 25) errors.push('Expected twenty-five source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 28) errors.push('Expected twenty-eight source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 16) errors.push(`Expected 16 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 13) errors.push(`Expected 13 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.effectOrCycleCondition !== 3) errors.push('Expected 3 current effect/Cycle conditions');", "if (currentRotationGapAuditSummary.effectOrCycleCondition !== 0) errors.push('Expected no current effect/Cycle conditions');")

# Broad cumulative count updates.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'bindingCount: 42': 'bindingCount: 45',
      'partiallyBoundSourceStepCount: 30': 'partiallyBoundSourceStepCount: 33',
      'unsupportedSourceStepCount: 16': 'unsupportedSourceStepCount: 13',
      'resolvedSinceBaseline: 25': 'resolvedSinceBaseline: 28',
      'total: 16': 'total: 13',
      'effectOrCycleCondition: 3': 'effectOrCycleCondition: 0',
      'toHaveLength(16)': 'toHaveLength(13)',
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

replace_once('src/rotation-gap-audit.test.ts', "it('derives all 16 current gaps from exact bindings'", "it('derives all 13 current gaps from exact bindings'")

# Per-preset recipe audit: actions are unchanged, semantic Cycle coverage improves.
recipe_test = read('src/verified-rotation-recipes.test.ts')
replacements = {
    "      partiallyBoundSourceSteps: 6,\n      unsupportedSourceSteps: 4,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 4,\n      verifiedActionSteps: 10,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 1,": "      partiallyBoundSourceSteps: 7,\n      unsupportedSourceSteps: 3,\n      exactActionSourceSteps: 1,\n      partialActionSourceSteps: 4,\n      verifiedActionSteps: 10,\n      omittedEffectConditions: 2,\n      omittedCycleConditions: 0,",
    "      partiallyBoundSourceSteps: 3,\n      unsupportedSourceSteps: 6,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 3,": "      partiallyBoundSourceSteps: 5,\n      unsupportedSourceSteps: 4,\n      verifiedActionSteps: 7,\n      omittedEffectConditions: 1,",
}
for old, new in replacements.items():
    if old not in recipe_test:
        raise RuntimeError(f'verified-rotation-recipes.test.ts missing anchor: {old[:130]}')
    recipe_test = recipe_test.replace(old, new, 1)
write('src/verified-rotation-recipes.test.ts', recipe_test)

# Existing unsupported-cycle test remains about Blossom, but the contract is no longer numerical-only.
replace_once('src/stain-cycle-scenario.test.ts', "it('blocks cycles without a confirmed numerical scenario model'", "it('blocks cycles without a verified scenario model'")
replace_once('src/stain-cycle-scenario.test.ts', "expect(result.steps[0]?.blockedReason?.ru).toContain('нет подтверждённой числовой модели сценария');", "expect(result.steps[0]?.blockedReason?.ru).toContain('нет подтверждённой модели сценария');")

replace_once('src/combat-scenario-ui.test.ts', "expect(manualEditorSource).toContain('Остальные циклы не превращаются в выдуманный урон');", "expect(manualEditorSource).toContain('Семантические модели не создают скрытый урон');")
replace_once('src/combat-scenario-ui.test.ts', "expect(manualEditorSource).toContain('verifiedCombatCycleModels');", "expect(manualEditorSource).toContain('verifiedCombatCycleModels');\n    expect(manualEditorSource).toContain('cycleModelOptionLabel');\n    expect(manualEditorSource).toContain('cycleActivationDisplay');")

cycle_test = '''import { describe, expect, it } from 'vitest';
import { verifiedCombatCycleModelById, verifiedCombatCycleModels } from './combat-cycle-models';
import { calculateCombatScenario, type CombatScenarioState } from './combat-scenario';
import { createEmptyGameVisibleBuild, type GameVisibleCharacterBuild, type GameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { confirmRotationScenarioTiming, importRotationPresetToScenario, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { validateVerifiedRotationRecipes, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';

function build(characterName: string, atk = 1000): GameVisibleCharacterBuild {
  const value = createEmptyGameVisibleBuild(characterName);
  return {
    ...value,
    level: 80,
    maxLevel: 80,
    stats: { ...value.stats, atk, critRate: 0, critDamage: 100 },
  };
}

function team(): GameVisibleTeamState {
  return {
    version: 1,
    activeSlot: 0,
    duration: 30,
    builds: [build('Lacrimosa'), build('Sakiri'), build('Haniel'), build('Zero')],
    target: { level: 80, resistance: 0, defenceReduction: 0, resistanceReduction: 0, boss: true },
  };
}

function cycleScenario(cycleId: string, actionAt = 1): CombatScenarioState {
  return {
    version: 1,
    name: cycleId,
    steps: [
      { id: 'cycle', at: 0, kind: 'activate-cycle', sourceSlot: 0, actionId: '', effectId: '', cycleId, note: '' },
      { id: 'action', at: actionAt, kind: 'action', sourceSlot: 0, actionId: 'lacrimosa.morning-tomato.level-10', effectId: '', cycleId: '', note: '' },
    ],
  };
}

describe('typed verified Esper Cycle events', () => {
  it('publishes one damage window, one timed state and two instantaneous triggers', () => {
    expect(verifiedCombatCycleModels.map((model) => [model.id, model.kind])).toEqual([
      ['stain', 'damage-window'],
      ['scorch', 'timed-state'],
      ['charge', 'resource-trigger'],
      ['discord', 'break-trigger'],
    ]);
    expect(verifiedCombatCycleModelById.get('scorch')).toMatchObject({ durationSeconds: 15 });
    expect(verifiedCombatCycleModelById.get('charge')).toMatchObject({ durationSeconds: null, ultimateEnergyPerTrigger: 10 });
    expect(verifiedCombatCycleModelById.get('discord')).toMatchObject({ durationSeconds: null, breakReductionPercent: null });
  });

  it('keeps Scorch active for 15 seconds without changing direct action damage', () => {
    const inside = calculateCombatScenario(team(), cycleScenario('scorch', 14.9));
    const boundary = calculateCombatScenario(team(), cycleScenario('scorch', 15));
    const without = calculateCombatScenario(team(), { ...cycleScenario('scorch', 14.9), steps: [cycleScenario('scorch', 14.9).steps[1]!] });
    expect(inside.steps[0]?.activatedCycle).toMatchObject({ kind: 'timed-state', expiresAt: 15 });
    expect(inside.steps[1]?.activeCycles.some((cycle) => cycle.cycleId === 'scorch')).toBe(true);
    expect(boundary.steps[1]?.activeCycles).toHaveLength(0);
    expect(inside.steps[1]?.calculation?.result?.expected).toBeCloseTo(without.steps[0]?.calculation?.result?.expected ?? 0, 8);
    expect(inside.totalExpected).toBeCloseTo(without.totalExpected, 8);
  });

  it('records Charge as +10 Energy per trigger without creating an active window or hidden damage', () => {
    const chargeTeam: GameVisibleTeamState = {
      ...team(),
      builds: [build('Jiuyuan'), build('Zero'), build('Hathor'), build('Haniel')],
    };
    const state: CombatScenarioState = {
      version: 1,
      name: 'Charge',
      steps: [
        { id: 'charge', at: 0, kind: 'activate-cycle', sourceSlot: 0, actionId: '', effectId: '', cycleId: 'charge', note: '' },
        { id: 'hit', at: 1, kind: 'action', sourceSlot: 0, actionId: 'jiuyuan.intel-hunter.direct.level-10', effectId: '', cycleId: '', note: '' },
      ],
    };
    const result = calculateCombatScenario(chargeTeam, state);
    expect(result.steps[0]?.activatedCycle).toMatchObject({ kind: 'resource-trigger', ultimateEnergyPerTrigger: 10, expiresAt: null });
    expect(result.steps[0]?.activeCycles).toHaveLength(0);
    expect(result.steps[1]?.activeCycles).toHaveLength(0);
    expect(result.finalActiveCycles).toHaveLength(0);
    expect(result.steps[1]?.calculation?.conditions.some((condition) => condition.id.startsWith('cycle.charge'))).toBe(false);
  });

  it('records Discord with an unpublished Break percentage and no active damage window', () => {
    const result = calculateCombatScenario(team(), cycleScenario('discord'));
    expect(result.steps[0]?.activatedCycle).toMatchObject({ kind: 'break-trigger', breakReductionPercent: null, expiresAt: null });
    expect(result.steps[0]?.activeCycles).toHaveLength(0);
    expect(result.finalActiveCycles).toHaveLength(0);
    expect(result.steps[1]?.calculation?.conditions.some((condition) => condition.id.startsWith('cycle.discord'))).toBe(false);
  });

  it('binds Charge, Scorch and Discord as partial semantic events', () => {
    const expected = {
      'hathor-hyper:jiuyuan-second-charge': 'charge',
      'lacrimosa-discord-dot:lacrimosa-scorch': 'scorch',
      'lacrimosa-discord-dot:lacrimosa-discord': 'discord',
    } as const;
    for (const [key, cycleId] of Object.entries(expected)) {
      expect(rotationScenarioBindings[key]).toEqual({ coverage: 'partial', items: [{ kind: 'activate-cycle', cycleId }] });
      expect(currentRotationGapAuditByKey.has(key)).toBe(false);
    }
    expect(validateRotationScenarioBindings()).toEqual([]);
  });

  it('imports semantic events as pending order markers and activates them only after timing confirmation', () => {
    for (const presetId of ['hathor-hyper', 'lacrimosa-discord-dot']) {
      const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, team(), 'ru');
      const relevant = Object.entries(imported.metadata.pendingByStepId).filter(([, pending]) => pending.kind === 'activate-cycle');
      expect(relevant.length).toBeGreaterThan(0);
      for (const [stepId] of relevant) expect(imported.scenario.steps.find((step) => step.id === stepId)?.kind).toBe('wait');
      const confirmed = confirmRotationScenarioTiming(imported.scenario, imported.metadata);
      for (const [stepId] of relevant) expect(confirmed.scenario.steps.find((step) => step.id === stepId)?.kind).toBe('activate-cycle');
    }
  });

  it('derives 45 bindings and a 13-gap audit with zero effect/Cycle gaps', () => {
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 45,
      fullyBoundSourceStepCount: 12,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 13,
      boundActionStepCount: 63,
      promotedActionStepCount: 63,
    });
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 28,
      total: 13,
      effectOrCycleCondition: 0,
      missingActionRecord: 0,
      nonDamageOperation: 8,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
  });
});
'''
write('src/typed-cycle-events.test.ts', cycle_test)

write('docs/TYPED_CYCLE_EVENT_RECONCILIATION.md', '''# Typed Esper Cycle event reconciliation\n\nVerified 2026-08-06.\n\n## Why the model changed\n\nThe previous Combat Scenario cycle type assumed every supported Cycle was a timed `+% DMG` window. That contract is valid for Stain but cannot represent Scorch, Charge or Discord without inventing damage. The registry is now a tagged union.\n\n## Verified variants\n\n- `damage-window` — Stain: 12 seconds, +20% Psyche/Lakshana damage. This is the only variant that modifies action damage.\n- `timed-state` — Scorch: a 15-second DoT state. No total damage is calculated because the source does not publish a deterministic tick ratio/count pair.\n- `resource-trigger` — Charge: +10 Ultimate Energy to the active character per Blossom-pistil hit on a Remora target. No total Energy is claimed because the number of qualifying hits is not fixed by the Rotation Lab step.\n- `break-trigger` — Discord: reduces Break by a percentage while Nova and Scorch overlap. The percentage is stored as unknown because the source does not publish a number.\n\nPrimary source: Prydwen Esper Cycles guide, updated 2026-04-23. Cross-check: Icy Veins Esper Cycles/Incantation guides, updated 2026-06-24.\n\n## Runtime semantics\n\n- Stain and Scorch are timed active windows.\n- Charge and Discord are instantaneous activation results and are not retained in `activeCycles`.\n- Only `kind: damage-window` participates in `cycleModifierForAction`.\n- Existing Combat Scenario schema v1 remains valid; no storage migration is required.\n\n## Rotation bindings\n\nThree source steps receive partial semantic bindings:\n\n- `hathor-hyper:jiuyuan-second-charge` → Charge; Blossom setup and swapping remain the visible remainder.\n- `lacrimosa-discord-dot:lacrimosa-scorch` → Scorch; the swap sequence remains the visible remainder.\n- `lacrimosa-discord-dot:lacrimosa-discord` → Discord; continued attacks and unknown Break percentage remain the visible remainder.\n\n## Coverage\n\n- bindings: 42 → 45;\n- partial source steps: 30 → 33;\n- unsupported/current gaps: 16 → 13;\n- effect/Cycle gaps: 3 → 0;\n- bound/promoted direct action steps remain 63.\n\nThe immutable 41-step baseline remains unchanged. The remaining gaps are eight non-damage operations and five ambiguous source variants.\n''')

print('Typed Cycle event patch applied successfully')
