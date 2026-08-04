import { ArrowRight, ListPlus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  evaluateAttackSequence,
  MAX_ATTACK_SEQUENCE_COMPONENTS,
  nextAttackSequenceComponentId,
  type AttackSequenceDraft,
  type AttackSequenceErrorCode,
} from '../team-sequence-builder';
import { formatNumber } from './UI';

interface AttackSequenceBuilderProps {
  characterName: string;
  draft: AttackSequenceDraft;
  currentMultiplierPerUse: number;
  currentUsesPerRotation: number;
  onChange: (draft: AttackSequenceDraft) => void;
  onApply: (draft: AttackSequenceDraft) => void;
  onResetFromCurrent: () => void;
}

const errorLabels: Record<AttackSequenceErrorCode, { ru: string; en: string }> = {
  'no-components': { ru: 'Добавь хотя бы одну часть серии.', en: 'Add at least one sequence component.' },
  'too-many-components': { ru: `Допустимо не больше ${MAX_ATTACK_SEQUENCE_COMPONENTS} строк.`, en: `No more than ${MAX_ATTACK_SEQUENCE_COMPONENTS} rows are allowed.` },
  'empty-label': { ru: 'Укажи понятное название действия.', en: 'Enter a clear action name.' },
  'invalid-multiplier': { ru: 'Множитель должен быть конечным числом не меньше нуля.', en: 'Multiplier must be a finite non-negative number.' },
  'invalid-hits': { ru: 'Число одинаковых попаданий должно быть целым и больше нуля.', en: 'Identical hit count must be a positive integer.' },
  'invalid-uses': { ru: 'Число применений серии должно быть больше нуля.', en: 'Sequence uses must be greater than zero.' },
  'zero-total': { ru: 'Суммарный множитель серии должен быть больше нуля.', en: 'The sequence total multiplier must be greater than zero.' },
};

export function AttackSequenceBuilder({
  characterName,
  draft,
  currentMultiplierPerUse,
  currentUsesPerRotation,
  onChange,
  onApply,
  onResetFromCurrent,
}: AttackSequenceBuilderProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const evaluation = evaluateAttackSequence(draft);
  const updateRow = (id: string, patch: Partial<AttackSequenceDraft['components'][number]>) => onChange({
    ...draft,
    components: draft.components.map((component) => component.id === id ? { ...component, ...patch } : component),
  });
  const removeRow = (id: string) => onChange({
    ...draft,
    components: draft.components.filter((component) => component.id !== id),
  });
  const addRow = () => {
    if (draft.components.length >= MAX_ATTACK_SEQUENCE_COMPONENTS) return;
    const number = draft.components.length + 1;
    onChange({
      ...draft,
      components: [...draft.components, {
        id: nextAttackSequenceComponentId(draft.components),
        label: ru ? `Часть серии ${number}` : `Sequence part ${number}`,
        multiplierPerHit: 0,
        identicalHits: 1,
      }],
    });
  };
  const format = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
  const globalErrors = evaluation.errors.filter((error) => error.componentId === undefined);

  return <details className="attack-sequence-builder">
    <summary><ListPlus size={18} /><span><b>{ru ? 'Конструктор серии атак' : 'Attack sequence builder'}</b><small>{ru ? 'Сложить разные удары без двойного счёта' : 'Add different actions without double counting'}</small></span><em>{format(evaluation.totalMultiplierPerUse)}%</em></summary>

    <div className="attack-sequence-intro">
      <p>{ru
        ? 'Каждая строка — отдельная часть одного применения серии. Сайт умножает только одинаковые попадания внутри строки, затем складывает строки и один раз применяет число повторов всей серии.'
        : 'Each row is one part of a single sequence use. Only identical hits inside a row are multiplied; rows are then added and sequence uses are applied once.'}</p>
      <span>{ru ? 'Названия вводишь ты: они помогают читать расчёт и не объявляются официальными именами навыков.' : 'Action names are player-entered descriptions and are not presented as official skill labels.'}</span>
    </div>

    <div className="attack-sequence-head" aria-hidden="true"><span>{ru ? 'Действие' : 'Action'}</span><span>{ru ? 'За попадание, % АТК' : 'Per hit, % ATK'}</span><span>{ru ? 'Одинаковых попаданий' : 'Identical hits'}</span><span>{ru ? 'Итого' : 'Subtotal'}</span><span /></div>
    <div className="attack-sequence-rows">{evaluation.rows.map((row, index) => <div className={`attack-sequence-row ${row.errors.length ? 'invalid' : ''}`} key={row.id}>
      <label><span>{ru ? `Действие ${index + 1}` : `Action ${index + 1}`}</span><input type="text" maxLength={80} value={draft.components[index]?.label ?? ''} onChange={(event) => updateRow(row.id, { label: event.target.value })} /></label>
      <label><span>{ru ? 'Множитель' : 'Multiplier'}</span><input type="number" min="0" step="any" value={draft.components[index]?.multiplierPerHit ?? 0} onChange={(event) => updateRow(row.id, { multiplierPerHit: Number(event.target.value) })} /></label>
      <label><span>{ru ? 'Попаданий' : 'Hits'}</span><input type="number" min="1" step="1" value={draft.components[index]?.identicalHits ?? 1} onChange={(event) => updateRow(row.id, { identicalHits: Number(event.target.value) })} /></label>
      <strong>{format(row.subtotalPerUse)}%</strong>
      <button type="button" className="icon-button attack-sequence-remove" onClick={() => removeRow(row.id)} aria-label={ru ? `Удалить действие ${index + 1}` : `Remove action ${index + 1}`}><Trash2 size={15} /></button>
      {row.errors.length ? <div className="attack-sequence-row-errors" role="alert">{row.errors.map((code) => <span key={code}>{errorLabels[code][locale]}</span>)}</div> : null}
    </div>)}</div>

    <div className="attack-sequence-add"><button type="button" className="button ghost" onClick={addRow} disabled={draft.components.length >= MAX_ATTACK_SEQUENCE_COMPONENTS}><Plus size={16} /> {ru ? 'Добавить часть серии' : 'Add sequence part'}</button><small>{draft.components.length}/{MAX_ATTACK_SEQUENCE_COMPONENTS}</small></div>

    <div className="attack-sequence-uses"><label><span>{ru ? 'Применений всей серии за ротацию' : 'Whole-sequence uses per rotation'}</span><input type="number" min="0" step="any" value={draft.usesPerRotation} onChange={(event) => onChange({ ...draft, usesPerRotation: Number(event.target.value) })} /></label><p>{ru ? 'Это число применяется к готовой сумме один раз.' : 'This value is applied once to the completed per-use sum.'}</p></div>

    <div className="attack-sequence-formula" aria-live="polite">
      <span>{ru ? 'Формула текущей серии' : 'Current sequence formula'}</span>
      <strong>{evaluation.rows.length
        ? `${evaluation.rows.map((row) => row.identicalHits === 1 ? `${format(row.multiplierPerHit)}%` : `${format(row.multiplierPerHit)}% × ${format(row.identicalHits)}`).join(' + ')} = ${format(evaluation.totalMultiplierPerUse)}%`
        : (ru ? 'Нет частей серии' : 'No sequence parts')}</strong>
      <b>{format(evaluation.totalMultiplierPerUse)}% × {format(evaluation.usesPerRotation)} = {format(evaluation.totalMultiplierPerRotation)}% {ru ? 'АТК за ротацию' : 'ATK per rotation'}</b>
    </div>

    {globalErrors.length ? <div className="attack-sequence-global-errors" role="alert">{globalErrors.map((error, index) => <span key={`${error.code}-${index}`}>{errorLabels[error.code][locale]}</span>)}</div> : null}

    <div className="attack-sequence-transfer">
      <div><small>{ru ? 'Сейчас в калькуляторе' : 'Current calculator value'}</small><b>{formatNumber(currentMultiplierPerUse)}% × {format(currentUsesPerRotation)}</b></div>
      <ArrowRight size={20} />
      <div><small>{ru ? 'После переноса' : 'After transfer'}</small><b>{format(evaluation.totalMultiplierPerUse)}% × {format(evaluation.usesPerRotation)}</b></div>
    </div>

    <div className="attack-sequence-actions"><button type="button" className="button ghost" onClick={onResetFromCurrent}><RotateCcw size={15} /> {ru ? 'Загрузить текущее значение' : 'Load current value'}</button><button type="button" className="button primary" disabled={!evaluation.valid} onClick={() => onApply(draft)}>{ru ? 'Перенести в расчёт' : 'Apply to calculation'} <ArrowRight size={16} /></button></div>
  </details>;
}
