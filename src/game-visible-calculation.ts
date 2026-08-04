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
  requiredLevel: number;
  sourcePublisher: string;
  sourceUrl: string;
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

const shinkuSource = 'https://www.prydwen.gg/neverness-to-everness/characters/shinku';

/**
 * Only actions whose exact coefficient is visible in a current sourced record
 * are exposed. The first release deliberately avoids reconstructing Shinku's
 * entire Ultimate from undocumented animation hit data.
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
    sourceUrl: shinkuSource,
    verifiedAt: '2026-07-13',
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
    sourcePublisher: 'Prydwen Institute',
    sourceUrl: shinkuSource,
    verifiedAt: '2026-07-13',
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
    const actualLevel = build.skills[action.requiredSkill];
    if (actualLevel !== action.requiredLevel) {
      return blocked(build.testMode, {
        ru: `Для этого коэффициента нужен уровень ${action.requiredLevel}. На другом уровне сайт не интерполирует значения и не придумывает формулу роста.`,
        en: `This coefficient requires level ${action.requiredLevel}. The site does not interpolate or invent scaling for another level.`,
      });
    }
    multiplier = action.multiplier;
    explanation = action.description;
    conditions.push({
      id: action.id,
      label: action.title,
      source: 'verified-data',
    });
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
      ...targetFromState(state, build.testMode),
      defenceReduction: Math.min(100, targetFromState(state, build.testMode).defenceReduction + conditional.defenceIgnore),
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
