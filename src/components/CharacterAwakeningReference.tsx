import { BookOpenText, CheckCircle2, Shield } from 'lucide-react';
import { awakeningNodesByCharacter } from '../awakening-data';
import { supportAwakeningNodesByCharacter } from '../support-awakening-data';
import { teamEffectsForCharacter } from '../team-effects';
import { verifiedVisibleActions } from '../verified-visible-actions';
import './CharacterAwakeningReference.css';

interface CharacterAwakeningReferenceProps {
  characterName: string;
  locale: 'ru' | 'en';
}

export function CharacterAwakeningReference({ characterName, locale }: CharacterAwakeningReferenceProps) {
  const ru = locale === 'ru';
  const nodes = awakeningNodesByCharacter.get(characterName)
    ?? supportAwakeningNodesByCharacter.get(characterName)
    ?? [];
  if (!nodes.length) return null;

  const actionLevels = new Set(
    verifiedVisibleActions
      .filter((action) => action.characterName === characterName && action.minimumAwakening !== undefined)
      .map((action) => action.minimumAwakening),
  );
  const teamEffectLevels = new Set(
    teamEffectsForCharacter(characterName)
      .filter((effect) => effect.minimumAwakening !== undefined)
      .map((effect) => effect.minimumAwakening),
  );

  return <details className="character-awakening-reference">
    <summary>
      <BookOpenText size={17} />
      <span>{ru ? `Пробуждения · ${nodes.length}` : `Awakenings · ${nodes.length}`}</span>
      <small>{ru ? 'Справка, не поле калькулятора' : 'Reference, not calculator input'}</small>
    </summary>
    <div className="character-awakening-reference__intro">
      <Shield size={17} />
      <p>{ru
        ? 'Здесь показаны все подтверждённые узлы персонажа. Калькулятор запрашивает только конкретный узел, необходимый выбранному действию или эффекту команды.'
        : 'All sourced nodes are shown here. The calculator asks only for the specific node required by the selected action or team effect.'}</p>
    </div>
    <div className="character-awakening-reference__list">{nodes.map((node) => {
      const calculationActive = actionLevels.has(node.level) || teamEffectLevels.has(node.level);
      return <article key={`${node.characterName}-${node.level}`} className={calculationActive ? 'calculation-active' : ''}>
        <b>A{node.level}</b>
        <div>
          <strong>{node.title[locale]}</strong>
          <p>{node.description[locale]}</p>
          <small>{node.evidence === 'current-russian-reference'
            ? (ru ? 'Текущая русская карточка' : 'Current Russian record')
            : (ru ? 'Английская карточка; русское название не подтверждено' : 'English record; Russian title unresolved')}</small>
        </div>
        <span>{calculationActive
          ? <><CheckCircle2 size={14} /> {ru ? 'используется моделью' : 'used by model'}</>
          : (ru ? 'справочно' : 'reference')}</span>
      </article>;
    })}</div>
  </details>;
}
