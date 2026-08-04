import type { GameVisibleTeamState } from './game-visible-build';
import type { LocalizedText } from './types';

export type VerifiedTeamEffectId =
  | 'haniel.friendship.nova-atk-drain'
  | 'sakiri.awakening-four.team-atk'
  | 'sakiri.impish-trick.def-reduction';

export type TeamEffectRecipientPolicy = 'all-team-members' | 'other-team-members' | 'enemy';

export interface VerifiedTeamEffect {
  id: VerifiedTeamEffectId;
  sourceCharacter: 'Haniel' | 'Sakiri';
  title: LocalizedText;
  description: LocalizedText;
  trigger: LocalizedText;
  durationSeconds: number | 'combat';
  recipientPolicy: TeamEffectRecipientPolicy;
  baseAtkPercent?: number;
  enemyDefenceReduction?: number;
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
  provenance: readonly TeamEffectProvenance[];
}

export interface TeamEffectProvenance {
  effectId: VerifiedTeamEffectId;
  sourceSlot: number;
  sourceCharacter: string;
  amount: number;
  kind: 'flat-atk' | 'enemy-defence-reduction';
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
];

export const verifiedTeamEffectById = new Map(verifiedTeamEffects.map((effect) => [effect.id, effect]));

export function teamEffectsForCharacter(characterName: string): readonly VerifiedTeamEffect[] {
  return verifiedTeamEffects.filter((effect) => effect.sourceCharacter === characterName);
}

function recipientSlots(policy: TeamEffectRecipientPolicy, sourceSlot: number, slotCount: number): number[] {
  const all = Array.from({ length: slotCount }, (_, index) => index);
  if (policy === 'other-team-members') return all.filter((index) => index !== sourceSlot);
  return all;
}

function blockedReason(effect: VerifiedTeamEffect, baseAtk: number, awakeningLevel: number): LocalizedText | null {
  if (effect.baseAtkPercent !== undefined && baseAtk <= 0) {
    return {
      ru: `Для эффекта «${effect.title.ru}» нужна базовая Атака ${effect.sourceCharacter === 'Haniel' ? 'Ханиэль' : 'Сакири'} с левой стороны строки «Атака» в подробных атрибутах.`,
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

export function deriveVerifiedTeamEffects(state: GameVisibleTeamState): DerivedTeamEffects {
  const mutable = state.builds.map(() => ({
    flatAtk: 0,
    enemyDefenceReduction: 0,
    provenance: [] as TeamEffectProvenance[],
  }));
  const evaluations: TeamEffectEvaluation[] = [];

  state.builds.forEach((sourceBuild, sourceSlot) => {
    sourceBuild.activeTeamEffectIds.forEach((effectId) => {
      const effect = verifiedTeamEffectById.get(effectId as VerifiedTeamEffectId);
      if (!effect || effect.sourceCharacter !== sourceBuild.characterName) return;

      const recipients = recipientSlots(effect.recipientPolicy, sourceSlot, state.builds.length);
      const reason = blockedReason(effect, sourceBuild.baseAtk, sourceBuild.awakeningLevel);
      const derivedAmount = effect.baseAtkPercent !== undefined
        ? sourceBuild.baseAtk * effect.baseAtkPercent / 100
        : effect.enemyDefenceReduction ?? 0;

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
      });
    });
  });

  return { slotModifiers: mutable, evaluations };
}
