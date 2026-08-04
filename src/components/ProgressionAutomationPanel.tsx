import { AlertTriangle, Check, CheckCircle2, ClipboardList, PackageCheck, Play, RotateCcw, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ascensionMaterials, type AscensionMaterialId } from '../progression-data';
import {
  applyParsedInventory,
  parseBulkInventory,
  serializeInventoryText,
  simulateImmediatePayments,
  type InventoryApplyMode,
  type InventoryParseIssue,
} from '../progression-automation';
import type { RosterProgressionEntry } from '../progression-engine';
import { localizedCharacterName } from '../gameTerms';
import { useI18n } from '../i18n';
import { formatNumber } from './UI';

interface ProgressionAutomationPanelProps {
  entries: readonly RosterProgressionEntry[];
  inventory: Partial<Record<AscensionMaterialId, number>>;
  activeMaterialIds: readonly AscensionMaterialId[];
  onApplyInventory: (inventory: Record<AscensionMaterialId, number>) => void;
  onApplyPayments: () => void;
}

function issueMessage(issue: InventoryParseIssue, ru: boolean): string {
  const detail = issue.detail ? ` «${issue.detail}»` : '';
  const messages = {
    'missing-amount': ru ? 'не найдено целое количество' : 'no integer amount found',
    'invalid-amount': ru ? `недопустимое количество${detail}` : `invalid amount${detail}`,
    'unknown-material': ru ? `неизвестный материал${detail}` : `unknown material${detail}`,
    'duplicate-material': ru ? `материал уже указан в строке ${issue.detail}` : `material was already set on line ${issue.detail}`,
  } as const;
  return ru ? `Строка ${issue.line}: ${messages[issue.code]}.` : `Line ${issue.line}: ${messages[issue.code]}.`;
}

export function ProgressionAutomationPanel({
  entries,
  inventory,
  activeMaterialIds,
  onApplyInventory,
  onApplyPayments,
}: ProgressionAutomationPanelProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [text, setText] = useState('');
  const [mode, setMode] = useState<InventoryApplyMode>('merge');
  const [inventoryApplied, setInventoryApplied] = useState(false);
  const parsed = useMemo(() => parseBulkInventory(text), [text]);
  const simulation = useMemo(() => simulateImmediatePayments(entries, inventory), [entries, inventory]);
  const payableCount = simulation.payableCharacters.length;
  const blockedCount = simulation.blockedCharacters.length;
  const consumedIds = activeMaterialIds.filter((id) => simulation.consumed[id] > 0);

  const loadCurrent = () => {
    setText(serializeInventoryText(inventory, activeMaterialIds, locale));
    setInventoryApplied(false);
  };

  const applyInventory = () => {
    if (!parsed.valid) return;
    onApplyInventory(applyParsedInventory(inventory, parsed, mode, activeMaterialIds));
    setInventoryApplied(true);
  };

  return <PanelShell>
    <header className="progression-automation-heading">
      <div><ClipboardList size={22} /><span><small>{ru ? 'БЫСТРЫЕ ДЕЙСТВИЯ' : 'QUICK ACTIONS'}</small><h2>{ru ? 'Ввести инвентарь пачкой и оплатить готовые этапы' : 'Paste inventory and pay ready ascensions'}</h2><p>{ru ? 'Сначала проверь массовый ввод. Затем сайт может последовательно оплатить только полностью доступные ближайшие этапы, не расходуя общий материал дважды.' : 'Validate bulk inventory first. The site can then pay only fully available immediate stages in roster order without spending shared materials twice.'}</p></span></div>
      <strong>{payableCount > 0 ? (ru ? `${payableCount} готово` : `${payableCount} ready`) : (ru ? 'Нет готовых этапов' : 'No payable stages')}</strong>
    </header>

    <div className="progression-automation-layout">
      <section className="bulk-inventory-editor">
        <div className="automation-section-heading"><div><h3>{ru ? 'Массовый ввод инвентаря' : 'Bulk inventory input'}</h3><p>{ru ? 'Одна строка — один материал. Поддерживаются русское название, английское название или внутренний ID.' : 'Use one material per line. Russian name, English name or canonical ID are accepted.'}</p></div><button className="button ghost" type="button" onClick={loadCurrent}><RotateCcw size={15} /> {ru ? 'Подставить текущие' : 'Load current'}</button></div>
        <textarea value={text} onChange={(event) => { setText(event.target.value); setInventoryApplied(false); }} placeholder={ru ? 'Жук-монета: 125000\nПотерянный шёпот = 12\nchargingKnightSparkPlug 6' : 'Beetle Coin: 125000\nLost Whispers = 12\nchargingKnightSparkPlug 6'} spellCheck={false} aria-label={ru ? 'Массовый ввод инвентаря' : 'Bulk inventory input'} />
        <div className="bulk-inventory-mode" role="radiogroup" aria-label={ru ? 'Режим применения' : 'Apply mode'}>
          <label><input type="radio" name="inventory-mode" checked={mode === 'merge'} onChange={() => setMode('merge')} /><span><b>{ru ? 'Обновить указанные' : 'Update listed'}</b><small>{ru ? 'Остальные значения не меняются.' : 'Unlisted values stay unchanged.'}</small></span></label>
          <label><input type="radio" name="inventory-mode" checked={mode === 'replace-active'} onChange={() => setMode('replace-active')} /><span><b>{ru ? 'Заменить активный набор' : 'Replace active set'}</b><small>{ru ? 'Неуказанные материалы текущего плана станут нулём; чужие планы не затрагиваются.' : 'Unlisted materials used by this plan become zero; unrelated stored materials are preserved.'}</small></span></label>
        </div>
        <div className={`bulk-inventory-result ${text.trim() ? (parsed.valid ? 'valid' : 'invalid') : 'empty'}`} aria-live="polite">
          {!text.trim() ? <><ClipboardList size={18} /><span>{ru ? 'Вставь список или подставь текущие значения.' : 'Paste a list or load current values.'}</span></> : parsed.valid ? <><CheckCircle2 size={18} /><span>{ru ? `Распознано материалов: ${parsed.lines.length}.` : `Recognized materials: ${parsed.lines.length}.`}</span></> : <><AlertTriangle size={18} /><span>{ru ? `Найдено ошибок: ${parsed.issues.length}. Ничего не будет применено частично.` : `${parsed.issues.length} errors found. Nothing will be partially applied.`}</span></>}
        </div>
        {parsed.issues.length ? <ul className="bulk-inventory-errors">{parsed.issues.map((issue) => <li key={`${issue.line}-${issue.code}`}><XCircle size={14} />{issueMessage(issue, ru)}</li>)}</ul> : null}
        {parsed.lines.length ? <div className="bulk-inventory-preview">{parsed.lines.map((line) => <span key={line.materialId}><b>{ascensionMaterials[line.materialId].name[locale]}</b><em>{formatNumber(line.amount)}</em></span>)}</div> : null}
        <div className="bulk-inventory-actions"><button className="button primary" type="button" disabled={!parsed.valid} onClick={applyInventory}><Check size={16} /> {ru ? 'Применить проверенный список' : 'Apply validated list'}</button>{inventoryApplied ? <span><CheckCircle2 size={15} />{ru ? 'Инвентарь обновлён' : 'Inventory updated'}</span> : null}</div>
      </section>

      <section className="payment-automation-preview">
        <div className="automation-section-heading"><div><h3>{ru ? 'Оплата ближайших этапов' : 'Pay immediate stages'}</h3><p>{ru ? 'Проверка идёт сверху вниз по текущему списку персонажей. Заблокированный этап не расходует и не резервирует материалы.' : 'The simulation follows the visible roster order. A blocked stage consumes and reserves nothing.'}</p></div><PackageCheck size={21} /></div>
        <div className="payment-summary"><span><small>{ru ? 'Можно оплатить' : 'Payable'}</small><b>{payableCount}</b></span><span><small>{ru ? 'Останутся заблокированы' : 'Blocked'}</small><b>{blockedCount}</b></span></div>
        <div className="payment-allocation-list">{simulation.allocations.length ? simulation.allocations.map((allocation, index) => <article key={allocation.characterName} className={allocation.payable ? 'payable' : 'blocked'}>
          <span className="payment-order">{index + 1}</span>
          <div><b>{localizedCharacterName(allocation.characterName, locale)}</b><small>{ru ? `ур. ${allocation.currentCap} → ${allocation.unlocksLevel}` : `Lv. ${allocation.currentCap} → ${allocation.unlocksLevel}`}</small>{allocation.payable ? <em>{ru ? 'Будет оплачен' : 'Will be paid'}</em> : <em>{ru ? 'Не хватает: ' : 'Missing: '}{Object.entries(allocation.shortages).map(([id, amount]) => `${ascensionMaterials[id as AscensionMaterialId].name[locale]} ${formatNumber(amount ?? 0)}`).join(' · ')}</em>}</div>
          {allocation.payable ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
        </article>) : <div className="payment-empty"><CheckCircle2 size={20} /><span>{ru ? 'У выбранных персонажей нет неоплаченных этапов.' : 'Selected characters have no unpaid ascensions.'}</span></div>}</div>
        {consumedIds.length ? <div className="payment-consumption"><small>{ru ? 'Будет списано' : 'Will consume'}</small>{consumedIds.map((id) => <span key={id}><b>{ascensionMaterials[id].name[locale]}</b><em>{formatNumber(simulation.consumed[id])}</em></span>)}</div> : null}
        <button className="button primary payment-apply" type="button" disabled={payableCount === 0} onClick={onApplyPayments}><Play size={16} /> {ru ? `Оплатить готовые этапы (${payableCount})` : `Pay ready stages (${payableCount})`}</button>
        <p className="payment-policy">{ru ? 'Это не совет по выгодности фарма и не автоматический выбор приоритетного персонажа. Сайт лишь применяет точные цены этапов в уже заданном тобой порядке.' : 'This is not farming-efficiency advice or an automatic priority recommendation. It only applies exact stage costs in the order you already chose.'}</p>
      </section>
    </div>
  </PanelShell>;
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return <section className="progression-automation-panel">{children}</section>;
}
