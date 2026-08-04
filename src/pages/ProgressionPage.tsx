import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Backpack,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileUp,
  Link2,
  Plus,
  Route,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { QuickStart } from '../components/GuidedHelp';
import { ProgressionAutomationPanel } from '../components/ProgressionAutomationPanel';
import { ProgressionNextOverview } from '../components/ProgressionNextOverview';
import { ProgressionRosterList } from '../components/ProgressionRosterList';
import { Field, formatNumber, Metric, Panel, SelectField } from '../components/UI';
import { localizedCharacterName } from '../gameTerms';
import { parseStoredJson, useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';
import {
  ascensionMaterials,
  ascensionSteps,
  bossMaterialIds,
  characterAscensionByName,
  characterAscensionProfiles,
  commonMaterialIds,
  progressionDatasetSources,
  type AscensionMaterialId,
} from '../progression-data';
import { applyImmediatePayments } from '../progression-automation';
import {
  aggregateRosterRequirements,
  calculateMaterialShortages,
  charactersUsingMaterial,
  defaultRosterProgressionState,
  migrateLegacyIroiState,
  normalizeRosterProgressionState,
  totalForCategory,
  usedMaterialIds,
  type RosterProgressionState,
} from '../progression-engine';
import {
  MAX_PROGRESSION_EXPORT_BYTES,
  PROGRESSION_SHARE_PARAM,
  applyProgressionShare,
  buildProgressionShareUrl,
  parseProgressionPlan,
  readProgressionShareState,
  removeProgressionShareParam,
  serializeProgressionPlan,
  type DecodedProgressionShare,
} from '../progression-share';

const STORAGE_KEY = 'nte.progression.roster.v2';
const LEGACY_COMPLETED_KEY = 'nte.progression.iroi.completed.v1';
const LEGACY_INVENTORY_KEY = 'nte.progression.iroi.inventory.v1';

type TransferStatus = 'idle' | 'copied' | 'exported' | 'applied' | 'imported' | 'invalid' | 'failed';

function readInitialState(): RosterProgressionState {
  const fallback = defaultRosterProgressionState();
  if (typeof window === 'undefined') return fallback;
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current !== null) return parseStoredJson(current, fallback, normalizeRosterProgressionState);
    const legacyCompleted = parseStoredJson<unknown>(window.localStorage.getItem(LEGACY_COMPLETED_KEY), 0);
    const legacyInventory = parseStoredJson<unknown>(window.localStorage.getItem(LEGACY_INVENTORY_KEY), {});
    return migrateLegacyIroiState(legacyCompleted, legacyInventory);
  } catch {
    return fallback;
  }
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Restricted contexts can deny Clipboard API access; use the fallback below.
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

function downloadJson(content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `nte-progression-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export function ProgressionPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const initialState = useMemo(readInitialState, []);
  const [initialShare] = useState(() => ({
    present: new URLSearchParams(window.location.search).has(PROGRESSION_SHARE_PARAM),
    decoded: readProgressionShareState(window.location.search),
  }));
  const [state, setState] = useLocalStorage<RosterProgressionState>(STORAGE_KEY, initialState, {
    normalize: normalizeRosterProgressionState,
  });
  const [characterToAdd, setCharacterToAdd] = useState('Shinku');
  const [includeInventory, setIncludeInventory] = useState(false);
  const [sharedPlan, setSharedPlan] = useState<DecodedProgressionShare | null>(initialShare.decoded);
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('idle');
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialShare.present) return;
    window.history.replaceState(window.history.state, '', removeProgressionShareParam(window.location.href));
    if (!initialShare.decoded) setTransferStatus('invalid');
  }, [initialShare]);

  useEffect(() => {
    if (transferStatus === 'idle') return undefined;
    const timeout = window.setTimeout(() => setTransferStatus('idle'), 3_000);
    return () => window.clearTimeout(timeout);
  }, [transferStatus]);

  const selectedNames = useMemo(() => new Set(state.entries.map((entry) => entry.characterName)), [state.entries]);
  const addableProfiles = useMemo(
    () => characterAscensionProfiles.filter((profile) => !selectedNames.has(profile.characterName)),
    [selectedNames],
  );
  const sortedProfiles = useMemo(
    () => [...characterAscensionProfiles].sort((a, b) => localizedCharacterName(a.characterName, locale).localeCompare(localizedCharacterName(b.characterName, locale))),
    [locale],
  );
  const required = useMemo(() => aggregateRosterRequirements(state.entries), [state.entries]);
  const shortages = useMemo(() => calculateMaterialShortages(required, state.inventory), [required, state.inventory]);
  const activeMaterialIds = useMemo(() => usedMaterialIds(required), [required]);
  const activeBossIds = bossMaterialIds.filter((id) => required[id] > 0);
  const activeCommonIds = commonMaterialIds.filter((id) => required[id] > 0);
  const completedAscensions = state.entries.reduce((sum, entry) => sum + entry.completedSteps, 0);
  const totalAscensions = state.entries.length * ascensionSteps.length;
  const sharedCompleted = sharedPlan?.state.entries.reduce((sum, entry) => sum + entry.completedSteps, 0) ?? 0;

  const addCharacter = () => {
    if (selectedNames.has(characterToAdd) || !characterAscensionByName.has(characterToAdd)) return;
    setState((current) => ({
      ...current,
      entries: [...current.entries, { characterName: characterToAdd, completedSteps: 0 }],
    }));
    const next = addableProfiles.find((profile) => profile.characterName !== characterToAdd);
    if (next) setCharacterToAdd(next.characterName);
  };

  const updateCompleted = (characterName: string, completedSteps: number) => setState((current) => ({
    ...current,
    entries: current.entries.map((entry) => entry.characterName === characterName
      ? { ...entry, completedSteps: Math.min(ascensionSteps.length, Math.max(0, completedSteps)) }
      : entry),
  }));

  const removeCharacter = (characterName: string) => setState((current) => ({
    ...current,
    entries: current.entries.filter((entry) => entry.characterName !== characterName),
  }));

  const updateInventory = (id: AscensionMaterialId, value: number) => setState((current) => ({
    ...current,
    inventory: { ...current.inventory, [id]: Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)) },
  }));

  const applyBulkInventory = (inventory: Record<AscensionMaterialId, number>) => setState((current) => ({
    ...current,
    inventory,
  }));

  const payReadyAscensions = () => setState((current) => applyImmediatePayments(current));

  const resetPlan = () => {
    setState(defaultRosterProgressionState());
    setTransferStatus('idle');
  };

  const copyShareLink = async () => {
    try {
      await copyText(buildProgressionShareUrl(state, window.location.href, includeInventory));
      setTransferStatus('copied');
    } catch {
      setTransferStatus('failed');
    }
  };

  const exportPlan = () => {
    try {
      downloadJson(serializeProgressionPlan(state));
      setTransferStatus('exported');
    } catch {
      setTransferStatus('failed');
    }
  };

  const importPlan = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > MAX_PROGRESSION_EXPORT_BYTES) throw new Error('FILE_TOO_LARGE');
      const imported = parseProgressionPlan(await file.text());
      if (!imported) throw new Error('INVALID_FILE');
      setState(imported);
      setTransferStatus('imported');
    } catch {
      setTransferStatus('invalid');
    }
  };

  const applySharedPlan = () => {
    if (!sharedPlan) return;
    setState((current) => applyProgressionShare(current, sharedPlan));
    setSharedPlan(null);
    setTransferStatus('applied');
  };

  const transferMessage = {
    idle: '',
    copied: ru
      ? `Ссылка скопирована. ${includeInventory ? 'Инвентарь включён.' : 'Инвентарь не включён.'}`
      : `Link copied. Inventory ${includeInventory ? 'included.' : 'not included.'}`,
    exported: ru ? 'Резервная копия JSON скачана.' : 'JSON backup downloaded.',
    applied: ru ? 'Общий план применён.' : 'Shared plan applied.',
    imported: ru ? 'План из JSON успешно импортирован.' : 'JSON plan imported successfully.',
    invalid: ru ? 'Не удалось прочитать план: ссылка или файл повреждены либо имеют неподдерживаемый формат.' : 'Could not read the plan: the link or file is damaged or unsupported.',
    failed: ru ? 'Не удалось выполнить действие в этом браузере.' : 'The action could not be completed in this browser.',
  }[transferStatus];

  return <div className="page calc-page roster-progression-page">
    <header className="page-heading"><div><span>{ru ? 'ПЛАН ПРОКАЧКИ' : 'ROSTER PROGRESSION'}</span><h1>{ru ? 'Что прокачивать и фармить дальше' : 'What to raise and farm next'}</h1><p>{ru ? 'Добавь персонажей и отметь оплаченные прорывы. Сначала сайт покажет точные ресурсы для ближайших этапов, а ниже — полный остаток до открытия 80 уровня.' : 'Add characters and mark paid ascensions. The site first shows exact resources for the next steps, then the complete remaining plan to unlock level 80.'}</p></div><button className="button ghost" onClick={resetPlan}><Trash2 size={16} /> {ru ? 'Сбросить план' : 'Reset plan'}</button></header>

    {sharedPlan ? <Panel className="progression-share-preview">
      <div className="progression-share-preview-copy"><Link2 size={22} /><div><h2>{ru ? 'Получен общий план' : 'Shared plan received'}</h2><p>{ru ? `${sharedPlan.state.entries.length} персонажей · ${sharedCompleted} оплаченных этапов прорыва. ${sharedPlan.includesInventory ? 'Автор включил свой инвентарь — он заменит текущий.' : 'Инвентарь не передан — твои текущие значения сохранятся.'}` : `${sharedPlan.state.entries.length} characters · ${sharedCompleted} paid ascensions. ${sharedPlan.includesInventory ? 'The sender included inventory, which will replace yours.' : 'Inventory was not shared, so your current values will be preserved.'}`}</p></div></div>
      <div className="progression-share-preview-actions"><button className="button primary" type="button" onClick={applySharedPlan}><Check size={17} /> {ru ? 'Применить план' : 'Apply plan'}</button><button className="button ghost" type="button" onClick={() => setSharedPlan(null)}><X size={17} /> {ru ? 'Отклонить' : 'Dismiss'}</button></div>
    </Panel> : null}

    <QuickStart title={ru ? 'Как составить план' : 'How to build a plan'} steps={ru ? [
      'Добавь персонажей и укажи последний полностью оплаченный этап прорыва.',
      'В блоке «Ближайшая цель» смотри общий набор только для следующего этапа каждого персонажа.',
      'Введи общий инвентарь: ближайшие блокеры и полный остаток до 80 пересчитаются автоматически.',
    ] : [
      'Add characters and set the last fully paid ascension for each one.',
      'Use Next target for the shared requirements of only one immediate step per character.',
      'Enter shared inventory to recalculate immediate blockers and the complete remainder to level 80.',
    ]} />

    <div className="disclaimer top-note"><ShieldCheck size={18} /><span>{ru ? 'В расчёт входят только шесть этапов прорыва персонажа: валюта «Жук-монета», семейство обычных материалов и материалы с боссов Охоты на аномалию. EXP, навыки, пассивы, жизненные навыки и дуги намеренно не прибавляются без отдельного полного набора данных.' : 'This calculation includes the six character ascensions only: Beetle Coins, one common material family and one Anomaly Hunt drop. EXP, abilities, passives, Life Skills and Arcs are intentionally excluded without a separate complete dataset.'}</span></div>

    <div className="summary-strip roster-summary">
      <Metric label={ru ? 'Персонажей в плане' : 'Planned characters'} value={state.entries.length} />
      <Metric label={ru ? 'Этапов оплачено' : 'Ascensions paid'} value={`${completedAscensions}/${totalAscensions || 0}`} />
      <Metric label={ru ? 'До ур. 80: монет' : 'To Lv. 80: coins'} value={formatNumber(shortages.beetleCoin)} />
      <Metric label={ru ? 'До ур. 80: материалов с боссов' : 'To Lv. 80: boss drops'} value={formatNumber(totalForCategory(shortages, 'boss'))} />
    </div>

    <ProgressionNextOverview entries={state.entries} inventory={state.inventory} />

    {state.entries.length > 0 ? <ProgressionAutomationPanel
      entries={state.entries}
      inventory={state.inventory}
      activeMaterialIds={activeMaterialIds}
      onApplyInventory={applyBulkInventory}
      onApplyPayments={payReadyAscensions}
    /> : null}

    <Panel className="progression-transfer-panel">
      <div className="panel-title"><Link2 size={20} /><div><h2>{ru ? 'Передать или сохранить план' : 'Share or back up the plan'}</h2><p>{ru ? 'Ссылка предназначена для быстрой передачи, JSON — для полной резервной копии.' : 'Use a link for quick sharing and JSON for a complete backup.'}</p></div></div>
      <div className="progression-transfer-controls">
        <label className="progression-inventory-toggle"><input type="checkbox" checked={includeInventory} onChange={(event) => setIncludeInventory(event.target.checked)} /><span><b>{ru ? 'Включить инвентарь в ссылку' : 'Include inventory in link'}</b><small>{ru ? 'По умолчанию ссылка передаёт только персонажей и этапы.' : 'By default, the link contains characters and breakpoints only.'}</small></span></label>
        <div className="progression-transfer-buttons"><button className="button" type="button" onClick={copyShareLink}>{transferStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />} {ru ? 'Копировать ссылку' : 'Copy link'}</button><button className="button ghost" type="button" onClick={exportPlan}><Download size={16} /> {ru ? 'Скачать JSON' : 'Download JSON'}</button><button className="button ghost" type="button" onClick={() => importInputRef.current?.click()}><FileUp size={16} /> {ru ? 'Импортировать JSON' : 'Import JSON'}</button><input ref={importInputRef} className="progression-file-input" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void importPlan(file); }} /></div>
      </div>
      <div className={`progression-transfer-status ${transferStatus}`} role="status" aria-live="polite">{transferMessage}</div>
    </Panel>

    <Panel className="progression-add-panel">
      <div className="panel-title"><Users size={20} /><div><h2>{ru ? 'Добавить персонажа' : 'Add a character'}</h2><p>{ru ? 'Доступны 20 выпущенных персонажей с проверенными материалами.' : 'All 20 released characters with verified materials are available.'}</p></div></div>
      <div className="progression-add-row">
        <SelectField label={ru ? 'Персонаж' : 'Character'} value={characterToAdd} disabled={addableProfiles.length === 0} onChange={(event) => setCharacterToAdd(event.target.value)}>
          {sortedProfiles.map((profile) => <option key={profile.characterName} value={profile.characterName} disabled={selectedNames.has(profile.characterName)}>{localizedCharacterName(profile.characterName, locale)}{ru ? ` · ${profile.characterName}` : ''}</option>)}
        </SelectField>
        <button className="button primary" onClick={addCharacter} disabled={addableProfiles.length === 0 || selectedNames.has(characterToAdd)}><Plus size={17} /> {addableProfiles.length === 0 ? (ru ? 'Все добавлены' : 'All added') : (ru ? 'Добавить в план' : 'Add to plan')}</button>
      </div>
    </Panel>

    {state.entries.length === 0 ? <Panel className="progression-empty"><Backpack size={34} /><h2>{ru ? 'План пока пуст' : 'The plan is empty'}</h2><p>{ru ? 'Добавь хотя бы одного персонажа — после этого появятся ближайшая цель, материалы, инвентарь и маршруты фарма.' : 'Add at least one character to reveal the next target, materials, inventory and farming routes.'}</p></Panel> : <ProgressionRosterList entries={state.entries} onUpdateCompleted={updateCompleted} onRemove={removeCharacter} />}

    {state.entries.length > 0 ? <div className="roster-progression-layout">
      <Panel className="progression-inventory-panel"><div className="panel-title"><Backpack size={20} /><div><h2>{ru ? 'Общий инвентарь' : 'Shared inventory'}</h2><p>{ru ? 'Показываются только материалы, которые нужны выбранным персонажам. Одни и те же значения используются и для ближайших этапов, и для полного плана.' : 'Only materials required by selected characters are shown. The same values feed both immediate targets and the complete plan.'}</p></div></div><div className="progression-inventory-grid">{activeMaterialIds.map((id) => <Field key={id} label={ascensionMaterials[id].name[locale]} hint={ru ? ascensionMaterials[id].name.en : undefined} type="number" min="0" value={state.inventory[id]} onChange={(event) => updateInventory(id, Number(event.target.value))} />)}</div></Panel>

      <Panel className="progression-shortage-panel"><h2>{ru ? 'Полный остаток до ур. 80' : 'Complete remainder to Lv. 80'}</h2><p className="progression-shortage-intro">{ru ? 'Здесь показаны все будущие этапы выбранных персонажей, а не только ближайший.' : 'This includes every future ascension for the selected characters, not only the next one.'}</p><div className="material-list roster-material-list">{activeMaterialIds.map((id) => <div key={id} className={shortages[id] === 0 ? 'complete' : ''}><span className="material-name"><span>{ascensionMaterials[id].name[locale]}</span>{ru ? <small>{ascensionMaterials[id].name.en}</small> : null}</span><b>{formatNumber(shortages[id])}</b><small>{ru ? `Нужно ${formatNumber(required[id])}, есть ${formatNumber(state.inventory[id])}` : `Need ${formatNumber(required[id])}, owned ${formatNumber(state.inventory[id])}`}</small></div>)}</div></Panel>
    </div> : null}

    {state.entries.length > 0 ? <section className="progression-farm-section"><h2 className="section-title">{ru ? 'Маршруты боссов для полного плана до ур. 80' : 'Boss routes for the complete plan to Lv. 80'}</h2><div className="progression-farm-grid">{activeBossIds.map((id) => <Panel key={id} className={shortages[id] === 0 ? 'farm-card complete' : 'farm-card'}><Route size={20} /><div><h3>{ascensionMaterials[id].name[locale]}</h3>{ru ? <small>{ascensionMaterials[id].name.en}</small> : null}<p>{ascensionMaterials[id].farm?.[locale]}</p>{ru && ascensionMaterials[id].originalFarmName ? <span>{ascensionMaterials[id].originalFarmName}</span> : null}</div><strong>{shortages[id] === 0 ? (ru ? 'Собрано' : 'Ready') : formatNumber(shortages[id])}</strong><footer>{charactersUsingMaterial(state.entries, id).map((name) => localizedCharacterName(name, locale)).join(' · ')}</footer></Panel>)}</div>

      <h2 className="section-title">{ru ? 'Обычные материалы для полного плана' : 'Common materials for the complete plan'}</h2><Panel className="common-material-summary">{activeCommonIds.map((id) => <div key={id} className={shortages[id] === 0 ? 'complete' : ''}><span><b>{ascensionMaterials[id].name[locale]}</b>{ru ? <small>{ascensionMaterials[id].name.en}</small> : null}</span><strong>{formatNumber(shortages[id])}</strong><small>{charactersUsingMaterial(state.entries, id).map((name) => localizedCharacterName(name, locale)).join(' · ')}</small></div>)}</Panel>
    </section> : null}

    <Panel className="progression-source-policy"><div className="panel-title"><ShieldCheck size={20} /><div><h2>{ru ? 'Источники и границы данных' : 'Sources and data boundaries'}</h2><p>{ru ? 'Почему итог не содержит красивых, но неподтверждённых чисел' : 'Why the total excludes attractive but unsupported numbers'}</p></div></div><div>{progressionDatasetSources.map((source) => <article key={source.publisher}><div><b>{source.publisher}</b><span>{ru ? 'Источник обновлён' : 'Source updated'}: {source.updatedAt}</span><span>{ru ? 'Проверено' : 'Verified'}: {source.verifiedAt}</span></div><p>{source.scope[locale]}</p><a href={source.url} target="_blank" rel="noreferrer">{ru ? 'Открыть источник' : 'Open source'} <ExternalLink size={13} /></a></article>)}</div><p className="model-note">{ru ? 'Итог относится только к материалам прорыва с ур. 20 по ур. 70, которые открывают предел ур. 80. Он не является полной стоимостью прокачки персонажа с нуля до MAX.' : 'The total covers ascension payments at Lv. 20 through Lv. 70 that unlock the Lv. 80 cap. It is not the complete cost of raising a character from zero to MAX.'}</p></Panel>
  </div>;
}
