import { CheckCircle2, CircleDot, Shield, Sparkles, Users } from 'lucide-react';
import type { GameVisibleCharacterBuild } from '../game-visible-build';
import {
  teamEffectsForCharacter,
  type TeamEffectEvaluation,
  type VerifiedTeamEffect,
} from '../team-effects';

interface VerifiedTeamEffectsPanelProps {
  build: GameVisibleCharacterBuild;
  sourceSlot: number;
  evaluations: readonly TeamEffectEvaluation[];
  locale: 'ru' | 'en';
  onChange: (build: GameVisibleCharacterBuild) => void;
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function durationLabel(effect: VerifiedTeamEffect, ru: boolean): string {
  if (effect.durationSeconds === 'combat') return ru ? 'до выхода из боя' : 'until leaving combat';
  return `${effect.durationSeconds} ${ru ? 'сек.' : 'sec.'}`;
}

function recipientLabel(effect: VerifiedTeamEffect, ru: boolean): string {
  if (effect.recipientPolicy === 'all-team-members') return ru ? 'Все 4 слота команды' : 'All 4 team slots';
  if (effect.recipientPolicy === 'other-team-members') return ru ? 'Все, кроме источника' : 'Everyone except the source';
  return ru ? 'Защита общей цели' : 'Shared target DEF';
}

function activeEffectLabel(
  effect: VerifiedTeamEffect,
  evaluation: TeamEffectEvaluation | undefined,
  ru: boolean,
): string {
  const amount = evaluation?.derivedAmount ?? 0;
  if (effect.baseAtkPercent !== undefined) {
    return ru
      ? `Применяется: +${amount.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} к Атаке получателя`
      : `Applied: +${amount.toLocaleString('en-US', { maximumFractionDigits: 1 })} recipient ATK`;
  }
  if (effect.critRate !== undefined) {
    return ru
      ? `Применяется: +${amount}% к шансу крит. удара по цели под Реморой`
      : `Applied: +${amount}% CRIT Rate against the Remora target`;
  }
  return ru
    ? `Применяется: −${amount}% защиты цели`
    : `Applied: −${amount}% target DEF`;
}

export function VerifiedTeamEffectsPanel({
  build,
  sourceSlot,
  evaluations,
  locale,
  onChange,
}: VerifiedTeamEffectsPanelProps) {
  const ru = locale === 'ru';
  const effects = teamEffectsForCharacter(build.characterName);
  if (!effects.length) return null;

  const toggleEffect = (effect: VerifiedTeamEffect, enabled: boolean) => {
    const next = enabled
      ? [...new Set([...build.activeTeamEffectIds, effect.id])]
      : build.activeTeamEffectIds.filter((id) => id !== effect.id);
    onChange({ ...build, activeTeamEffectIds: next });
  };

  return <div className="nte-team-effects-section">
    <div className="nte-team-effects-heading">
      <Users size={20} />
      <div>
        <h3>{ru ? 'Проверенные эффекты команды' : 'Verified team effects'}</h3>
        <p>{ru
          ? 'Включай только окно, которое действительно активно в проверяемом моменте боя. Неактивные эффекты ничего не добавляют.'
          : 'Enable only the combat window that is actually active at the tested moment. Inactive effects add nothing.'}</p>
      </div>
    </div>

    <div className="nte-team-effect-list">{effects.map((effect) => {
      const enabled = build.activeTeamEffectIds.includes(effect.id);
      const evaluation = evaluations.find((entry) => entry.sourceSlot === sourceSlot && entry.effect.id === effect.id);
      const active = evaluation?.active === true;
      return <article key={effect.id} className={`${enabled ? 'enabled' : ''} ${active ? 'active' : ''}`}>
        <label className="nte-team-effect-toggle">
          <input type="checkbox" checked={enabled} onChange={(event) => toggleEffect(effect, event.target.checked)} />
          <span><b>{effect.title[locale]}</b><small>{effect.trigger[locale]} · {durationLabel(effect, ru)}</small></span>
        </label>
        <p>{effect.description[locale]}</p>
        <div className="nte-team-effect-meta">
          <span><Users size={14} /> {recipientLabel(effect, ru)}</span>
          {effect.minimumAwakening ? <span><Shield size={14} /> A{effect.minimumAwakening}+</span> : null}
          {effect.baseAtkPercent ? <span><Sparkles size={14} /> {effect.baseAtkPercent}% {ru ? 'базовой Атаки' : 'Base ATK'}</span> : null}
          {effect.enemyDefenceReduction ? <span><Shield size={14} /> −{effect.enemyDefenceReduction}% {ru ? 'защиты' : 'DEF'}</span> : null}
          {effect.critRate ? <span><CircleDot size={14} /> +{effect.critRate}% {ru ? 'к шансу крит. удара' : 'CRIT Rate'}</span> : null}
        </div>

        {enabled && effect.baseAtkPercent !== undefined ? <label className="nte-team-effect-base-atk">
          <span>{ru ? `Базовая Атака ${build.characterName === 'Haniel' ? 'Ханиэль' : 'Сакири'}` : `${build.characterName} Base ATK`}</span>
          <input type="number" min="0" step="1" value={build.baseAtk} onChange={(event) => onChange({ ...build, baseAtk: numberValue(event.target.value) })} />
          <small>{ru
            ? 'Левое число в подробной строке «Атака». Итоговую Атаку персонажа сюда не копируй.'
            : 'The left number in the detailed ATK row. Do not copy final ATK here.'}</small>
        </label> : null}

        {enabled ? <div className={`nte-team-effect-status ${active ? 'active' : 'blocked'}`}>
          {active ? <CheckCircle2 size={16} /> : <Shield size={16} />}
          <span>{active
            ? activeEffectLabel(effect, evaluation, ru)
            : evaluation?.blockedReason?.[locale] ?? (ru ? 'Заполни обязательные условия.' : 'Complete the required conditions.')}</span>
        </div> : null}
      </article>;
    })}</div>
  </div>;
}
