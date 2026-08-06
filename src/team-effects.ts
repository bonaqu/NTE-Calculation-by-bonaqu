import type { GameVisibleTeamState } from './game-visible-build';
import type { LocalizedText } from './types';

export type VerifiedTeamEffectId =
  | 'haniel.friendship.nova-atk-drain'
  | 'sakiri.awakening-four.team-atk'
  | 'sakiri.impish-trick.def-reduction'
  | 'hathor.delay-warning.remora-crit-rate'
  | 'shinku.surging-crimson.damage';

export type TeamEffectRecipientPolicy = 'all-team-members' | 'other-team-members' | 'source-only' | 'enemy';

export interface VerifiedTeamEffect {
  id: VerifiedTeamEffectId;
  sourceCharacter: 'Haniel' | 'Sakiri' | 'Hathor' | 'Shinku';
  title: LocalizedText;
  description: LocalizedText;
  trigger: LocalizedText;
  durationSeconds: number | 'combat';
  recipientPolicy: TeamEffectRecipientPolicy;
  baseAtkPercent?: number;
  enemyDefenceReduction?: number;
  critRate?: number;
  damageBonus?: number;
  minimumAwakening?: number;
  sourcePublisher: string;
  sourceUrl: string;
  supportingSourceUrl: string;
  sourceUpdatedAt: string;
  verifiedAt: string;
}

export interface TeamEffectSlotModifier {
  flatAtk: number;
  enemyDefenceReduction: number;
  critRate: number;
  damageBonus: number;
  provenance: readonly TeamEffectProvenance[];
}

export interface TeamEffectProvenance {
  effectId: VerifiedTeamEffectId;
  sourceSlot: number;
  sourceCharacter: string;
  amount: number;
  kind: 'flat-atk' | 'enemy-defence-reduction' | 'crit-rate' | 'damage-bonus';
  label: LocalizedText;
}

export interface TeamEffectEvaluation {
  effect: VerifiedTeamEffect;
  sourceSlot: number;
  enabled: boolean;
  active: boolean;
  recipients: readonly number[];
  derivedAmount: number;
  blockedReason?: LocalizedText;
}

export interface DerivedTeamEffects {
  slotModifiers: readonly TeamEffectSlotModifier[];
  evaluations: readonly TeamEffectEvaluation[];
}

const verifiedAt = '2026-08-04';
const prydwen = (character: string) => `https://www.prydwen.gg/neverness-to-everness/characters/${character}`;
const ruDatabase = (esperId: number) => `https://interactivemap.app/neverness-to-everness/database/ru/espers/esper-${esperId}/`;

export const verifiedTeamEffects: readonly VerifiedTeamEffect[] = [
  {
    id: 'haniel.friendship.nova-atk-drain',
    sourceCharacter: 'Haniel',
    title: { ru: 'Победила дружба! · бонус после Новы', en: "It's Friendship! · post-Nova ATK" },
    description: {
      ru: 'После завершения Новы каждый участник команды получает Атаку, равную 8% базовой Атаки Ханиэль. Снижение исходящей Атаки цели не участвует в текущей формуле нашего урона.',
      en: "When Nova ends, every team member gains flat ATK equal to 8% of Haniel's Base ATK. The target's outgoing ATK loss is outside the current damage formula.",
    },
    trigger: { ru: 'Нова завершилась', en: 'Nova ended' },
    durationSeconds: 'combat',
    recipientPolicy: 'all-team-members',
    baseAtkPercent: 8,
    sourcePublisher: 'Prydwen Institute / NTE Database',
    sourceUrl: prydwen('haniel'),
    supportingSourceUrl: ruDatabase(1020),
    sourceUpdatedAt: '2026-05-26',
    verifiedAt,
  },
  {
    id: 'sakiri.awakening-four.team-atk',
    sourceCharacter: 'Sakiri',
    title: { ru: 'Жажда уверенности · бонус A4', en: 'Wishful Reliance · A4 team ATK' },
    description: {
      ru: 'После «Праздника обжорства» остальные участники команды получают Атаку, равную 30% базовой Атаки Сакири, на 20 секунд. Сакири не получает этот бонус.',
      en: "After Feast of Gluttony, team members other than Sakiri gain flat ATK equal to 30% of Sakiri's Base ATK for 20 seconds.",
    },
    trigger: { ru: 'Применён «Праздник обжорства»', en: 'Feast of Gluttony was cast' },
    durationSeconds: 20,
    recipientPolicy: 'other-team-members',
    baseAtkPercent: 30,
    minimumAwakening: 4,
    sourcePublisher: 'Prydwen Institute / NTE Database',
    sourceUrl: prydwen('sakiri'),
    supportingSourceUrl: ruDatabase(1003),
    sourceUpdatedAt: '2026-05-26',
    verifiedAt,
  },
  {
    id: 'sakiri.impish-trick.def-reduction',
    sourceCharacter: 'Sakiri',
    title: { ru: 'Озорной трюк · снижение защиты', en: 'Impish Trick · DEF reduction' },
    description: {
      ru: 'После подбрасывания или подавления защита противника снижается на 10% на 20 секунд.',
      en: 'After inflicting Airborne or Suppress, enemy DEF is reduced by 10% for 20 seconds.',
    },
    trigger: { ru: 'Сработало подбрасывание или подавление', en: 'Airborne or Suppress was inflicted' },
    durationSeconds: 20,
    recipientPolicy: 'enemy',
    enemyDefenceReduction: 10,
    sourcePublisher: 'Prydwen Institute / NTE Database',
    sourceUrl: prydwen('sakiri'),
    supportingSourceUrl: ruDatabase(1003),
    sourceUpdatedAt: '2026-05-26',
    verifiedAt,
  },
  {
    id: 'hathor.delay-warning.remora-crit-rate',
    sourceCharacter: 'Hathor',
    title: { ru: 'Delay Warning · Ремора', en: 'Delay Warning · Remora Enhancement' },
    description: {
      ru: 'Когда союзники атакуют цель под Реморой, их шанс критического удара повышается на 10 процентных пунктов. Пассив Хатор продлевает Ремору до 12 секунд. Английское название сохранено до подтверждения русской локализации клиента.',
      en: 'Allies gain 10 percentage points of CRIT Rate while attacking a target affected by Remora. Hathor extends that Remora duration to 12 seconds.',
    },
    trigger: {
      ru: 'На проверяемую цель наложена Ремора',
      en: 'Remora was applied to the tested target',
    },
    durationSeconds: 12,
    recipientPolicy: 'all-team-members',
    critRate: 10,
    sourcePublisher: 'Prydwen Institute / Icy Veins',
    sourceUrl: prydwen('hathor'),
    supportingSourceUrl: 'https://www.icy-veins.com/neverness-to-everness/hathor-profile-skills',
    sourceUpdatedAt: '2026-06-27',
    verifiedAt,
  },
  {
    id: 'shinku.surging-crimson.damage',
    sourceCharacter: 'Shinku',
    title: { ru: 'Surging Crimson · бонус урона', en: 'Surging Crimson · DMG bonus' },
    description: {
      ru: 'После применения Crimson Fury Шинку входит в Surging Crimson на 13 секунд и получает +30% к урону. Эффект действует только на Шинку. Увеличение коэффициентов A6 и бонус R1 моделируются отдельно и сюда не входят.',
      en: 'After casting Crimson Fury, Shinku enters Surging Crimson for 13 seconds and gains +30% DMG. The effect applies only to Shinku. Awakening 6 ratio increases and the Resonance 1 bonus are separate.',
    },
    trigger: {
      ru: 'Применена Crimson Fury',
      en: 'Crimson Fury was cast',
    },
    durationSeconds: 13,
    recipientPolicy: 'source-only',
    damageBonus: 30,
    sourcePublisher: 'Icy Veins / Prydwen Institute',
    sourceUrl: 'https://www.icy-veins.com/neverness-to-everness/shinku-profile-skills',
    supportingSourceUrl: prydwen('shinku'),
    sourceUpdatedAt: '2026-07-31',
    verifiedAt: '2026-08-06',
  },
];

export const verifiedTeamEffectById = new Map(verifiedTeamEffects.map((effect) => [effect.id, effect]));

export function teamEffectsForCharacter(characterName: string): readonly VerifiedTeamEffect[] {
  return verifiedTeamEffects.filter((effect) => effect.sourceCharacter === characterName);
}

function recipientSlots(policy: TeamEffectRecipientPolicy, sourceSlot: number, slotCount: number): number[] {
  const all = Array.from({ length: slotCount }, (_, index) => index);
  if (policy === 'other-team-members') return all.filter((index) => index !== sourceSlot);
  if (policy === 'source-only') return [sourceSlot];
  return all;
}

function sourceCharacterRussianName(characterName: VerifiedTeamEffect['sourceCharacter']): string {
  if (characterName === 'Haniel') return 'Ханиэль';
  if (characterName === 'Sakiri') return 'Сакири';
  if (characterName === 'Shinku') return 'Шинку';
  return 'Хатор';
}

function blockedReason(effect: VerifiedTeamEffect, baseAtk: number, awakeningLevel: number): LocalizedText | null {
  if (effect.baseAtkPercent !== undefined && baseAtk <= 0) {
    return {
      ru: `Для эффекта «${effect.title.ru}» нужна базовая Атака ${sourceCharacterRussianName(effect.sourceCharacter)} с левой стороны строки «Атака» в подробных атрибутах.`,
      en: `${effect.title.en} requires the source character's Base ATK from the left side of the detailed ATK row.`,
    };
  }
  if (effect.minimumAwakening !== undefined && awakeningLevel < effect.minimumAwakening) {
    return {
      ru: `Эффект требует A${effect.minimumAwakening}; сейчас открыт максимум A${awakeningLevel}.`,
      en: `The effect requires A${effect.minimumAwakening}; the current maximum is A${awakeningLevel}.`,
    };
  }
  return null;
}

function effectAmount(effect: VerifiedTeamEffect, baseAtk: number): number {
  if (effect.baseAtkPercent !== undefined) return baseAtk * effect.baseAtkPercent / 100;
  if (effect.enemyDefenceReduction !== undefined) return effect.enemyDefenceReduction;
  if (effect.critRate !== undefined) return effect.critRate;
  return effect.damageBonus ?? 0;
}

export function deriveVerifiedTeamEffects(state: GameVisibleTeamState): DerivedTeamEffects {
  const mutable = state.builds.map(() => ({
    flatAtk: 0,
    enemyDefenceReduction: 0,
    critRate: 0,
    damageBonus: 0,
    provenance: [] as TeamEffectProvenance[],
  }));
  const evaluations: TeamEffectEvaluation[] = [];

  state.builds.forEach((sourceBuild, sourceSlot) => {
    sourceBuild.activeTeamEffectIds.forEach((effectId) => {
      const effect = verifiedTeamEffectById.get(effectId as VerifiedTeamEffectId);
      if (!effect || effect.sourceCharacter !== sourceBuild.characterName) return;

      const recipients = recipientSlots(effect.recipientPolicy, sourceSlot, state.builds.length);
      const reason = blockedReason(effect, sourceBuild.baseAtk, sourceBuild.awakeningLevel);
      const derivedAmount = effectAmount(effect, sourceBuild.baseAtk);

      evaluations.push({
        effect,
        sourceSlot,
        enabled: true,
        active: reason === null,
        recipients,
        derivedAmount,
        ...(reason ? { blockedReason: reason } : {}),
      });
      if (reason) return;

      recipients.forEach((recipientSlot) => {
        const target = mutable[recipientSlot];
        if (!target) return;
        if (effect.baseAtkPercent !== undefined) {
          target.flatAtk += derivedAmount;
          target.provenance.push({
            effectId: effect.id,
            sourceSlot,
            sourceCharacter: sourceBuild.characterName,
            amount: derivedAmount,
            kind: 'flat-atk',
            label: {
              ru: `${effect.title.ru}: +${derivedAmount.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} к Атаке от базовой Атаки ${sourceBuild.baseAtk}`,
              en: `${effect.title.en}: +${derivedAmount.toLocaleString('en-US', { maximumFractionDigits: 1 })} ATK from ${sourceBuild.baseAtk} Base ATK`,
            },
          });
        }
        if (effect.enemyDefenceReduction !== undefined) {
          target.enemyDefenceReduction += effect.enemyDefenceReduction;
          target.provenance.push({
            effectId: effect.id,
            sourceSlot,
            sourceCharacter: sourceBuild.characterName,
            amount: effect.enemyDefenceReduction,
            kind: 'enemy-defence-reduction',
            label: {
              ru: `${effect.title.ru}: защита цели снижена на ${effect.enemyDefenceReduction}%`,
              en: `${effect.title.en}: target DEF reduced by ${effect.enemyDefenceReduction}%`,
            },
          });
        }
        if (effect.critRate !== undefined) {
          target.critRate += effect.critRate;
          target.provenance.push({
            effectId: effect.id,
            sourceSlot,
            sourceCharacter: sourceBuild.characterName,
            amount: effect.critRate,
            kind: 'crit-rate',
            label: {
              ru: `${effect.title.ru}: +${effect.critRate}% к шансу крит. удара по цели под Реморой`,
              en: `${effect.title.en}: +${effect.critRate}% CRIT Rate against the Remora target`,
            },
          });
        }
        if (effect.damageBonus !== undefined) {
          target.damageBonus += effect.damageBonus;
          target.provenance.push({
            effectId: effect.id,
            sourceSlot,
            sourceCharacter: sourceBuild.characterName,
            amount: effect.damageBonus,
            kind: 'damage-bonus',
            label: {
              ru: `${effect.title.ru}: +${effect.damageBonus}% к урону Шинку на ${effect.durationSeconds} секунд`,
              en: `${effect.title.en}: +${effect.damageBonus}% Shinku DMG for ${effect.durationSeconds} seconds`,
            },
          });
        }
      });
    });
  });

  return { slotModifiers: mutable, evaluations };
}
