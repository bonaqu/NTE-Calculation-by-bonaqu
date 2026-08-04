import type { LocalizedText } from './types';
import { verifiedVisibleActionsBatchB } from './verified-visible-actions-batch-b';
import { verifiedVisibleActionsBatchC } from './verified-visible-actions-batch-c';

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

const source = (character: string) => `https://www.prydwen.gg/neverness-to-everness/characters/${character}`;

/**
 * One record is one explicitly sourced standalone trigger. Records are not
 * silently expanded into animation strings, burst windows or rotations.
 */
const verifiedVisibleActionsBase: readonly VerifiedVisibleAction[] = [
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

export const verifiedVisibleActions: readonly VerifiedVisibleAction[] = [
  ...verifiedVisibleActionsBase,
  ...verifiedVisibleActionsBatchB,
  ...verifiedVisibleActionsBatchC,
];

export const visibleActionById = new Map(verifiedVisibleActions.map((action) => [action.id, action]));