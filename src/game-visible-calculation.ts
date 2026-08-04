import { calculateDamage, type DamageResult, type EnemyProfile } from '../packages/calculation-core/src';
import {
  combatCoverageByCharacter,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
  type VisibleTestModeId,
} from './game-visible-build';
import type { LocalizedText } from './types';

export interface VerifiedVisibleAction {
  id: string;
  characterName: string;
  title: LocalizedText;
  description: LocalizedText;
  multiplier: number;
  requiredSkill: 'basic' | 'skill' | 'ultimate' | 'support';
  requiredLevel: number | '—';
  minimumAwakening?: number;
  requiresLowerLevelTarget?: boolean;
  defenceIgnore?: number;
  assumedConditions?: readonly LocalizedText[];
  sourcePublisher: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export interface VisibleCalculationCondition {
  id: string;
  label: LocalizedText;
  source: 'player' | 'verified-data' | 'test-preset';
}

export interface VisibleBuildCalculation {
  supported: boolean;
  mode: VisibleTestModeId;
  title: LocalizedText;
  explanation: LocalizedText;
  result?: DamageResult;
  multiplier?: number;
  conditions: readonly VisibleCalculationCondition[];
  blockedReason?: LocalizedText;
  normalizedReference: boolean;
}

export interface VisibleTeamCalculation {
  rows: readonly VisibleBuildCalculation[];
  totalExpected: number;
  comparableRows: number;
  allRowsComparable: boolean;
}

const source = (character: string) => `https://www.prydwen.gg/neverness-to-everness/characters/${character}`;

/**
 * Only standalone actions whose complete coefficient and trigger are explicit in
 * a current source are exposed. A record represents one trigger, not a full
 * animation string, burst window or rotation.
 */
export const verifiedVisibleActions: readonly VerifiedVisibleAction[] = [
  {
    id: 'shinku.charge-enhancement.level-11',
    characterName: 'Shinku',
    title: { ru: 'Срабатывание усиления Зарядки', en: 'Charge Enhancement trigger' },
    description: {
      ru: 'Одно срабатывание пассивного урона при 11-м уровне базовой атаки. Это не вся ротация Шинку.',
      en: 'One passive damage trigger at Basic Attack level 11. This is not Shinku’s full rotation.',
    },
    multiplier: 863.6,
    requiredSkill: 'basic',
    requiredLevel: 11,
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('shinku'),
    sourceUpdatedAt: '2026-07-13',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'shinku.menacing-gaze-eight.level-11',
    characterName: 'Shinku',
    title: { ru: 'Мгновенный удар: 8 уровней состояния', en: 'Instant Strike: 8 state stacks' },
    description: {
      ru: 'Дополнительный урон при восьми уровнях особого состояния и 11-м уровне базовой атаки. Исходная карточка указывает 215,9% АТК за уровень.',
      en: 'Bonus damage at eight special-state stacks and Basic Attack level 11. The source lists 215.9% ATK per stack.',
    },
    multiplier: 215.9 * 8,
    requiredSkill: 'basic',
    requiredLevel: 11,
    assumedConditions: [{
      ru: 'Набрано 8 уровней указанного в источнике состояния.',
      en: 'Eight stacks of the source-listed state are active.',
    }],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('shinku'),
    sourceUpdatedAt: '2026-07-13',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'nanally.fair-duel.level-11',
    characterName: 'Nanally',
    title: { ru: 'Честная дуэль: одно срабатывание', en: 'Fair Duel: one trigger' },
    description: {
      ru: 'Одна дополнительная атака пассивного навыка «Честная дуэль» при 11-м уровне базовой атаки. Это не весь период «Авторитета Ити-дайме».',
      en: 'One Fair Duel follow-up at Basic Attack level 11. This is not the full Ichi-daime’s Authority window.',
    },
    multiplier: 129.5,
    requiredSkill: 'basic',
    requiredLevel: 11,
    assumedConditions: [{
      ru: 'Активен «Авторитет Ити-дайме», и команда нанесла один экземпляр урона цикла эспера.',
      en: 'Ichi-daime’s Authority is active and the team dealt one instance of Esper Cycle damage.',
    }],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('nanally'),
    sourceUpdatedAt: '2026-06-23',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'nanally.awakening-three-follow-up.level-11',
    characterName: 'Nanally',
    title: { ru: 'Пробуждение 3: одна дополнительная атака', en: 'Awakening 3: one follow-up' },
    description: {
      ru: 'Одно дополнительное срабатывание пробуждения 3 при 11-м уровне базовой атаки. Сайт не умножает его на длительность состояния автоматически.',
      en: 'One Awakening 3 follow-up at Basic Attack level 11. The site does not automatically multiply it by the state duration.',
    },
    multiplier: 107.9,
    requiredSkill: 'basic',
    requiredLevel: 11,
    minimumAwakening: 3,
    assumedConditions: [{
      ru: 'Активен «Авторитет Ити-дайме», и Наналли нанесла один экземпляр урона.',
      en: 'Ichi-daime’s Authority is active and Nanally dealt one instance of damage.',
    }],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('nanally'),
    sourceUpdatedAt: '2026-06-23',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'chaos.remora-enhancement.base-five-seconds',
    characterName: 'Chaos',
    title: { ru: 'Усиление Реморы: базовые 5 секунд', en: 'Remora Enhancement: base 5 seconds' },
    description: {
      ru: 'Одно завершение Реморы с базовой длительностью 5 секунд: 800% АТК. Это отдельный пассивный взрыв, а не атака Хаоса в окне сверхспособности.',
      en: 'One Remora end at its base five-second duration: 800% ATK. This is a standalone passive detonation, not Chaos’s Ultimate-window rotation.',
    },
    multiplier: 800,
    requiredSkill: 'basic',
    requiredLevel: '—',
    assumedConditions: [{
      ru: 'Ремора завершилась через базовые 5 секунд и не была обновлена.',
      en: 'Remora ended at its base five-second duration and was not reapplied.',
    }],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('chaos'),
    sourceUpdatedAt: '2026-07-08',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'chaos.remora-enhancement.maximum-twelve-seconds',
    characterName: 'Chaos',
    title: { ru: 'Усиление Реморы: максимум 12 секунд', en: 'Remora Enhancement: maximum 12 seconds' },
    description: {
      ru: 'Максимально продлённая Ремора: базовые 800% АТК увеличиваются на предельные 300%, поэтому одно завершение даёт 3200% АТК. Это не вся ротация Хаоса.',
      en: 'Maximum-duration Remora: the base 800% ATK is increased by the capped 300%, producing 3200% ATK for one end trigger. This is not Chaos’s full rotation.',
    },
    multiplier: 800 * 4,
    requiredSkill: 'basic',
    requiredLevel: '—',
    assumedConditions: [{
      ru: 'Ремора продлена до 12 секунд; прирост достиг указанного в источнике ограничения +300%.',
      en: 'Remora was extended to 12 seconds and reached the source-listed +300% increase cap.',
    }],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('chaos'),
    sourceUpdatedAt: '2026-07-08',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'lacrimosa.discord-enhancement.broken-target',
    characterName: 'Lacrimosa',
    title: { ru: 'Усиление Диссонанса: сломленная цель', en: 'Discord Enhancement: Broken target' },
    description: {
      ru: 'Одно дополнительное срабатывание на 400% АТК, когда Диссонанс срабатывает по уже сломленной цели. Это не включает обычный урон Диссонанса.',
      en: 'One 400% ATK bonus trigger when Discord activates on an already Broken target. This excludes Discord’s normal damage.',
    },
    multiplier: 400,
    requiredSkill: 'basic',
    requiredLevel: '—',
    assumedConditions: [{
      ru: 'Цель уже сломлена в момент срабатывания Диссонанса.',
      en: 'The target is already Broken when Discord triggers.',
    }],
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('lacrimosa'),
    sourceUpdatedAt: '2026-06-23',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'zero.blooming-gaze.awakening-one',
    characterName: 'Zero',
    title: { ru: 'Пробуждение 1: дополнительный удар', en: 'Awakening 1: additional hit' },
    description: {
      ru: 'Один дополнительный удар на 200% АТК по цели ниже уровнем. Для этого отдельного удара учитывается 75% игнорирования защиты.',
      en: 'One additional 200% ATK hit against a lower-level target. This standalone hit applies 75% DEF Ignore.',
    },
    multiplier: 200,
    requiredSkill: 'basic',
    requiredLevel: '—',
    minimumAwakening: 1,
    requiresLowerLevelTarget: true,
    defenceIgnore: 75,
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('zero'),
    sourceUpdatedAt: '2026-05-31',
    verifiedAt: '2026-08-04',
  },
  {
    id: 'zero.appraise-and-engrave-extra.awakening-six',
    characterName: 'Zero',
    title: { ru: 'Пробуждение 6: дополнительный урон навыка', en: 'Awakening 6: Skill extra damage' },
    description: {
      ru: 'Дополнительный урон «Оценки и гравировки» на 300% АТК по первой подходящей цели ниже уровнем. Основные четыре удара навыка сюда не входят.',
      en: 'The 300% ATK extra damage from Appraise and Engrave against the first eligible lower-level target. The Skill’s four main hits are excluded.',
    },
    multiplier: 300,
    requiredSkill: 'basic',
    requiredLevel: '—',
    minimumAwakening: 6,
    requiresLowerLevelTarget: true,
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: source('zero'),
    sourceUpdatedAt: '2026-05-31',
    verifiedAt: '2026-08-04',
  },
];

export const visibleActionById = new Map(verifiedVisibleActions.map((action) => [action.id, action]));

const titleByMode: Record<VisibleTestModeId, LocalizedText> = {
  'neutral-reference': { ru: 'Контрольный удар 100% АТК', en: '100% ATK reference hit' },
  'burst-reference': { ru: 'Контрольный удар после сверхспособности', en: 'Post-Ultimate reference hit' },
  'training-target': { ru: 'Контрольный удар по заданной цели', en: 'Reference hit against custom target' },
  'verified-action': { ru: 'Проверенное действие персонажа', en: 'Verified character action' },
};

const referenceExplanation: LocalizedText = {
  ru: 'Это нормализованный тест, а не заявленный урон конкретного навыка. Он нужен для честного сравнения видимых характеристик и условий.',
  en: 'This is a normalized test, not a claimed skill result. It exists to compare visible stats and conditions honestly.',
};

const blushingMirageDamage = [32, 36.8, 41.6, 46.4, 51.2] as const;
const blushingMirageDefIgnore = [12, 13.8, 15.6, 17.4, 19.2] as const;

function arcConditional(build: GameVisibleCharacterBuild, mode: VisibleTestModeId): {
  damageBonus: number;
  defenceIgnore: number;
  conditions: VisibleCalculationCondition[];
} {
  if (
    build.arc.arcName !== 'Blushing Mirage'
    || mode !== 'burst-reference'
    || !build.arc.afterUltimateActive
  ) {
    return { damageBonus: 0, defenceIgnore: 0, conditions: [] };
  }
  const index = Math.min(4, Math.max(0, Math.trunc(build.arc.mixingRank) - 1));
  return {
    damageBonus: blushingMirageDamage[index] ?? blushingMirageDamage[0],
    defenceIgnore: blushingMirageDefIgnore[index] ?? blushingMirageDefIgnore[0],
    conditions: [{
      id: 'arc.blushing-mirage.after-ultimate',
      label: {
        ru: `«Алеющий мираж» P${index + 1}: окно после сверхспособности`,
        en: `Blushing Mirage M${index + 1}: post-Ultimate window`,
      },
      source: 'verified-data',
    }],
  };
}

function targetFromState(state: GameVisibleTeamState, mode: VisibleTestModeId): EnemyProfile {
  if (mode === 'neutral-reference' || mode === 'burst-reference') {
    return {
      level: state.target.level,
      resistance: 0,
      defenceReduction: 0,
      resistanceReduction: 0,
    };
  }
  return {
    level: state.target.level,
    resistance: state.target.resistance,
    defenceReduction: state.target.defenceReduction,
    resistanceReduction: state.target.resistanceReduction,
  };
}

function blocked(
  mode: VisibleTestModeId,
  reason: LocalizedText,
): VisibleBuildCalculation {
  return {
    supported: false,
    mode,
    title: titleByMode[mode],
    explanation: referenceExplanation,
    conditions: [],
    blockedReason: reason,
    normalizedReference: mode !== 'verified-action',
  };
}

function validateActionRequirements(
  action: VerifiedVisibleAction,
  build: GameVisibleCharacterBuild,
  state: GameVisibleTeamState,
): LocalizedText | null {
  if (typeof action.requiredLevel === 'number') {
    const actualLevel = build.skills[action.requiredSkill];
    if (actualLevel !== action.requiredLevel) {
      return {
        ru: `Для этого коэффициента нужен уровень ${action.requiredLevel}. На другом уровне сайт не интерполирует значения и не придумывает формулу роста.`,
        en: `This coefficient requires level ${action.requiredLevel}. The site does not interpolate or invent scaling for another level.`,
      };
    }
  }
  if (action.minimumAwakening !== undefined && build.awakeningLevel < action.minimumAwakening) {
    return {
      ru: `Для действия требуется пробуждение ${action.minimumAwakening} или выше.`,
      en: `This action requires Awakening ${action.minimumAwakening} or higher.`,
    };
  }
  if (action.requiresLowerLevelTarget && state.target.level >= build.level) {
    return {
      ru: `Цель должна быть ниже уровня персонажа. Сейчас персонаж ${build.level}-го уровня, цель ${state.target.level}-го.`,
      en: `The target must be lower level than the character. Character level is ${build.level}; target level is ${state.target.level}.`,
    };
  }
  return null;
}

export function calculateGameVisibleBuild(
  build: GameVisibleCharacterBuild,
  state: GameVisibleTeamState,
): VisibleBuildCalculation {
  const coverage = combatCoverageByCharacter.get(build.characterName);
  if (!coverage || !coverage.supportedModes.includes(build.testMode)) {
    return blocked(build.testMode, {
      ru: 'Для этого персонажа выбранный тест ещё не подтверждён. Можно использовать контрольный тест видимых характеристик.',
      en: 'The selected test is not verified for this character yet. Use the visible-stat reference test instead.',
    });
  }
  if (build.stats.atk <= 0) {
    return blocked(build.testMode, {
      ru: 'Введи итоговую «Атаку» из окна «Атрибуты». Атака дуги отдельно к ней не прибавляется.',
      en: 'Enter final ATK from the Attributes screen. Arc ATK is not added to it again.',
    });
  }

  let multiplier = 100;
  let explanation = referenceExplanation;
  let actionDefenceIgnore = 0;
  const conditions: VisibleCalculationCondition[] = [{
    id: 'visible.final-atk',
    label: {
      ru: `Итоговая Атака из клиента: ${build.stats.atk}`,
      en: `Final in-client ATK: ${build.stats.atk}`,
    },
    source: 'player',
  }];

  if (build.testMode === 'verified-action') {
    const action = visibleActionById.get(build.verifiedActionId);
    if (!action || action.characterName !== build.characterName) {
      return blocked(build.testMode, {
        ru: 'Выбери подтверждённое действие этого персонажа.',
        en: 'Select a verified action for this character.',
      });
    }
    const requirementError = validateActionRequirements(action, build, state);
    if (requirementError) return blocked(build.testMode, requirementError);

    multiplier = action.multiplier;
    explanation = action.description;
    actionDefenceIgnore = action.defenceIgnore ?? 0;
    conditions.push({ id: action.id, label: action.title, source: 'verified-data' });
    action.assumedConditions?.forEach((label, index) => conditions.push({
      id: `${action.id}.condition.${index + 1}`,
      label,
      source: 'test-preset',
    }));
    if (action.minimumAwakening !== undefined) {
      conditions.push({
        id: `${action.id}.awakening`,
        label: {
          ru: `Пробуждение персонажа: ${build.awakeningLevel}`,
          en: `Character Awakening: ${build.awakeningLevel}`,
        },
        source: 'player',
      });
    }
    if (action.requiresLowerLevelTarget) {
      conditions.push({
        id: `${action.id}.target-level`,
        label: {
          ru: `Уровень цели ${state.target.level} ниже уровня персонажа ${build.level}`,
          en: `Target level ${state.target.level} is below character level ${build.level}`,
        },
        source: 'player',
      });
    }
    if (action.defenceIgnore) {
      conditions.push({
        id: `${action.id}.defence-ignore`,
        label: {
          ru: `Удар игнорирует ${action.defenceIgnore}% защиты цели`,
          en: `The hit ignores ${action.defenceIgnore}% of target DEF`,
        },
        source: 'verified-data',
      });
    }
  }

  const conditional = arcConditional(build, build.testMode);
  conditions.push(...conditional.conditions);
  if (build.testMode === 'training-target') {
    conditions.push({
      id: 'custom-target',
      label: {
        ru: `Цель: ур. ${state.target.level}, сопротивление ${state.target.resistance}%`,
        en: `Target: Lv. ${state.target.level}, ${state.target.resistance}% resistance`,
      },
      source: 'test-preset',
    });
  }

  const target = targetFromState(state, build.testMode);
  const result = calculateDamage({
    characterLevel: build.level,
    baseAtk: build.stats.atk,
    arcAtk: 0,
    flatAtk: 0,
    atkPercent: 0,
    teamAtkPercent: 0,
    skillMultiplier: multiplier,
    hits: 1,
    damageBonus: build.stats.damageBonus + build.stats.attributeDamageBonus + conditional.damageBonus,
    teamDamageBonus: 0,
    critRate: build.stats.critRate,
    critDamage: build.stats.critDamage,
    enemy: {
      ...target,
      defenceReduction: Math.min(100, target.defenceReduction + conditional.defenceIgnore + actionDefenceIgnore),
    },
  });

  return {
    supported: true,
    mode: build.testMode,
    title: build.testMode === 'verified-action'
      ? visibleActionById.get(build.verifiedActionId)?.title ?? titleByMode[build.testMode]
      : titleByMode[build.testMode],
    explanation,
    result,
    multiplier,
    conditions,
    normalizedReference: build.testMode !== 'verified-action',
  };
}

export function calculateGameVisibleTeam(state: GameVisibleTeamState): VisibleTeamCalculation {
  const rows = state.builds.map((build) => calculateGameVisibleBuild(build, state));
  const supported = rows.filter((row): row is VisibleBuildCalculation & { result: DamageResult } => row.supported && Boolean(row.result));
  return {
    rows,
    totalExpected: supported.reduce((sum, row) => sum + row.result.expected, 0),
    comparableRows: supported.length,
    allRowsComparable: supported.length === state.builds.length,
  };
}

export function actionsForCharacter(characterName: string): readonly VerifiedVisibleAction[] {
  return verifiedVisibleActions.filter((action) => action.characterName === characterName);
}
