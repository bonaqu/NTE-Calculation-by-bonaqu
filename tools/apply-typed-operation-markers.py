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
        raise RuntimeError(f'{path}: expected one anchor, found {count}: {old[:150]!r}')
    write(path, content.replace(old, new, 1))


operations = '''import { rotationPresetById } from './rotation-presets';
import type { LocalizedText } from './types';

export type VerifiedScenarioOperationKind =
  | 'swap-setup'
  | 'resource-routing'
  | 'resource-rebuild'
  | 'start-position'
  | 'conditional-loop'
  | 'restart-control';

const operationDefinitions = [
  {
    id: 'zero.quick-swap-return-hathor',
    kind: 'swap-setup',
    presetId: 'hathor-hyper',
    sourceStepId: 'hathor-quickswap',
    title: { ru: 'Быстрое переключение и возврат', en: 'Quick swap and return setup' },
  },
  {
    id: 'hathor.reaction-energy-routing',
    kind: 'resource-routing',
    presetId: 'hathor-hyper',
    sourceStepId: 'energy-routing',
    title: { ru: 'Маршрутизация энергии реакции', en: 'Reaction Energy routing' },
  },
  {
    id: 'haniel.energy-cycle-rebuild',
    kind: 'resource-rebuild',
    presetId: 'hathor-hyper',
    sourceStepId: 'haniel-rebuild',
    title: { ru: 'Восстановление энергии и шкалы цикла', en: 'Energy and Cycle gauge rebuild' },
  },
  {
    id: 'hathor.cooldown-restart-chaos',
    kind: 'restart-control',
    presetId: 'chaos-remora-bomb',
    sourceStepId: 'chaos-restart',
    title: { ru: 'Ожидание перезарядок и перезапуск', en: 'Cooldown wait and restart' },
  },
  {
    id: 'jiuyuan.start-position-nanally',
    kind: 'start-position',
    presetId: 'nanally-hexed-dual',
    sourceStepId: 'nanally-jiuyuan-open',
    title: { ru: 'Стартовая позиция Цзююань', en: 'Jiuyuan starting position' },
  },
  {
    id: 'sakiri.energy-recovery-preserve-hexed',
    kind: 'conditional-loop',
    presetId: 'nanally-hexed-dual',
    sourceStepId: 'nanally-energy-recovery',
    title: { ru: 'Восстановление энергии с сохранением Проклятия', en: 'Energy recovery while preserving Hexed' },
  },
  {
    id: 'lacrimosa.conditional-support-energy-loop',
    kind: 'conditional-loop',
    presetId: 'lacrimosa-discord-dot',
    sourceStepId: 'lacrimosa-repeat-loop',
    title: { ru: 'Условный цикл восстановления поддержки', en: 'Conditional support-recovery loop' },
  },
  {
    id: 'adler.energy-check-restart',
    kind: 'restart-control',
    presetId: 'baicang-firefly-hyper',
    sourceStepId: 'baicang-restart',
    title: { ru: 'Проверка энергии и возврат к Адлер', en: 'Energy check and Adler restart' },
  },
] as const satisfies readonly {
  id: string;
  kind: VerifiedScenarioOperationKind;
  presetId: string;
  sourceStepId: string;
  title: LocalizedText;
}[];

export type VerifiedScenarioOperationId = typeof operationDefinitions[number]['id'];

export interface VerifiedScenarioOperation {
  id: VerifiedScenarioOperationId;
  kind: VerifiedScenarioOperationKind;
  presetId: string;
  sourceStepId: string;
  sourceCharacter: string;
  title: LocalizedText;
  summary: LocalizedText;
  /** Operations are intentionally non-damaging and have no inferred duration. */
  damageContribution: 0;
  durationSeconds: null;
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export const verifiedScenarioOperations: readonly VerifiedScenarioOperation[] = operationDefinitions.map((definition) => {
  const preset = rotationPresetById.get(definition.presetId);
  const sourceStep = preset?.steps.find((step) => step.id === definition.sourceStepId);
  if (!preset || !sourceStep) {
    throw new Error(`Invalid verified scenario operation source: ${definition.presetId}:${definition.sourceStepId}`);
  }
  return {
    ...definition,
    sourceCharacter: sourceStep.actor,
    summary: {
      ru: `${sourceStep.instruction.ru} ${sourceStep.outcome.ru}`,
      en: `${sourceStep.instruction.en} ${sourceStep.outcome.en}`,
    },
    damageContribution: 0,
    durationSeconds: null,
    sourcePublisher: preset.sourcePublisher,
    sourceUrl: preset.sourceUrl,
    sourceUpdatedAt: preset.sourceUpdatedAt,
    verifiedAt: '2026-08-06',
  };
});

export const verifiedScenarioOperationById = new Map<VerifiedScenarioOperationId, VerifiedScenarioOperation>(
  verifiedScenarioOperations.map((operation) => [operation.id, operation]),
);
'''
write('src/scenario-operations.ts', operations)

replace_once(
    'tsconfig.node.json',
    '    "src/combat-cycle-models.ts",\n',
    '    "src/combat-cycle-models.ts",\n    "src/scenario-operations.ts",\n',
)

# Combat Scenario additive schema-v1 operation support.
replace_once(
    'src/combat-scenario.ts',
    "import type { GameVisibleTeamState } from './game-visible-build';\n",
    "import type { GameVisibleTeamState } from './game-visible-build';\nimport { verifiedScenarioOperationById, type VerifiedScenarioOperation, type VerifiedScenarioOperationId } from './scenario-operations';\n",
)
replace_once(
    'src/combat-scenario.ts',
    "export type CombatScenarioStepKind = 'action' | 'activate-effect' | 'activate-cycle' | 'wait';",
    "export type CombatScenarioStepKind = 'action' | 'activate-effect' | 'activate-cycle' | 'operation' | 'wait';",
)
replace_once(
    'src/combat-scenario.ts',
    "  /** Added within schema v1; old v1 saves omit it and normalize to an empty string. */\n  cycleId?: string;\n  note: string;",
    "  /** Added within schema v1; old v1 saves omit it and normalize to an empty string. */\n  cycleId?: string;\n  /** Added within schema v1; old v1 saves omit it and normalize to an empty string. */\n  operationId?: string;\n  note: string;",
)
replace_once(
    'src/combat-scenario.ts',
    "export type CombatScenarioStepStatus = 'calculated' | 'activated' | 'wait' | 'blocked';",
    "export type CombatScenarioStepStatus = 'calculated' | 'activated' | 'operation' | 'wait' | 'blocked';",
)
replace_once(
    'src/combat-scenario.ts',
    "  activatedCycle?: ActiveScenarioCycle;\n  activeEffects:",
    "  activatedCycle?: ActiveScenarioCycle;\n  operation?: VerifiedScenarioOperation;\n  activeEffects:",
)
replace_once(
    'src/combat-scenario.ts',
    "  activatedCycleCount: number;\n  blockedStepCount:",
    "  activatedCycleCount: number;\n  operationStepCount: number;\n  completedOperationCount: number;\n  blockedStepCount:",
)
replace_once(
    'src/combat-scenario.ts',
    "  if (value === 'activate-effect' || value === 'activate-cycle' || value === 'wait') return value;",
    "  if (value === 'activate-effect' || value === 'activate-cycle' || value === 'operation' || value === 'wait') return value;",
)
replace_once(
    'src/combat-scenario.ts',
    "    cycleId: '',\n    note: '',",
    "    cycleId: '',\n    operationId: '',\n    note: '',",
)
replace_once(
    'src/combat-scenario.ts',
    "      cycleId: text(input.cycleId, '', 80),\n      note:",
    "      cycleId: text(input.cycleId, '', 80),\n      operationId: text(input.operationId, '', 120),\n      note:",
)
replace_once(
    'src/combat-scenario.ts',
    "    if (step.kind === 'wait') {\n      results.push({",
    "    if (step.kind === 'wait') {\n      results.push({",
)
# Insert operation branch immediately after wait branch.
replace_once(
    'src/combat-scenario.ts',
    "      return;\n    }\n\n    if (step.kind === 'activate-cycle') {",
    "      return;\n    }\n\n    if (step.kind === 'operation') {\n      const operation = verifiedScenarioOperationById.get(step.operationId as VerifiedScenarioOperationId);\n      if (!operation || operation.sourceCharacter !== sourceBuild.characterName) {\n        results.push({\n          step,\n          originalIndex,\n          status: 'blocked',\n          sourceCharacter: sourceBuild.characterName,\n          activeEffects: beforeEffects,\n          activeCycles: beforeCycles,\n          blockedReason: blockedReason(\n            'Выбранная небоевая операция не принадлежит персонажу в этом слоте или не подтверждена.',\n            'The selected non-damage operation does not belong to this slot character or is not verified.',\n          ),\n        });\n        return;\n      }\n      results.push({\n        step,\n        originalIndex,\n        status: 'operation',\n        sourceCharacter: sourceBuild.characterName,\n        operation,\n        activeEffects: beforeEffects,\n        activeCycles: beforeCycles,\n      });\n      return;\n    }\n\n    if (step.kind === 'activate-cycle') {",
)
replace_once(
    'src/combat-scenario.ts',
    "    activatedCycleCount: results.filter((result) => result.status === 'activated' && result.step.kind === 'activate-cycle').length,\n    blockedStepCount:",
    "    activatedCycleCount: results.filter((result) => result.status === 'activated' && result.step.kind === 'activate-cycle').length,\n    operationStepCount: results.filter((result) => result.step.kind === 'operation').length,\n    completedOperationCount: results.filter((result) => result.status === 'operation').length,\n    blockedStepCount:",
)

# Rotation import binding atom and report.
replace_once(
    'src/rotation-scenario-import.ts',
    "import { rotationPresetById, rotationPresets } from './rotation-presets';\n",
    "import { rotationPresetById, rotationPresets } from './rotation-presets';\nimport { verifiedScenarioOperationById, type VerifiedScenarioOperationId } from './scenario-operations';\n",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  | { kind: 'activate-cycle'; cycleId: EsperCycleId };",
    "  | { kind: 'activate-cycle'; cycleId: EsperCycleId }\n  | { kind: 'operation-marker'; operationId: VerifiedScenarioOperationId };",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  generatedCycleSteps: number;\n  generatedPartialRemainderSteps:",
    "  generatedCycleSteps: number;\n  generatedOperationSteps: number;\n  generatedPartialRemainderSteps:",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "function atomFingerprint(atom: RotationScenarioBindingAtom): string {\n  if (atom.kind === 'action-sequence') return `actions:${atom.actionIds.join(',')}`;\n  if (atom.kind === 'activate-effect') return `effect:${atom.effectId}`;\n  return `cycle:${atom.cycleId}`;\n}",
    "function atomFingerprint(atom: RotationScenarioBindingAtom): string {\n  if (atom.kind === 'action-sequence') return `actions:${atom.actionIds.join(',')}`;\n  if (atom.kind === 'activate-effect') return `effect:${atom.effectId}`;\n  if (atom.kind === 'activate-cycle') return `cycle:${atom.cycleId}`;\n  return `operation:${atom.operationId}`;\n}",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "function validBindingAtom(step: RotationStep, atom: RotationScenarioBindingAtom): boolean {",
    "function validBindingAtom(preset: RotationPreset, step: RotationStep, atom: RotationScenarioBindingAtom): boolean {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  if (atom.kind === 'activate-effect') {\n    return verifiedTeamEffectById.get(atom.effectId)?.sourceCharacter === step.actor;\n  }\n  return step.cycle === atom.cycleId && verifiedCombatCycleModelById.has(atom.cycleId);\n}",
    "  if (atom.kind === 'activate-effect') {\n    return verifiedTeamEffectById.get(atom.effectId)?.sourceCharacter === step.actor;\n  }\n  if (atom.kind === 'activate-cycle') {\n    return step.cycle === atom.cycleId && verifiedCombatCycleModelById.has(atom.cycleId);\n  }\n  const operation = verifiedScenarioOperationById.get(atom.operationId);\n  return operation?.presetId === preset.id\n    && operation.sourceStepId === step.id\n    && operation.sourceCharacter === step.actor;\n}",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  return candidate.items.every((atom) => validBindingAtom(step, atom)) ? candidate : null;",
    "  return candidate.items.every((atom) => validBindingAtom(preset, step, atom)) ? candidate : null;",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    cycleId: '',\n    note: '',",
    "    cycleId: '',\n    operationId: '',\n    note: '',",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  let generatedCycleSteps = 0;\n  let generatedPartialRemainderSteps = 0;",
    "  let generatedCycleSteps = 0;\n  let generatedOperationSteps = 0;\n  let generatedPartialRemainderSteps = 0;",
)
# Insert direct operation import before pending condition handling.
replace_once(
    'src/rotation-scenario-import.ts',
    "      const pendingStep = {\n        ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),",
    "      if (atom.kind === 'operation-marker') {\n        append({\n          ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),\n          kind: 'operation',\n          operationId: atom.operationId,\n          note: stepNote(sourceStep, locale),\n        }, sourceStep, part, matched.coverage);\n        generatedOperationSteps += 1;\n        part += 1;\n        continue;\n      }\n\n      const pendingStep = {\n        ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    generatedCycleSteps,\n    generatedPartialRemainderSteps,",
    "    generatedCycleSteps,\n    generatedOperationSteps,\n    generatedPartialRemainderSteps,",
)

# Eight full operation bindings.
operation_bindings = """
  [binding('hathor-hyper', 'hathor-quickswap')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'zero.quick-swap-return-hathor' }],
  },
  [binding('hathor-hyper', 'energy-routing')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'hathor.reaction-energy-routing' }],
  },
  [binding('hathor-hyper', 'haniel-rebuild')]: {
    coverage: 'full',
    items: [{ kind: 'operation-marker', operationId: 'haniel.energy-cycle-rebuild' }],
  },
"""
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('hathor-hyper', 'hathor-charge')]: {",
    operation_bindings + "  [binding('hathor-hyper', 'hathor-charge')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('chaos-remora-bomb', 'chaos-return-hathor')]: {",
    "  [binding('chaos-remora-bomb', 'chaos-restart')]: {\n    coverage: 'full',\n    items: [{ kind: 'operation-marker', operationId: 'hathor.cooldown-restart-chaos' }],\n  },\n  [binding('chaos-remora-bomb', 'chaos-return-hathor')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('nanally-hexed-dual', 'nanally-zero-blossom')]: {",
    "  [binding('nanally-hexed-dual', 'nanally-jiuyuan-open')]: {\n    coverage: 'full',\n    items: [{ kind: 'operation-marker', operationId: 'jiuyuan.start-position-nanally' }],\n  },\n  [binding('nanally-hexed-dual', 'nanally-zero-blossom')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('nanally-hexed-dual', 'nanally-charged-string')]: {",
    "  [binding('nanally-hexed-dual', 'nanally-energy-recovery')]: {\n    coverage: 'full',\n    items: [{ kind: 'operation-marker', operationId: 'sakiri.energy-recovery-preserve-hexed' }],\n  },\n  [binding('nanally-hexed-dual', 'nanally-charged-string')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('lacrimosa-discord-dot', 'lacrimosa-daffodill-open')]: {",
    "  [binding('lacrimosa-discord-dot', 'lacrimosa-repeat-loop')]: {\n    coverage: 'full',\n    items: [{ kind: 'operation-marker', operationId: 'lacrimosa.conditional-support-energy-loop' }],\n  },\n  [binding('lacrimosa-discord-dot', 'lacrimosa-daffodill-open')]: {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  [binding('baicang-firefly-hyper', 'baicang-sakiri-buff')]: {",
    "  [binding('baicang-firefly-hyper', 'baicang-restart')]: {\n    coverage: 'full',\n    items: [{ kind: 'operation-marker', operationId: 'adler.energy-check-restart' }],\n  },\n  [binding('baicang-firefly-hyper', 'baicang-sakiri-buff')]: {",
)

# Current audit: only five ambiguous variants remain.
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 28) errors.push('Expected twenty-eight source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 36) errors.push('Expected thirty-six source steps resolved since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 13) errors.push(`Expected 13 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 5) errors.push(`Expected 5 current gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.nonDamageOperation !== 8) errors.push('Expected 8 current non-damage operations');", "if (currentRotationGapAuditSummary.nonDamageOperation !== 0) errors.push('Expected no current non-damage operations');")

# Verified action-only recipe gap/audit semantics.
replace_once(
    'src/verified-rotation-recipes.ts',
    "import { rotationPresetById, rotationPresets } from './rotation-presets';\n",
    "import { rotationPresetById, rotationPresets } from './rotation-presets';\nimport { verifiedScenarioOperationById } from './scenario-operations';\n",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  | 'unconfirmed-effect'\n  | 'unconfirmed-cycle';",
    "  | 'unconfirmed-effect'\n  | 'unconfirmed-cycle'\n  | 'non-damage-operation';",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  omittedCycleConditions: number;\n  fixedRepeatEvidence:",
    "  omittedCycleConditions: number;\n  omittedOperationMarkers: number;\n  fixedRepeatEvidence:",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "function validBindingAtom(step: RotationStep, atom: RotationScenarioBindingAtom): boolean {",
    "function validBindingAtom(preset: RotationPreset, step: RotationStep, atom: RotationScenarioBindingAtom): boolean {",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  if (atom.kind === 'activate-effect') {\n    return verifiedTeamEffectById.get(atom.effectId)?.sourceCharacter === step.actor;\n  }\n  return step.cycle === atom.cycleId && verifiedCombatCycleModelById.has(atom.cycleId);\n}",
    "  if (atom.kind === 'activate-effect') {\n    return verifiedTeamEffectById.get(atom.effectId)?.sourceCharacter === step.actor;\n  }\n  if (atom.kind === 'activate-cycle') {\n    return step.cycle === atom.cycleId && verifiedCombatCycleModelById.has(atom.cycleId);\n  }\n  const operation = verifiedScenarioOperationById.get(atom.operationId);\n  return operation?.presetId === preset.id && operation.sourceStepId === step.id && operation.sourceCharacter === step.actor;\n}",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  return candidate.items.every((atom) => validBindingAtom(step, atom)) ? candidate : null;",
    "  return candidate.items.every((atom) => validBindingAtom(preset, step, atom)) ? candidate : null;",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  if (kind === 'unconfirmed-cycle') {\n    return {",
    "  if (kind === 'non-damage-operation') {\n    return {\n      ru: `Небоевая операция «${step.instruction.ru}» подтверждена, но намеренно не включена в action-only рецепт.`,\n      en: `The non-damage operation “${step.instruction.en}” is verified but intentionally excluded from the action-only recipe.`,\n    };\n  }\n  if (kind === 'unconfirmed-cycle') {\n    return {",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "      const kind: VerifiedRotationRecipeGapKind = atom.kind === 'activate-effect'\n        ? 'unconfirmed-effect'\n        : 'unconfirmed-cycle';",
    "      const kind: VerifiedRotationRecipeGapKind = atom.kind === 'activate-effect'\n        ? 'unconfirmed-effect'\n        : atom.kind === 'activate-cycle'\n          ? 'unconfirmed-cycle'\n          : 'non-damage-operation';",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  let omittedCycleConditions = 0;\n",
    "  let omittedCycleConditions = 0;\n  let omittedOperationMarkers = 0;\n",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "    omittedCycleConditions += matched.items.filter((atom) => atom.kind === 'activate-cycle').length;\n",
    "    omittedCycleConditions += matched.items.filter((atom) => atom.kind === 'activate-cycle').length;\n    omittedOperationMarkers += matched.items.filter((atom) => atom.kind === 'operation-marker').length;\n",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "    omittedCycleConditions,\n    fixedRepeatEvidence:",
    "    omittedCycleConditions,\n    omittedOperationMarkers,\n    fixedRepeatEvidence:",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "      cycleId: '',\n      note:",
    "      cycleId: '',\n      operationId: '',\n      note:",
)

# UI manual operation selection and result display.
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "import { rotationPresetById, rotationPresets } from '../rotation-presets';\n",
    "import { rotationPresetById, rotationPresets } from '../rotation-presets';\nimport { verifiedScenarioOperationById, verifiedScenarioOperations } from '../scenario-operations';\n",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  if (kind === 'wait') return ru ? 'Ожидание / непокрытый шаг' : 'Wait / unsupported step';",
    "  if (kind === 'operation') return ru ? 'Подтверждённая небоевая операция' : 'Verified non-damage operation';\n  if (kind === 'wait') return ru ? 'Ожидание / непокрытый шаг' : 'Wait / unsupported step';",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  const supportedCycles = useMemo(() => verifiedCombatCycleModels.map((model) => ({",
    "  const supportedOperations = useMemo(() => verifiedScenarioOperations.filter((operation) => (\n    team.builds.some((build) => build.characterName === operation.sourceCharacter)\n  )), [team.builds]);\n  const supportedCycles = useMemo(() => verifiedCombatCycleModels.map((model) => ({",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "      if (kind === 'activate-cycle') {\n        step.sourceSlot = 0;\n        step.cycleId = supportedCycles[0]?.model.id ?? '';\n      }",
    "      if (kind === 'activate-cycle') {\n        step.sourceSlot = 0;\n        step.cycleId = supportedCycles[0]?.model.id ?? '';\n      }\n      if (kind === 'operation') {\n        const operation = supportedOperations[0];\n        step.operationId = operation?.id ?? '';\n        const sourceSlot = team.builds.findIndex((build) => build.characterName === operation?.sourceCharacter);\n        step.sourceSlot = sourceSlot >= 0 ? sourceSlot : 0;\n      }",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "        <div><span>{ru ? 'Окон' : 'Windows'}</span><b>{importPreview.generatedEffectSteps + importPreview.generatedCycleSteps}</b></div>",
    "        <div><span>{ru ? 'Окон' : 'Windows'}</span><b>{importPreview.generatedEffectSteps + importPreview.generatedCycleSteps}</b></div>\n        <div><span>{ru ? 'Операций' : 'Operations'}</span><b>{importPreview.generatedOperationSteps}</b></div>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "      <div><span>{ru ? 'Циклов эспера' : 'Esper Cycles'}</span><strong>{result.activatedCycleCount}</strong></div>",
    "      <div><span>{ru ? 'Циклов эспера' : 'Esper Cycles'}</span><strong>{result.activatedCycleCount}</strong></div>\n      <div><span>{ru ? 'Небоевых операций' : 'Non-damage operations'}</span><strong>{result.completedOperationCount}</strong><small>{result.completedOperationCount}/{result.operationStepCount}</small></div>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "        <button type=\"button\" onClick={() => addStep('activate-cycle')}><Sparkles size={16} />{ru ? 'Цикл' : 'Cycle'}</button>\n        <button type=\"button\" onClick={() => addStep('wait')}>",
    "        <button type=\"button\" onClick={() => addStep('activate-cycle')}><Sparkles size={16} />{ru ? 'Цикл' : 'Cycle'}</button>\n        <button type=\"button\" onClick={() => addStep('operation')}><TimerReset size={16} />{ru ? 'Операция' : 'Operation'}</button>\n        <button type=\"button\" onClick={() => addStep('wait')}>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "onChange={(event) => updateStep(step.id, (current) => ({ ...current, kind: event.target.value as CombatScenarioStepKind, actionId: '', effectId: '', cycleId: '' }), true)}>",
    "onChange={(event) => updateStep(step.id, (current) => ({ ...current, kind: event.target.value as CombatScenarioStepKind, actionId: '', effectId: '', cycleId: '', operationId: '' }), true)}>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "            <option value=\"activate-cycle\">{stepLabel('activate-cycle', ru)}</option>\n            <option value=\"wait\">",
    "            <option value=\"activate-cycle\">{stepLabel('activate-cycle', ru)}</option>\n            <option value=\"operation\">{stepLabel('operation', ru)}</option>\n            <option value=\"wait\">",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "            {supportedCycles.map(({ model, cycle }) => <option value={model.id} key={model.id}>{cycleModelOptionLabel(model, cycle?.name[locale] ?? model.id, ru)}</option>)}\n          </select> : <input value={step.note}",
    "            {supportedCycles.map(({ model, cycle }) => <option value={model.id} key={model.id}>{cycleModelOptionLabel(model, cycle?.name[locale] ?? model.id, ru)}</option>)}\n          </select> : step.kind === 'operation' ? <select value={step.operationId} aria-label={ru ? 'Подтверждённая небоевая операция' : 'Verified non-damage operation'} onChange={(event) => updateStep(step.id, (current) => {\n            const operation = verifiedScenarioOperationById.get(event.target.value as never);\n            const sourceSlot = team.builds.findIndex((entry) => entry.characterName === operation?.sourceCharacter);\n            return { ...current, operationId: event.target.value, sourceSlot: sourceSlot >= 0 ? sourceSlot : current.sourceSlot };\n          }, true)}>\n            <option value=\"\">{ru ? 'Выбери подтверждённую операцию' : 'Select a verified operation'}</option>\n            {supportedOperations.map((operation) => <option value={operation.id} key={operation.id}>{operation.title[locale]}</option>)}\n          </select> : <input value={step.note}",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "? 'Расставь подтверждённые действия, эффекты персонажей и циклы эспера по времени.",
    "? 'Расставь подтверждённые действия, эффекты персонажей, циклы эспера и небоевые операции по времени.",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    ": 'Place verified actions, character effects and Esper Cycles on a timeline.",
    ": 'Place verified actions, character effects, Esper Cycles and non-damage operations on a timeline.",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "const activatedTitle = entry.activatedCycle?.name[locale] ?? entry.effectEvaluation?.effect.title[locale];",
    "const activatedTitle = entry.activatedCycle?.name[locale] ?? entry.effectEvaluation?.effect.title[locale];\n        const operationTitle = entry.operation?.title[locale];",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "              ? activatedTitle\n              : entry.status === 'wait'",
    "              ? activatedTitle\n              : entry.status === 'operation'\n                ? operationTitle\n                : entry.status === 'wait'",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "                  ? (cycleDisplay?.kindLabel ?? (ru ? 'Состояние общей цели' : 'Shared target state'))",
    "                  ? (cycleDisplay?.kindLabel ?? (ru ? 'Состояние общей цели' : 'Shared target state'))\n                  : entry.step.kind === 'operation'\n                    ? (ru ? 'Подтверждённая небоевая операция · 0 урона по замыслу' : 'Verified non-damage operation · 0 damage by design')",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "entry.status === 'activated' ? cycleDisplay ? <><strong>{cycleDisplay.value}</strong>",
    "entry.status === 'operation' ? <><strong>0</strong><small>{ru ? 'урон по замыслу' : 'damage by design'}</small></> : entry.status === 'activated' ? cycleDisplay ? <><strong>{cycleDisplay.value}</strong>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "Импортируй ротацию или добавь эффект, цикл эспера, действие либо промежуток ожидания.",
    "Импортируй ротацию или добавь действие, эффект, цикл эспера, небoевую операцию либо промежуток ожидания.",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "Import a rotation or add an effect, Esper Cycle, action or wait step.",
    "Import a rotation or add an action, effect, Esper Cycle, non-damage operation or wait step.",
)

# Current audit tests/counts. Keep immutable baseline at eight non-damage rows.
replace_once('src/rotation-gap-audit.test.ts', "it('derives all 13 current gaps from exact bindings'", "it('derives the five remaining ambiguous gaps from exact bindings'")
replace_once('src/rotation-gap-audit.test.ts', 'resolvedSinceBaseline: 28,', 'resolvedSinceBaseline: 36,')
replace_once('src/rotation-gap-audit.test.ts', 'total: 13,', 'total: 5,')
replace_once('src/rotation-gap-audit.test.ts', 'nonDamageOperation: 8,', 'nonDamageOperation: 0,')
replace_once('src/rotation-gap-audit.test.ts', 'expect(unsupportedKeys).toHaveLength(13);', 'expect(unsupportedKeys).toHaveLength(5);')
replace_once("src/rotation-gap-audit.test.ts", "expect(currentRotationGapAuditByKey.has('nanally-hexed-dual:nanally-energy-recovery')).toBe(true);", "expect(currentRotationGapAuditByKey.has('nanally-hexed-dual:nanally-energy-recovery')).toBe(false);")
replace_once("src/rotation-gap-audit.test.ts", "expect(currentRotationGapAuditByKey.has('chaos-remora-bomb:chaos-restart')).toBe(true);", "expect(currentRotationGapAuditByKey.has('chaos-remora-bomb:chaos-restart')).toBe(false);")

# Broad current coverage counts in cumulative tests.
for path in Path('src').rglob('*.test.ts'):
    text = path.read_text(encoding='utf-8')
    replacements = {
      'bindingCount: 45': 'bindingCount: 53',
      'fullyBoundSourceStepCount: 12': 'fullyBoundSourceStepCount: 20',
      'unsupportedSourceStepCount: 13': 'unsupportedSourceStepCount: 5',
      'resolvedSinceBaseline: 28': 'resolvedSinceBaseline: 36',
      'total: 13': 'total: 5',
      'toHaveLength(13)': 'toHaveLength(5)',
    }
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

operation_test = '''import { describe, expect, it } from 'vitest';
import { calculateCombatScenario, normalizeCombatScenarioState, type CombatScenarioState } from './combat-scenario';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAuditSummary, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { importRotationPresetToScenario, previewRotationScenarioImport, rotationScenarioBindings, validateRotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { verifiedScenarioOperationById, verifiedScenarioOperations } from './scenario-operations';
import { rotationPresetRecipeAuditById, validateVerifiedRotationRecipes, verifiedRotationRecipeCoverage } from './verified-rotation-recipes';

const bindingMap = {
  'hathor-hyper:hathor-quickswap': 'zero.quick-swap-return-hathor',
  'hathor-hyper:energy-routing': 'hathor.reaction-energy-routing',
  'hathor-hyper:haniel-rebuild': 'haniel.energy-cycle-rebuild',
  'chaos-remora-bomb:chaos-restart': 'hathor.cooldown-restart-chaos',
  'nanally-hexed-dual:nanally-jiuyuan-open': 'jiuyuan.start-position-nanally',
  'nanally-hexed-dual:nanally-energy-recovery': 'sakiri.energy-recovery-preserve-hexed',
  'lacrimosa-discord-dot:lacrimosa-repeat-loop': 'lacrimosa.conditional-support-energy-loop',
  'baicang-firefly-hyper:baicang-restart': 'adler.energy-check-restart',
} as const;

describe('typed verified non-damage operation markers', () => {
  it('publishes eight unique source-backed zero-damage operations', () => {
    expect(verifiedScenarioOperations).toHaveLength(8);
    expect(new Set(verifiedScenarioOperations.map((operation) => operation.id)).size).toBe(8);
    for (const operation of verifiedScenarioOperations) {
      expect(operation.damageContribution).toBe(0);
      expect(operation.durationSeconds).toBeNull();
      expect(operation.sourceUrl.startsWith('https://')).toBe(true);
      expect(operation.sourceCharacter).toBeTruthy();
      expect(operation.summary.ru).toBeTruthy();
      expect(operation.verifiedAt).toBe('2026-08-06');
    }
  });

  it('keeps schema v1 backward compatible through an additive operationId', () => {
    const normalized = normalizeCombatScenarioState({
      version: 1,
      name: 'legacy',
      steps: [{ id: 'old', at: 0, kind: 'wait', sourceSlot: 0, actionId: '', effectId: '', cycleId: '', note: '' }],
    });
    expect(normalized?.steps[0]?.operationId).toBe('');
  });

  it('executes a valid operation without changing damage or active windows', () => {
    const team = initialGameVisibleTeamState();
    team.builds[0] = { ...team.builds[0]!, characterName: 'Jiuyuan' };
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'operation',
      steps: [{
        id: 'op', at: 0, kind: 'operation', sourceSlot: 0,
        actionId: '', effectId: '', cycleId: '', operationId: 'jiuyuan.start-position-nanally', note: '',
      }],
    };
    const result = calculateCombatScenario(team, scenario);
    expect(result.steps[0]).toMatchObject({ status: 'operation', sourceCharacter: 'Jiuyuan' });
    expect(result.steps[0]?.operation?.damageContribution).toBe(0);
    expect(result.totalExpected).toBe(0);
    expect(result.totalNonCrit).toBe(0);
    expect(result.totalCrit).toBe(0);
    expect(result.operationStepCount).toBe(1);
    expect(result.completedOperationCount).toBe(1);
    expect(result.blockedStepCount).toBe(0);
    expect(result.finalActiveEffects).toEqual([]);
    expect(result.finalActiveCycles).toEqual([]);
  });

  it('blocks an unknown or wrong-character operation', () => {
    const team = initialGameVisibleTeamState();
    const scenario: CombatScenarioState = {
      version: 1,
      name: 'invalid',
      steps: [{
        id: 'op', at: 0, kind: 'operation', sourceSlot: 0,
        actionId: '', effectId: '', cycleId: '', operationId: 'jiuyuan.start-position-nanally', note: '',
      }],
    };
    const result = calculateCombatScenario(team, scenario);
    expect(result.steps[0]?.status).toBe('blocked');
    expect(result.completedOperationCount).toBe(0);
    expect(result.blockedStepCount).toBe(1);
  });

  it('adds eight exact full operation-marker bindings', () => {
    for (const [key, operationId] of Object.entries(bindingMap)) {
      expect(rotationScenarioBindings[key]).toEqual({
        coverage: 'full',
        items: [{ kind: 'operation-marker', operationId }],
      });
      expect(verifiedScenarioOperationById.get(operationId as never)).toBeTruthy();
    }
    expect(validateRotationScenarioBindings()).toEqual([]);
  });

  it('imports operations directly and reports them separately from actions and windows', () => {
    let operationSteps = 0;
    for (const presetId of ['hathor-hyper', 'chaos-remora-bomb', 'nanally-hexed-dual', 'lacrimosa-discord-dot', 'baicang-firefly-hyper']) {
      const preset = rotationPresetById.get(presetId)!;
      const imported = importRotationPresetToScenario(preset, initialGameVisibleTeamState(), 'ru');
      const operations = imported.scenario.steps.filter((step) => step.kind === 'operation');
      operationSteps += operations.length;
      expect(imported.report.generatedOperationSteps).toBe(operations.length);
      for (const step of operations) {
        expect(step.operationId).toBeTruthy();
        expect(imported.metadata.pendingByStepId[step.id]).toBeUndefined();
        expect(imported.metadata.originsByStepId[step.id]?.coverage).toBe('full');
      }
      expect(previewRotationScenarioImport(preset).generatedOperationSteps).toBe(operations.length);
    }
    expect(operationSteps).toBe(8);
  });

  it('keeps operations out of action-only recipes with a separate audit counter', () => {
    expect(validateVerifiedRotationRecipes()).toEqual([]);
    const omitted = [...rotationPresetRecipeAuditById.values()].reduce((sum, audit) => sum + audit.omittedOperationMarkers, 0);
    expect(omitted).toBe(8);
    expect(verifiedRotationRecipeCoverage).toMatchObject({
      bindingCount: 53,
      fullyBoundSourceStepCount: 20,
      partiallyBoundSourceStepCount: 33,
      unsupportedSourceStepCount: 5,
      boundActionStepCount: 63,
      promotedActionStepCount: 63,
    });
  });

  it('reduces current audit to five ambiguous variants only', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 36,
      total: 5,
      missingActionRecord: 0,
      effectOrCycleCondition: 0,
      nonDamageOperation: 0,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 113,
    });
  });
});
'''
write('src/typed-operation-markers.test.ts', operation_test)

write('docs/TYPED_OPERATION_MARKER_RECONCILIATION.md', '''# Typed non-damage operation reconciliation\n\nVerified 2026-08-06.\n\n## Why operations are first-class steps\n\nEight Rotation Lab source steps are fully sourced instructions but intentionally contain no deterministic damage action: swaps, Energy routing/rebuild, starting position, cooldown checks and conditional recovery loops. Treating them as unsupported `wait` rows incorrectly implied missing evidence. Treating them as attacks would invent damage.\n\nCombat Scenario therefore adds `kind: operation` and an additive schema-v1 `operationId`. Old saves normalize to an empty operation ID without a version migration.\n\n## Runtime contract\n\n- A valid operation returns status `operation`.\n- Its damage contribution is exactly zero by design.\n- It does not change effects, Cycle windows, action coverage or timeline duration.\n- Unknown IDs or a source-character mismatch are blocked.\n- Manual UI and imported scenarios display the operation title and source instruction.\n\n## Verified registry\n\nThe eight stable IDs map one-to-one to their source preset and source step. Their localized summary and provenance are derived from the Rotation Lab source record, preventing text drift.\n\n## Rotation bindings\n\nAll eight non-damage source steps receive full `operation-marker` bindings. Action-only verified recipes intentionally exclude these markers and report them through `omittedOperationMarkers` rather than treating them as unknown source gaps.\n\n## Coverage\n\n- bindings: 45 → 53;\n- fully bound source steps: 12 → 20;\n- unsupported/current gaps: 13 → 5;\n- current non-damage gaps: 8 → 0;\n- bound/promoted direct action steps remain 63.\n\nThe immutable 41-step baseline remains unchanged. The five remaining current gaps are genuine variant choices rather than missing records or unmodeled operations.\n''')

print('Typed operation-marker patch applied successfully')
