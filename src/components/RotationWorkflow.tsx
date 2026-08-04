import { useEffect } from 'react';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, ListChecks, Play, RefreshCcw, SkipForward, Sparkles } from 'lucide-react';
import { esperCycleById, localizedCycleName } from '../esper-cycles';
import { localizedCharacterName } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';
import { clampPracticeStepIndex, firstIncompleteStepIndex, nextPracticeStepIndex, phaseStepPosition, previousPracticeStepIndex, requiredRotationStepsComplete } from '../rotation-practice';
import type { Locale, RotationActionKind, RotationPhase, RotationPreset, RotationStep } from '../types';

type RotationView = 'plan' | 'practice';

interface RotationWorkflowProps {
  preset: RotationPreset;
  completed: ReadonlySet<string>;
  onToggleStep: (stepId: string) => void;
  onResetProgress: () => void;
}

const actionLabels: Record<RotationActionKind, { ru: string; en: string }> = {
  prepare: { ru: 'подготовка', en: 'prepare' },
  swap: { ru: 'смена персонажа', en: 'swap' },
  ultimate: { ru: 'сверхспособность', en: 'ultimate' },
  skill: { ru: 'навык', en: 'skill' },
  redirect: { ru: 'навык перенаправления', en: 'redirect skill' },
  basic: { ru: 'базовые атаки', en: 'basic attacks' },
  cycle: { ru: 'цикл эспера', en: 'Esper Cycle' },
  recovery: { ru: 'восстановление', en: 'recovery' },
};

const phaseLabels: Record<RotationPhase, { ru: string; en: string }> = {
  setup: { ru: 'Подготовка', en: 'Setup' },
  burst: { ru: 'Основная последовательность', en: 'Main sequence' },
  recovery: { ru: 'Восстановление', en: 'Recovery' },
};

function normalizeView(value: unknown): RotationView | null {
  return value === 'plan' || value === 'practice' ? value : null;
}

function normalizeCursors(value: unknown): Record<string, number> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return Object.fromEntries(Object.entries(value).flatMap(([key, cursor]) => typeof cursor === 'number' && Number.isFinite(cursor)
    ? [[key, Math.max(0, Math.trunc(cursor))]]
    : []));
}

function purposeForStep(step: RotationStep, locale: Locale): string {
  if (step.cycle) {
    const cycle = esperCycleById.get(step.cycle);
    return locale === 'ru'
      ? `Запустить или подготовить цикл «${localizedCycleName(step.cycle, locale)}»${cycle?.durationSeconds ? ` на ${cycle.durationSeconds} сек.` : '.'}`
      : `Trigger or prepare ${localizedCycleName(step.cycle, locale)}${cycle?.durationSeconds ? ` for ${cycle.durationSeconds}s.` : '.'}`;
  }

  const purpose: Record<RotationActionKind, { ru: string; en: string }> = {
    prepare: { ru: 'Создать условия для следующих действий, не начиная основную последовательность раньше времени.', en: 'Create the conditions for the next actions without starting the main sequence too early.' },
    swap: { ru: 'Передать активное поле следующему персонажу в порядке, указанном источником.', en: 'Hand the active field to the next character in the source-backed order.' },
    ultimate: { ru: 'Использовать сверхспособность в той точке цепочки, где её эффекты должны поддержать следующие действия.', en: 'Use the Ultimate where its effects can support the following actions.' },
    skill: { ru: 'Продолжить опубликованную последовательность и подготовить следующий шаг.', en: 'Continue the published sequence and prepare the next step.' },
    redirect: { ru: 'Продолжить цепочку через навык перенаправления и передать нужный эффект дальше.', en: 'Continue the chain through a Redirect Skill and carry the intended effect forward.' },
    basic: { ru: 'Добрать нужные срабатывания или ресурсы перед следующим обязательным действием.', en: 'Build the required triggers or resources before the next required action.' },
    cycle: { ru: 'Активировать предусмотренный планом цикл эспера.', en: 'Activate the Esper Cycle required by the plan.' },
    recovery: { ru: 'Вернуть ресурсы и состояние команды к следующему повторению ротации.', en: 'Restore team resources and state for the next rotation loop.' },
  };
  return purpose[step.action][locale];
}

export function RotationWorkflow({ preset, completed, onToggleStep, onResetProgress }: RotationWorkflowProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [view, setView] = useLocalStorage<RotationView>('nte.rotation.view.v1', 'plan', { normalize: normalizeView });
  const [cursors, setCursors] = useLocalStorage<Record<string, number>>('nte.rotation.cursor.v1', {}, { normalize: normalizeCursors });
  const firstIncomplete = firstIncompleteStepIndex(preset.steps, completed);
  const cursor = clampPracticeStepIndex(cursors[preset.id] ?? firstIncomplete, preset.steps.length);
  const currentStep = preset.steps[cursor];
  const phasePosition = phaseStepPosition(preset.steps, cursor);
  const completedCount = preset.steps.filter((step) => completed.has(step.id)).length;
  const allRequiredComplete = requiredRotationStepsComplete(preset.steps, completed);

  useEffect(() => {
    setCursors((current) => {
      const existing = current[preset.id];
      const safe = existing === undefined ? firstIncomplete : clampPracticeStepIndex(existing, preset.steps.length);
      return existing === safe ? current : { ...current, [preset.id]: safe };
    });
  }, [firstIncomplete, preset.id, preset.steps.length, setCursors]);

  const setCursor = (index: number) => setCursors((current) => ({
    ...current,
    [preset.id]: clampPracticeStepIndex(index, preset.steps.length),
  }));

  const startPractice = () => {
    setCursor(firstIncomplete);
    setView('practice');
  };

  const completeAndNext = () => {
    if (!currentStep) return;
    if (!completed.has(currentStep.id)) onToggleStep(currentStep.id);
    setCursor(nextPracticeStepIndex(cursor, preset.steps.length));
  };

  const restart = () => {
    onResetProgress();
    setCursor(0);
  };

  return <section className="rotation-workflow" aria-label={ru ? 'План ротации' : 'Rotation plan'}>
    <div className="rotation-workflow-heading"><div><ListChecks size={22} /><span><h2>{ru ? 'Порядок действий' : 'Action order'}</h2><p>{ru ? 'План показывает всю цепочку; тренировка оставляет на экране только текущий шаг.' : 'Plan shows the full chain; Practice keeps only the current step on screen.'}</p></span></div><div className="rotation-view-switch" role="tablist" aria-label={ru ? 'Вид ротации' : 'Rotation view'}><button type="button" role="tab" aria-selected={view === 'plan'} className={view === 'plan' ? 'active' : ''} onClick={() => setView('plan')}><ListChecks size={15} /> {ru ? 'План' : 'Plan'}</button><button type="button" role="tab" aria-selected={view === 'practice'} className={view === 'practice' ? 'active' : ''} onClick={startPractice}><Play size={15} /> {ru ? 'Тренировка' : 'Practice'}</button></div></div>

    <div className="rotation-progress-line"><span>{ru ? 'Выполнено' : 'Completed'}: {completedCount}/{preset.steps.length}</span><i><u style={{ width: `${preset.steps.length ? completedCount / preset.steps.length * 100 : 0}%` }} /></i><button type="button" onClick={restart}><RefreshCcw size={14} /> {ru ? 'Начать заново' : 'Restart'}</button></div>

    {view === 'plan' ? <div className="rotation-plan">
      <div className="rotation-plan-head"><span>#</span><span>{ru ? 'Сейчас сделай' : 'Do this'}</span><span>{ru ? 'Роль шага' : 'Step purpose'}</span><span>{ru ? 'Должно получиться' : 'Expected result'}</span></div>
      {(['setup', 'burst', 'recovery'] as RotationPhase[]).map((phase) => {
        const phaseSteps = preset.steps.filter((step) => step.phase === phase);
        return <section className={`rotation-plan-phase phase-${phase}`} key={phase}><header><span>{phaseLabels[phase][locale]}</span><small>{phaseSteps.length} {ru ? 'шаг.' : 'steps'}</small></header>{phaseSteps.map((step) => {
          const globalIndex = preset.steps.findIndex((entry) => entry.id === step.id);
          const isComplete = completed.has(step.id);
          return <label className={`rotation-plan-row ${isComplete ? 'complete' : ''}`} key={step.id}><input type="checkbox" checked={isComplete} onChange={() => onToggleStep(step.id)} /><span className="rotation-plan-number">{isComplete ? <Check size={15} /> : globalIndex + 1}</span><span className="rotation-plan-action"><b>{localizedCharacterName(step.actor, locale)}</b><em>{actionLabels[step.action][locale]}{step.optional ? ` · ${ru ? 'необязательно' : 'optional'}` : ''}</em><p>{step.instruction[locale]}</p></span><span className="rotation-plan-purpose">{purposeForStep(step, locale)}</span><span className="rotation-plan-outcome"><Sparkles size={14} />{step.outcome[locale]}</span></label>;
        })}</section>;
      })}
    </div> : allRequiredComplete ? <div className="rotation-practice-complete"><CheckCircle2 size={34} /><h3>{ru ? 'Обязательная часть пройдена' : 'Required rotation complete'}</h3><p>{ru ? 'Все обязательные шаги выполнены. Необязательные действия не блокируют завершение: их можно отдельно потренировать в полном плане.' : 'Every required step is complete. Optional actions do not block completion and can be practiced separately from the full plan.'}</p><div><button className="button primary" type="button" onClick={restart}><RefreshCcw size={16} /> {ru ? 'Повторить ротацию' : 'Repeat rotation'}</button><button className="button ghost" type="button" onClick={() => setView('plan')}>{ru ? 'Открыть план' : 'Open plan'}</button></div></div> : currentStep ? <article className={`rotation-practice-card phase-${currentStep.phase}`}>
      <header><div><span>{phaseLabels[currentStep.phase][locale]}</span><small>{ru ? `Шаг ${phasePosition.current} из ${phasePosition.total} в разделе` : `Step ${phasePosition.current} of ${phasePosition.total} in phase`}</small></div><strong>{cursor + 1}/{preset.steps.length}</strong></header>
      <div className="rotation-practice-actor"><b>{localizedCharacterName(currentStep.actor, locale)}</b><span>{actionLabels[currentStep.action][locale]}</span>{currentStep.optional ? <em>{ru ? 'Можно пропустить' : 'May be skipped'}</em> : <em>{ru ? 'По порядку источника' : 'Source order'}</em>}</div>
      <div className="rotation-practice-content"><section><span>{ru ? 'Сейчас сделай' : 'Do this now'}</span><p>{currentStep.instruction[locale]}</p></section><section><span>{ru ? 'Зачем' : 'Why'}</span><p>{purposeForStep(currentStep, locale)}</p></section><section><span>{ru ? 'Должно получиться' : 'Expected result'}</span><p>{currentStep.outcome[locale]}</p></section></div>
      <footer><button className="button ghost" type="button" disabled={cursor === 0} onClick={() => setCursor(previousPracticeStepIndex(cursor, preset.steps.length))}><ChevronLeft size={17} /> {ru ? 'Назад' : 'Previous'}</button>{currentStep.optional ? <button className="button ghost" type="button" onClick={() => setCursor(nextPracticeStepIndex(cursor, preset.steps.length))}><SkipForward size={17} /> {ru ? 'Пропустить' : 'Skip'}</button> : null}<button className="button primary" type="button" onClick={completeAndNext}>{completed.has(currentStep.id) ? (ru ? 'Следующий шаг' : 'Next step') : (ru ? 'Готово, дальше' : 'Done, next')} <ChevronRight size={17} /></button></footer>
      <p className="rotation-practice-timing">{preset.timingPolicy[locale]}</p>
    </article> : null}
  </section>;
}
