import { CheckCircle2, Coins, Route, Target } from 'lucide-react';
import { ascensionMaterials, type AscensionMaterialId } from '../progression-data';
import type { RosterProgressionEntry } from '../progression-engine';
import {
  immediateCoinShortage,
  immediateMaterialBlockers,
  immediateTargetsReady,
  nextAscensionTargets,
} from '../progression-next';
import { localizedCharacterName } from '../gameTerms';
import { useI18n } from '../i18n';
import { formatNumber } from './UI';

interface ProgressionNextOverviewProps {
  entries: readonly RosterProgressionEntry[];
  inventory: Partial<Record<AscensionMaterialId, number>>;
}

export function ProgressionNextOverview({ entries, inventory }: ProgressionNextOverviewProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const targets = nextAscensionTargets(entries);
  const blockers = immediateMaterialBlockers(entries, inventory);
  const coins = immediateCoinShortage(entries, inventory);
  const ready = immediateTargetsReady(entries, inventory);

  if (entries.length === 0) return null;

  return <section className={`next-progression ${ready ? 'is-ready' : ''}`} aria-labelledby="next-progression-title">
    <header><div><span>{ru ? 'БЛИЖАЙШАЯ ЦЕЛЬ' : 'NEXT TARGET'}</span><h2 id="next-progression-title">{ru ? 'Что нужно для следующих прорывов' : 'What the next ascensions need'}</h2><p>{ru ? 'Считается ровно один следующий неоплаченный этап каждого персонажа. Это отдельный краткосрочный список; полный остаток до 80 уровня остаётся ниже.' : 'This includes exactly one next unpaid ascension for each character. It is a short-term list; the complete remaining plan to level 80 stays below.'}</p></div><div className="next-progression-status">{targets.length === 0 ? <><CheckCircle2 size={23} /><span><b>{ru ? 'Все достигли предела ур. 80' : 'Everyone reached Lv. 80 cap'}</b><small>{ru ? 'Ближайших прорывов больше нет' : 'No next ascensions remain'}</small></span></> : ready ? <><CheckCircle2 size={23} /><span><b>{ru ? 'На все ближайшие этапы хватает' : 'All next steps are covered'}</b><small>{ru ? 'Общий инвентарь покрывает их одновременно' : 'Shared inventory covers them simultaneously'}</small></span></> : <><Target size={23} /><span><b>{ru ? `${targets.length} ближайших целей` : `${targets.length} immediate targets`}</b><small>{ru ? `${blockers.length} видов материалов ещё не хватает` : `${blockers.length} material types are still missing`}</small></span></>}</div></header>

    {targets.length > 0 ? <div className="next-target-strip" aria-label={ru ? 'Следующие прорывы персонажей' : 'Next character ascensions'}>{targets.map((target) => <div key={target.characterName}><span>{localizedCharacterName(target.characterName, locale)}</span><b>{ru ? `ур. ${target.currentCap} → ${target.step.unlocksLevel}` : `Lv. ${target.currentCap} → ${target.step.unlocksLevel}`}</b></div>)}</div> : null}

    {targets.length > 0 ? <div className="next-progression-body">
      <div className="next-blockers"><div className="next-section-title"><Route size={18} /><span><h3>{ru ? 'Материалы, которые блокируют ближайшие этапы' : 'Materials blocking the next steps'}</h3><p>{ru ? 'Выше стоят материалы, нужные большему числу ближайших целей. Это порядок координации, а не рейтинг выгодности фарма.' : 'Materials used by more immediate targets appear first. This is coordination order, not farming-efficiency advice.'}</p></span></div>{blockers.length ? <div className="next-blocker-list">{blockers.map((blocker, index) => {
        const material = ascensionMaterials[blocker.materialId];
        return <article key={blocker.materialId}><span className="next-blocker-rank">{index + 1}</span><span className="next-blocker-name"><b>{material.name[locale]}</b>{ru ? <small>{material.name.en}</small> : null}{material.farm ? <em>{material.farm[locale]}</em> : null}</span><span className="next-blocker-count"><b>{formatNumber(blocker.missing)}</b><small>{ru ? `нужно ${formatNumber(blocker.required)}, есть ${formatNumber(blocker.owned)}` : `need ${formatNumber(blocker.required)}, owned ${formatNumber(blocker.owned)}`}</small></span><span className="next-blocker-users">{blocker.affectedCharacters.map((name) => localizedCharacterName(name, locale)).join(' · ')}</span></article>;
      })}</div> : <div className="next-materials-ready"><CheckCircle2 size={22} /><span><b>{ru ? 'Материалы собраны' : 'Materials ready'}</b><small>{ru ? 'Для ближайших прорывов не хватает только монет либо уже хватает всего.' : 'Only coins may remain, or every immediate requirement is already covered.'}</small></span></div>}</div>

      <aside className={`next-coin ${coins.missing === 0 ? 'complete' : ''}`}><Coins size={21} /><span><small>{ru ? 'Жук-монеты на ближайшие этапы' : 'Beetle Coins for next steps'}</small><b>{coins.missing === 0 ? (ru ? 'Хватает' : 'Ready') : formatNumber(coins.missing)}</b><em>{ru ? `Нужно ${formatNumber(coins.required)} · есть ${formatNumber(coins.owned)}` : `Need ${formatNumber(coins.required)} · owned ${formatNumber(coins.owned)}`}</em></span></aside>
    </div> : null}
  </section>;
}
