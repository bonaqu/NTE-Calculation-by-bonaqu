import { useMemo } from 'react';
import { Backpack, CheckCircle2, Circle } from 'lucide-react';
import { iroiProgression } from '../data';
import { useI18n } from '../i18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Field, formatNumber, Metric, Panel, SelectField } from '../components/UI';
import { QuickStart } from '../components/GuidedHelp';
import { localizedMaterial, progressionMaterials, type ProgressionMaterialKey } from '../gameTerms';

type MaterialKey = ProgressionMaterialKey;
const materialKeys: MaterialKey[] = ['beetleCoin', 'page', 'fading', 'blurred', 'chaos'];

export function ProgressionPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [completed, setCompleted] = useLocalStorage<number>('nte.progression.iroi.completed.v1', 0);
  const [inventory, setInventory] = useLocalStorage<Record<MaterialKey, number>>('nte.progression.iroi.inventory.v1', { beetleCoin: 0, page: 0, fading: 0, blurred: 0, chaos: 0 });
  const safeCompleted = Math.min(iroiProgression.length, Math.max(0, completed));
  const required = useMemo(() => iroiProgression.slice(safeCompleted).reduce((sum, row) => ({
    beetleCoin: sum.beetleCoin + row.beetleCoin, page: sum.page + row.page, fading: sum.fading + row.fading, blurred: sum.blurred + row.blurred, chaos: sum.chaos + row.chaos,
  }), { beetleCoin: 0, page: 0, fading: 0, blurred: 0, chaos: 0 }), [safeCompleted]);
  const remaining = Object.fromEntries((Object.keys(required) as MaterialKey[]).map((key) => [key, Math.max(0, required[key] - Math.max(0, inventory[key]))])) as Record<MaterialKey, number>;

  return <div className="page calc-page"><header className="page-heading"><div><span>{ru ? 'ПЛАН ПРОКАЧКИ' : 'CHARACTER PROGRESSION'}</span><h1>{ru ? 'Планировщик прокачки Ирой' : 'Iroi progression planner'}</h1><p>{ru ? 'Посчитай материалы, которые ещё нужны для открытия 80 уровня. Укажи уже завершённый этап и свой текущий инвентарь.' : 'Verified ascension costs required to unlock level 80. EXP and skill costs are not added without a reliable dataset.'}</p></div></header>

    <QuickStart title={ru ? 'Быстрый старт' : 'Quick start'} steps={ru ? [
      'Выбери последний этап возвышения, который уже полностью оплачен.',
      'Введи количество материалов, которые лежат у тебя в инвентаре.',
      'Справа появится остаток, который действительно нужно собрать.',
    ] : [
      'Select the last ascension breakpoint you already paid for.',
      'Enter the materials currently in your inventory.',
      'The right panel shows what you still need to farm.',
    ]} />

    <div className="disclaimer top-note"><Backpack size={18} /><span>{ru ? 'Русские названия — терминология этого проекта и сообщества. Оригинальные английские названия показаны рядом, потому что официального русского интерфейса игры сейчас нет.' : 'Material names use the verified English wording; localized project names are shown in Russian mode.'}</span></div>
    <div className="summary-strip"><Metric label={ru ? 'Осталось жучиных монет' : 'Coins remaining'} value={formatNumber(remaining.beetleCoin)} /><Metric label={ru ? 'Страниц' : 'Pages'} value={remaining.page} /><Metric label={ru ? 'Силуэтов' : 'Silhouettes'} value={remaining.fading + remaining.blurred + remaining.chaos} /><Metric label={ru ? 'Источник данных' : 'Source'} value="Icy Veins" note="2026-08-03" /></div>
    <div className="progression-layout"><Panel><div className="panel-title"><Backpack size={20} /><div><h2>{ru ? 'Твой текущий прогресс' : 'Current progress'}</h2><p>{ru ? 'Этап считается завершённым только после оплаты всех материалов на нём.' : 'Select the already-paid breakpoint and enter your inventory.'}</p></div></div><SelectField label={ru ? 'Последний полностью завершённый этап' : 'Last completed breakpoint'} value={safeCompleted} onChange={(event) => setCompleted(Number(event.target.value))}><option value={0}>{ru ? 'Возвышения ещё не оплачены' : 'None'}</option>{iroiProgression.map((row, index) => <option key={row.cap} value={index + 1}>{ru ? `Открыт ур. ${row.cap}` : `Lv. ${row.cap}`}</option>)}</SelectField><div className="inventory-grid">{materialKeys.map((key) => <Field key={key} label={localizedMaterial(key, locale)} type="number" min="0" value={inventory[key]} onChange={(event) => setInventory((current) => ({ ...current, [key]: Math.max(0, Number(event.target.value)) }))} />)}</div></Panel>
      <Panel><h2>{ru ? 'Что ещё нужно собрать' : 'Remaining materials'}</h2><div className="material-list">{materialKeys.map((key) => <div key={key}><span className="material-name"><span>{localizedMaterial(key, locale)}</span>{ru ? <small>{progressionMaterials[key].en}</small> : null}</span><b>{formatNumber(remaining[key])}</b><small>{ru ? `Всего нужно ${formatNumber(required[key])}, в инвентаре ${formatNumber(inventory[key])}` : `Need ${formatNumber(required[key])}, owned ${formatNumber(inventory[key])}`}</small></div>)}</div></Panel></div>
    <Panel className="breakpoint-table"><h2>{ru ? 'Стоимость каждого этапа возвышения' : 'Ascension breakpoints'}</h2>{iroiProgression.map((row, index) => {
      const silhouetteKey: MaterialKey = row.fading ? 'fading' : row.blurred ? 'blurred' : 'chaos';
      const silhouetteCount = row.fading || row.blurred || row.chaos;
      return <div key={row.cap} className={index < safeCompleted ? 'done' : ''}><span>{ru ? `Ур. ${row.cap}` : `Lv. ${row.cap}`}</span><span>{formatNumber(row.beetleCoin)} {localizedMaterial('beetleCoin', locale)}</span><span>{row.page ? `${row.page} · ${localizedMaterial('page', locale)}` : '—'}</span><span>{silhouetteCount} · {localizedMaterial(silhouetteKey, locale)}</span><span aria-label={index < safeCompleted ? (ru ? 'Завершено' : 'Completed') : (ru ? 'Не завершено' : 'Not completed')}>{index < safeCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}</span></div>;
    })}</Panel>
  </div>;
}
