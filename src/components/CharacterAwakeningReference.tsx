import { BookOpenText, CheckCircle2, ChevronDown, ExternalLink, Shield } from 'lucide-react';
import {
  awakeningNodesForCharacter,
  teamEffectIdsForAwakeningNode,
} from '../awakening-reference';
import { verifiedTeamEffectById } from '../team-effects';
import { visibleActionById } from '../verified-visible-actions';

interface CharacterAwakeningReferenceProps {
  characterName: string;
  locale: 'ru' | 'en';
}

export function CharacterAwakeningReference({ characterName, locale }: CharacterAwakeningReferenceProps) {
  const ru = locale === 'ru';
  const nodes = awakeningNodesForCharacter(characterName);
  if (!nodes.length) return null;

  const russianCount = nodes.filter((node) => node.evidence === 'current-russian-reference').length;
  const fallbackCount = nodes.length - russianCount;

  return <details className="character-awakening-reference">
    <summary>
      <div className="character-awakening-summary-icon"><BookOpenText size={17} /></div>
      <div>
        <b>{ru ? `Пробуждения A1–A${nodes.length}` : `Awakenings A1–A${nodes.length}`}</b>
        <small>{fallbackCount
          ? (ru ? `${russianCount} русских названий · ${fallbackCount} английских с пометкой` : `${russianCount} Russian references · ${fallbackCount} disclosed English fallbacks`)
          : (ru ? 'Все названия подтверждены текущей русской карточкой' : 'All labels have current Russian-reference evidence')}</small>
      </div>
      <ChevronDown size={18} />
    </summary>

    <div className="character-awakening-nodes">{nodes.map((node) => {
      const actionNames = (node.relatedActionIds ?? [])
        .map((id) => visibleActionById.get(id)?.title[locale])
        .filter((value): value is string => Boolean(value));
      const effectNames = teamEffectIdsForAwakeningNode(node)
        .map((id) => verifiedTeamEffectById.get(id)?.title[locale])
        .filter((value): value is string => Boolean(value));
      const calculationLinks = [...actionNames, ...effectNames];

      return <article key={`${node.characterName}-${node.level}`} className={node.calculationStatus}>
        <div className="character-awakening-level">A{node.level}</div>
        <div className="character-awakening-copy">
          <div className="character-awakening-title"><strong>{node.title[locale]}</strong><span>{node.evidence === 'current-russian-reference' ? (ru ? 'RU подтверждено' : 'RU reference') : (ru ? 'EN с пометкой' : 'EN fallback')}</span></div>
          <p>{node.description[locale]}</p>
          {calculationLinks.length ? <div className="character-awakening-links"><CheckCircle2 size={14} /><span>{ru ? 'Используется калькулятором:' : 'Used by calculator:'} {calculationLinks.join(' · ')}</span></div> : <div className="character-awakening-links informational"><Shield size={14} /><span>{ru ? 'Справочный узел: не применяется к урону без отдельной проверенной модели.' : 'Reference node: not applied to damage without a separate verified model.'}</span></div>}
          <div className="character-awakening-source"><small>{node.sourcePublisher} · {ru ? 'источник обновлён' : 'source updated'} {node.sourceUpdatedAt} · {ru ? 'проверено проектом' : 'project verified'} {node.verifiedAt}</small><a href={node.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Открыть источник' : 'Open source'} <ExternalLink size={13} /></a></div>
        </div>
      </article>;
    })}</div>
  </details>;
}
