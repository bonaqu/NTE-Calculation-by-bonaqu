import { calculateDamage, type DamageResult, type EnemyProfile } from '../packages/calculation-core/src';
import {
  combatCoverageByCharacter,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
  type VisibleTestModeId,
} from './game-visible-build';
import {
  deriveVerifiedTeamEffects,
  type TeamEffectEvaluation,
  type TeamEffectSlotModifier,
} from './team-effects';
import type { LocalizedText } from './types';
import {
  verifiedVisibleActions,
  visibleActionById,
  type ActionScalingStat,
  type VerifiedVisibleAction,
} from './verified-visible-actions';

export { verifiedVisibleActions, visibleActionById };
export type { ActionScalingStat, VerifiedVisibleAction };

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
  teamEffects: readonly TeamEffectEvaluation[];
}

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

const emptyModifier: TeamEffectSlotModifier = {
  flatAtk: 0,
  enemyDefenceReduction: 0,
  critRate: 0,
  damageBonus: 0,
  provenance: [],
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

function blocked(mode: VisibleTestModeId, reason: LocalizedText): VisibleBuildCalculation {
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

function supportConditions(modifier: TeamEffectSlotModifier): VisibleCalculationCondition[] {
  return modifier.provenance.map((entry) => ({
    id: `${entry.effectId}.source-slot-${entry.sourceSlot + 1}`,
    label: entry.label,
    source: 'verified-data' as const,
  }));
}

function scalingValue(build: GameVisibleCharacterBuild, stat: ActionScalingStat): number {
  if (stat === 'def') return build.stats.def;
  if (stat === 'max-hp') return build.stats.hp;
  return build.stats.atk;
}

function scalingCondition(build: GameVisibleCharacterBuild, stat: ActionScalingStat): VisibleCalculationCondition {
  if (stat === 'def') {
    return {
      id: 'visible.final-def',
      label: { ru: `Итоговая ЗАЩ из клиента: ${build.stats.def}`, en: `Final in-client DEF: ${build.stats.def}` },
      source: 'player',
    };
  }
  if (stat === 'max-hp') {
    return {
      id: 'visible.final-max-hp',
      label: { ru: `Максимальные ОЗ из клиента: ${build.stats.hp}`, en: `Final in-client Max HP: ${build.stats.hp}` },
      source: 'player',
    };
  }
  return {
    id: 'visible.final-atk',
    label: { ru: `Итоговая Атака из клиента: ${build.stats.atk}`, en: `Final in-client ATK: ${build.stats.atk}` },
    source: 'player',
  };
}

function missingScalingValue(stat: ActionScalingStat): LocalizedText {
  if (stat === 'def') {
    return {
      ru: 'Введи итоговую «ЗАЩ» из окна «Атрибуты». Проценты и значение защиты снаряжения отдельно не прибавляются.',
      en: 'Enter final DEF from the Attributes screen. Equipment DEF values and percentages are not added again.',
    };
  }
  if (stat === 'max-hp') {
    return {
      ru: 'Введи итоговые максимальные ОЗ из окна «Атрибуты». ОЗ с дуги и консоли отдельно не прибавляются.',
      en: 'Enter final Max HP from the Attributes screen. Arc and Console HP are not added again.',
    };
  }
  return {
    ru: 'Введи итоговую «Атаку» из окна «Атрибуты». Атака дуги отдельно к ней не прибавляется.',
    en: 'Enter final ATK from the Attributes screen. Arc ATK is not added to it again.',
  };
}

export function calculateGameVisibleBuild(
  build: GameVisibleCharacterBuild,
  state: GameVisibleTeamState,
  modifier: TeamEffectSlotModifier = emptyModifier,
): VisibleBuildCalculation {
  const coverage = combatCoverageByCharacter.get(build.characterName);
  if (!coverage || !coverage.supportedModes.includes(build.testMode)) {
    return blocked(build.testMode, {
      ru: 'Для этого персонажа выбранный тест ещё не подтверждён. Можно использовать контрольный тест видимых характеристик.',
      en: 'The selected test is not verified for this character yet. Use the visible-stat reference test instead.',
    });
  }

  let action: VerifiedVisibleAction | undefined;
  if (build.testMode === 'verified-action') {
    action = visibleActionById.get(build.verifiedActionId);
    if (!action || action.characterName !== build.characterName) {
      return blocked(build.testMode, {
        ru: 'Выбери подтверждённое действие этого персонажа.',
        en: 'Select a verified action for this character.',
      });
    }
    const requirementError = validateActionRequirements(action, build, state);
    if (requirementError) return blocked(build.testMode, requirementError);
  }

  const actionScalingStat: ActionScalingStat = action?.scalingStat ?? 'atk';
  const actionScalingValue = scalingValue(build, actionScalingStat);
  if (actionScalingValue <= 0) return blocked(build.testMode, missingScalingValue(actionScalingStat));

  let multiplier = 100;
  let explanation = referenceExplanation;
  let actionDefenceIgnore = 0;
  const conditions: VisibleCalculationCondition[] = [
    scalingCondition(build, actionScalingStat),
    ...supportConditions(modifier),
  ];

  if (action) {
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
    flatAtk: modifier.flatAtk,
    atkPercent: 0,
    teamAtkPercent: 0,
    scalingValue: actionScalingStat === 'atk' ? undefined : actionScalingValue,
    skillMultiplier: multiplier,
    hits: 1,
    damageBonus: build.stats.damageBonus
      + build.stats.attributeDamageBonus
      + modifier.damageBonus
      + conditional.damageBonus,
    teamDamageBonus: 0,
    critRate: build.stats.critRate + modifier.critRate,
    critDamage: build.stats.critDamage,
    enemy: {
      ...target,
      defenceReduction: Math.min(
        100,
        target.defenceReduction
          + modifier.enemyDefenceReduction
          + conditional.defenceIgnore
          + actionDefenceIgnore,
      ),
    },
  });

  return {
    supported: true,
    mode: build.testMode,
    title: action?.title ?? titleByMode[build.testMode],
    explanation,
    result,
    multiplier,
    conditions,
    normalizedReference: build.testMode !== 'verified-action',
  };
}

export function calculateGameVisibleTeam(state: GameVisibleTeamState): VisibleTeamCalculation {
  const derived = deriveVerifiedTeamEffects(state);
  const rows = state.builds.map((build, index) => calculateGameVisibleBuild(
    build,
    state,
    derived.slotModifiers[index] ?? emptyModifier,
  ));
  const supported = rows.filter((row): row is VisibleBuildCalculation & { result: DamageResult } => row.supported && Boolean(row.result));
  return {
    rows,
    totalExpected: supported.reduce((sum, row) => sum + row.result.expected, 0),
    comparableRows: supported.length,
    allRowsComparable: supported.length === state.builds.length,
    teamEffects: derived.evaluations,
  };
}

export function actionsForCharacter(characterName: string): readonly VerifiedVisibleAction[] {
  return verifiedVisibleActions.filter((action) => action.characterName === characterName);
}
