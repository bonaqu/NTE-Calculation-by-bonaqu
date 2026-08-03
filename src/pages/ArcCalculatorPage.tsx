import { useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Info, SlidersHorizontal } from 'lucide-react';
import { compareArcs } from '../../packages/calculation-core/src';
import { arcBenchmarkScenarios, arcPresets, customModelArcIds, sources } from '../data';
import { useI18n } from '../i18n';
import { Field, formatNumber, Panel } from '../components/UI';
import type { ArcBenchmarkRow, ArcPreset } from '../types';

type ArcStats = {
  baseAtk: number;
  flatAtk: number;
  atkPercent: number;
  critRate: number;
  critDamage: number;
  damageBonus: number;
  skillMultiplier: number;
  hits: number;
  enemyLevel: number;
  resistance: number;
  teamFixed: number;
  passiveUptime: number;
};

type ArcStatKey = keyof ArcStats;
type BenchmarkDisplayRow = { arc: ArcPreset; benchmark: ArcBenchmarkRow };

const labels: Record<'ru' | 'en', Record<ArcStatKey, string>> = {
  ru: {
    baseAtk: 'Базовая ATK Ирой', flatAtk: 'Плоская ATK', atkPercent: 'ATK, %', critRate: 'Крит. шанс, %',
    critDamage: 'Крит. урон, %', damageBonus: 'Бонус урона, %', skillMultiplier: 'Множитель окна, %', hits: 'Попаданий',
    enemyLevel: 'Уровень врага', resistance: 'Сопротивление врага, %', teamFixed: 'Урон команды без Ирой', passiveUptime: 'Аптайм учтённых эффектов, %',
  },
  en: {
    baseAtk: 'Iroi base ATK', flatAtk: 'Flat ATK', atkPercent: 'ATK, %', critRate: 'CRIT Rate, %',
    critDamage: 'CRIT DMG, %', damageBonus: 'DMG Bonus, %', skillMultiplier: 'Window multiplier, %', hits: 'Hits',
    enemyLevel: 'Enemy level', resistance: 'Enemy RES, %', teamFixed: 'Team damage without Iroi', passiveUptime: 'Modeled effect uptime, %',
  },
};

const initialStats: ArcStats = {
  baseAtk: 1500, flatAtk: 250, atkPercent: 70, critRate: 30, critDamage: 70, damageBonus: 10,
  skillMultiplier: 1000, hits: 1, enemyLevel: 82, resistance: 20, teamFixed: 2_300_000, passiveUptime: 100,
};

export function ArcCalculatorPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [mode, setMode] = useState<'benchmark' | 'custom'>('benchmark');
  const [scenarioId, setScenarioId] = useState(arcBenchmarkScenarios[0].id);
  const [stats, setStats] = useState<ArcStats>(initialStats);

  const arcMap = useMemo(() => new Map(arcPresets.map((arc) => [arc.id, arc])), []);
  const sourceMap = useMemo(() => new Map(sources.map((source) => [source.id, source])), []);
  const customArcIdSet = useMemo(() => new Set<string>(customModelArcIds), []);
  const modelArcs = useMemo(() => arcPresets.filter((arc) => customArcIdSet.has(arc.id)), [customArcIdSet]);
  const scenario = arcBenchmarkScenarios.find((item) => item.id === scenarioId) ?? arcBenchmarkScenarios[0];
  const scenarioSource = sourceMap.get(scenario.sourceId);

  const benchmarkRows = useMemo(() => scenario.rows.flatMap<BenchmarkDisplayRow>((benchmark) => {
    const arc = arcMap.get(benchmark.arcId);
    return arc ? [{ arc, benchmark }] : [];
  }), [arcMap, scenario]);

  const customRows = useMemo(() => compareArcs({
    characterLevel: 80, baseAtk: stats.baseAtk, flatAtk: stats.flatAtk, atkPercent: stats.atkPercent,
    teamAtkPercent: 0, skillMultiplier: stats.skillMultiplier, hits: stats.hits, damageBonus: stats.damageBonus,
    teamDamageBonus: 0, critRate: stats.critRate, critDamage: stats.critDamage,
    enemy: { level: stats.enemyLevel, resistance: stats.resistance, defenceReduction: 0, resistanceReduction: 0 },
  }, modelArcs.map((arc) => ({
    id: arc.id, name: `${arc.name} M${arc.mixing}`, arcAtk: arc.baseAtk,
    atkPercent: arc.effect.atkPct ?? 0, critRate: arc.effect.critRate ?? 0,
    critDamage: arc.effect.critDmg ?? 0, damageBonus: arc.effect.dmgBonus ?? 0,
    teamDamageBonus: arc.effect.teamDmgBonus ?? 0, passiveUptime: stats.passiveUptime,
  }))), [modelArcs, stats]);
  const bestCustomTotal = (customRows[0]?.expected ?? 0) + Math.max(0, stats.teamFixed);
  const customDisplayRows = useMemo(() => customRows.flatMap((row) => {
    const arc = arcMap.get(row.id);
    return arc ? [{ arc, percent: bestCustomTotal > 0 ? ((row.expected + Math.max(0, stats.teamFixed)) / bestCustomTotal) * 100 : 0 }] : [];
  }), [arcMap, bestCustomTotal, customRows, stats.teamFixed]);

  const updateStat = (key: ArcStatKey, value: number) => setStats((current) => ({ ...current, [key]: value }));

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

    {mode === 'custom' ? <Panel className="settings-panel"><div className="panel-title"><SlidersHorizontal size={20} /><div><h2>{ru ? 'Частичная модель персонажа' : 'Partial character model'}</h2><p>{ru ? 'Учитывает базовые характеристики и только явно занесённые эффекты. Это не скрытая ротационная модель Rivyn.' : 'Includes base stats and only explicitly entered effects. It is not Rivyn’s private rotation model.'}</p></div></div><div className="field-grid">
      {(Object.keys(stats) as ArcStatKey[]).map((key) => <Field key={key} label={labels[locale][key]} type="number" value={stats[key]} min={key === 'passiveUptime' ? 0 : undefined} max={key === 'passiveUptime' ? 100 : undefined} onChange={(event) => updateStat(key, Number(event.target.value))} />)}
    </div></Panel> : null}

    <Panel className="table-panel">
      {mode === 'benchmark' ? <div className="calc-table arc-table benchmark-table" role="table"><div className="table-head" role="row"><span>#</span><span>{ru ? 'Дуга' : 'Arc'}</span><span>ATK</span><span>{ru ? 'Урон команды' : 'Team DMG'}</span><span>DPS</span><span>{ru ? 'Сравнение' : 'Relative'}</span><span>{ru ? 'Примечание' : 'Note'}</span></div>
        {benchmarkRows.map(({ arc, benchmark }, index) => <div className={`table-row ${index === 0 ? 'best-row' : ''}`} key={`${scenario.id}-${arc.id}`} role="row">
          <span className="rank">{index + 1}</span><span className="arc-cell"><img src={arc.image} alt={arc.name} /><span><b>{arc.name} <em>M{arc.mixing}</em></b><small>{arc.rarity} · {arc.type} · {arc.secondaryLabel} {arc.secondaryValue}%</small></span></span>
          <span>{arc.baseAtk}</span><span className="numeric-cell">{benchmark.teamDamage === undefined ? '—' : formatNumber(benchmark.teamDamage)}</span><span className="numeric-cell">{benchmark.teamDps === undefined ? '—' : formatNumber(benchmark.teamDps)}</span>
          <span className="percent-cell"><b>{benchmark.percent.toFixed(2)}%</b><span><i style={{ width: `${Math.min(100, benchmark.percent)}%` }} /></span></span>
          <span className="note-cell">{index === 0 ? <CheckCircle2 size={17} /> : <Info size={16} />}<span>{benchmark.note[locale]}<small>{scenarioSource?.publisher} · {scenario.verifiedAt}</small></span></span>
        </div>)}
      </div> : <div className="calc-table arc-table" role="table"><div className="table-head" role="row"><span>#</span><span>{ru ? 'Дуга' : 'Arc'}</span><span>ATK</span><span>{ru ? 'Сравнение' : 'Relative'}</span><span>{ru ? 'Примечание' : 'Note'}</span></div>
        {customDisplayRows.map(({ arc, percent }, index) => {
          const source = sourceMap.get(arc.sourceId);
          return <div className={`table-row ${index === 0 ? 'best-row' : ''}`} key={arc.id} role="row">
            <span className="rank">{index + 1}</span><span className="arc-cell"><img src={arc.image} alt={arc.name} /><span><b>{arc.name} <em>M{arc.mixing}</em></b><small>{arc.rarity} · {arc.type} · {arc.secondaryLabel} {arc.secondaryValue}%</small></span></span>
            <span>{arc.baseAtk}</span><span className="percent-cell"><b>{percent.toFixed(2)}%</b><span><i style={{ width: `${Math.min(100, percent)}%` }} /></span></span>
            <span className="note-cell">{index === 0 ? <CheckCircle2 size={17} /> : <Info size={16} />}<span>{arc.benchmarkNote[locale]}<small>{source?.publisher} · {source?.verifiedAt}</small></span></span>
          </div>;
        })}
      </div>}
    </Panel>

    {mode === 'benchmark' && scenario.id === 'rivyn-support' ? <div className="disclaimer"><Info size={18} /><span>{ru ? 'Абсолютные значения точно перенесены со скриншота, но исходный калькулятор Rivyn не опубликован. Таблица воспроизводит результат, а не заявляет, что внутренняя формула восстановлена.' : 'Absolute values are transcribed from the screenshot, but Rivyn’s source calculator is not public. This table reproduces the result and does not claim the internal formula has been reconstructed.'}</span></div> : null}
    {mode === 'custom' ? <div className="disclaimer"><Info size={18} /><span>{ru ? `В относительный результат включён фиксированный урон остальных членов команды: ${formatNumber(stats.teamFixed)}. Неописанные пассивы дуг не выдумываются и поэтому могут изменить реальный порядок.` : `Relative results include ${formatNumber(stats.teamFixed)} fixed damage from the rest of the team. Unspecified Arc passives are not invented and may change the real ordering.`}</span></div> : null}
  </div>;
}
