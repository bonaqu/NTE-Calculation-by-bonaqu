import { rotationScenarioBindings } from './rotation-scenario-import';
import { rotationPresetById, rotationPresets } from './rotation-presets';
import type { LocalizedText, RotationStep } from './types';
import { visibleActionById } from './verified-visible-actions';

export const ROTATION_GAP_AUDIT_VERSION = 1 as const;

export type RotationGapClassification =
  | 'exact-existing-action'
  | 'compound-existing-actions'
  | 'effect-or-cycle-condition'
  | 'missing-action-record'
  | 'non-damage-operation'
  | 'ambiguous-source-step';

export interface RotationGapAuditEntry {
  version: typeof ROTATION_GAP_AUDIT_VERSION;
  presetId: string;
  sourceStepId: string;
  classification: RotationGapClassification;
  rationale: LocalizedText;
  /** Existing catalog records that look tempting but are semantically wrong for this source step. */
  rejectedActionIds?: readonly string[];
}

export interface RotationMissingActionPriority {
  rank: number;
  characterName: string;
  capability: LocalizedText;
  sourceSteps: readonly string[];
  reason: LocalizedText;
}

const gapKey = (presetId: string, sourceStepId: string): string => `${presetId}:${sourceStepId}`;

const entry = (
  presetId: string,
  sourceStepId: string,
  classification: RotationGapClassification,
  rationale: LocalizedText,
  rejectedActionIds?: readonly string[],
): RotationGapAuditEntry => ({
  version: ROTATION_GAP_AUDIT_VERSION,
  presetId,
  sourceStepId,
  classification,
  rationale,
  ...(rejectedActionIds?.length ? { rejectedActionIds } : {}),
});

const shinkuPassiveIds = [
  'shinku.charge-enhancement.level-11',
  'shinku.menacing-gaze-eight.level-11',
] as const;
const zeroConditionalIds = [
  'zero.blooming-gaze.awakening-one',
  'zero.appraise-and-engrave-extra.awakening-six',
] as const;
const nanallyPassiveIds = [
  'nanally.fair-duel.level-11',
  'nanally.awakening-three-follow-up.level-11',
] as const;
const chaosPassiveIds = [
  'chaos.remora-enhancement.base-five-seconds',
  'chaos.remora-enhancement.maximum-twelve-seconds',
] as const;
const lacrimosaPassiveIds = ['lacrimosa.discord-enhancement.broken-target'] as const;
const jiuyuanPassiveIds = ['jiuyuan.know-every-secret.awakening-six'] as const;
const daffodillWrongVariantIds = [
  'daffodill.echoes.enhanced-sequence.level-10',
  'daffodill.finale.one-parry-extra.level-10',
] as const;

/**
 * Baseline registry for all 41 source steps that had no binding after PR #120.
 * Every row records why the current 86-action catalog may or may not be used.
 */
export const rotationGapAudit: readonly RotationGapAuditEntry[] = [
  // Shinku · Charge team (7)
  entry('shinku-charge', 'shinku-prep', 'ambiguous-source-step', {
    ru: 'Шаг смешивает 8 зарядов, ещё 4 заряда, обычный навык и альтернативную контратаку. Он не задаёт одну воспроизводимую последовательность урона.',
    en: 'The step mixes eight stacks, four more stacks, a normal Skill and an alternative dodge counter. It does not define one reproducible damage sequence.',
  }, shinkuPassiveIds),
  entry('shinku-charge', 'zero-fill', 'missing-action-record', {
    ru: 'Нужны прямые записи сверхспособности и навыка Зеро. Каталог содержит только условные дополнительные удары пробуждений.',
    en: 'Direct Zero Ultimate and Skill records are required. The catalog only contains conditional Awakening extra hits.',
  }, zeroConditionalIds),
  entry('shinku-charge', 'nanally-charge', 'missing-action-record', {
    ru: 'Шаг требует сверхспособность и навык перенаправления Наналли вместе с Цветением и Зарядом. Её текущие пассивные триггеры не заменяют эти применения.',
    en: 'The step requires Nanally Ultimate and Redirect Skill together with Blossom and Charge. Her current passive triggers do not replace those casts.',
  }, nanallyPassiveIds),
  entry('shinku-charge', 'shinku-ultimate', 'missing-action-record', {
    ru: 'В каталоге нет прямого action ID входа Шинку в состояние сверхспособности.',
    en: 'The catalog has no direct action ID for Shinku entering her Ultimate state.',
  }, shinkuPassiveIds),
  entry('shinku-charge', 'shinku-enhanced-skills', 'missing-action-record', {
    ru: 'Источник требует пять усиленных навыков. Один пассивный триггер нельзя повторить пять раз вместо пяти отдельных применений навыка.',
    en: 'The source requires five enhanced Skills. One passive trigger cannot be repeated five times as a substitute for five Skill casts.',
  }, shinkuPassiveIds),
  entry('shinku-charge', 'shinku-dashes', 'missing-action-record', {
    ru: 'Три рывка сверхспособности и завершающий удар не имеют отдельных подтверждённых action ID.',
    en: 'The three Ultimate dashes and finisher do not have separate verified action IDs.',
  }, shinkuPassiveIds),
  entry('shinku-charge', 'shinku-recovery', 'ambiguous-source-step', {
    ru: 'Шаг объединяет набор восьми зарядов, применение неназванного варианта навыка и переключение. Связь с пассивом на восьми уровнях прямо не опубликована.',
    en: 'The step combines building eight stacks, casting an unnamed Skill variant and swapping. A direct link to the eight-stack passive is not published.',
  }, shinkuPassiveIds),

  // Hathor · Hypercarry (7)
  entry('hathor-hyper', 'jiuyuan-open', 'missing-action-record', {
    ru: 'Нужны прямые действия «Расплаты» и навыка перенаправления Цзююань; её A6-ответный триггер относится к другой механике.',
    en: 'Direct Final Reckoning and Jiuyuan Redirect Skill actions are required; her A6 retaliation trigger is a different mechanic.',
  }, jiuyuanPassiveIds),
  entry('hathor-hyper', 'zero-blossom', 'missing-action-record', {
    ru: 'Цветение остаётся условием цикла, а прямое применение сверхспособности Зеро отсутствует в каталоге.',
    en: 'Blossom remains a Cycle condition, while Zero direct Ultimate cast is absent from the catalog.',
  }, zeroConditionalIds),
  entry('hathor-hyper', 'hathor-quickswap', 'non-damage-operation', {
    ru: 'Это быстрое переключение и подготовка возврата без отдельного доказанного урона.',
    en: 'This is a quick swap and return setup without a separate verified damage action.',
  }),
  entry('hathor-hyper', 'zero-third-strike', 'missing-action-record', {
    ru: 'Источник требует навык перенаправления Зеро. Условный A6-дополнительный урон не равен полному применению навыка.',
    en: 'The source requires Zero Redirect Skill. The conditional A6 extra damage is not the full Skill cast.',
  }, zeroConditionalIds),
  entry('hathor-hyper', 'jiuyuan-second-charge', 'effect-or-cycle-condition', {
    ru: 'Шаг описывает переключение, Цветение и последующий Заряд, но не называет самостоятельное действие урона Цзююань.',
    en: 'The step describes a swap, Blossom and the following Charge but names no standalone Jiuyuan damage action.',
  }),
  entry('hathor-hyper', 'energy-routing', 'non-damage-operation', {
    ru: 'Это маршрутизация энергии реакции между Хатор и Ханиэль, а не действие урона.',
    en: 'This routes reaction Energy between Hathor and Haniel rather than dealing damage.',
  }),
  entry('hathor-hyper', 'haniel-rebuild', 'non-damage-operation', {
    ru: 'Шаг восстанавливает энергию и шкалу цикла и возвращает ротацию к началу.',
    en: 'The step rebuilds Energy and the Cycle gauge and returns the rotation to its start.',
  }),

  // Chaos · Remora Bomb (6)
  entry('chaos-remora-bomb', 'chaos-hathor-redirect', 'missing-action-record', {
    ru: 'Полностью удерживаемое «Воздушное командование» исключено из каталога: источник даёт коэффициент тика, но не детерминированное число тиков применения.',
    en: 'Fully held Aerial Command is excluded from the catalog because the source gives a per-tick ratio but no deterministic cast tick count.',
  }),
  entry('chaos-remora-bomb', 'chaos-zero-remora', 'missing-action-record', {
    ru: 'Ремора является условием цикла, а прямое применение сверхспособности Зеро отсутствует. Удары пробуждений не заменяют сверхспособность.',
    en: 'Remora is a Cycle condition and Zero direct Ultimate cast is missing. Awakening hits do not replace the Ultimate.',
  }, zeroConditionalIds),
  entry('chaos-remora-bomb', 'chaos-ultimate', 'missing-action-record', {
    ru: 'В каталоге есть только взрыв усиления Реморы Хаос, но нет прямого действия её сверхспособности.',
    en: 'The catalog contains only Chaos Remora Enhancement detonation, not her direct Ultimate action.',
  }, chaosPassiveIds),
  entry('chaos-remora-bomb', 'chaos-heavy-one', 'missing-action-record', {
    ru: 'Первая усиленная тяжёлая атака Хаос не имеет отдельного action ID.',
    en: 'Chaos first enhanced Heavy Attack has no separate action ID.',
  }, chaosPassiveIds),
  entry('chaos-remora-bomb', 'chaos-heavy-two', 'missing-action-record', {
    ru: 'Вторая усиленная тяжёлая атака Хаос не имеет отдельного action ID.',
    en: 'Chaos second enhanced Heavy Attack has no separate action ID.',
  }, chaosPassiveIds),
  entry('chaos-remora-bomb', 'chaos-restart', 'non-damage-operation', {
    ru: 'Это ожидание перезарядок и возврат к первому шагу без фиксированного действия урона.',
    en: 'This waits for cooldowns and returns to the first step without a fixed damage action.',
  }),

  // Nanally · Dual DPS Hexed (8)
  entry('nanally-hexed-dual', 'nanally-jiuyuan-open', 'non-damage-operation', {
    ru: 'Шаг только задаёт старт на Цзююань и подготовку переключения.',
    en: 'The step only establishes Jiuyuan as the starting character and prepares a swap.',
  }),
  entry('nanally-hexed-dual', 'nanally-zero-blossom', 'missing-action-record', {
    ru: 'Для шага нужны прямые навык перенаправления и сверхспособность Зеро; Цветение отдельно остаётся условием цикла.',
    en: 'The step needs direct Zero Redirect Skill and Ultimate records; Blossom separately remains a Cycle condition.',
  }, zeroConditionalIds),
  entry('nanally-hexed-dual', 'nanally-jiuyuan-hexed', 'missing-action-record', {
    ru: 'Проклятие является условием цикла, а прямые сверхспособность и навык перенаправления Цзююань отсутствуют.',
    en: 'Hexed is a Cycle condition, while direct Jiuyuan Ultimate and Redirect Skill records are missing.',
  }, jiuyuanPassiveIds),
  entry('nanally-hexed-dual', 'nanally-redirect', 'missing-action-record', {
    ru: 'Навык перенаправления Наналли не представлен самостоятельной action-записью.',
    en: 'Nanally Redirect Skill is not represented by a standalone action record.',
  }, nanallyPassiveIds),
  entry('nanally-hexed-dual', 'nanally-ultimate', 'missing-action-record', {
    ru: 'Прямое применение сверхспособности Наналли отсутствует; пассивные дополнительные атаки являются другими действиями.',
    en: 'Nanally direct Ultimate cast is absent; her passive follow-ups are different actions.',
  }, nanallyPassiveIds),
  entry('nanally-hexed-dual', 'nanally-basic-string', 'missing-action-record', {
    ru: 'Пятиударная базовая цепочка не может быть заменена одним Fair Duel или A3-срабатыванием.',
    en: 'The five-hit Basic string cannot be replaced by one Fair Duel or A3 trigger.',
  }, nanallyPassiveIds),
  entry('nanally-hexed-dual', 'nanally-charged-string', 'missing-action-record', {
    ru: 'Три заряженные атаки не имеют отдельных action ID; пассивные срабатывания не доказывают их коэффициенты.',
    en: 'The three Charged Attacks have no separate action IDs; passive triggers do not establish their ratios.',
  }, nanallyPassiveIds),
  entry('nanally-hexed-dual', 'nanally-energy-recovery', 'non-damage-operation', {
    ru: 'Шаг описывает восстановление энергии и сохранение Проклятия для следующего захода без фиксированного числа атак.',
    en: 'The step describes Energy recovery and saving Hexed for the next sequence without a fixed attack count.',
  }),

  // Lacrimosa · DoT Discord (8)
  entry('lacrimosa-discord-dot', 'lacrimosa-transform', 'missing-action-record', {
    ru: 'Преобразующий навык перенаправления Лакримозы не представлен action ID. Бонус по сломленной цели относится к другому триггеру.',
    en: 'Lacrimosa transformation Redirect Skill has no action ID. The Broken-target bonus is a different trigger.',
  }, lacrimosaPassiveIds),
  entry('lacrimosa-discord-dot', 'lacrimosa-scorch', 'effect-or-cycle-condition', {
    ru: 'Шаг запускает Поджог переключением Сакири и сразу возвращается; отдельное действие урона не названо.',
    en: 'The step triggers Scorch by swapping to Sakiri and immediately returns; no standalone damage action is named.',
  }),
  entry('lacrimosa-discord-dot', 'lacrimosa-discord', 'effect-or-cycle-condition', {
    ru: 'Диссонанс задаёт активное окно цикла и общее продолжение атаки, но не одну конкретную атаку Лакримозы.',
    en: 'Discord defines an active Cycle window and generic continued attacking, not one specific Lacrimosa attack.',
  }, lacrimosaPassiveIds),
  entry('lacrimosa-discord-dot', 'lacrimosa-basic-five', 'missing-action-record', {
    ru: 'Пять базовых атак Лакримозы не имеют пяти отдельных или одной полной подтверждённой action-записи.',
    en: 'Lacrimosa five Basic Attacks have neither five separate IDs nor one verified full-string action record.',
  }, lacrimosaPassiveIds),
  entry('lacrimosa-discord-dot', 'lacrimosa-phantom-one', 'missing-action-record', {
    ru: 'Усиленная базовая атака Даффодил не равна Echoes-навыку перенаправления или дополнительному удару парирования Finale.',
    en: 'Daffodill enhanced Basic Attack is not her Echoes Redirect Skill or Finale Parry extra hit.',
  }, daffodillWrongVariantIds),
  entry('lacrimosa-discord-dot', 'lacrimosa-redirect-five', 'missing-action-record', {
    ru: 'Навык перенаправления Лакримозы с переходом к пятой атаке отсутствует в каталоге.',
    en: 'Lacrimosa Redirect Skill that advances to the fifth attack is absent from the catalog.',
  }, lacrimosaPassiveIds),
  entry('lacrimosa-discord-dot', 'lacrimosa-phantom-two', 'missing-action-record', {
    ru: 'Вторая усиленная базовая атака Даффодил также не совпадает с доступными Echoes и Parry-записями.',
    en: 'Daffodill second enhanced Basic Attack likewise does not match the available Echoes and Parry records.',
  }, daffodillWrongVariantIds),
  entry('lacrimosa-discord-dot', 'lacrimosa-repeat-loop', 'non-damage-operation', {
    ru: 'Это условный повтор короткой связки до восстановления энергии, а не фиксированное число новых действий.',
    en: 'This conditionally repeats the short loop until Energy recovers rather than defining a fixed number of new actions.',
  }),

  // Baicang · Firefly Hyper (5)
  entry('baicang-firefly-hyper', 'baicang-adler-open', 'ambiguous-source-step', {
    ru: 'Навык Адлер имеет точную начальную композицию, но в источнике ему предшествует сверхспособность с двумя взаимоисключающими вариантами на 5 или 10 попаданий. Текущая модель пробела не должна переставлять навык перед неразрешённой сверхспособностью.',
    en: 'Adler Skill has an exact initial composition, but the source places it after an Ultimate with mutually exclusive five-hit and ten-hit variants. The current gap model must not move the Skill before the unresolved Ultimate.',
  }, [
    'adler.evils-bane.initial-composition.level-10',
    'adler.tranquility.five-target-hits.level-10',
    'adler.tranquility.single-enemy-ten-hits.level-10',
  ]),
  entry('baicang-firefly-hyper', 'baicang-phantom-one', 'missing-action-record', {
    ru: 'Первая усиленная базовая атака Даффодил не совпадает с Echoes или дополнительным парированием Finale.',
    en: 'Daffodill first enhanced Basic Attack does not match Echoes or the Finale Parry extra hit.',
  }, daffodillWrongVariantIds),
  entry('baicang-firefly-hyper', 'baicang-phantom-two', 'missing-action-record', {
    ru: 'Вторая усиленная базовая атака Даффодил не совпадает с доступными вариантами её навыка и сверхспособности.',
    en: 'Daffodill second enhanced Basic Attack does not match her available Skill and Ultimate variants.',
  }, daffodillWrongVariantIds),
  entry('baicang-firefly-hyper', 'baicang-dodge-spam', 'ambiguous-source-step', {
    ru: 'Шаг объединяет неизвестное число заряженных атак после уклонения, контрудары и навык по готовности. Одна запись Silenced Thought не доказывает число повторов всей смеси.',
    en: 'The step combines an unknown number of Dodge Charged Attacks, counters and a Skill when available. One Silenced Thought record does not establish the repeat count of the whole mixture.',
  }, [
    'baicang.silenced-thought.full-composition.level-10',
    'baicang.heart-of-heaven-and-earth.level-10',
    'baicang.such-crime.level-10',
  ]),
  entry('baicang-firefly-hyper', 'baicang-restart', 'non-damage-operation', {
    ru: 'Это проверка энергии и возврат к Адлер без самостоятельного урона.',
    en: 'This checks team Energy and returns to Adler without standalone damage.',
  }),
];

export const rotationGapAuditByKey = new Map(
  rotationGapAudit.map((item) => [gapKey(item.presetId, item.sourceStepId), item]),
);

export const rotationGapClassificationLabels: Readonly<Record<RotationGapClassification, LocalizedText>> = {
  'exact-existing-action': { ru: 'Точное действие уже есть', en: 'Exact existing action' },
  'compound-existing-actions': { ru: 'Комбинация действий уже есть', en: 'Existing action combination' },
  'effect-or-cycle-condition': { ru: 'Условие эффекта или цикла', en: 'Effect or Cycle condition' },
  'missing-action-record': { ru: 'Не хватает action-записи', en: 'Missing action record' },
  'non-damage-operation': { ru: 'Небоевое действие', en: 'Non-damage operation' },
  'ambiguous-source-step': { ru: 'Неоднозначный исходный шаг', en: 'Ambiguous source step' },
};

export const rotationGapAuditSummary = Object.freeze({
  total: rotationGapAudit.length,
  exactExistingAction: rotationGapAudit.filter((item) => item.classification === 'exact-existing-action').length,
  compoundExistingActions: rotationGapAudit.filter((item) => item.classification === 'compound-existing-actions').length,
  effectOrCycleCondition: rotationGapAudit.filter((item) => item.classification === 'effect-or-cycle-condition').length,
  missingActionRecord: rotationGapAudit.filter((item) => item.classification === 'missing-action-record').length,
  nonDamageOperation: rotationGapAudit.filter((item) => item.classification === 'non-damage-operation').length,
  ambiguousSourceStep: rotationGapAudit.filter((item) => item.classification === 'ambiguous-source-step').length,
  safelyBindableUnsupportedSteps: 0,
  existingCatalogExhausted: true,
});

export const rotationMissingActionPriorities: readonly RotationMissingActionPriority[] = [
  {
    rank: 1,
    characterName: 'Shinku',
    capability: { ru: 'сверхспособность, 5 усиленных навыков и 3 рывка', en: 'Ultimate, five enhanced Skills and three dashes' },
    sourceSteps: ['shinku-ultimate', 'shinku-enhanced-skills', 'shinku-dashes', 'shinku-recovery'],
    reason: { ru: 'Откроет реальную атакующую часть ротации Шинку вместо одной подготовки Хатор.', en: 'Unlocks Shinku actual damage window instead of only Hathor preparation.' },
  },
  {
    rank: 2,
    characterName: 'Nanally',
    capability: { ru: 'навык перенаправления, сверхспособность, 5 базовых и 3 заряженные атаки', en: 'Redirect Skill, Ultimate, five Basics and three Charged Attacks' },
    sourceSteps: ['nanally-redirect', 'nanally-ultimate', 'nanally-basic-string', 'nanally-charged-string'],
    reason: { ru: 'Даст Наналли минимум два точных исходных шага и позволит решить вопрос повышения её пресета.', en: 'Gives Nanally at least two exact source steps and enables an evidence-based promotion decision.' },
  },
  {
    rank: 3,
    characterName: 'Chaos',
    capability: { ru: 'сверхспособность и две усиленные тяжёлые атаки', en: 'Ultimate and two enhanced Heavy Attacks' },
    sourceSteps: ['chaos-ultimate', 'chaos-heavy-one', 'chaos-heavy-two'],
    reason: { ru: 'Текущий рецепт Хаос содержит только подготовку Ханиэль и завершение Хатор.', en: 'The current Chaos recipe contains only Haniel setup and Hathor closure.' },
  },
  {
    rank: 4,
    characterName: 'Lacrimosa',
    capability: { ru: 'преобразование, базовая цепочка и переход к пятой атаке', en: 'transformation, Basic string and fifth-attack advance' },
    sourceSteps: ['lacrimosa-transform', 'lacrimosa-basic-five', 'lacrimosa-redirect-five'],
    reason: { ru: 'Добавит действия самой Лакримозы в её частичный рецепт.', en: 'Adds Lacrimosa own actions to her partial recipe.' },
  },
  {
    rank: 5,
    characterName: 'Daffodill',
    capability: { ru: 'первая и вторая усиленные базовые атаки', en: 'first and second enhanced Basic Attacks' },
    sourceSteps: ['lacrimosa-phantom-one', 'lacrimosa-phantom-two', 'baicang-phantom-one', 'baicang-phantom-two'],
    reason: { ru: 'Одна пара точных записей закроет четыре повторно используемых шага двух пресетов.', en: 'One exact pair closes four reused source steps across two presets.' },
  },
  {
    rank: 6,
    characterName: 'Zero',
    capability: { ru: 'прямые сверхспособность и навык перенаправления', en: 'direct Ultimate and Redirect Skill' },
    sourceSteps: ['zero-fill', 'zero-blossom', 'zero-third-strike', 'nanally-zero-blossom', 'chaos-zero-remora'],
    reason: { ru: 'Зеро участвует в четырёх пресетах, а текущие A1/A6-записи покрывают только условные дополнительные удары.', en: 'Zero appears in four presets while current A1/A6 records cover only conditional extra hits.' },
  },
];

function currentUnsupportedSteps(): Array<{ presetId: string; step: RotationStep }> {
  const result: Array<{ presetId: string; step: RotationStep }> = [];
  for (const preset of rotationPresets) {
    for (const step of preset.steps) {
      if (!rotationScenarioBindings[gapKey(preset.id, step.id)]) result.push({ presetId: preset.id, step });
    }
  }
  return result;
}

export function validateRotationGapAudit(): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();

  for (const item of rotationGapAudit) {
    const key = gapKey(item.presetId, item.sourceStepId);
    if (item.version !== ROTATION_GAP_AUDIT_VERSION) errors.push(`Invalid gap-audit version: ${key}`);
    if (keys.has(key)) errors.push(`Duplicate gap-audit entry: ${key}`);
    keys.add(key);

    const preset = rotationPresetById.get(item.presetId);
    const step = preset?.steps.find((candidate) => candidate.id === item.sourceStepId);
    if (!preset || !step) errors.push(`Unknown gap-audit source step: ${key}`);
    if (rotationScenarioBindings[key]) errors.push(`Gap-audit entry unexpectedly has a binding: ${key}`);

    for (const actionId of item.rejectedActionIds ?? []) {
      const action = visibleActionById.get(actionId);
      if (!action) errors.push(`Unknown rejected action: ${key}:${actionId}`);
      if (action && step && action.characterName !== step.actor) {
        errors.push(`Rejected action actor mismatch: ${key}:${actionId}`);
      }
    }
  }

  const unsupported = currentUnsupportedSteps();
  for (const { presetId, step } of unsupported) {
    const key = gapKey(presetId, step.id);
    if (!keys.has(key)) errors.push(`Unclassified unsupported source step: ${key}`);
  }
  for (const key of keys) {
    const [presetId, ...stepParts] = key.split(':');
    const stepId = stepParts.join(':');
    if (!unsupported.some((item) => item.presetId === presetId && item.step.id === stepId)) {
      errors.push(`Gap-audit entry is not currently unsupported: ${key}`);
    }
  }

  if (rotationGapAuditSummary.total !== 41) errors.push(`Expected 41 audited gaps, got ${rotationGapAuditSummary.total}`);
  if (rotationGapAuditSummary.missingActionRecord !== 26) errors.push('Expected 26 missing-action records');
  if (rotationGapAuditSummary.effectOrCycleCondition !== 3) errors.push('Expected 3 effect/Cycle conditions');
  if (rotationGapAuditSummary.nonDamageOperation !== 8) errors.push('Expected 8 non-damage operations');
  if (rotationGapAuditSummary.ambiguousSourceStep !== 4) errors.push('Expected 4 ambiguous source steps');
  if (rotationGapAuditSummary.exactExistingAction !== 0 || rotationGapAuditSummary.compoundExistingActions !== 0) {
    errors.push('Unsupported steps must not claim a safe existing-action match');
  }

  return errors;
}
