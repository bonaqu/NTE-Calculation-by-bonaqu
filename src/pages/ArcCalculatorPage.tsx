import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Copy, ExternalLink, Info, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { compareArcTeams } from '../../packages/calculation-core/src';
import { arcBenchmarkScenarios, sources } from '../data';
import { arcPresetSources, arcPresets, arcPresetToModel, customModelArcIds } from '../arc-presets';
import { useI18n } from '../i18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  ARC_SHARE_PARAM,
  ARC_STATE_STORAGE_KEY,
  arcStatKeys,
  buildArcShareUrl,
  createDefaultArcState,
  defaultArcStats,
  normalizeArcCalculatorState,
  normalizeArcStats,
  readArcShareState,
  removeArcShareParam,
  type ArcMode,
  type ArcStatKey,
} from '../state/arcState';
import { Field, formatNumber, Panel } from '../components/UI';
import type { ArcBenchmarkRow, ArcPreset } from '../types';

type BenchmarkDisplayRow = { arc: ArcPreset; benchmark: ArcBenchmarkRow };
type ShareStatus = 'idle' | 'copied' | 'failed';

const scenarioIds = arcBenchmarkScenarios.map((scenario) => scenario.id);
const initialScenario = arcBenchmarkScenarios[0]!;
const defaultState = createDefaultArcState(initialScenario.id);

const labels: Record<'ru' | 'en', Record<ArcStatKey, string>> = {
  ru: {
    baseAtk: 'Базовая ATK Ирой', flatAtk: 'Плоская ATK', atkPercent: 'ATK, %', critRate: 'Крит. шанс, %',
    critDamage: 'Крит. урон, %', damageBonus: 'Бонус урона, %', skillMultiplier: 'Множитель окна, %', hits: 'Попаданий',
    enemyLevel: 'Уровень врага', resistance: 'Сопротивление врага, %', teamFixed: 'Базовый урон союзников', passiveUptime: 'Аптайм условных эффектов, %',
  },
  en: {
    baseAtk: 'Iroi base ATK', flatAtk: 'Flat ATK', atkPercent: 'ATK, %', critRate: 'CRIT Rate, %',
    critDamage: 'CRIT DMG, %', damageBonus: 'DMG Bonus, %', skillMultiplier: 'Window multiplier, %', hits: 'Hits',
    enemyLevel: 'Enemy level', resistance: 'Enemy RES, %', teamFixed: 'Base ally damage', passiveUptime: 'Conditional effect uptime, %',
  },
};

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Restricted contexts can deny Clipboard API access; use the synchronous fallback below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('COPY_FAILED');
}

export function ArcCalculatorPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [sharedState] = useState(() => readArcShareState(window.location.search, scenarioIds));
  const [hadShareParam] = useState(() => new URLSearchParams(window.location.search).has(ARC_SHARE_PARAM));
  const [arcState, setArcState] = useLocalStorage(ARC_STATE_STORAGE_KEY, defaultState, {
    normalize: (value) => normalizeArcCalculatorState(value, scenarioIds),
    syncTabs: true,
  });
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  const { mode, scenarioId, stats } = arcState;

  useEffect(() => {
    if (sharedState) setArcState(sharedState);
    if (hadShareParam) window.history.replaceState(window.history.state, '', removeArcShareParam(window.location.href));
  }, [hadShareParam, setArcState, sharedState]);

  useEffect(() => {
    if (shareStatus === 'idle') return undefined;
    const timeout = window.setTimeout(() => setShareStatus('idle'), 2_500);
    return () => window.clearTimeout(timeout);
  }, [shareStatus]);

  const arcMap = useMemo(() => new Map(arcPresets.map((arc) => [arc.id, arc])), []);
  const sourceMap = useMemo(() => new Map([...sources, ...arcPresetSources].map((source) => [source.id, source])), []);
  const customArcIdSet = useMemo(() => new Set<string>(customModelArcIds), []);
  const modelArcs = useMemo(() => arcPresets.filter((arc) => customArcIdSet.has(arc.id)), [customArcIdSet]);
  const scenario = arcBenchmarkScenarios.find((item) => item.id === scenarioId) ?? initialScenario;
  const scenarioSource = sourceMap.get(scenario.sourceId);
  const tableLabels = {
    arcAtk: ru ? 'Базовая ATK дуги' : 'Arc base ATK',
    totalAtk: ru ? 'Итоговая ATK' : 'Total ATK',
    iroiDamage: ru ? 'Урон Ирой' : 'Iroi DMG',
    teamDamage: ru ? 'Урон команды' : 'Team DMG',
    dps: 'DPS',
    relative: ru ? 'Сравнение' : 'Relative',
    note: ru ? 'Примечание' : 'Note',
  };

  const benchmarkRows = useMemo(() => scenario.rows.flatMap<BenchmarkDisplayRow>((benchmark) => {
    const arc = arcMap.get(benchmark.arcId);
    return arc ? [{ arc, benchmark }] : [];
  }), [arcMap, scenario]);

  const customRows = useMemo(() => compareArcTeams({
    characterLevel: 80,
    baseAtk: stats.baseAtk,
    flatAtk: stats.flatAtk,
    atkPercent: stats.atkPercent,
    teamAtkPercent: 0,
    skillMultiplier: stats.skillMultiplier,
    hits: stats.hits,
    damageBonus: stats.damageBonus,
    teamDamageBonus: 0,
    critRate: stats.critRate,
    critDamage: stats.critDamage,
    enemy: {
      level: stats.enemyLevel,
      resistance: stats.resistance,
      defenceReduction: 0,
      resistanceReduction: 0,
    },
  }, modelArcs.map((arc) => arcPresetToModel(arc, stats.passiveUptime)), stats.teamFixed), [modelArcs, stats]);

  const setMode = (nextMode: ArcMode) => setArcState((current) => ({ ...current, mode: nextMode }));
  const setScenarioId = (nextScenarioId: string) => setArcState((current) => ({ ...current, scenarioId: nextScenarioId }));
  const updateStat = (key: ArcStatKey, value: number) => {
    if (!Number.isFinite(value)) return;
    setArcState((current) => {
      const normalized = normalizeArcStats({ ...current.stats, [key]: value });
      return normalized ? { ...current, stats: normalized } : current;
    });
  };
  const resetStats = () => {
    setArcState((current) => ({ ...current, stats: { ...defaultArcStats } }));
    setShareStatus('idle');
  };
  const shareCustomState = async () => {
    const url = buildArcShareUrl({ ...arcState, mode: 'custom' }, window.location.href);
    try {
      await copyText(url);
      setShareStatus('copied');
    } catch {
      setShareStatus('failed');
    }
  };

  return <div className="page calc-page">
    <header className="page-heading"><div><span>ARCS CALCULATION</span><h1>{ru ? 'Сравнение дуг для Ирой' : 'Iroi Arc comparison'}</h1><p>{ru ? 'Два раздельных исходных бенчмарка и отдельная прозрачная модель для твоих статов.' : 'Two separate sourced benchmarks plus a transparent custom-stat model.'}</p></div>
      <div className="segmented" role="tablist" aria-label={ru ? 'Режим расчёта' : 'Calculation mode'}><button role="tab" aria-selected={mode === 'benchmark'} className={mode === 'benchmark' ? 'active' : ''} onClick={() => setMode('benchmark')}>{ru ? 'Бенчмарки' : 'Benchmarks'}</button><button role="tab" aria-selected={mode === 'custom'} className={mode === 'custom' ? 'active' : ''} onClick={() => setMode('custom')}>{ru ? 'Свои статы' : 'Custom stats'}</button></div>
    </header>

    {mode === 'benchmark' ? <Panel className="scenario-panel">
      <div className="scenario-copy"><span className="scenario-label">{ru ? 'Сценарий расчёта' : 'Calculation scenario'}</span><h2>{scenario.title[locale]}</h2><p>{scenario.description[locale]}</p></div>
      <label className="scenario-select"><span>{ru ? 'Источник данных' : 'Data source'}</span><select value={scenario.id} onChange={(event) => setScenarioId(event.target.value)}>{arcBenchmarkScenarios.map((item) => <option key={item.id} value={item.id}>{item.title[locale]}</option>)}</select></label>
      <div className="scenario-meta">{scenario.meta.map((item, index) => <span key={`${scenario.id}-${index}`}>{item[locale]}</span>)}</div>
      <div className="scenario-source"><span>{scenarioSource?.publisher} · {ru ? 'проверено' : 'verified'} {scenario.verifiedAt}</span>{scenarioSource?.url ? <a href={scenarioSource.url} target="_blank" rel="noreferrer">{ru ? 'Открыть источник' : 'Open source'} <ExternalLink size={15} /></a> : <span className="muted">{ru ? 'Источник предоставлен владельцем проекта' : 'Source supplied by the project owner'}</span>}</div>
    </Panel> : null}

    {mode === 'custom' ? <Panel className="settings-panel"><div className="settings-heading"><div className="panel-title"><SlidersHorizontal size={20} /><div><h2>{ru ? 'Частичная командная модель' : 'Partial team model'}</h2><p>{ru ? 'Постоянные характеристики и пассивы всегда активны. Поле аптайма масштабирует только условные эффекты; бонусы союзникам применяются только к их урону.' : 'Static stats and always-on passives stay active. Uptime scales conditional effects only; ally bonuses affect ally damage only.'}</p></div></div><div className="settings-actions"><button className="button ghost compact-button" type="button" onClick={resetStats}><RotateCcw size={16} /> {ru ? 'Сбросить' : 'Reset'}</button><button className="button compact-button" type="button" onClick={shareCustomState}>{shareStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />} {ru ? 'Копировать ссылку' : 'Copy link'}</button></div></div><div className="field-grid">
      {arcStatKeys.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={stats[key]} min={key === 'passiveUptime' ? 0 : undefined} max={key === 'passiveUptime' ? 100 : undefined} onChange={(event) => updateStat(key, Number(event.target.value))} />)}
    </div><div className={`share-status ${shareStatus}`} role="status" aria-live="polite">{shareStatus === 'copied' ? (ru ? 'Ссылка скопирована — в ней сохранены текущие значения.' : 'Link copied with the current values.') : shareStatus === 'failed' ? (ru ? 'Не удалось скопировать ссылку. Проверь разрешение буфера обмена.' : 'Could not copy the link. Check clipboard permission.') : ''}</div></Panel> : null}

    <Panel className="table-panel">
      {mode === 'benchmark' ? <div className="calc-table arc-table benchmark-table" role="table"><div className="table-head" role="row"><span>#</span><span>{ru ? 'Дуга' : 'Arc'}</span><span>ATK</span><span>{ru ? 'Урон команды' : 'Team DMG'}</span><span>DPS</span><span>{ru ? 'Сравнение' : 'Relative'}</span><span>{ru ? 'Примечание' : 'Note'}</span></div>
        {benchmarkRows.map(({ arc, benchmark }, index) => <div className={`table-row ${index === 0 ? 'best-row' : ''}`} key={`${scenario.id}-${arc.id}`} role="row">
          <span className="rank">{index + 1}</span><span className="arc-cell"><img src={arc.image} alt={arc.name} /><span><b>{arc.name} <em>M{arc.mixing}</em></b><small>{arc.rarity} · {arc.type} · {arc.secondaryLabel} {arc.secondaryValue}%</small></span></span>
          <span className="mobile-metric stat-cell" data-label={tableLabels.arcAtk}><b>{arc.baseAtk}</b></span>
          <span className="mobile-metric numeric-cell" data-label={tableLabels.teamDamage}><b>{benchmark.teamDamage === undefined ? '—' : formatNumber(benchmark.teamDamage)}</b></span>
          <span className="mobile-metric numeric-cell" data-label={tableLabels.dps}><b>{benchmark.teamDps === undefined ? '—' : formatNumber(benchmark.teamDps)}</b></span>
          <span className="mobile-metric percent-cell" data-label={tableLabels.relative}><b>{benchmark.percent.toFixed(2)}%</b><span><i style={{ width: `${Math.min(100, benchmark.percent)}%` }} /></span></span>
          <span className="mobile-metric note-cell" data-label={tableLabels.note}>{index === 0 ? <CheckCircle2 size={17} /> : <Info size={16} />}<span>{benchmark.note[locale]}<small>{scenarioSource?.publisher} · {scenario.verifiedAt}</small></span></span>
        </div>)}
      </div> : <div className="calc-table arc-table custom-team-table" role="table"><div className="table-head" role="row"><span>#</span><span>{ru ? 'Дуга' : 'Arc'}</span><span>{ru ? 'Итоговая ATK' : 'Total ATK'}</span><span>{ru ? 'Урон Ирой' : 'Iroi DMG'}</span><span>{ru ? 'Урон команды' : 'Team DMG'}</span><span>{ru ? 'Сравнение' : 'Relative'}</span><span>{ru ? 'Примечание' : 'Note'}</span></div>
        {customRows.map((row, index) => {
          const arc = arcMap.get(row.id);
          if (!arc) return null;
          const source = sourceMap.get(arc.sourceId);
          const percent = row.relative * 100;
          return <div className={`table-row ${index === 0 ? 'best-row' : ''}`} key={arc.id} role="row">
            <span className="rank">{index + 1}</span><span className="arc-cell"><img src={arc.image} alt={arc.name} /><span><b>{arc.name} <em>M{arc.mixing}</em></b><small>{arc.rarity} · {arc.type} · {arc.secondaryLabel} {arc.secondaryValue}%</small></span></span>
            <span className="mobile-metric stat-cell" data-label={tableLabels.totalAtk}><b>{formatNumber(row.totalAtk)}</b></span>
            <span className="mobile-metric numeric-cell" data-label={tableLabels.iroiDamage}><b>{formatNumber(row.wearerDamage)}</b></span>
            <span className="mobile-metric numeric-cell team-total-cell" data-label={tableLabels.teamDamage}><b>{formatNumber(row.teamDamage)}</b><small>{ru ? `Союзники: ${formatNumber(row.allyDamage)}` : `Allies: ${formatNumber(row.allyDamage)}`}</small></span>
            <span className="mobile-metric percent-cell" data-label={tableLabels.relative}><b>{percent.toFixed(2)}%</b><span><i style={{ width: `${Math.min(100, percent)}%` }} /></span></span>
            <span className="mobile-metric note-cell" data-label={tableLabels.note}>{index === 0 ? <CheckCircle2 size={17} /> : <Info size={16} />}<span>{arc.benchmarkNote[locale]}<small>{arc.model.trigger[locale]} · {source?.publisher} · {source?.verifiedAt}</small></span></span>
          </div>;
        })}
      </div>}
    </Panel>

    {mode === 'benchmark' && scenario.id === 'rivyn-support' ? <div className="disclaimer"><Info size={18} /><span>{ru ? 'Абсолютные значения точно перенесены со скриншота, но исходный калькулятор Rivyn не опубликован. Таблица воспроизводит результат, а не заявляет, что внутренняя формула восстановлена.' : 'Absolute values are transcribed from the screenshot, but Rivyn’s source calculator is not public. This table reproduces the result and does not claim the internal formula has been reconstructed.'}</span></div> : null}
    {mode === 'custom' ? <div className="disclaimer"><Info size={18} /><span>{ru ? `Базовый урон союзников: ${formatNumber(stats.teamFixed)}. Постоянные сабстаты и пассивы применяются на 100%; аптайм ${stats.passiveUptime}% влияет только на условную часть. Бонусы союзникам усиливают только их урон, а итоговый рейтинг сортируется по полному урону команды. Настройки сохраняются в этом браузере.` : `Base ally damage: ${formatNumber(stats.teamFixed)}. Static substats and always-on passives apply at 100%; the ${stats.passiveUptime}% uptime affects conditional modifiers only. Ally bonuses affect ally damage only, and ranking uses total team damage. Settings are saved in this browser.`}</span></div> : null}
  </div>;
}
