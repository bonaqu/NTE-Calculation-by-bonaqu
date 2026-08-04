import { Shield } from 'lucide-react';
import type { AwakeningNode } from '../awakening-data';
import type { GameVisibleCharacterBuild } from '../game-visible-build';

interface NamedAwakeningRequirementsProps {
  nodes: readonly AwakeningNode[];
  build: GameVisibleCharacterBuild;
  locale: 'ru' | 'en';
  onChange: (build: GameVisibleCharacterBuild) => void;
}

export function NamedAwakeningRequirements({
  nodes,
  build,
  locale,
  onChange,
}: NamedAwakeningRequirementsProps) {
  if (!nodes.length) return null;
  const ru = locale === 'ru';

  const setRequirement = (node: AwakeningNode, checked: boolean) => {
    const otherConfirmedLevels = nodes
      .filter((entry) => entry.level !== node.level && entry.level <= build.awakeningLevel)
      .map((entry) => entry.level);
    const nextLevel = checked
      ? Math.max(build.awakeningLevel, node.level)
      : Math.max(0, ...otherConfirmedLevels);
    onChange({ ...build, awakeningLevel: nextLevel });
  };

  return <div className="nte-condition-section nte-named-awakening-requirements">
    <h3>{ru ? 'Требуемые пробуждения' : 'Required Awakenings'}</h3>
    <p className="nte-condition-copy">{ru
      ? 'Подтверди только узел, от которого зависит выбранное действие или включённый эффект команды. Полный список A1–A6 находится в Базе персонажей.'
      : 'Confirm only the node required by the selected action or enabled team effect. The full A1–A6 reference lives in the Character Database.'}</p>
    <div className="nte-named-awakening-list">{nodes.map((node) => {
      const checked = build.awakeningLevel >= node.level;
      return <label className={`nte-condition-toggle ${checked ? 'confirmed' : ''}`} key={`${node.characterName}-${node.level}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setRequirement(node, event.target.checked)}
        />
        <span>
          <b>A{node.level} · {node.title[locale]} {ru ? 'открыто' : 'unlocked'}</b>
          <small>{node.description[locale]}</small>
          <small>{node.evidence === 'current-russian-reference'
            ? (ru ? 'Название подтверждено текущей русской карточкой.' : 'Title confirmed by the current Russian record.')
            : (ru ? 'Показано английское название: точная русская форма не подтверждена.' : 'English title shown because the exact Russian form is unresolved.')}</small>
        </span>
      </label>;
    })}</div>
    <div className="nte-model-note">
      <Shield size={17} />
      <span>{ru
        ? 'Внутреннее число пробуждения сохраняется только для совместимости сохранений и API. Само по себе оно не добавляет урон.'
        : 'The numeric Awakening value remains only for save/API compatibility. It does not add damage by itself.'}</span>
    </div>
  </div>;
}
