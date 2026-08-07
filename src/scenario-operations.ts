import { rotationPresetById } from './rotation-presets';
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
