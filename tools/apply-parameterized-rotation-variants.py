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
        raise RuntimeError(f'{path}: expected one anchor, found {count}: {old[:180]!r}')
    write(path, content.replace(old, new, 1))


# ---------- Rotation import domain ----------
replace_once(
    'src/rotation-scenario-import.ts',
    "import type { EsperCycleId, Locale, RotationPreset, RotationStep } from './types';",
    "import type { EsperCycleId, Locale, LocalizedText, RotationPreset, RotationStep } from './types';",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "export type RotationScenarioSourceCoverage = 'full' | 'partial' | 'unsupported';",
    "export type RotationScenarioSourceCoverage = 'full' | 'partial' | 'variant-required' | 'unsupported';",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  | { kind: 'activate-cycle'; cycleId: EsperCycleId }\n  | { kind: 'operation-marker'; operationId: VerifiedScenarioOperationId };",
    "  | { kind: 'activate-cycle'; cycleId: EsperCycleId }\n  | { kind: 'operation-marker'; operationId: VerifiedScenarioOperationId }\n  | { kind: 'variant-marker'; variantId: string; note: LocalizedText };",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "export interface RotationScenarioBinding {\n  coverage: Exclude<RotationScenarioSourceCoverage, 'unsupported'>;\n  items: readonly RotationScenarioBindingAtom[];\n}\n",
    "export interface RotationScenarioBinding {\n  coverage: Extract<RotationScenarioSourceCoverage, 'full' | 'partial'>;\n  items: readonly RotationScenarioBindingAtom[];\n}\n\nexport type RotationScenarioVariantSelectionValue = string | number;\nexport type RotationScenarioVariantSelections = Readonly<Record<string, RotationScenarioVariantSelectionValue>>;\n\ninterface RotationScenarioVariantControlBase {\n  id: string;\n  presetId: string;\n  title: LocalizedText;\n  description: LocalizedText;\n}\n\nexport interface RotationScenarioSelectVariantControl extends RotationScenarioVariantControlBase {\n  kind: 'select';\n  options: readonly { id: string; label: LocalizedText; description: LocalizedText }[];\n}\n\nexport interface RotationScenarioCountVariantControl extends RotationScenarioVariantControlBase {\n  kind: 'count';\n  minimum: number;\n  maximum: number;\n}\n\nexport type RotationScenarioVariantControl = RotationScenarioSelectVariantControl | RotationScenarioCountVariantControl;\n\nexport interface RotationScenarioVariantRequirement {\n  presetId: string;\n  sourceStepId: string;\n  controlIds: readonly string[];\n  rationale: LocalizedText;\n}\n\nexport const rotationScenarioVariantControls: readonly RotationScenarioVariantControl[] = [\n  {\n    id: 'lacrimosa.form',\n    presetId: 'lacrimosa-discord-dot',\n    kind: 'select',\n    title: { ru: 'Форма атак Лакримозы', en: 'Lacrimosa attack form' },\n    description: { ru: 'Один выбор согласованно применяется к полной базовой цепочке и пятой атаке.', en: 'One selection is applied consistently to the full Basic string and fifth attack.' },\n    options: [\n      { id: 'tomato-metal', label: { ru: 'Tomato Metal · ближняя форма', en: 'Tomato Metal · melee form' }, description: { ru: '974,3% прямая цепочка; пятая атака 386,3%.', en: '974.3% direct string; 386.3% fifth attack.' } },\n      { id: 'tomato-percussion', label: { ru: 'Tomato Percussion · дальняя форма', en: 'Tomato Percussion · ranged form' }, description: { ru: '1127,6% полная цепочка; пятая атака 247,7%.', en: '1127.6% full string; 247.7% fifth attack.' } },\n    ],\n  },\n  {\n    id: 'lacrimosa.redirect-skill',\n    presetId: 'lacrimosa-discord-dot',\n    kind: 'select',\n    title: { ru: 'Вариант навыка перенаправления', en: 'Redirect Skill variant' },\n    description: { ru: 'Morning Tomato имеет собственный коэффициент. Devilish Gift копирует внешнюю способность и остаётся видимым marker.', en: 'Morning Tomato has a native ratio. Devilish Gift copies an external ability and remains a visible marker.' },\n    options: [\n      { id: 'morning-tomato', label: { ru: 'Morning Tomato', en: 'Morning Tomato' }, description: { ru: 'Точный прямой урон 599,7% АТК.', en: 'Exact 599.7% ATK direct damage.' } },\n      { id: 'devilish-gift', label: { ru: 'Devilish Gift', en: 'Devilish Gift' }, description: { ru: 'Урон зависит от скопированной внешней способности и не синтезируется.', en: 'Damage depends on the copied external ability and is not synthesized.' } },\n    ],\n  },\n  {\n    id: 'baicang.adler-ultimate-mode',\n    presetId: 'baicang-firefly-hyper',\n    kind: 'select',\n    title: { ru: 'Режим сверхспособности Адлер', en: 'Adler Ultimate mode' },\n    description: { ru: 'Источник допускает взаимоисключающие варианты на 5 или 10 попаданий.', en: 'The source allows mutually exclusive five-hit or ten-hit variants.' },\n    options: [\n      { id: 'five-target-hits', label: { ru: '5 попаданий по нескольким целям', en: '5 hits across multiple targets' }, description: { ru: 'Использует точный five-target action ID.', en: 'Uses the exact five-target action ID.' } },\n      { id: 'single-enemy-ten-hits', label: { ru: '10 попаданий по одной цели', en: '10 hits against one enemy' }, description: { ru: 'Использует точный single-enemy ten-hit action ID.', en: 'Uses the exact single-enemy ten-hit action ID.' } },\n    ],\n  },\n  {\n    id: 'baicang.dodge-charged-count',\n    presetId: 'baicang-firefly-hyper',\n    kind: 'count',\n    title: { ru: 'Число Dodge Charged Attack Байканг', en: 'Baicang Dodge Charged Attack count' },\n    description: { ru: 'Задаёт конечное число Silenced Thought. Контратаки и Skill when ready остаются visible remainder.', en: 'Sets a finite Silenced Thought count. Counters and Skill when ready remain a visible remainder.' },\n    minimum: 1,\n    maximum: 20,\n  },\n];\n\nexport const rotationScenarioVariantRequirements: readonly RotationScenarioVariantRequirement[] = [\n  { presetId: 'lacrimosa-discord-dot', sourceStepId: 'lacrimosa-transform', controlIds: ['lacrimosa.redirect-skill'], rationale: { ru: 'Нужно выбрать Morning Tomato либо Devilish Gift.', en: 'Choose Morning Tomato or Devilish Gift.' } },\n  { presetId: 'lacrimosa-discord-dot', sourceStepId: 'lacrimosa-basic-five', controlIds: ['lacrimosa.form'], rationale: { ru: 'Нужно выбрать ближнюю либо дальнюю форму полной цепочки.', en: 'Choose the melee or ranged full string.' } },\n  { presetId: 'lacrimosa-discord-dot', sourceStepId: 'lacrimosa-redirect-five', controlIds: ['lacrimosa.redirect-skill', 'lacrimosa.form'], rationale: { ru: 'Нужно выбрать Redirect Skill и согласованную форму пятой атаки.', en: 'Choose the Redirect Skill and matching fifth-attack form.' } },\n  { presetId: 'baicang-firefly-hyper', sourceStepId: 'baicang-adler-open', controlIds: ['baicang.adler-ultimate-mode'], rationale: { ru: 'Нужно выбрать 5-hit либо 10-hit Ultimate Адлер.', en: 'Choose Adler five-hit or ten-hit Ultimate.' } },\n  { presetId: 'baicang-firefly-hyper', sourceStepId: 'baicang-dodge-spam', controlIds: ['baicang.dodge-charged-count'], rationale: { ru: 'Нужно задать конечное число Dodge Charged Attack.', en: 'Set a finite Dodge Charged Attack count.' } },\n];\n\nconst variantControlById = new Map(rotationScenarioVariantControls.map((control) => [control.id, control]));\nexport const rotationScenarioVariantSourceKeys = new Set(\n  rotationScenarioVariantRequirements.map((requirement) => `${requirement.presetId}:${requirement.sourceStepId}`),\n);\n\nexport function rotationScenarioVariantControlsForPreset(presetId: string): readonly RotationScenarioVariantControl[] {\n  return rotationScenarioVariantControls.filter((control) => control.presetId === presetId);\n}\n\nexport function normalizeRotationScenarioVariantSelections(\n  presetId: string,\n  value: unknown,\n): RotationScenarioVariantSelections {\n  if (!isRecord(value)) return {};\n  const result: Record<string, RotationScenarioVariantSelectionValue> = {};\n  for (const control of rotationScenarioVariantControlsForPreset(presetId)) {\n    const raw = value[control.id];\n    if (control.kind === 'select') {\n      if (typeof raw === 'string' && control.options.some((option) => option.id === raw)) result[control.id] = raw;\n      continue;\n    }\n    if (typeof raw === 'number' && Number.isInteger(raw) && raw >= control.minimum && raw <= control.maximum) {\n      result[control.id] = raw;\n    }\n  }\n  return result;\n}\n\nexport function unresolvedRotationScenarioVariantControls(\n  presetId: string,\n  selections: RotationScenarioVariantSelections,\n): readonly RotationScenarioVariantControl[] {\n  const normalized = normalizeRotationScenarioVariantSelections(presetId, selections);\n  return rotationScenarioVariantControlsForPreset(presetId).filter((control) => normalized[control.id] === undefined);\n}\n",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  generatedOperationSteps: number;\n  generatedPartialRemainderSteps:",
    "  generatedOperationSteps: number;\n  generatedVariantMarkerSteps: number;\n  variantRequiredSourceSteps: number;\n  generatedPartialRemainderSteps:",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  pendingByStepId: Record<string, PendingRotationCondition>;\n}",
    "  pendingByStepId: Record<string, PendingRotationCondition>;\n  variantSelections: RotationScenarioVariantSelections;\n}",
)

# Variant resolver after binding table.
variant_resolver = '''

function variantRequirementForStep(presetId: string, sourceStepId: string): RotationScenarioVariantRequirement | undefined {
  return rotationScenarioVariantRequirements.find((requirement) => (
    requirement.presetId === presetId && requirement.sourceStepId === sourceStepId
  ));
}

function lacrimosaFormAction(form: RotationScenarioVariantSelectionValue | undefined, fifth = false): string | null {
  if (form === 'tomato-metal') return fifth
    ? 'lacrimosa.tomato-metal.fifth.level-10'
    : 'lacrimosa.tomato-metal.full-direct-sequence.level-10';
  if (form === 'tomato-percussion') return fifth
    ? 'lacrimosa.tomato-percussion.fifth.level-10'
    : 'lacrimosa.tomato-percussion.full-sequence.level-10';
  return null;
}

function variantBindingForStep(
  preset: RotationPreset,
  step: RotationStep,
  selections: RotationScenarioVariantSelections,
): RotationScenarioBinding | null {
  const normalized = normalizeRotationScenarioVariantSelections(preset.id, selections);
  if (preset.id === 'lacrimosa-discord-dot') {
    const redirect = normalized['lacrimosa.redirect-skill'];
    const form = normalized['lacrimosa.form'];
    if (step.id === 'lacrimosa-transform') {
      if (redirect === 'morning-tomato') return {
        coverage: 'partial',
        items: [{ kind: 'action-sequence', actionIds: ['lacrimosa.morning-tomato.level-10'] }],
      };
      if (redirect === 'devilish-gift') return {
        coverage: 'partial',
        items: [{
          kind: 'variant-marker',
          variantId: 'lacrimosa.devilish-gift.copied-external-ability',
          note: {
            ru: 'Выбран Devilish Gift: прямой урон зависит от скопированной внешней способности и не добавлен в расчёт.',
            en: 'Devilish Gift selected: direct damage depends on the copied external ability and is not added to the calculation.',
          },
        }],
      };
      return null;
    }
    if (step.id === 'lacrimosa-basic-five') {
      const actionId = lacrimosaFormAction(form);
      return actionId ? { coverage: 'full', items: [{ kind: 'action-sequence', actionIds: [actionId] }] } : null;
    }
    if (step.id === 'lacrimosa-redirect-five') {
      const fifthActionId = lacrimosaFormAction(form, true);
      if (!fifthActionId || !redirect) return null;
      if (redirect === 'morning-tomato') return {
        coverage: 'full',
        items: [{ kind: 'action-sequence', actionIds: ['lacrimosa.morning-tomato.level-10', fifthActionId] }],
      };
      return {
        coverage: 'partial',
        items: [
          {
            kind: 'variant-marker',
            variantId: 'lacrimosa.devilish-gift.copied-external-ability',
            note: {
              ru: 'Devilish Gift выбран, но его скопированная внешняя способность не имеет фиксированного action ID.',
              en: 'Devilish Gift is selected, but its copied external ability has no fixed action ID.',
            },
          },
          { kind: 'action-sequence', actionIds: [fifthActionId] },
        ],
      };
    }
  }
  if (preset.id === 'baicang-firefly-hyper' && step.id === 'baicang-adler-open') {
    const mode = normalized['baicang.adler-ultimate-mode'];
    const ultimateId = mode === 'five-target-hits'
      ? 'adler.tranquility.five-target-hits.level-10'
      : mode === 'single-enemy-ten-hits'
        ? 'adler.tranquility.single-enemy-ten-hits.level-10'
        : null;
    return ultimateId ? {
      coverage: 'full',
      items: [{ kind: 'action-sequence', actionIds: [ultimateId, 'adler.evils-bane.initial-composition.level-10'] }],
    } : null;
  }
  if (preset.id === 'baicang-firefly-hyper' && step.id === 'baicang-dodge-spam') {
    const count = normalized['baicang.dodge-charged-count'];
    if (typeof count !== 'number') return null;
    return {
      coverage: 'partial',
      items: [
        { kind: 'action-sequence', actionIds: Array.from({ length: count }, () => 'baicang.silenced-thought.full-composition.level-10') },
        {
          kind: 'variant-marker',
          variantId: 'baicang.dodge-spam.counter-and-skill-order',
          note: {
            ru: 'Число Dodge Charged Attack задано пользователем. Количество и порядок контратак и навыка по готовности источник не фиксирует.',
            en: 'The Dodge Charged Attack count is user-selected. The source does not fix the count or order of counters and Skill casts when ready.',
          },
        },
      ],
    };
  }
  return null;
}
'''
replace_once(
    'src/rotation-scenario-import.ts',
    "};\n\nfunction isRecord(value: unknown): value is Record<string, unknown> {",
    "};" + variant_resolver + "\nfunction isRecord(value: unknown): value is Record<string, unknown> {",
)

# Metadata and normalization.
replace_once(
    'src/rotation-scenario-import.ts',
    "    pendingByStepId: {},\n  };",
    "    pendingByStepId: {},\n    variantSelections: {},\n  };",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "      const coverage = raw.coverage === 'full' || raw.coverage === 'partial' || raw.coverage === 'unsupported'",
    "      const coverage = raw.coverage === 'full' || raw.coverage === 'partial' || raw.coverage === 'variant-required' || raw.coverage === 'unsupported'",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  const preset = rotationPresetById.get(sourceRotationId);\n  const rawReport = isRecord(value.report) ? value.report : null;\n  const report = preset && rawReport ? previewRotationScenarioImport(preset) : null;",
    "  const preset = rotationPresetById.get(sourceRotationId);\n  const variantSelections = normalizeRotationScenarioVariantSelections(preset?.id ?? '', value.variantSelections);\n  const rawReport = isRecord(value.report) ? value.report : null;\n  const report = preset && rawReport ? previewRotationScenarioImport(preset, variantSelections) : null;",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "      origin.coverage = sourceStep\n        ? validatedBinding(preset, sourceStep)?.coverage ?? 'unsupported'\n        : 'unsupported';",
    "      origin.coverage = sourceStep\n        ? validatedBinding(preset, sourceStep, variantSelections)?.coverage\n          ?? (variantRequirementForStep(preset.id, sourceStep.id) ? 'variant-required' : 'unsupported')\n        : 'unsupported';",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    pendingByStepId,\n  };",
    "    pendingByStepId,\n    variantSelections,\n  };",
)

# Fingerprint, validation and selected binding.
replace_once(
    'src/rotation-scenario-import.ts',
    "  if (atom.kind === 'activate-cycle') return `cycle:${atom.cycleId}`;\n  return `operation:${atom.operationId}`;",
    "  if (atom.kind === 'activate-cycle') return `cycle:${atom.cycleId}`;\n  if (atom.kind === 'operation-marker') return `operation:${atom.operationId}`;\n  return `variant:${atom.variantId}`;",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  const operation = verifiedScenarioOperationById.get(atom.operationId);\n  return operation?.presetId === preset.id\n    && operation.sourceStepId === step.id\n    && operation.sourceCharacter === step.actor;",
    "  if (atom.kind === 'operation-marker') {\n    const operation = verifiedScenarioOperationById.get(atom.operationId);\n    return operation?.presetId === preset.id\n      && operation.sourceStepId === step.id\n      && operation.sourceCharacter === step.actor;\n  }\n  return Boolean(atom.variantId && atom.note.ru && atom.note.en);",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "function validatedBinding(preset: RotationPreset, step: RotationStep): RotationScenarioBinding | null {\n  const candidate = rotationScenarioBindings[binding(preset.id, step.id)];\n  if (!candidate || candidate.items.length === 0) return null;",
    "function validatedBinding(\n  preset: RotationPreset,\n  step: RotationStep,\n  selections: RotationScenarioVariantSelections = {},\n): RotationScenarioBinding | null {\n  const candidate = rotationScenarioBindings[binding(preset.id, step.id)]\n    ?? variantBindingForStep(preset, step, selections);\n  if (!candidate || candidate.items.length === 0) return null;",
)

# Variant-required note.
replace_once(
    'src/rotation-scenario-import.ts',
    "function partialRemainderNote(step: RotationStep, locale: Locale): string {",
    "function variantRequiredNote(preset: RotationPreset, step: RotationStep, locale: Locale): string {\n  const requirement = variantRequirementForStep(preset.id, step.id);\n  const prefix = locale === 'ru' ? 'Требуется выбор варианта:' : 'Variant selection required:';\n  return `${prefix} ${requirement?.rationale[locale] ?? stepNote(step, locale)}`.slice(0, 400);\n}\n\nfunction partialRemainderNote(step: RotationStep, locale: Locale): string {",
)

# importedSteps selections/report.
replace_once(
    'src/rotation-scenario-import.ts',
    "function importedSteps(preset: RotationPreset, locale: Locale): {",
    "function importedSteps(\n  preset: RotationPreset,\n  locale: Locale,\n  selections: RotationScenarioVariantSelections = {},\n): {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  let generatedOperationSteps = 0;\n  let generatedPartialRemainderSteps = 0;",
    "  let generatedOperationSteps = 0;\n  let generatedVariantMarkerSteps = 0;\n  let variantRequiredSourceSteps = 0;\n  let generatedPartialRemainderSteps = 0;",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    const matched = sourceSlot >= 0 ? validatedBinding(preset, sourceStep) : null;\n\n    if (!matched) {\n      append({\n        ...baseScenarioStep(preset, sourceStep, sourceIndex, Math.max(0, sourceSlot), 0),\n        note: stepNote(sourceStep, locale),\n      }, sourceStep, 0, 'unsupported');\n      return;\n    }",
    "    const matched = sourceSlot >= 0 ? validatedBinding(preset, sourceStep, selections) : null;\n\n    if (!matched) {\n      const variantRequired = sourceSlot >= 0 && Boolean(variantRequirementForStep(preset.id, sourceStep.id));\n      append({\n        ...baseScenarioStep(preset, sourceStep, sourceIndex, Math.max(0, sourceSlot), 0),\n        note: variantRequired ? variantRequiredNote(preset, sourceStep, locale) : stepNote(sourceStep, locale),\n      }, sourceStep, 0, variantRequired ? 'variant-required' : 'unsupported');\n      if (variantRequired) variantRequiredSourceSteps += 1;\n      return;\n    }",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    let part = 0;\n    for (const atom of matched.items) {",
    "    let part = 0;\n    let hasVariantMarker = false;\n    for (const atom of matched.items) {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "      if (atom.kind === 'operation-marker') {\n        append({",
    "      if (atom.kind === 'variant-marker') {\n        append({\n          ...baseScenarioStep(preset, sourceStep, sourceIndex, sourceSlot, part),\n          note: atom.note[locale],\n        }, sourceStep, part, matched.coverage);\n        generatedVariantMarkerSteps += 1;\n        hasVariantMarker = true;\n        part += 1;\n        continue;\n      }\n\n      if (atom.kind === 'operation-marker') {\n        append({",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    if (matched.coverage === 'partial') {",
    "    if (matched.coverage === 'partial' && !hasVariantMarker) {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  const unsupportedSourceSteps = preset.steps.length - mappedSourceSteps;",
    "  const unsupportedSourceSteps = preset.steps.length - mappedSourceSteps - variantRequiredSourceSteps;",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    generatedOperationSteps,\n    generatedPartialRemainderSteps,",
    "    generatedOperationSteps,\n    generatedVariantMarkerSteps,\n    variantRequiredSourceSteps,\n    generatedPartialRemainderSteps,",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "      pendingByStepId,\n    },",
    "      pendingByStepId,\n      variantSelections: normalizeRotationScenarioVariantSelections(preset.id, selections),\n    },",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "export function previewRotationScenarioImport(preset: RotationPreset): RotationScenarioImportReport {\n  return importedSteps(preset, 'ru').report;\n}",
    "export function previewRotationScenarioImport(\n  preset: RotationPreset,\n  selections: RotationScenarioVariantSelections = {},\n): RotationScenarioImportReport {\n  return importedSteps(preset, 'ru', selections).report;\n}",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  locale: Locale,\n): RotationScenarioImportResult {",
    "  locale: Locale,\n  selections: RotationScenarioVariantSelections = {},\n): RotationScenarioImportResult {",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "  const generated = importedSteps(preset, locale);",
    "  const normalizedSelections = normalizeRotationScenarioVariantSelections(preset.id, selections);\n  const unresolved = unresolvedRotationScenarioVariantControls(preset.id, normalizedSelections);\n  if (unresolved.length > 0) {\n    throw new Error(`Rotation preset ${preset.id} requires variant selections: ${unresolved.map((control) => control.id).join(', ')}`);\n  }\n  const generated = importedSteps(preset, locale, normalizedSelections);",
)
replace_once(
    'src/rotation-scenario-import.ts',
    "    coverage: origin.coverage ?? validatedBinding(preset, step)?.coverage ?? 'unsupported',",
    "    coverage: origin.coverage\n      ?? validatedBinding(preset, step, metadata.variantSelections)?.coverage\n      ?? (variantRequirementForStep(preset.id, step.id) ? 'variant-required' : 'unsupported'),",
)

# Variant registry validation appended to existing validator.
replace_once(
    'src/rotation-scenario-import.ts',
    "  for (const [key, candidate] of Object.entries(rotationScenarioBindings)) {",
    "  for (const control of rotationScenarioVariantControls) {\n    if (!rotationPresetById.has(control.presetId)) errors.push(`Unknown variant-control preset: ${control.id}`);\n    if (control.kind === 'select' && (control.options.length < 2 || new Set(control.options.map((option) => option.id)).size !== control.options.length)) {\n      errors.push(`Invalid select variant control: ${control.id}`);\n    }\n    if (control.kind === 'count' && (!Number.isInteger(control.minimum) || !Number.isInteger(control.maximum) || control.minimum < 0 || control.maximum < control.minimum)) {\n      errors.push(`Invalid count variant control: ${control.id}`);\n    }\n  }\n  for (const requirement of rotationScenarioVariantRequirements) {\n    const key = binding(requirement.presetId, requirement.sourceStepId);\n    if (!knownKeys.has(key)) errors.push(`Unknown variant source step: ${key}`);\n    if (rotationScenarioBindings[key]) errors.push(`Variant source step also has a fixed binding: ${key}`);\n    for (const controlId of requirement.controlIds) {\n      const control = variantControlById.get(controlId);\n      if (!control || control.presetId !== requirement.presetId) errors.push(`Invalid variant control reference: ${key}:${controlId}`);\n    }\n  }\n  const sampleSelections: Record<string, Record<string, RotationScenarioVariantSelectionValue>> = {};\n  for (const control of rotationScenarioVariantControls) {\n    sampleSelections[control.presetId] ??= {};\n    sampleSelections[control.presetId]![control.id] = control.kind === 'select' ? control.options[0]!.id : control.minimum;\n  }\n  for (const requirement of rotationScenarioVariantRequirements) {\n    const preset = rotationPresetById.get(requirement.presetId);\n    const step = preset?.steps.find((entry) => entry.id === requirement.sourceStepId);\n    if (preset && step && !validatedBinding(preset, step, sampleSelections[preset.id] ?? {})) {\n      errors.push(`Unresolvable variant source step: ${requirement.presetId}:${requirement.sourceStepId}`);\n    }\n  }\n\n  for (const [key, candidate] of Object.entries(rotationScenarioBindings)) {",
)

# ---------- Manual import UI ----------
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  previewRotationScenarioImport,\n  ROTATION_SCENARIO_IMPORT_STORAGE_KEY,",
    "  previewRotationScenarioImport,\n  rotationScenarioVariantControlsForPreset,\n  unresolvedRotationScenarioVariantControls,\n  ROTATION_SCENARIO_IMPORT_STORAGE_KEY,",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  type RotationScenarioImportMetadata,\n  type RotationScenarioSourceCoverage,",
    "  type RotationScenarioImportMetadata,\n  type RotationScenarioSourceCoverage,\n  type RotationScenarioVariantSelections,",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  if (coverage === 'partial') return ru ? 'частично' : 'partial';\n  return ru ? 'не связано' : 'unsupported';",
    "  if (coverage === 'partial') return ru ? 'частично' : 'partial';\n  if (coverage === 'variant-required') return ru ? 'нужен выбор' : 'variant required';\n  return ru ? 'не связано' : 'unsupported';",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  const [selectedRotationId, setSelectedRotationId] = useState(rotationPresets[0]?.id ?? '');",
    "  const [selectedRotationId, setSelectedRotationId] = useState(rotationPresets[0]?.id ?? '');\n  const [variantSelections, setVariantSelections] = useState<RotationScenarioVariantSelections>({});",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "  const importPreview = useMemo(\n    () => selectedPreset ? previewRotationScenarioImport(selectedPreset) : null,\n    [selectedPreset],\n  );",
    "  const variantControls = useMemo(\n    () => rotationScenarioVariantControlsForPreset(selectedPreset?.id ?? ''),\n    [selectedPreset?.id],\n  );\n  const unresolvedVariantControls = useMemo(\n    () => unresolvedRotationScenarioVariantControls(selectedPreset?.id ?? '', variantSelections),\n    [selectedPreset?.id, variantSelections],\n  );\n  const importPreview = useMemo(\n    () => selectedPreset ? previewRotationScenarioImport(selectedPreset, variantSelections) : null,\n    [selectedPreset, variantSelections],\n  );",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "    const imported = importRotationPresetToScenario(selectedPreset, team, locale);",
    "    const imported = importRotationPresetToScenario(selectedPreset, team, locale, variantSelections);",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "        <label><span>{ru ? 'Ротация' : 'Rotation'}</span><select value={selectedRotationId} onChange={(event) => setSelectedRotationId(event.target.value)}>{rotationPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title[locale]}</option>)}</select></label>\n        <button type=\"button\" onClick={importRotation} disabled={!selectedPreset}><Download size={16} />{ru ? 'Импортировать' : 'Import'}</button>",
    "        <label><span>{ru ? 'Ротация' : 'Rotation'}</span><select value={selectedRotationId} onChange={(event) => { setSelectedRotationId(event.target.value); setVariantSelections({}); }}>{rotationPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title[locale]}</option>)}</select></label>\n        <button type=\"button\" onClick={importRotation} disabled={!selectedPreset || unresolvedVariantControls.length > 0}><Download size={16} />{ru ? 'Импортировать' : 'Import'}</button>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "      </div>\n      {selectedPreset && importPreview ? <div className=\"rotation-scenario-preview\">",
    "      </div>\n      {variantControls.length ? <div className=\"rotation-scenario-variant-controls\" aria-label={ru ? 'Обязательные варианты импорта' : 'Required import variants'}>\n        {variantControls.map((control) => <label key={control.id}>\n          <span>{control.title[locale]}</span>\n          {control.kind === 'select' ? <select value={typeof variantSelections[control.id] === 'string' ? String(variantSelections[control.id]) : ''} onChange={(event) => setVariantSelections((current) => ({ ...current, [control.id]: event.target.value }))}>\n            <option value=\"\">{ru ? 'Выбери вариант' : 'Select a variant'}</option>\n            {control.options.map((option) => <option value={option.id} key={option.id}>{option.label[locale]}</option>)}\n          </select> : <input type=\"number\" min={control.minimum} max={control.maximum} value={typeof variantSelections[control.id] === 'number' ? Number(variantSelections[control.id]) : ''} onChange={(event) => {\n            const value = event.target.value === '' ? undefined : Number(event.target.value);\n            setVariantSelections((current) => {\n              const next = { ...current };\n              if (value === undefined) delete next[control.id];\n              else next[control.id] = Math.trunc(value);\n              return next;\n            });\n          }} />}\n          <small>{control.description[locale]}</small>\n        </label>)}\n        {unresolvedVariantControls.length ? <p>{ru\n          ? `До импорта заполни: ${unresolvedVariantControls.map((control) => control.title.ru).join(', ')}.`\n          : `Complete before import: ${unresolvedVariantControls.map((control) => control.title.en).join(', ')}.`}</p> : null}\n      </div> : null}\n      {selectedPreset && importPreview ? <div className=\"rotation-scenario-preview\">",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "        <div className=\"coverage-unsupported\"><span>{ru ? 'Не связано' : 'Unsupported'}</span><b>{importPreview.unsupportedSourceSteps}</b></div>",
    "        <div className=\"coverage-unsupported\"><span>{ru ? 'Нужен выбор' : 'Variant required'}</span><b>{importPreview.variantRequiredSourceSteps}</b></div>\n        <div className=\"coverage-unsupported\"><span>{ru ? 'Не связано' : 'Unsupported'}</span><b>{importPreview.unsupportedSourceSteps}</b></div>",
)
replace_once(
    'src/components/ManualTeamCombatScenarioEditor.tsx',
    "        <div><span>{ru ? 'Операций' : 'Operations'}</span><b>{importPreview.generatedOperationSteps}</b></div>",
    "        <div><span>{ru ? 'Операций' : 'Operations'}</span><b>{importPreview.generatedOperationSteps}</b></div>\n        <div><span>{ru ? 'Variant markers' : 'Variant markers'}</span><b>{importPreview.generatedVariantMarkerSteps}</b></div>",
)

# ---------- Current audit and panel ----------
replace_once(
    'src/rotation-gap-audit-current.ts',
    "import { rotationScenarioBindings } from './rotation-scenario-import';",
    "import {\n  rotationScenarioBindings,\n  rotationScenarioVariantRequirements,\n  rotationScenarioVariantSourceKeys,\n} from './rotation-scenario-import';",
)
replace_once(
    'src/rotation-gap-audit-current.ts',
    "export const currentRotationGapAudit: readonly RotationGapAuditEntry[] = baselineRotationGapAudit.filter(\n  (item) => !rotationScenarioBindings[gapKey(item.presetId, item.sourceStepId)],\n)",
    "export const currentRotationGapAudit: readonly RotationGapAuditEntry[] = baselineRotationGapAudit.filter(\n  (item) => !rotationScenarioBindings[gapKey(item.presetId, item.sourceStepId)]\n    && !rotationScenarioVariantSourceKeys.has(gapKey(item.presetId, item.sourceStepId)),\n)",
)
replace_once(
    'src/rotation-gap-audit-current.ts',
    "  verifiedActionCatalogCount: visibleActionById.size,",
    "  verifiedActionCatalogCount: visibleActionById.size,\n  parameterizedVariantSourceSteps: rotationScenarioVariantRequirements.length,",
)
replace_once(
    'src/rotation-gap-audit-current.ts',
    "    .filter((step) => !rotationScenarioBindings[gapKey(preset.id, step.id)])",
    "    .filter((step) => !rotationScenarioBindings[gapKey(preset.id, step.id)]\n      && !rotationScenarioVariantSourceKeys.has(gapKey(preset.id, step.id)))",
)
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 36) errors.push('Expected thirty-six source steps resolved since baseline');", "if (currentRotationGapAuditSummary.resolvedSinceBaseline !== 41) errors.push('Expected all forty-one source steps modeled since baseline');")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.total !== 5) errors.push(`Expected 5 current gaps, got ${currentRotationGapAuditSummary.total}`);", "if (currentRotationGapAuditSummary.total !== 0) errors.push(`Expected no current unsupported gaps, got ${currentRotationGapAuditSummary.total}`);")
replace_once('src/rotation-gap-audit-current.ts', "if (currentRotationGapAuditSummary.ambiguousSourceStep !== 5) errors.push('Expected 5 current ambiguous source steps');", "if (currentRotationGapAuditSummary.ambiguousSourceStep !== 0) errors.push('Expected no current ambiguous source steps');\n  if (currentRotationGapAuditSummary.parameterizedVariantSourceSteps !== 5) errors.push('Expected five parameterized variant source steps');")

replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "import { rotationPresetById, rotationPresets } from '../rotation-presets';",
    "import { rotationPresetById, rotationPresets } from '../rotation-presets';\nimport { rotationScenarioVariantRequirements } from '../rotation-scenario-import';",
)
replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "  const entries = currentRotationGapAudit.filter((item) => item.presetId === selectedPreset?.id);",
    "  const entries = currentRotationGapAudit.filter((item) => item.presetId === selectedPreset?.id);\n  const variantRequirements = rotationScenarioVariantRequirements.filter((item) => item.presetId === selectedPreset?.id);",
)
replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "          ? `${currentRotationGapAuditSummary.total} ТЕКУЩИХ ПРОБЕЛОВ · ${currentRotationGapAuditSummary.resolvedSinceBaseline} ЗАКРЫТО С BASELINE`\n          : `${currentRotationGapAuditSummary.total} CURRENT GAPS · ${currentRotationGapAuditSummary.resolvedSinceBaseline} CLOSED SINCE BASELINE`}",
    "          ? `${currentRotationGapAuditSummary.total} НЕПОДДЕРЖИВАЕМЫХ ПРОБЕЛОВ · ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} ВАРИАНТОВ С ВЫБОРОМ`\n          : `${currentRotationGapAuditSummary.total} UNSUPPORTED GAPS · ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} USER-SELECTED VARIANTS`}",
)
replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "      <div><b>{currentRotationGapAuditSummary.resolvedSinceBaseline}</b><span>{ru ? 'закрыто точно' : 'closed exactly'}</span></div>",
    "      <div><b>{currentRotationGapAuditSummary.parameterizedVariantSourceSteps}</b><span>{ru ? 'нужен выбор' : 'user-selected'}</span></div>\n      <div><b>{currentRotationGapAuditSummary.resolvedSinceBaseline}</b><span>{ru ? 'смоделировано' : 'modeled'}</span></div>",
)
replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "          }) : <div className=\"rotation-gap-audit__safe-result\"><CheckCircle2 size={18} /><span>{ru",
    "          }) : null}\n          {variantRequirements.map((item) => {\n            const step = selectedPreset?.steps.find((candidate) => candidate.id === item.sourceStepId);\n            return <details key={`variant:${item.presetId}:${item.sourceStepId}`}>\n              <summary>\n                <span className=\"rotation-gap-audit__badge ambiguous\">{ru ? 'Выбор пользователя' : 'User selection'}</span>\n                <b>{localizedCharacterName(step?.actor ?? '', locale)}</b>\n                <span>{step?.instruction[locale] ?? item.sourceStepId}</span>\n              </summary>\n              <p>{item.rationale[locale]}</p>\n            </details>;\n          })}\n          {!entries.length && !variantRequirements.length ? <div className=\"rotation-gap-audit__safe-result\"><CheckCircle2 size={18} /><span>{ru",
)
replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "            : 'This preset has no fully unsupported source steps left.'}</span></div>}",
    "            : 'This preset has no unsupported or parameterized source steps left.'}</span></div> : null}",
)
replace_once(
    'src/components/RotationGapAuditPanel.tsx',
    "          ? `Каталог из ${currentRotationGapAuditSummary.verifiedActionCatalogCount} действий проверяется без fuzzy matching: текущие ${currentRotationGapAuditSummary.total} пробелов не получили семантических подмен.`\n          : `The ${currentRotationGapAuditSummary.verifiedActionCatalogCount}-action catalog is checked without fuzzy matching: the current ${currentRotationGapAuditSummary.total} gaps received no semantic substitutions.`}",
    "          ? `Каталог из ${currentRotationGapAuditSummary.verifiedActionCatalogCount} действий проверяется без fuzzy matching: неподдерживаемых пробелов нет, а ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} вариантов требуют явного выбора.`\n          : `The ${currentRotationGapAuditSummary.verifiedActionCatalogCount}-action catalog is checked without fuzzy matching: no unsupported gaps remain, while ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} variants require explicit selection.`}",
)

# ---------- Action-only recipe variant gap semantics ----------
replace_once(
    'src/verified-rotation-recipes.ts',
    "  rotationScenarioBindings,\n  type RotationScenarioBinding,",
    "  rotationScenarioBindings,\n  rotationScenarioVariantSourceKeys,\n  type RotationScenarioBinding,",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  | 'non-damage-operation';",
    "  | 'non-damage-operation'\n  | 'variant-choice-required';",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "  if (kind === 'unconfirmed-cycle') {",
    "  if (kind === 'variant-choice-required') {\n    return {\n      ru: `Шаг «${step.instruction.ru}» параметризован, но action-only рецепт не выбирает вариант за пользователя.`,\n      en: `The step “${step.instruction.en}” is parameterized, but the action-only recipe does not choose a variant for the user.`,\n    };\n  }\n  if (kind === 'unconfirmed-cycle') {",
)
replace_once(
    'src/verified-rotation-recipes.ts',
    "    if (!matched) {\n      gaps.push({\n        sourceStepId: sourceStep.id,\n        sourceStepIndex,\n        part: 0,\n        kind: 'unsupported-source-step',\n        note: gapNote('unsupported-source-step', sourceStep),\n      });",
    "    if (!matched) {\n      const kind: VerifiedRotationRecipeGapKind = rotationScenarioVariantSourceKeys.has(bindingKey(preset.id, sourceStep.id))\n        ? 'variant-choice-required'\n        : 'unsupported-source-step';\n      gaps.push({\n        sourceStepId: sourceStep.id,\n        sourceStepIndex,\n        part: 0,\n        kind,\n        note: gapNote(kind, sourceStep),\n      });",
)

# ---------- Tests ----------
variant_test = '''import { describe, expect, it } from 'vitest';
import { initialGameVisibleTeamState } from './game-visible-build';
import { currentRotationGapAudit, currentRotationGapAuditSummary, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import {
  importRotationPresetToScenario,
  initialRotationScenarioImportMetadata,
  normalizeRotationScenarioImportMetadata,
  previewRotationScenarioImport,
  rotationScenarioVariantControls,
  rotationScenarioVariantRequirements,
  rotationScenarioVariantSourceKeys,
  unresolvedRotationScenarioVariantControls,
  validateRotationScenarioBindings,
  type RotationScenarioVariantSelections,
} from './rotation-scenario-import';
import { rotationPresetById } from './rotation-presets';
import { rotationPresetRecipeAuditById, verifiedRotationRecipeById } from './verified-rotation-recipes';

function actionsForSourceStep(presetId: string, sourceStepId: string, selections: RotationScenarioVariantSelections) {
  const imported = importRotationPresetToScenario(rotationPresetById.get(presetId)!, initialGameVisibleTeamState(), 'en', selections);
  return {
    imported,
    steps: imported.scenario.steps.filter((step) => imported.metadata.originsByStepId[step.id]?.sourceStepId === sourceStepId),
  };
}

describe('parameterized Rotation Lab variant choices', () => {
  it('publishes four controls covering five exact source requirements', () => {
    expect(rotationScenarioVariantControls).toHaveLength(4);
    expect(new Set(rotationScenarioVariantControls.map((control) => control.id)).size).toBe(4);
    expect(rotationScenarioVariantRequirements).toHaveLength(5);
    expect(rotationScenarioVariantSourceKeys.size).toBe(5);
    expect(validateRotationScenarioBindings()).toEqual([]);
  });

  it('reports variant-required rows instead of unsupported rows before selection', () => {
    const lacrimosa = previewRotationScenarioImport(rotationPresetById.get('lacrimosa-discord-dot')!);
    const baicang = previewRotationScenarioImport(rotationPresetById.get('baicang-firefly-hyper')!);
    expect(lacrimosa).toMatchObject({ variantRequiredSourceSteps: 3, unsupportedSourceSteps: 0 });
    expect(baicang).toMatchObject({ variantRequiredSourceSteps: 2, unsupportedSourceSteps: 0 });
    expect(unresolvedRotationScenarioVariantControls('lacrimosa-discord-dot', {})).toHaveLength(2);
    expect(unresolvedRotationScenarioVariantControls('baicang-firefly-hyper', {})).toHaveLength(2);
  });

  it('keeps import metadata v1 backward compatible and persists valid selections', () => {
    expect(initialRotationScenarioImportMetadata().variantSelections).toEqual({});
    const normalized = normalizeRotationScenarioImportMetadata({
      version: 1,
      sourceRotationId: 'lacrimosa-discord-dot',
      timingStatus: 'order-only',
      report: {},
      originsByStepId: {},
      pendingByStepId: {},
      variantSelections: { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato', junk: 'x' },
    });
    expect(normalized?.variantSelections).toEqual({
      'lacrimosa.form': 'tomato-metal',
      'lacrimosa.redirect-skill': 'morning-tomato',
    });
    expect(normalizeRotationScenarioImportMetadata({
      version: 1, sourceRotationId: '', timingStatus: 'none', report: null, originsByStepId: {}, pendingByStepId: {},
    })?.variantSelections).toEqual({});
  });

  it('applies one Lacrimosa form consistently to the full string and fifth attack', () => {
    const selections = { 'lacrimosa.form': 'tomato-metal', 'lacrimosa.redirect-skill': 'morning-tomato' } as const;
    const full = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-basic-five', selections);
    const redirect = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-redirect-five', selections);
    expect(full.steps.map((step) => step.actionId).filter(Boolean)).toEqual(['lacrimosa.tomato-metal.full-direct-sequence.level-10']);
    expect(redirect.steps.map((step) => step.actionId).filter(Boolean)).toEqual([
      'lacrimosa.morning-tomato.level-10',
      'lacrimosa.tomato-metal.fifth.level-10',
    ]);
    expect(full.imported.report.variantRequiredSourceSteps).toBe(0);
    expect(full.imported.metadata.variantSelections).toEqual(selections);
  });

  it('keeps Devilish Gift visible without inventing copied damage', () => {
    const selections = { 'lacrimosa.form': 'tomato-percussion', 'lacrimosa.redirect-skill': 'devilish-gift' } as const;
    const transform = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-transform', selections);
    const redirect = actionsForSourceStep('lacrimosa-discord-dot', 'lacrimosa-redirect-five', selections);
    expect(transform.steps).toHaveLength(1);
    expect(transform.steps[0]).toMatchObject({ kind: 'wait', actionId: '' });
    expect(transform.steps[0]?.note).toContain('copied external ability');
    expect(redirect.steps.map((step) => step.actionId).filter(Boolean)).toEqual(['lacrimosa.tomato-percussion.fifth.level-10']);
    expect(redirect.steps.some((step) => step.note.includes('copied external ability'))).toBe(true);
    expect(transform.imported.report.generatedVariantMarkerSteps).toBeGreaterThanOrEqual(2);
  });

  it('uses mutually exclusive Adler Ultimate variants before Evils Bane', () => {
    const five = actionsForSourceStep('baicang-firefly-hyper', 'baicang-adler-open', {
      'baicang.adler-ultimate-mode': 'five-target-hits',
      'baicang.dodge-charged-count': 1,
    });
    const ten = actionsForSourceStep('baicang-firefly-hyper', 'baicang-adler-open', {
      'baicang.adler-ultimate-mode': 'single-enemy-ten-hits',
      'baicang.dodge-charged-count': 1,
    });
    expect(five.steps.map((step) => step.actionId)).toEqual([
      'adler.tranquility.five-target-hits.level-10',
      'adler.evils-bane.initial-composition.level-10',
    ]);
    expect(ten.steps.map((step) => step.actionId)).toEqual([
      'adler.tranquility.single-enemy-ten-hits.level-10',
      'adler.evils-bane.initial-composition.level-10',
    ]);
  });

  it('uses the user-selected finite Baicang count and preserves the unknown mixture as a marker', () => {
    const result = actionsForSourceStep('baicang-firefly-hyper', 'baicang-dodge-spam', {
      'baicang.adler-ultimate-mode': 'single-enemy-ten-hits',
      'baicang.dodge-charged-count': 3,
    });
    expect(result.steps.filter((step) => step.actionId === 'baicang.silenced-thought.full-composition.level-10')).toHaveLength(3);
    expect(result.steps.filter((step) => step.kind === 'wait')).toHaveLength(1);
    expect(result.steps.find((step) => step.kind === 'wait')?.note).toContain('does not fix the count or order');
    expect(() => importRotationPresetToScenario(
      rotationPresetById.get('baicang-firefly-hyper')!,
      initialGameVisibleTeamState(),
      'en',
      { 'baicang.adler-ultimate-mode': 'five-target-hits', 'baicang.dodge-charged-count': 21 },
    )).toThrow(/requires variant selections/);
  });

  it('removes unsupported gaps while keeping five parameterized requirements visible', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAudit).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 41,
      total: 0,
      ambiguousSourceStep: 0,
      parameterizedVariantSourceSteps: 5,
    });
    expect(rotationPresetRecipeAuditById.get('lacrimosa-discord-dot')?.unsupportedSourceSteps).toBe(3);
    expect(rotationPresetRecipeAuditById.get('baicang-firefly-hyper')?.unsupportedSourceSteps).toBe(2);
    expect(verifiedRotationRecipeById.get('rotation-lab.lacrimosa-discord-dot.verified-actions')?.gaps.filter((gap) => gap.kind === 'variant-choice-required')).toHaveLength(3);
    expect(verifiedRotationRecipeById.get('rotation-lab.baicang-firefly-hyper.verified-actions')?.gaps.filter((gap) => gap.kind === 'variant-choice-required')).toHaveLength(2);
  });
});
'''
write('src/parameterized-rotation-variants.test.ts', variant_test)

write('docs/PARAMETERIZED_ROTATION_VARIANTS.md', '''# Parameterized Rotation Lab variants\n\nVerified 2026-08-07.\n\n## Principle\n\nThe final five baseline gaps were not missing records. Each source step allowed mutually exclusive forms, target modes or an open-ended repeat count. A default binding would therefore be a guess. Rotation import now requires explicit selections and keeps the static action-only recipes parameter-free.\n\n## Controls\n\n- Lacrimosa form: Tomato Metal or Tomato Percussion. One value drives both the full Basic string and the fifth attack.\n- Lacrimosa Redirect Skill: Morning Tomato or Devilish Gift. Morning Tomato uses its exact native action; Devilish Gift creates a visible marker because copied external damage is not deterministic.\n- Adler Ultimate mode: five target hits or ten hits against one enemy. Both options preserve Ultimate → Evils Bane order.\n- Baicang Dodge Charged count: integer 1–20. The selected number creates exactly that many Silenced Thought actions. Counter and Skill count/order remain a visible marker.\n\n## Import semantics\n\n- Missing selections are `variant-required`, not unsupported.\n- The UI disables import until every preset control is complete.\n- Metadata schema v1 stores normalized `variantSelections` additively.\n- Variant markers are zero-damage wait rows with explicit provenance text; they never create hidden actions or seconds.\n- Preview and import reports separately count variant-required source steps and generated variant markers.\n\n## Audit semantics\n\nThe immutable 41-step baseline remains unchanged. Current unsupported gaps become zero because every source step now has a fixed binding, typed semantic model, operation marker or parameterized variant model. Five variant requirements remain visible in the audit panel and import controls.\n\nAction-only recipes intentionally keep five `variant-choice-required` gaps because they cannot select a user-specific branch.\n''')

print('Parameterized Rotation Lab variant patch applied successfully')
