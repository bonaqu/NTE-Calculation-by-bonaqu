import { useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Layers3, ListTree, ShieldCheck, Sparkles } from 'lucide-react';
import {
  COMBAT_SCENARIO_STORAGE_KEY,
  initialCombatScenarioState,
  normalizeCombatScenarioState,
  type CombatScenarioState,
} from '../combat-scenario';
import type { GameVisibleTeamState } from '../game-visible-build';
import { localizedCharacterName } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  initialRotationScenarioImportMetadata,
  normalizeRotationScenarioImportMetadata,
  ROTATION_SCENARIO_IMPORT_STORAGE_KEY,
  type RotationScenarioImportMetadata,
} from '../rotation-scenario-import';
import {
  compileVerifiedActionScenario,
  compileVerifiedRotationFragment,
  verifiedActionScenarioRecipes,
  verifiedRotationFragments,
  type VerifiedActionScenarioRecipe,
  type VerifiedRotationFragment,
} from '../verified-action-scenario-recipes';
import {
  compileVerifiedRotationRecipe,
  verifiedRotationRecipes,
  type VerifiedRotationRecipe,
} from '../verified-rotation-recipes';
import { visibleActionById } from '../verified-visible-actions';
import '../verified-scenario-recipes.css';

interface VerifiedScenarioRecipePanelProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
}

type ApplyStatus =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

function requiredSkillLabel(skill: string, ru: boolean): string {
  if (skill === 'basic') return ru ? 'Базовая атака' : 'Basic Attack';
  if (skill === 'skill') return ru ? 'Навык' : 'Skill';
  if (skill === 'ultimate') return ru ? 'Сверхспособность' : 'Ultimate';
  return ru ? 'Навык поддержки' : 'Support Skill';
}

function scalingLabel(value: 'atk' | 'def' | 'max-hp' | undefined, ru: boolean): string {
  if (value === 'def') return ru ? 'от итоговой Защиты' : 'from final DEF';
  if (value === 'max-hp') return ru ? 'от максимальных ОЗ' : 'from Max HP';
  return ru ? 'от итоговой Атаки' : 'from final ATK';
}

function timingLabel(recipe: VerifiedActionScenarioRecipe, ru: boolean): string {
  const timing = recipe.timingConstraint;
  if (!timing) return ru
    ? 'Без подтверждённого времени: 0 с — только локальная точка отсчёта.'
    : 'No verified timing: 0s is only a local reference origin.';
  if (timing.kind === 'relative-offset') return ru
    ? `${timing.seconds} с после: ${timing.anchor.ru}.`
    : `${timing.seconds}s after ${timing.anchor.en}.`;
  return ru
    ? `Минимум ${timing.seconds} с после предыдущего срабатывания; повтор не добавляется.`
    : `At least ${timing.seconds}s after the previous trigger; no repeat is added.`;
}

function rotationCoverageLabel(recipe: VerifiedRotationRecipe, ru: boolean): string {
  return recipe.coverage === 'complete-action-order'
    ? (ru ? 'Полный подтверждённый порядок действий' : 'Complete verified action order')
    : (ru ? 'Частичный подтверждённый порядок' : 'Partial verified action order');
}

function rotationTimingLabel(recipe: VerifiedRotationRecipe, ru: boolean): string {
  return recipe.timingMode === 'confirmed-seconds'
    ? (ru ? 'Посекундный таймлайн подтверждён' : 'Confirmed-second timeline')
    : (ru ? 'Только порядок · секунды не подтверждены' : 'Order only · seconds unverified');
}

function groupedRecipes(recipes: readonly VerifiedActionScenarioRecipe[]): Array<{
  characterName: string;
  recipes: VerifiedActionScenarioRecipe[];
}> {
  const groups = new Map<string, VerifiedActionScenarioRecipe[]>();
  for (const recipe of recipes) {
    const current = groups.get(recipe.characterName) ?? [];
    current.push(recipe);
    groups.set(recipe.characterName, current);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([characterName, entries]) => ({
      characterName,
      recipes: entries.sort((left, right) => left.title.en.localeCompare(right.title.en)),
    }));
}

export function VerifiedScenarioRecipePanel({ team, locale }: VerifiedScenarioRecipePanelProps) {
  const ru = locale === 'ru';
  const [, setScenario] = useLocalStorage<CombatScenarioState>(
    COMBAT_SCENARIO_STORAGE_KEY,
    initialCombatScenarioState(),
    { normalize: normalizeCombatScenarioState },
  );
  const [, setImportMetadata] = useLocalStorage<RotationScenarioImportMetadata>(
    ROTATION_SCENARIO_IMPORT_STORAGE_KEY,
    initialRotationScenarioImportMetadata(),
    { normalize: normalizeRotationScenarioImportMetadata },
  );
  const teamNames = useMemo(() => new Set(team.builds.map((build) => build.characterName)), [team.builds]);
  const availableRecipes = useMemo(
    () => verifiedActionScenarioRecipes.filter((recipe) => teamNames.has(recipe.characterName)),
    [teamNames],
  );
  const availableFragments = useMemo(
    () => verifiedRotationFragments.filter((fragment) => teamNames.has(fragment.characterName)),
    [teamNames],
  );
  const availableRotationRecipes = useMemo(
    () => verifiedRotationRecipes.filter((recipe) => recipe.team.every((characterName) => teamNames.has(characterName))),
    [teamNames],
  );
  const groups = useMemo(() => groupedRecipes(availableRecipes), [availableRecipes]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [selectedFragmentId, setSelectedFragmentId] = useState('');
  const [selectedRotationRecipeId, setSelectedRotationRecipeId] = useState('');
  const [status, setStatus] = useState<ApplyStatus>({ kind: 'idle' });

  const selectedRecipe = availableRecipes.find((recipe) => recipe.id === selectedRecipeId)
    ?? availableRecipes[0];
  const selectedFragment = availableFragments.find((fragment) => fragment.id === selectedFragmentId)
    ?? availableFragments[0];
  const selectedRotationRecipe = availableRotationRecipes.find((recipe) => recipe.id === selectedRotationRecipeId)
    ?? availableRotationRecipes[0];
  const selectedAction = selectedRecipe ? visibleActionById.get(selectedRecipe.actionId) : undefined;

  const confirmReplacement = (current: CombatScenarioState): boolean => (
    current.steps.length === 0
    || window.confirm(ru
      ? 'Этот рецепт заменит все текущие шаги боевого сценария. Состав и сборки не изменятся. Продолжить?'
      : 'This recipe will replace every current Combat Scenario step. The lineup and builds will not change. Continue?')
  );

  const applyRecipe = () => {
    if (!selectedRecipe) return;
    const compiled = compileVerifiedActionScenario(selectedRecipe.id, team, locale);
    if (!compiled.ok) {
      setStatus({ kind: 'error', message: compiled.reason[locale] });
      return;
    }
    let applied = false;
    setScenario((current) => {
      if (!confirmReplacement(current)) return current;
      applied = true;
      return compiled.scenario;
    });
    if (!applied) return;
    setImportMetadata(initialRotationScenarioImportMetadata());
    setStatus({
      kind: 'success',
      message: ru
        ? 'Одиночный подтверждённый сценарий применён. Импорт Rotation Lab отсоединён.'
        : 'The standalone verified scenario was applied. Rotation Lab provenance was detached.',
    });
  };

  const applyFragment = () => {
    if (!selectedFragment) return;
    const compiled = compileVerifiedRotationFragment(selectedFragment.id, team, locale);
    if (!compiled.ok) {
      setStatus({ kind: 'error', message: compiled.reason[locale] });
      return;
    }
    let applied = false;
    setScenario((current) => {
      if (!confirmReplacement(current)) return current;
      applied = true;
      return compiled.scenario;
    });
    if (!applied) return;
    setImportMetadata(initialRotationScenarioImportMetadata());
    setStatus({
      kind: 'success',
      message: ru
        ? 'Подтверждённый порядок применён без выдуманных секунд. Импорт Rotation Lab отсоединён.'
        : 'The verified order was applied without invented seconds. Rotation Lab provenance was detached.',
    });
  };

  const applyRotationRecipe = () => {
    if (!selectedRotationRecipe) return;
    const compiled = compileVerifiedRotationRecipe(selectedRotationRecipe.id, team, locale);
    if (!compiled.ok) {
      setStatus({ kind: 'error', message: compiled.reason[locale] });
      return;
    }
    let applied = false;
    setScenario((current) => {
      if (!confirmReplacement(current)) return current;
      applied = true;
      return compiled.scenario;
    });
    if (!applied) return;
    setImportMetadata(compiled.metadata);
    setStatus({
      kind: 'success',
      message: ru
        ? 'Частичный подтверждённый порядок применён. Пробелы не синтезированы, provenance Rotation Lab сохранён.'
        : 'The partial verified order was applied. Gaps were not synthesized and Rotation Lab provenance was preserved.',
    });
  };

  return <section className="verified-scenario-recipes" aria-label={ru ? 'Готовые подтверждённые сценарии' : 'Verified scenario recipes'}>
    <div className="verified-scenario-recipes__heading">
      <ShieldCheck size={21} />
      <div>
        <span>{ru ? '86 ДЕЙСТВИЙ + АУДИТ ROTATION LAB' : '86 ACTIONS + ROTATION LAB AUDIT'}</span>
        <h3>{ru ? 'Готовые подтверждённые сценарии' : 'Verified scenario recipes'}</h3>
        <p>{ru
          ? 'Одиночные действия, точные связки и частичные ротации разделены. Повторения, эффекты, циклы и секунды появляются только при прямом подтверждении.'
          : 'Standalone actions, exact fragments and partial rotations are separated. Repeats, effects, Cycles and seconds appear only with direct evidence.'}</p>
      </div>
    </div>

    <div className="verified-scenario-recipes__grid">
      <article>
        <div className="verified-scenario-recipes__kind"><Sparkles size={18} /><div><b>{ru ? 'Одиночное действие' : 'Standalone action'}</b><small>{availableRecipes.length} / 86</small></div></div>
        {selectedRecipe && selectedAction ? <>
          <label>
            <span>{ru ? 'Рецепт для текущей команды' : 'Recipe for current team'}</span>
            <select value={selectedRecipe.id} onChange={(event) => {
              setSelectedRecipeId(event.target.value);
              setStatus({ kind: 'idle' });
            }}>
              {groups.map((group) => <optgroup key={group.characterName} label={localizedCharacterName(group.characterName, locale)}>
                {group.recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title[locale]}</option>)}
              </optgroup>)}
            </select>
          </label>
          <div className="verified-scenario-recipes__facts">
            <span>{requiredSkillLabel(selectedAction.requiredSkill, ru)}{selectedAction.requiredLevel === '—' ? '' : ` · ${ru ? 'ур.' : 'Lv.'} ${selectedAction.requiredLevel}`}</span>
            <span>{scalingLabel(selectedAction.scalingStat, ru)}</span>
            <span>{timingLabel(selectedRecipe, ru)}</span>
          </div>
          <p>{selectedRecipe.description[locale]}</p>
          <div className="verified-scenario-recipes__source">
            <span>{selectedAction.sourcePublisher} · {selectedAction.sourceUpdatedAt}</span>
            <a href={selectedAction.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Источник действия' : 'Action source'} <ExternalLink size={13} /></a>
          </div>
          <button type="button" onClick={applyRecipe}><CheckCircle2 size={16} />{ru ? 'Собрать одиночный сценарий' : 'Build standalone scenario'}</button>
        </> : <p>{ru ? 'В текущей команде нет доступных подтверждённых действий.' : 'The current team has no available verified actions.'}</p>}
      </article>

      <article>
        <div className="verified-scenario-recipes__kind"><Layers3 size={18} /><div><b>{ru ? 'Точная атакующая связка' : 'Exact action fragment'}</b><small>{availableFragments.length}</small></div></div>
        {selectedFragment ? <>
          <label>
            <span>{ru ? 'Опубликованный порядок' : 'Published order'}</span>
            <select value={selectedFragment.id} onChange={(event) => {
              setSelectedFragmentId(event.target.value);
              setStatus({ kind: 'idle' });
            }}>
              {availableFragments.map((fragment) => <option key={fragment.id} value={fragment.id}>{fragment.title[locale]}</option>)}
            </select>
          </label>
          <p>{selectedFragment.description[locale]}</p>
          <ol>{selectedFragment.steps.map((step) => {
            const action = visibleActionById.get(step.actionId);
            return <li key={step.actionId}>{action?.title[locale] ?? step.actionId}</li>;
          })}</ol>
          <div className="verified-scenario-recipes__order-only">{ru
            ? 'Порядок подтверждён. Все шаги получают одну локальную отметку 0 с: это не посекундный таймлайн.'
            : 'Order is verified. Every step receives the same local 0s marker; this is not a second-by-second timeline.'}</div>
          <div className="verified-scenario-recipes__source">
            <span>{selectedFragment.evidence.sourcePublisher} · {selectedFragment.evidence.sourceUpdatedAt}</span>
            <a href={selectedFragment.evidence.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Источник порядка' : 'Order source'} <ExternalLink size={13} /></a>
          </div>
          <button type="button" onClick={applyFragment}><Layers3 size={16} />{ru ? 'Собрать фрагмент' : 'Build fragment'}</button>
        </> : <p>{ru
          ? 'Для текущей команды пока нет многодейственного фрагмента с полностью подтверждённым порядком.'
          : 'The current team has no multi-action fragment with fully verified order yet.'}</p>}
      </article>

      <article>
        <div className="verified-scenario-recipes__kind"><ListTree size={18} /><div><b>{ru ? 'Аудированный рецепт Rotation Lab' : 'Audited Rotation Lab recipe'}</b><small>{availableRotationRecipes.length} / 4</small></div></div>
        {selectedRotationRecipe ? <>
          <label>
            <span>{ru ? 'Требуется полный исходный состав' : 'Requires the complete source lineup'}</span>
            <select value={selectedRotationRecipe.id} onChange={(event) => {
              setSelectedRotationRecipeId(event.target.value);
              setStatus({ kind: 'idle' });
            }}>
              {availableRotationRecipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title[locale]}</option>)}
            </select>
          </label>
          <div className="verified-scenario-recipes__facts rotation-audit">
            <span>{rotationCoverageLabel(selectedRotationRecipe, ru)}</span>
            <span>{selectedRotationRecipe.steps.length} {ru ? 'действий' : 'actions'}</span>
            <span>{selectedRotationRecipe.gaps.length} {ru ? 'пробелов покрытия' : 'coverage gaps'}</span>
            <span>{rotationTimingLabel(selectedRotationRecipe, ru)}</span>
          </div>
          <p>{selectedRotationRecipe.description[locale]}</p>
          <ol>{selectedRotationRecipe.steps.map((step) => {
            const action = visibleActionById.get(step.actionId);
            return <li key={`${step.sourceStepId}-${step.part}-${step.actionId}`}>
              <b>{localizedCharacterName(step.characterName, locale)}</b> · {action?.title[locale] ?? step.actionId}
            </li>;
          })}</ol>
          <details className="verified-scenario-recipes__gaps">
            <summary>{ru ? `Что не вошло: ${selectedRotationRecipe.gaps.length}` : `What remains uncovered: ${selectedRotationRecipe.gaps.length}`}</summary>
            <ul>{selectedRotationRecipe.gaps.map((gap, index) => <li key={`${gap.sourceStepId}-${gap.part}-${gap.kind}-${index}`}>{gap.note[locale]}</li>)}</ul>
          </details>
          <div className="verified-scenario-recipes__order-only">{ru
            ? 'В сценарий попадут только перечисленные действия. Эффекты, циклы и неподдерживаемые части останутся пробелами; все отметки 0 с означают только порядок.'
            : 'Only the listed actions enter the scenario. Effects, Cycles and unsupported parts remain gaps; every 0s marker represents order only.'}</div>
          <div className="verified-scenario-recipes__source">
            <span>{selectedRotationRecipe.sourcePublisher} · {selectedRotationRecipe.sourceUpdatedAt}</span>
            <a href={selectedRotationRecipe.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Источник ротации' : 'Rotation source'} <ExternalLink size={13} /></a>
          </div>
          <button type="button" onClick={applyRotationRecipe}><ListTree size={16} />{ru ? 'Собрать частичный порядок' : 'Build partial order'}</button>
        </> : <p>{ru
          ? 'Ни один из четырёх аудированных рецептов не совпадает с текущим полным составом команды.'
          : 'None of the four audited recipes matches the current complete team lineup.'}</p>}
      </article>
    </div>

    {status.kind !== 'idle' ? <div className={`verified-scenario-recipes__status ${status.kind}`} role="status">{status.message}</div> : null}
    <small className="verified-scenario-recipes__scope">{ru
      ? 'Частичный порядок — это библиотека доказанных действий с видимыми пробелами, а не полная DPS-ротация.'
      : 'A partial order is a library of verified actions with visible gaps, not a complete DPS rotation.'}</small>
  </section>;
}
