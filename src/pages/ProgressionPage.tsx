import { useMemo } from 'react';
import { Backpack, CheckCircle2, Circle } from 'lucide-react';
import { iroiProgression } from '../data';
import { useI18n } from '../i18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Field, formatNumber, Metric, Panel, SelectField } from '../components/UI';

const materialLabels = { beetleCoin: 'Beetle Coin', page: "A Page from Delusion's Shore", fading: 'Fading Silhouette', blurred: 'Blurred Silhouette', chaos: 'Chaos Silhouette' } as const;
type MaterialKey = keyof typeof materialLabels;

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

  return <div className="page calc-page"><header className="page-heading"><div><span>CHARACTER PROGRESSION</span><h1>{ru ? 'Планировщик прокачки Ирой' : 'Iroi progression planner'}</h1><p>{ru ? 'Проверенная стоимость возвышений для открытия 80 уровня. EXP и навыки не добавлены без надёжного набора данных.' : 'Verified ascension costs required to unlock level 80. EXP and skill costs are not added without a reliable dataset.'}</p></div></header>
    <div className="disclaimer top-note"><Backpack size={18} /><span>{ru ? 'Названия материалов оставлены на английском, пока их написание в русском клиенте не подтверждено.' : 'Material names use the verified English wording; localized client names can be added after verification.'}</span></div>
    <div className="summary-strip"><Metric label={ru ? 'Осталось монет' : 'Coins remaining'} value={formatNumber(remaining.beetleCoin)} /><Metric label={ru ? 'Страниц' : 'Pages'} value={remaining.page} /><Metric label={ru ? 'Силуэтов' : 'Silhouettes'} value={remaining.fading + remaining.blurred + remaining.chaos} /><Metric label={ru ? 'Источник' : 'Source'} value="Icy Veins" note="2026-08-03" /></div>
    <div className="progression-layout"><Panel><div className="panel-title"><Backpack size={20} /><div><h2>{ru ? 'Текущий прогресс' : 'Current progress'}</h2><p>{ru ? 'Выбери уже оплаченный этап и укажи инвентарь.' : 'Select the already-paid breakpoint and enter your inventory.'}</p></div></div><SelectField label={ru ? 'Последний завершённый этап' : 'Last completed breakpoint'} value={safeCompleted} onChange={(event) => setCompleted(Number(event.target.value))}><option value={0}>{ru ? 'Ничего' : 'None'}</option>{iroiProgression.map((row, index) => <option key={row.cap} value={index + 1}>Lv. {row.cap}</option>)}</SelectField><div className="inventory-grid">{(Object.keys(materialLabels) as MaterialKey[]).map((key) => <Field key={key} label={materialLabels[key]} type="number" min="0" value={inventory[key]} onChange={(event) => setInventory((current) => ({ ...current, [key]: Math.max(0, Number(event.target.value)) }))} />)}</div></Panel>
      <Panel><h2>{ru ? 'Что осталось собрать' : 'Remaining materials'}</h2><div className="material-list">{(Object.keys(materialLabels) as MaterialKey[]).map((key) => <div key={key}><span>{materialLabels[key]}</span><b>{formatNumber(remaining[key])}</b><small>{ru ? `Нужно ${formatNumber(required[key])}, есть ${formatNumber(inventory[key])}` : `Need ${formatNumber(required[key])}, owned ${formatNumber(inventory[key])}`}</small></div>)}</div></Panel></div>
    <Panel className="breakpoint-table"><h2>{ru ? 'Этапы возвышения' : 'Ascension breakpoints'}</h2>{iroiProgression.map((row, index) => { const silhouette = row.fading ? `${row.fading} Fading` : row.blurred ? `${row.blurred} Blurred` : `${row.chaos} Chaos`; return <div key={row.cap} className={index < safeCompleted ? 'done' : ''}><span>Lv. {row.cap}</span><span>{formatNumber(row.beetleCoin)} Beetle Coin</span><span>{row.page ? `${row.page} Page` : '—'}</span><span>{silhouette}</span><span>{index < safeCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}</span></div>; })}</Panel>
  </div>;
}
