import { Shield } from 'lucide-react';
import { awakeningNodesByCharacter } from '../awakening-data';
import type { GameVisibleCharacterBuild } from '../game-visible-build';
import type { VerifiedVisibleAction } from '../verified-visible-actions';
import { supportAwakeningNodesByCharacter } from '../support-awakening-data';

interface ActionAwakeningRequirementProps {
  action: VerifiedVisibleAction | undefined;
  build: GameVisibleCharacterBuild;
  locale: 'ru' | 'en';
  onChange: (build: GameVisibleCharacterBuild) => void;
}

export function ActionAwakeningRequirement({
  action,
  build,
  locale,
  onChange,
}: ActionAwakeningRequirementProps) {
  const minimum = action?.minimumAwakening;
  if (!action || minimum === undefined) return null;

  const nodes = awakeningNodesByCharacter.get(build.characterName)
    ?? supportAwakeningNodesByCharacter.get(build.characterName)
    ?? [];
  const node = nodes.find((entry) => entry.level === minimum);
  const enabled = build.awakeningLevel >= minimum;
  const ru = locale === 'ru';
  const title = node?.title[locale] ?? (ru ? `Пробуждение ${minimum}` : `Awakening ${minimum}`);

  return <div className="nte-condition-section nte-action-awakening-requirement">
    <h3>{ru ? 'Требование выбранного действия' : 'Selected action requirement'}</h3>
    <label className="nte-condition-toggle">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange({
          ...build,
          awakeningLevel: event.target.checked ? Math.max(build.awakeningLevel, minimum) : 0,
        })}
      />
      <span>
        <b>A{minimum} · {title} {ru ? 'открыто' : 'unlocked'}</b>
        <small>{node?.description[locale] ?? (ru
          ? 'Подтверди только этот узел: без него выбранное действие не рассчитывается.'
          : 'Confirm only this node; the selected action is blocked without it.')}</small>
      </span>
    </label>
    <div className="nte-model-note">
      <Shield size={17} />
      <span>{ru
        ? 'Это условие относится только к выбранному действию. Остальные пробуждения не применяются автоматически.'
        : 'This condition belongs only to the selected action. Other Awakening nodes are not applied automatically.'}</span>
    </div>
  </div>;
}
