import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Plus,
  Shield,
  Sparkles,
  Swords,
  TimerReset,
  Trash2,
} from 'lucide-react';
import { verifiedCombatCycleModels } from '../combat-cycle-models';
import {
  calculateCombatScenario,
  COMBAT_SCENARIO_STORAGE_KEY,
  createCombatScenarioStep,
  initialCombatScenarioState,
  normalizeCombatScenarioState,
  type CombatScenarioState,
  type CombatScenarioStep,
  type CombatScenarioStepKind,
} from '../combat-scenario';
import { esperCycleById } from '../esper-cycles';
import { actionsForCharacter } from '../game-visible-calculation';
import type { GameVisibleTeamState } from '../game-visible-build';
import { localizedCharacterName } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { rotationPresetById, rotationPresets } from '../rotation-presets';
import {
  confirmRotationScenarioTiming,
  importRotationPresetToScenario,
  initialRotationScenarioImportMetadata,
  invalidateRotationScenarioTiming,
  normalizeRotationScenarioImportMetadata,
  previewRotationScenarioImport,
  ROTATION_SCENARIO_IMPORT_STORAGE_KEY,
  rotationSourceStep,
  type RotationScenarioImportMetadata,
} from '../rotation-scenario-import';
import { teamEffectsForCharacter } from '../team-effects';

interface TeamCombatScenarioPanelProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
  onTeamChange: (team: GameVisibleTeamState) => void;
}

function nextStepId(steps: readonly CombatScenarioStep[]): string {
  const used = new Set(steps.map((step) => step.id));
  let index = steps.length + 1;
  while (used.has(`step-${index}`)) index += 1;
  return `step-${index}`;
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(600, parsed)) : 0;
}

function stepLabel(kind: CombatScenarioStepKind, ru: boolean): string {
  if (kind === 'activate-effect') return ru ? 'Включить эффект персонажа' : 'Activate character effect';
  if (kind === 'activate-cycle') return ru ? 'Активировать цикл эспера' : 'Activate Esper Cycle';
  if (kind === 'wait') return ru ? 'Ожидание / непокрытый шаг' : 'Wait / unsupported step';
  return ru ? 'Подтверждённое действие' : 'Verified action';
}

export function TeamCombatScenarioPanel({ team, locale, onTeamChange }: TeamCombatScenarioPanelProps) {
  const ru = locale === 'ru';
  const [scenario, setScenario] = useLocalStorage<CombatScenarioState>(
    COMBAT_SCENARIO_STORAGE_KEY,
    initialCombatScenarioState(),
    { normalize: normalizeCombatScenarioState },
  );
  const [importMetadata, setImportMetadata] = useLocalStorage<RotationScenarioImportMetadata>(
    ROTATION_SCENARIO_IMPORT_STORAGE_KEY,
    initialRotationScenarioImportMetadata(),
    { normalize: normalizeRotationScenarioImportMetadata },
  );
  const [selectedRotationId, setSelectedRotationId] = useState(rotationPresets[0]?.id ?? '');
  const result = useMemo(() => calculateCombatScenario(team, scenario), [scenario, team]);
  const selectedPreset = rotationPresetById.get(selectedRotationId) ?? rotationPresets[0];
  const importPreview = useMemo(
    () => selectedPreset ? previewRotationScenarioImport(selectedPreset) : null,
    [selectedPreset],
  );
  const importedPreset = rotationPresetById.get(importMetadata.sourceRotationId);
  const supportedCycles = useMemo(() => verifiedCombatCycleModels.map((model) => ({
    model,
    cycle: esperCycleById.get(model.id),
  })).filter((entry) => Boolean(entry.cycle)), []);

  const detachImport = () => setImportMetadata(initialRotationScenarioImportMetadata());
  const updateStep = (
    id: string,
    updater: (step: CombatScenarioStep) => CombatScenarioStep,
    detach = false,
  ) => {
    if (detach) detachImport();
    setScenario((current) => ({
      ...current,
      steps: current.steps.map((step) => step.id === id ? updater(step) : step),
    }));
  };

  const updateTimestamp = (id: string, at: number) => {
    if (importMetadata.timingStatus === 'confirmed-seconds') {
      const invalidated = invalidateRotationScenarioTiming(scenario, importMetadata, locale);
      setScenario({
        ...invalidated.scenario,
        steps: invalidated.scenario.steps.map((step) => step.id === id ? { ...step, at } : step),
      });
      setImportMetadata(invalidated.metadata);
      return;
    }
    updateStep(id, (step) => ({ ...step, at }));
  };

  const addStep = (kind: CombatScenarioStepKind) => {
    detachImport();
    setScenario((current) => {
      const step = createCombatScenarioStep(current.steps.length, kind);
      step.id = nextStepId(current.steps);
      step.at = current.steps.reduce((maximum, entry) => Math.max(maximum, entry.at), 0);
      if (kind === 'action') {
        const sourceSlot = team.builds.findIndex((build) => actionsForCharacter(build.characterName).length > 0);
        step.sourceSlot = sourceSlot >= 0 ? sourceSlot : 0;
        step.actionId = actionsForCharacter(team.builds[step.sourceSlot]?.characterName ?? '')[0]?.id ?? '';
      }
      if (kind === 'activate-effect') {
        const sourceSlot = team.builds.findIndex((build) => teamEffectsForCharacter(build.characterName).length > 0);
        step.sourceSlot = sourceSlot >= 0 ? sourceSlot : 0;
        step.effectId = teamEffectsForCharacter(team.builds[step.sourceSlot]?.characterName ?? '')[0]?.id ?? '';
      }
      if (kind === 'activate-cycle') {
        step.sourceSlot = 0;
        step.cycleId = supportedCycles[0]?.model.id ?? '';
      }
      return { ...current, steps: [...current.steps, step] };
    });
  };

  const removeStep = (id: string) => {
    detachImport();
    setScenario((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== id),
    }));
  };

  const duplicateStep = (id: string) => {
    detachImport();
    setScenario((current) => {
      const index = current.steps.findIndex((step) => step.id === id);
      const source = current.steps[index];
      if (!source) return current;
      const copy = { ...source, id: nextStepId(current.steps) };
      const next = [...current.steps];
      next.splice(index + 1, 0, copy);
      return { ...current, steps: next };
    });
  };

  const moveStep = (id: string, direction: -1 | 1) => setScenario((current) => {
    const index = current.steps.findIndex((step) => step.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.steps.length) return current;
    const next = [...current.steps];
    [next[index], next[target]] = [next[target]!, next[index]!];
    return { ...current, steps: next };
  });

  const importRotation = () => {
    if (!selectedPreset) return;
    if (scenario.steps.length > 0) {
      const accepted = window.confirm(ru
        ? 'Импорт заменит текущий состав и все шаги боевого сценария. Продолжить?'
        : 'Importing will replace the current lineup and every Combat Scenario step. Continue?');
      if (!accepted) return;
    }
    const imported = importRotationPresetToScenario(selectedPreset, team, locale);
    onTeamChange(imported.team);
    setScenario(imported.scenario);
    setImportMetadata(imported.metadata);
  };

  const confirmImportedTiming = () => {
    const confirmed = confirmRotationScenarioTiming(scenario, importMetadata);
    setScenario(confirmed.scenario);
    setImportMetadata(confirmed.metadata);
  };

  const format = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const timeUnit = importMetadata.timingStatus === 'order-only' ? '#' : (ru ? 'с' : 's');

  return <section className="combat-scenario-panel">
    <div className="combat-scenario-heading">
      <div>
        <span>{ru ? 'ПЕРВЫЙ СЛОЙ РЕАЛЬНОГО КОМАНДНОГО РАСЧЁТА' : 'FIRST REAL TEAM-COMBAT LAYER'}</span>
        <h2>{ru ? 'Боевой сценарий' : 'Combat scenario'}</h2>
        <p>{ru
          ? 'Расставь подтверждённые действия, эффекты персонажей и циклы эспера по времени. Сайт посчитает только доказанные части и покажет, что пока не покрыто моделью.'
          : 'Place verified actions, character effects and Esper Cycles on a timeline. The site calculates only sourced parts and exposes everything not covered yet.'}</p>
      </div>
      <div className="combat-scenario-warning"><Shield size={18} /><span>{ru
        ? 'Это не полный DPS ротации: анимации, энергия и неподтверждённые удары не додумываются.'
        : 'This is not full rotation DPS: animations, energy and unsupported hits are not guessed.'}</span></div>
    </div>

    <section className="rotation-scenario-import" aria-label={ru ? 'Импорт ротации' : 'Rotation import'}>
      <div className="rotation-scenario-import-heading">
        <Download size={20} />
        <div><h3>{ru ? 'Импорт из Rotation Lab' : 'Import from Rotation Lab'}</h3><p>{ru
          ? 'Переносит опубликованный порядок, но не выдаёт порядковые номера за секунды.'
          : 'Transfers the sourced order without presenting ordinal positions as seconds.'}</p></div>
      </div>
      <div className="rotation-scenario-import-controls">
        <label><span>{ru ? 'Ротация' : 'Rotation'}</span><select value={selectedRotationId} onChange={(event) => setSelectedRotationId(event.target.value)}>{rotationPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title[locale]}</option>)}</select></label>
        <button type="button" onClick={importRotation} disabled={!selectedPreset}><Download size={16} />{ru ? 'Импортировать' : 'Import'}</button>
      </div>
      {selectedPreset && importPreview ? <div className="rotation-scenario-preview">
        <div><span>{ru ? 'Исходных шагов' : 'Source steps'}</span><b>{importPreview.totalSourceSteps}</b></div>
        <div><span>{ru ? 'Связано с моделью' : 'Safely bound'}</span><b>{importPreview.mappedSourceSteps}</b></div>
        <div><span>{ru ? 'Действий' : 'Actions'}</span><b>{importPreview.generatedActionSteps}</b></div>
        <div><span>{ru ? 'Окон' : 'Windows'}</span><b>{importPreview.generatedEffectSteps + importPreview.generatedCycleSteps}</b></div>
        <div><span>{ru ? 'Покрытие импорта' : 'Import coverage'}</span><b>{importPreview.coveragePercent}%</b></div>
      </div> : null}
      {selectedPreset ? <div className="rotation-scenario-source"><span>{selectedPreset.sourcePublisher} · {selectedPreset.sourceUpdatedAt}</span><a href={selectedPreset.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Источник ротации' : 'Rotation source'} <ExternalLink size={13} /></a><small>{ru ? 'Покрытие импорта не означает полный DPS ротации.' : 'Import coverage does not mean full rotation DPS coverage.'}</small></div> : null}
    </section>

    {importedPreset && importMetadata.report ? <section className={`rotation-scenario-timing ${importMetadata.timingStatus}`}>
      <div><TimerReset size={20} /><span><b>{importMetadata.timingStatus === 'order-only'
        ? (ru ? 'Порядок без подтверждённых секунд' : 'Order without confirmed seconds')
        : (ru ? 'Секунды подтверждены пользователем' : 'Seconds confirmed by player')}</b><small>{importMetadata.timingStatus === 'order-only'
          ? (ru ? 'Эффекты и циклы пока не участвуют в уроне. Проверь отметки времени перед подтверждением.' : 'Effects and cycles do not affect damage yet. Review timestamps before confirming them.')
          : (ru ? 'Изменение любой отметки времени снова отключит временные окна.' : 'Changing any timestamp will disable timed windows again.')}</small></span></div>
      {importMetadata.timingStatus === 'order-only' ? <button type="button" onClick={confirmImportedTiming}><CheckCircle2 size={16} />{ru ? 'Подтвердить введённые секунды' : 'Confirm entered seconds'}</button> : null}
      <p>{importedPreset.title[locale]} · {importMetadata.report.mappedSourceSteps}/{importMetadata.report.totalSourceSteps} {ru ? 'исходных шагов связано безопасно' : 'source steps safely bound'}</p>
    </section> : null}

    <div className="combat-scenario-summary" aria-label={ru ? 'Итог сценария' : 'Scenario summary'}>
      <div><span>{ru ? 'Подтверждённый ожидаемый урон' : 'Verified expected damage'}</span><strong>{format(result.totalExpected)}</strong></div>
      <div><span>{ru ? 'Покрытие действий' : 'Action coverage'}</span><strong>{result.coveragePercent}%</strong><small>{result.calculatedActionCount}/{result.actionStepCount}</small></div>
      <div><span>{importMetadata.timingStatus === 'order-only' ? (ru ? 'Диапазон порядка' : 'Order span') : (ru ? 'Длительность отметок' : 'Timeline span')}</span><strong>{format(result.durationSeconds)} {timeUnit}</strong></div>
      <div><span>{ru ? 'Эффектов персонажей' : 'Character effects'}</span><strong>{result.activatedEffectCount}</strong></div>
      <div><span>{ru ? 'Циклов эспера' : 'Esper Cycles'}</span><strong>{result.activatedCycleCount}</strong></div>
    </div>

    <div className="combat-scenario-toolbar">
      <label><span>{ru ? 'Название сценария' : 'Scenario name'}</span><input value={scenario.name} maxLength={120} onChange={(event) => setScenario((current) => ({ ...current, name: event.target.value }))} placeholder={ru ? 'Например: окно Шинку после Новы' : 'Example: Shinku post-Nova window'} /></label>
      <div>
        <button type="button" onClick={() => addStep('action')}><Swords size={16} />{ru ? 'Действие' : 'Action'}</button>
        <button type="button" onClick={() => addStep('activate-effect')}><Shield size={16} />{ru ? 'Эффект' : 'Effect'}</button>
        <button type="button" onClick={() => addStep('activate-cycle')}><Sparkles size={16} />{ru ? 'Цикл' : 'Cycle'}</button>
        <button type="button" onClick={() => addStep('wait')}><Clock3 size={16} />{ru ? 'Ожидание' : 'Wait'}</button>
      </div>
    </div>

    <div className="combat-scenario-cycle-policy"><Sparkles size={17} /><span>{ru
      ? 'Числовая модель сейчас подтверждена только для цикла «След»: +20% урона Психики и Лакшаны по общей цели на 12 секунд. Остальные циклы не превращаются в выдуманный урон.'
      : 'Only Stain currently has a verified numerical model: +20% Psyche and Lakshana damage against the shared target for 12 seconds. Other cycles are not converted into invented damage.'}</span></div>

    {scenario.steps.length ? <div className="combat-scenario-editor">
      <div className="combat-scenario-editor-head"><span>{ru ? 'Порядок' : 'Order'}</span><span>{importMetadata.timingStatus === 'order-only' ? (ru ? 'Отметка' : 'Marker') : (ru ? 'Время' : 'Time')}</span><span>{ru ? 'Тип шага' : 'Step type'}</span><span>{ru ? 'Источник' : 'Source'}</span><span>{ru ? 'Действие или условие' : 'Action or condition'}</span><span /></div>
      {scenario.steps.map((step, index) => {
        const build = team.builds[step.sourceSlot];
        const actions = actionsForCharacter(build?.characterName ?? '');
        const effects = teamEffectsForCharacter(build?.characterName ?? '');
        const origin = rotationSourceStep(importMetadata, step.id);
        return <div className="combat-scenario-editor-row" key={step.id}>
          <div className="combat-scenario-order"><b>{index + 1}</b><button type="button" aria-label={ru ? 'Выше' : 'Move up'} disabled={index === 0} onClick={() => moveStep(step.id, -1)}><ChevronUp size={15} /></button><button type="button" aria-label={ru ? 'Ниже' : 'Move down'} disabled={index === scenario.steps.length - 1} onClick={() => moveStep(step.id, 1)}><ChevronDown size={15} /></button></div>
          <label className="combat-scenario-time"><span className="sr-only">{ru ? 'Отметка времени' : 'Time marker'}</span><input type="number" min="0" max="600" step="0.1" value={step.at} onChange={(event) => updateTimestamp(step.id, numberValue(event.target.value))} /><small>{timeUnit}</small></label>
          <select value={step.kind} aria-label={ru ? 'Тип шага' : 'Step type'} onChange={(event) => updateStep(step.id, (current) => ({ ...current, kind: event.target.value as CombatScenarioStepKind, actionId: '', effectId: '', cycleId: '' }), true)}>
            <option value="action">{stepLabel('action', ru)}</option>
            <option value="activate-effect">{stepLabel('activate-effect', ru)}</option>
            <option value="activate-cycle">{stepLabel('activate-cycle', ru)}</option>
            <option value="wait">{stepLabel('wait', ru)}</option>
          </select>
          {step.kind === 'activate-cycle' ? <div className="combat-scenario-shared-target">{ru ? 'Общая цель' : 'Shared target'}</div> : <select value={step.sourceSlot} aria-label={ru ? 'Слот команды' : 'Team slot'} onChange={(event) => updateStep(step.id, (current) => ({ ...current, sourceSlot: Number(event.target.value), actionId: '', effectId: '' }), true)}>
            {team.builds.map((entry, slot) => <option key={`${entry.characterName}-${slot}`} value={slot}>{slot + 1} · {localizedCharacterName(entry.characterName, locale)}</option>)}
          </select>}
          <div className="combat-scenario-value-cell">{step.kind === 'action' ? <select value={step.actionId} aria-label={ru ? 'Подтверждённое действие' : 'Verified action'} onChange={(event) => updateStep(step.id, (current) => ({ ...current, actionId: event.target.value }), true)}>
            <option value="">{actions.length ? (ru ? 'Выбери действие' : 'Select action') : (ru ? 'Нет подтверждённых действий' : 'No verified actions')}</option>
            {actions.map((entry) => <option value={entry.id} key={entry.id}>{entry.title[locale]}</option>)}
          </select> : step.kind === 'activate-effect' ? <select value={step.effectId} aria-label={ru ? 'Проверенный эффект' : 'Verified effect'} onChange={(event) => updateStep(step.id, (current) => ({ ...current, effectId: event.target.value }), true)}>
            <option value="">{effects.length ? (ru ? 'Выбери эффект' : 'Select effect') : (ru ? 'Нет подтверждённых эффектов' : 'No verified effects')}</option>
            {effects.map((entry) => <option value={entry.id} key={entry.id}>{entry.title[locale]}</option>)}
          </select> : step.kind === 'activate-cycle' ? <select value={step.cycleId} aria-label={ru ? 'Подтверждённый цикл эспера' : 'Verified Esper Cycle'} onChange={(event) => updateStep(step.id, (current) => ({ ...current, cycleId: event.target.value }), true)}>
            <option value="">{ru ? 'Выбери численно поддержанный цикл' : 'Select a numerically supported cycle'}</option>
            {supportedCycles.map(({ model, cycle }) => <option value={model.id} key={model.id}>{cycle?.name[locale]} · {model.durationSeconds}{ru ? 'с' : 's'} · +{model.damageBonus}%</option>)}
          </select> : <input value={step.note} maxLength={400} onChange={(event) => updateStep(step.id, (current) => ({ ...current, note: event.target.value }))} placeholder={ru ? 'Что происходит в непокрытой части ротации' : 'What happens in the unsupported rotation part'} />}{origin ? <small>{ru ? 'Rotation Lab' : 'Rotation Lab'} · {origin.step.instruction[locale]}{origin.part ? ` · ${ru ? 'часть' : 'part'} ${origin.part + 1}` : ''}</small> : null}</div>
          <div className="combat-scenario-row-actions"><button type="button" aria-label={ru ? 'Дублировать' : 'Duplicate'} onClick={() => duplicateStep(step.id)}><Copy size={15} /></button><button type="button" aria-label={ru ? 'Удалить' : 'Remove'} onClick={() => removeStep(step.id)}><Trash2 size={15} /></button></div>
        </div>;
      })}
    </div> : <div className="combat-scenario-empty"><Clock3 size={24} /><h3>{ru ? 'Сценарий пока пуст' : 'The scenario is empty'}</h3><p>{ru ? 'Импортируй ротацию или добавь эффект, цикл эспера, действие либо промежуток ожидания.' : 'Import a rotation or add an effect, Esper Cycle, action or wait step.'}</p><button type="button" onClick={() => addStep('action')}><Plus size={16} />{ru ? 'Добавить первое действие' : 'Add first action'}</button></div>}

    {result.steps.length ? <div className="combat-scenario-results">
      <div className="combat-scenario-results-heading"><div><h3>{importMetadata.timingStatus === 'order-only' ? (ru ? 'Импортированный порядок' : 'Imported order') : (ru ? 'Проверенная временная шкала' : 'Verified timeline')}</h3><p>{importMetadata.timingStatus === 'order-only'
        ? (ru ? 'Порядковые отметки ещё не являются секундами. Временные окна отключены.' : 'Ordinal markers are not seconds yet. Timed windows are disabled.')
        : (ru ? 'Шаги отсортированы по времени; при одинаковом времени сохраняется порядок строк.' : 'Steps are sorted by time; equal timestamps preserve row order.')}</p></div><span>{result.blockedStepCount ? `${result.blockedStepCount} ${ru ? 'заблок.' : 'blocked'}` : (ru ? 'без блокировок' : 'no blocks')}</span></div>
      <ol>{result.steps.map((entry) => {
        const damage = entry.calculation?.result;
        const activatedTitle = entry.activatedCycle?.name[locale] ?? entry.effectEvaluation?.effect.title[locale];
        const activeWindowCount = entry.activeEffects.length + entry.activeCycles.length;
        const activatedDuration = entry.activatedCycle
          ? entry.activatedCycle.expiresAt - entry.activatedCycle.startedAt
          : entry.effectEvaluation?.effect.durationSeconds;
        const origin = rotationSourceStep(importMetadata, entry.step.id);
        return <li className={`status-${entry.status}`} key={`${entry.step.id}-${entry.originalIndex}`}>
          <time>{format(entry.step.at)}{timeUnit}</time>
          <div className="combat-scenario-status-icon">{entry.status === 'blocked' ? <CircleAlert size={18} /> : entry.status === 'wait' ? <Clock3 size={18} /> : <CheckCircle2 size={18} />}</div>
          <div className="combat-scenario-result-copy"><b>{entry.status === 'calculated'
            ? entry.calculation?.title[locale]
            : entry.status === 'activated'
              ? activatedTitle
              : entry.status === 'wait'
                ? (entry.step.note || (ru ? 'Непокрытый промежуток' : 'Unsupported interval'))
                : (ru ? 'Шаг заблокирован' : 'Step blocked')}</b><small>{entry.step.kind === 'activate-cycle'
                  ? (ru ? 'Состояние общей цели' : 'Shared target state')
                  : entry.sourceCharacter ? localizedCharacterName(entry.sourceCharacter, locale) : ''}{activeWindowCount ? ` · ${activeWindowCount} ${ru ? 'активн. окон' : 'active windows'}` : ''}{origin ? ` · Rotation Lab: ${origin.step.id}` : ''}</small>{entry.blockedReason ? <p>{entry.blockedReason[locale]}</p> : null}</div>
          <div className="combat-scenario-result-value">{damage ? <><strong>{format(damage.expected)}</strong><small>{ru ? 'ожидаемый' : 'expected'}</small></> : entry.status === 'activated' ? <><strong>{activatedDuration === 'combat' ? '∞' : `${activatedDuration}${ru ? 'с' : 's'}`}</strong><small>{ru ? 'окно' : 'window'}</small></> : null}</div>
        </li>;
      })}</ol>
    </div> : null}
  </section>;
}
