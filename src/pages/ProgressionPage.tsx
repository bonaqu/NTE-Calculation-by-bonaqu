import { useMemo, useState } from 'react';
import { Backpack, CheckCircle2, Circle, ExternalLink, Plus, Route, ShieldCheck, Trash2, Users } from 'lucide-react';
import { characterByName } from '../characters';
import { QuickStart } from '../components/GuidedHelp';
import { ResilientImage } from '../components/ResilientImage';
import { Field, formatNumber, Metric, Panel, SelectField } from '../components/UI';
import { localizedAttribute, localizedCharacterName, localizedRole } from '../gameTerms';
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
import {
  aggregateRosterRequirements,
  calculateMaterialShortages,
  charactersUsingMaterial,
  defaultRosterProgressionState,
  migrateLegacyIroiState,
  normalizeRosterProgressionState,
  requirementsForCharacter,
  totalForCategory,
  usedMaterialIds,
  type RosterProgressionState,
} from '../progression-engine';

const STORAGE_KEY = 'nte.progression.roster.v2';
const LEGACY_COMPLETED_KEY = 'nte.progression.iroi.completed.v1';
const LEGACY_INVENTORY_KEY = 'nte.progression.iroi.inventory.v1';

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

export function ProgressionPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const initialState = useMemo(readInitialState, []);
  const [state, setState] = useLocalStorage<RosterProgressionState>(STORAGE_KEY, initialState, {
    normalize: normalizeRosterProgressionState,
  });
  const [characterToAdd, setCharacterToAdd] = useState('Shinku');

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

  const resetPlan = () => setState(defaultRosterProgressionState());

  return <div className="page calc-page roster-progression-page">
    <header className="page-heading"><div><span>{ru ? 'ПЛАН ПРОКАЧКИ' : 'ROSTER PROGRESSION'}</span><h1>{ru ? 'Планировщик возвышения команды' : 'Roster ascension planner'}</h1><p>{ru ? 'Добавь нескольких персонажей, отметь уже оплаченные возвышения и введи общий инвентарь. Сайт объединит одинаковые материалы и покажет, что действительно осталось фармить до открытия 80 уровня.' : 'Add several characters, mark paid ascensions and enter one shared inventory. The planner combines matching materials and shows what is still required to unlock level 80.'}</p></div><button className="button ghost" onClick={resetPlan}><Trash2 size={16} /> {ru ? 'Сбросить план' : 'Reset plan'}</button></header>

    <QuickStart title={ru ? 'Как составить план' : 'How to build a plan'} steps={ru ? [
      'Добавь всех персонажей, которых собираешься поднять. Будущие Линко и Занкоу не показываются до публикации их материалов.',
      'В каждой карточке выбери последнее возвышение, которое уже полностью оплачено. Формулировка сразу показывает новый открытый предел уровня.',
      'Введи общий инвентарь один раз — одинаковые материалы автоматически распределяются по всему плану.',
    ] : [
      'Add every character you intend to raise. Upcoming Linko and Zankou remain unavailable until their materials are public.',
      'For every card, choose the last ascension you fully paid. The option also states the level cap it unlocked.',
      'Enter shared inventory once; matching materials are automatically applied across the whole plan.',
    ]} />

    <div className="disclaimer top-note"><ShieldCheck size={18} /><span>{ru ? 'В расчёт входят только шесть возвышений персонажа: жучиные монеты, семейство обычных материалов и дроп Охоты на аномалию. EXP, навыки, пассивы, жизненные навыки и дуги намеренно не прибавляются без отдельного полного набора данных.' : 'This calculation includes the six character ascensions only: Beetle Coins, one common material family and one Anomaly Hunt drop. EXP, abilities, passives, Life Skills and Arcs are intentionally excluded without a separate complete dataset.'}</span></div>

    <div className="summary-strip roster-summary">
      <Metric label={ru ? 'Персонажей в плане' : 'Planned characters'} value={state.entries.length} />
      <Metric label={ru ? 'Возвышений оплачено' : 'Ascensions paid'} value={`${completedAscensions}/${totalAscensions || 0}`} />
      <Metric label={ru ? 'Не хватает монет' : 'Coins missing'} value={formatNumber(shortages.beetleCoin)} />
      <Metric label={ru ? 'Не хватает босс-дропа' : 'Boss drops missing'} value={formatNumber(totalForCategory(shortages, 'boss'))} />
    </div>

    <Panel className="progression-add-panel">
      <div className="panel-title"><Users size={20} /><div><h2>{ru ? 'Добавить персонажа' : 'Add a character'}</h2><p>{ru ? 'Доступны 20 выпущенных персонажей с проверенными материалами.' : 'All 20 released characters with verified materials are available.'}</p></div></div>
      <div className="progression-add-row">
        <SelectField label={ru ? 'Персонаж' : 'Character'} value={characterToAdd} disabled={addableProfiles.length === 0} onChange={(event) => setCharacterToAdd(event.target.value)}>
          {sortedProfiles.map((profile) => <option key={profile.characterName} value={profile.characterName} disabled={selectedNames.has(profile.characterName)}>{localizedCharacterName(profile.characterName, locale)}{ru ? ` · ${profile.characterName}` : ''}</option>)}
        </SelectField>
        <button className="button primary" onClick={addCharacter} disabled={addableProfiles.length === 0 || selectedNames.has(characterToAdd)}><Plus size={17} /> {addableProfiles.length === 0 ? (ru ? 'Все добавлены' : 'All added') : (ru ? 'Добавить в план' : 'Add to plan')}</button>
      </div>
    </Panel>

    {state.entries.length === 0 ? <Panel className="progression-empty"><Backpack size={34} /><h2>{ru ? 'План пока пуст' : 'The plan is empty'}</h2><p>{ru ? 'Добавь хотя бы одного персонажа — после этого появятся материалы, инвентарь и маршруты фарма.' : 'Add at least one character to reveal material totals, inventory and farming routes.'}</p></Panel> : <section className="progression-character-grid" aria-label={ru ? 'Персонажи в плане' : 'Planned characters'}>{state.entries.map((entry) => {
      const profile = characterAscensionByName.get(entry.characterName);
      if (!profile) return null;
      const character = characterByName.get(entry.characterName);
      const characterRequired = requirementsForCharacter(profile, entry.completedSteps);
      const displayName = localizedCharacterName(entry.characterName, locale);
      const currentCap = entry.completedSteps === 0 ? 20 : ascensionSteps[entry.completedSteps - 1]?.unlocksLevel ?? 80;
      const commonTotal = totalForCategory(characterRequired, 'common');
      return <Panel key={entry.characterName} className="progression-character-card">
        <header><ResilientImage src={character?.image} alt={displayName} wrapperClassName="progression-character-art" loading="lazy" /><div><h2>{displayName}</h2>{ru ? <small>{entry.characterName}</small> : null}<p>{localizedAttribute(character?.attribute, locale)} · {localizedRole(character?.role, locale)}</p></div><button className="icon-button progression-remove" onClick={() => removeCharacter(entry.characterName)} aria-label={ru ? `Убрать ${displayName} из плана` : `Remove ${displayName} from plan`}><Trash2 size={16} /></button></header>
        <div className="progression-cap"><span>{ru ? 'Текущий открытый предел' : 'Current unlocked cap'}</span><strong>{ru ? `Ур. ${currentCap}` : `Lv. ${currentCap}`}</strong></div>
        <SelectField label={ru ? 'Последнее полностью оплаченное возвышение' : 'Last fully paid ascension'} value={entry.completedSteps} onChange={(event) => updateCompleted(entry.characterName, Number(event.target.value))}>
          <option value={0}>{ru ? 'Возвышения ещё не оплачены · предел ур. 20' : 'No ascensions paid · Lv. 20 cap'}</option>
          {ascensionSteps.map((step, index) => <option key={step.atLevel} value={index + 1}>{ru ? `Оплачено на ур. ${step.atLevel} · открыт ур. ${step.unlocksLevel}` : `Paid at Lv. ${step.atLevel} · unlocked Lv. ${step.unlocksLevel}`}</option>)}
        </SelectField>
        <div className="progression-card-totals"><span><small>{ru ? 'Монеты' : 'Coins'}</small><b>{formatNumber(characterRequired.beetleCoin)}</b></span><span><small>{ascensionMaterials[profile.bossMaterial].name[locale]}</small><b>{formatNumber(characterRequired[profile.bossMaterial])}</b></span><span><small>{ru ? 'Обычные материалы' : 'Common materials'}</small><b>{formatNumber(commonTotal)}</b></span></div>
        <details className="progression-breakdowns"><summary>{ru ? 'Показать этапы и источник' : 'Show stages and source'}</summary><div>{ascensionSteps.map((step, index) => {
          const done = index < entry.completedSteps;
          const materialId = profile.commonMaterials[step.commonTier];
          return <div className={done ? 'done' : ''} key={step.atLevel}><span>{done ? <CheckCircle2 size={15} /> : <Circle size={15} />}</span><b>{ru ? `Ур. ${step.atLevel} → ${step.unlocksLevel}` : `Lv. ${step.atLevel} → ${step.unlocksLevel}`}</b><small>{formatNumber(step.beetleCoin)} · {step.bossCount ? `${step.bossCount} ${ascensionMaterials[profile.bossMaterial].name[locale]} · ` : ''}{step.commonCount} {ascensionMaterials[materialId].name[locale]}</small></div>;
        })}</div><a href={profile.sourceUrl} target="_blank" rel="noreferrer">{profile.sourcePublisher} · {ru ? 'гайд обновлён' : 'guide updated'} {profile.sourceUpdatedAt} <ExternalLink size={13} /></a><small>{ru ? 'Проверено для проекта' : 'Verified for project'}: {profile.verifiedAt}</small></details>
      </Panel>;
    })}</section>}

    {state.entries.length > 0 ? <div className="roster-progression-layout">
      <Panel className="progression-inventory-panel"><div className="panel-title"><Backpack size={20} /><div><h2>{ru ? 'Общий инвентарь' : 'Shared inventory'}</h2><p>{ru ? 'Показываются только материалы, которые нужны выбранным персонажам. Сохранённые значения остальных материалов не удаляются.' : 'Only materials required by the selected characters are shown. Saved values for other materials are retained.'}</p></div></div><div className="progression-inventory-grid">{activeMaterialIds.map((id) => <Field key={id} label={ascensionMaterials[id].name[locale]} hint={ru ? ascensionMaterials[id].name.en : undefined} type="number" min="0" value={state.inventory[id]} onChange={(event) => updateInventory(id, Number(event.target.value))} />)}</div></Panel>

      <Panel className="progression-shortage-panel"><h2>{ru ? 'Что осталось собрать' : 'What is still missing'}</h2><div className="material-list roster-material-list">{activeMaterialIds.map((id) => <div key={id} className={shortages[id] === 0 ? 'complete' : ''}><span className="material-name"><span>{ascensionMaterials[id].name[locale]}</span>{ru ? <small>{ascensionMaterials[id].name.en}</small> : null}</span><b>{formatNumber(shortages[id])}</b><small>{ru ? `Нужно ${formatNumber(required[id])}, есть ${formatNumber(state.inventory[id])}` : `Need ${formatNumber(required[id])}, owned ${formatNumber(state.inventory[id])}`}</small></div>)}</div></Panel>
    </div> : null}

    {state.entries.length > 0 ? <section className="progression-farm-section"><h2 className="section-title">{ru ? 'Маршрут фарма босс-дропа' : 'Boss-drop farming route'}</h2><div className="progression-farm-grid">{activeBossIds.map((id) => <Panel key={id} className={shortages[id] === 0 ? 'farm-card complete' : 'farm-card'}><Route size={20} /><div><h3>{ascensionMaterials[id].name[locale]}</h3>{ru ? <small>{ascensionMaterials[id].name.en}</small> : null}<p>{ascensionMaterials[id].farm?.[locale]}</p>{ru && ascensionMaterials[id].originalFarmName ? <span>{ascensionMaterials[id].originalFarmName}</span> : null}</div><strong>{shortages[id] === 0 ? (ru ? 'Собрано' : 'Ready') : formatNumber(shortages[id])}</strong><footer>{charactersUsingMaterial(state.entries, id).map((name) => localizedCharacterName(name, locale)).join(' · ')}</footer></Panel>)}</div>

      <h2 className="section-title">{ru ? 'Обычные материалы в плане' : 'Common materials in the plan'}</h2><Panel className="common-material-summary">{activeCommonIds.map((id) => <div key={id} className={shortages[id] === 0 ? 'complete' : ''}><span><b>{ascensionMaterials[id].name[locale]}</b>{ru ? <small>{ascensionMaterials[id].name.en}</small> : null}</span><strong>{formatNumber(shortages[id])}</strong><small>{charactersUsingMaterial(state.entries, id).map((name) => localizedCharacterName(name, locale)).join(' · ')}</small></div>)}</Panel>
    </section> : null}

    <Panel className="progression-source-policy"><div className="panel-title"><ShieldCheck size={20} /><div><h2>{ru ? 'Источники и границы данных' : 'Sources and data boundaries'}</h2><p>{ru ? 'Почему итог не содержит красивых, но неподтверждённых чисел' : 'Why the total excludes attractive but unsupported numbers'}</p></div></div><div>{progressionDatasetSources.map((source) => <article key={source.publisher}><div><b>{source.publisher}</b><span>{ru ? 'Источник обновлён' : 'Source updated'}: {source.updatedAt}</span><span>{ru ? 'Проверено' : 'Verified'}: {source.verifiedAt}</span></div><p>{source.scope[locale]}</p><a href={source.url} target="_blank" rel="noreferrer">{ru ? 'Открыть источник' : 'Open source'} <ExternalLink size={13} /></a></article>)}</div><p className="model-note">{ru ? 'Итог относится только к материалам возвышения с ур. 20 по ур. 70, которые открывают предел ур. 80. Он не является полной стоимостью прокачки персонажа с нуля до MAX.' : 'The total covers ascension payments at Lv. 20 through Lv. 70 that unlock the Lv. 80 cap. It is not the complete cost of raising a character from zero to MAX.'}</p></Panel>
  </div>;
}
