import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, GitCompareArrows, RefreshCcw, Route, ShieldCheck, Users } from 'lucide-react';
import type { TeamMemberInput } from '../../packages/calculation-core/src';
import { characterByName, characterCatalog } from '../characters';
import { ResilientImage } from '../components/ResilientImage';
import { RotationWorkflow } from '../components/RotationWorkflow';
import { Metric, Panel } from '../components/UI';
import { QuickStart } from '../components/GuidedHelp';
import { esperCycleById, localizedCycleName } from '../esper-cycles';
import { localizedArcType, localizedAttribute, localizedCharacterName, localizedRole } from '../gameTerms';
import { useLocalStorage, parseStoredJson } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';
import { availableEsperCycles, applyTeamIdentities, normalizeExplorerTeam, normalizePresetProgress } from '../rotation-engine';
import { rotationPresetById, rotationPresets } from '../rotation-presets';
import { defaultMembers } from '../team-defaults';

const initialPreset = rotationPresets[0]!;
const presetIds = new Set(rotationPresets.map((preset) => preset.id));
const presetStepIds = new Map(rotationPresets.map((preset) => [preset.id, new Set(preset.steps.map((step) => step.id))]));
const storedMemberNumberKeys: Array<keyof TeamMemberInput> = [
  'characterLevel', 'baseAtk', 'arcAtk', 'flatAtk', 'atkPercent', 'teamAtkPercent', 'skillMultiplier', 'hits',
  'damageBonus', 'teamDamageBonus', 'critRate', 'critDamage', 'actionsPerRotation',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStoredTeam(value: unknown): value is TeamMemberInput[] {
  if (!Array.isArray(value) || value.length < 4) return false;
  return value.slice(0, 4).every((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.name !== 'string') return false;
    const enemy = entry.enemy;
    if (!isRecord(enemy)) return false;
    const memberNumbersValid = storedMemberNumberKeys.every((key) => typeof entry[key] === 'number' && Number.isFinite(entry[key]));
    const enemyNumbersValid = ['level', 'resistance', 'defenceReduction', 'resistanceReduction']
      .every((key) => typeof enemy[key] === 'number' && Number.isFinite(enemy[key]));
    return memberNumbersValid && enemyNumbersValid;
  });
}

export function RotationLabPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [presetId, setPresetId] = useLocalStorage<string>('nte.rotation.preset.v1', initialPreset.id, {
    normalize: (value) => typeof value === 'string' && presetIds.has(value) ? value : null,
  });
  const [progress, setProgress] = useLocalStorage<Record<string, string[]>>('nte.rotation.progress.v1', {}, {
    normalize: (value) => normalizePresetProgress(value, presetIds, presetStepIds),
  });
  const [explorerTeam, setExplorerTeam] = useLocalStorage<string[]>('nte.rotation.explorer.v1', initialPreset.team, {
    normalize: (value) => normalizeExplorerTeam(value, initialPreset.team),
  });
  const [transferError, setTransferError] = useState(false);

  const preset = rotationPresetById.get(presetId) ?? initialPreset;
  const completed = useMemo(() => new Set(progress[preset.id] ?? []), [preset.id, progress]);
  const completedCount = completed.size;
  const completionPercent = Math.round(completedCount / preset.steps.length * 100);
  const availableCycles = useMemo(() => availableEsperCycles(explorerTeam), [explorerTeam]);

  const toggleStep = (stepId: string) => {
    setProgress((current) => {
      const next = new Set(current[preset.id] ?? []);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return { ...current, [preset.id]: [...next] };
    });
  };

  const resetProgress = () => setProgress((current) => ({ ...current, [preset.id]: [] }));

  const updateExplorerCharacter = (index: number, name: string) => {
    if (explorerTeam.some((selected, selectedIndex) => selectedIndex !== index && selected === name)) return;
    setExplorerTeam((current) => current.map((entry, entryIndex) => entryIndex === index ? name : entry));
  };

  const applyTeam = (team: string[]) => {
    setTransferError(false);
    try {
      const parsed = parseStoredJson<unknown>(localStorage.getItem('nte.team.v2'), defaultMembers);
      const basis = isStoredTeam(parsed) ? parsed : defaultMembers;
      const next = applyTeamIdentities(basis, team);
      localStorage.setItem('nte.team.v2', JSON.stringify(next));
      location.hash = '#/team';
    } catch {
      setTransferError(true);
    }
  };

  return <div className="page calc-page rotation-page">
    <header className="page-heading"><div><span>{ru ? 'ЛАБОРАТОРИЯ РОТАЦИЙ' : 'ROTATION LAB'}</span><h1>{ru ? 'Понятный порядок действий без выдуманных таймингов' : 'Readable action order without invented timing'}</h1><p>{ru ? 'Смотри весь план или включай пошаговую тренировку: сайт показывает, что сделать сейчас, роль шага и ожидаемый результат. Точные секунды не выдумываются там, где источник их не публикует.' : 'Review the full plan or enter focused practice: the site shows what to do now, the step purpose and the expected result. Exact seconds are never invented when the source does not publish them.'}</p></div></header>

    <QuickStart title={ru ? 'Как пользоваться' : 'How to use it'} steps={ru ? [
      'Выбери готовую ротацию и проверь источник, состав и ограничения.',
      'В режиме «План» прочитай всю последовательность по колонкам: действие, роль шага и ожидаемый результат.',
      'В режиме «Тренировка» выполняй по одному шагу; необязательные действия можно пропустить.',
    ] : [
      'Choose a sourced preset and review its source, team and limitations.',
      'Use Plan to read the whole sequence as action, purpose and expected result.',
      'Use Practice to perform one step at a time; optional actions may be skipped.',
    ]} />

    <div className="rotation-preset-switch" role="tablist" aria-label={ru ? 'Готовые ротации' : 'Rotation presets'}>
      {rotationPresets.map((entry) => <button key={entry.id} role="tab" aria-selected={preset.id === entry.id} className={preset.id === entry.id ? 'active' : ''} onClick={() => setPresetId(entry.id)}><Route size={18} /><span><b>{entry.title[locale]}</b><small>{entry.team.map((name) => localizedCharacterName(name, locale)).join(' · ')}</small></span></button>)}
    </div>

    <div className="summary-strip rotation-summary"><Metric label={ru ? 'Персонажей' : 'Characters'} value={preset.team.length} /><Metric label={ru ? 'Шагов' : 'Steps'} value={preset.steps.length} /><Metric label={ru ? 'Реакций в плане' : 'Planned Cycles'} value={preset.cyclePlan.length} /><Metric label={ru ? 'Прогресс тренировки' : 'Training progress'} value={`${completedCount}/${preset.steps.length}`} note={`${completionPercent}%`} /></div>

    <Panel className="rotation-overview">
      <div className="rotation-overview-copy"><span>{ru ? 'ПРОВЕРЕННАЯ РОТАЦИЯ' : 'SOURCED PRESET'}</span><h2>{preset.title[locale]}</h2><p>{preset.description[locale]}</p><div className="rotation-actions"><button className="button primary" onClick={() => applyTeam(preset.team)}><Users size={17} /> {ru ? 'Перенести состав в калькулятор' : 'Apply team to calculator'} <ArrowRight size={17} /></button><button className="button ghost" onClick={resetProgress}><RefreshCcw size={16} /> {ru ? 'Сбросить прогресс' : 'Reset progress'}</button></div>{transferError ? <p className="transfer-error" role="alert">{ru ? 'Браузер запретил запись в локальное хранилище. Состав не был изменён.' : 'The browser blocked local storage. The team was not changed.'}</p> : null}</div>
      <div className="rotation-source-card"><ShieldCheck size={22} /><div><b>{preset.sourcePublisher}</b><span>{ru ? 'Гайд обновлён' : 'Guide updated'}: {preset.sourceUpdatedAt}</span><span>{ru ? 'Проверено для проекта' : 'Verified for project'}: {preset.verifiedAt}</span></div><a href={preset.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Открыть исходный гайд' : 'Open source guide'} <ExternalLink size={14} /></a><p>{preset.timingPolicy[locale]}</p></div>
    </Panel>

    <section className="rotation-team-grid" aria-label={ru ? 'Состав команды' : 'Team composition'}>{preset.team.map((name, index) => {
      const character = characterByName.get(name);
      const displayName = localizedCharacterName(name, locale);
      return <article key={name} className="rotation-character-card"><span className="rotation-slot">{index + 1}</span><ResilientImage src={character?.image} alt={displayName} wrapperClassName="rotation-character-art" loading="lazy" /><div><h2>{displayName}</h2>{ru ? <small>{name}</small> : null}<p>{localizedAttribute(character?.attribute, locale)} · {localizedRole(character?.role, locale)}</p><span>{localizedArcType(character?.arcType ?? '', locale)}</span></div></article>;
    })}</section>

    <Panel className="cycle-chain-panel"><div className="panel-title"><GitCompareArrows size={21} /><div><h2>{ru ? 'Цепочка циклов эспера' : 'Esper Cycle chain'}</h2><p>{ru ? 'Это логический порядок реакций из гайда, а не шкала времени.' : 'This is the sourced logical order, not a timing bar.'}</p></div></div><div className="cycle-chain">{preset.cyclePlan.map((cycleId, index) => {
      const cycle = esperCycleById.get(cycleId);
      return <div className={`cycle-node ${cycle?.category ?? ''}`} key={`${cycleId}-${index}`}><span>{index + 1}</span><div><b>{localizedCycleName(cycleId, locale)}</b><small>{cycle?.attributes.map((attribute) => localizedAttribute(attribute, locale)).join(' + ')}</small></div>{cycle?.durationSeconds ? <em>{cycle.durationSeconds} {ru ? 'сек' : 's'}</em> : <em>{ru ? 'условие' : 'trigger'}</em>}</div>;
    })}</div></Panel>

    <RotationWorkflow preset={preset} completed={completed} onToggleStep={toggleStep} onResetProgress={resetProgress} />

    <Panel className="rotation-assumptions"><div className="panel-title"><ShieldCheck size={21} /><div><h2>{ru ? 'Условия и ограничения' : 'Assumptions and limitations'}</h2><p>{ru ? 'То, что необходимо знать до сравнения результата с боем.' : 'What must be understood before comparing the plan with actual combat.'}</p></div></div><div>{preset.assumptions.map((assumption, index) => <p key={index}><span>{index + 1}</span>{assumption[locale]}</p>)}</div></Panel>

    <section className="cycle-explorer">
      <header className="page-heading compact-heading"><div><span>{ru ? 'КОНСТРУКТОР РЕАКЦИЙ' : 'CYCLE EXPLORER'}</span><h2>{ru ? 'Что может запустить твоя команда' : 'What your team can actually trigger'}</h2><p>{ru ? 'Выбери четырёх разных персонажей. Доступные реакции выводятся только из их проверенных атрибутов — роли, дуги и предполагаемый стиль игры не влияют на результат.' : 'Choose four different characters. Available reactions are derived only from verified attributes; roles, Arcs and assumed playstyle do not change the result.'}</p></div><button className="button ghost" onClick={() => setExplorerTeam([...preset.team])}>{ru ? 'Взять текущую ротацию' : 'Use current preset'}</button></header>

      <div className="explorer-layout"><Panel className="explorer-team"><div className="explorer-select-grid">{explorerTeam.map((name, index) => {
        const character = characterByName.get(name);
        return <label key={`${name}-${index}`}><span>{ru ? `Слот ${index + 1}` : `Slot ${index + 1}`}</span><select value={name} onChange={(event) => updateExplorerCharacter(index, event.target.value)}>{characterCatalog.map((option) => <option value={option.name} key={option.id} disabled={option.name !== name && explorerTeam.includes(option.name)}>{localizedCharacterName(option.name, locale)} · {localizedAttribute(option.attribute, locale)}</option>)}</select><small>{localizedRole(character?.role, locale) || (ru ? 'Роль ещё не объявлена' : 'Role not announced')} · {localizedArcType(character?.arcType ?? '', locale) || (ru ? 'Тип дуги не объявлен' : 'Arc type not announced')}</small></label>;
      })}</div><button className="button primary explorer-apply" onClick={() => applyTeam(explorerTeam)}><Users size={17} /> {ru ? 'Перенести эту четвёрку в калькулятор' : 'Apply this team to calculator'}</button></Panel>

      <div className="available-cycle-list">{availableCycles.length ? availableCycles.map((cycle) => <article key={cycle.id} className={`available-cycle category-${cycle.category}`}><div><span>{cycle.category === 'triple' ? '3' : '2'}</span><h3>{cycle.name[locale]}</h3>{cycle.durationSeconds ? <em>{cycle.durationSeconds} {ru ? 'сек' : 's'}</em> : null}</div><p>{cycle.effect[locale]}</p><small>{cycle.attributes.map((attribute) => localizedAttribute(attribute, locale)).join(' + ')}</small>{cycle.derivedFrom ? <strong>{ru ? 'Нужно совместить' : 'Combine'}: {cycle.derivedFrom.map((id) => localizedCycleName(id, locale)).join(' + ')}</strong> : null}</article>) : <Panel className="no-cycles"><Route size={24} /><h3>{ru ? 'Совместимых реакций нет' : 'No compatible cycles'}</h3><p>{ru ? 'В выбранной четвёрке нет подходящих сочетаний атрибутов.' : 'The selected team has no compatible attribute combinations.'}</p></Panel>}</div></div>
    </section>
  </div>;
}
