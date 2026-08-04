import { useMemo, useState } from 'react';
import { BookOpenText, CheckCircle2, ChevronDown, ExternalLink, Search } from 'lucide-react';
import { type ArcDirectoryRarity, type ArcDirectoryType } from '../arc-directory';
import { arcCatalog } from '../arc-catalog';
import { arcPresetSources } from '../arc-presets';
import { awakeningSearchText } from '../awakening-reference';
import { characterCatalog } from '../characters';
import { CharacterAwakeningReference } from '../components/CharacterAwakeningReference';
import { sources } from '../data';
import { useI18n } from '../i18n';
import { Panel } from '../components/UI';
import { QuickStart } from '../components/GuidedHelp';
import { ResilientImage } from '../components/ResilientImage';
import { LocalizationEvidenceLegend, LocalizationEvidenceNote } from '../components/LocalizationEvidenceNote';
import type { CharacterAttribute, CharacterRarity, CharacterReleaseStatus, CharacterRole } from '../types';
import {
  localizedArcName,
  localizedArcType,
  localizedAttribute,
  localizedCharacterAliases,
  localizedCharacterName,
  localizedRole,
  localizedStatLabel,
} from '../gameTerms';
import { arcNameEvidence, arcTypeEvidence, characterNameEvidence } from '../localization-evidence';

const rarities: ArcDirectoryRarity[] = ['S', 'A', 'B'];
const arcTypes: ArcDirectoryType[] = ['Solid', 'Gas', 'Liquid', 'Plasma', 'Synthesis'];
const characterRarities: CharacterRarity[] = ['S', 'A'];
const characterAttributes: CharacterAttribute[] = ['Anima', 'Chaos', 'Cosmos', 'Incantation', 'Lakshana', 'Psyche'];
const characterRoles: CharacterRole[] = ['Damage', 'Buff', 'Survival'];
const characterStatuses: CharacterReleaseStatus[] = ['released', 'upcoming'];

export function DatabasePage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'characters' | 'arcs'>('characters');
  const [rarity, setRarity] = useState<ArcDirectoryRarity | 'all'>('all');
  const [arcType, setArcType] = useState<ArcDirectoryType | 'all'>('all');
  const [characterRarity, setCharacterRarity] = useState<CharacterRarity | 'all'>('all');
  const [characterAttribute, setCharacterAttribute] = useState<CharacterAttribute | 'all'>('all');
  const [characterRole, setCharacterRole] = useState<CharacterRole | 'all'>('all');
  const [characterArcType, setCharacterArcType] = useState<ArcDirectoryType | 'all'>('all');
  const [characterStatus, setCharacterStatus] = useState<CharacterReleaseStatus | 'all'>('all');
  const normalizeSearch = (value: string) => value.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е');
  const normalizedQuery = normalizeSearch(query);
  const sourceMap = useMemo(() => new Map([...sources, ...arcPresetSources].map((source) => [source.id, source])), []);

  const characters = useMemo(() => characterCatalog.filter((row) => {
    const nameEvidence = characterNameEvidence[row.name];
    const typeEvidence = row.arcType ? arcTypeEvidence[row.arcType] : undefined;
    const searchable = [
      row.name,
      localizedCharacterName(row.name, 'ru'),
      ...localizedCharacterAliases(row.name),
      ...(nameEvidence?.alternatives?.map((entry) => entry.russian) ?? []),
      row.attribute,
      localizedAttribute(row.attribute, 'ru'),
      row.role ?? '',
      localizedRole(row.role, 'ru'),
      row.arcType ?? '',
      localizedArcType(row.arcType ?? '', 'ru'),
      ...(typeEvidence?.alternatives?.map((entry) => entry.russian) ?? []),
      row.summary.ru,
      row.summary.en,
      awakeningSearchText(row.name),
      row.rarity,
      row.releaseVersion ?? '',
    ].join(' ');
    const normalizedSearchable = normalizeSearch(searchable);
    return normalizedSearchable.includes(normalizedQuery)
      && (characterRarity === 'all' || row.rarity === characterRarity)
      && (characterAttribute === 'all' || row.attribute === characterAttribute)
      && (characterRole === 'all' || row.role === characterRole)
      && (characterArcType === 'all' || row.arcType === characterArcType)
      && (characterStatus === 'all' || row.releaseStatus === characterStatus);
  }), [characterArcType, characterAttribute, characterRarity, characterRole, characterStatus, normalizedQuery]);

  const arcs = useMemo(() => arcCatalog.filter((row) => {
    const nameEvidence = arcNameEvidence[row.name];
    const typeEvidence = arcTypeEvidence[row.type];
    const searchable = [
      row.name,
      localizedArcName(row.name, 'ru'),
      ...(nameEvidence?.alternatives?.map((entry) => entry.russian) ?? []),
      row.type,
      localizedArcType(row.type, 'ru'),
      ...(typeEvidence.alternatives?.map((entry) => entry.russian) ?? []),
      row.rarity,
      row.secondaryLabel,
      localizedStatLabel(row.secondaryLabel, 'ru'),
      row.effect.ru,
      row.effect.en,
    ].join(' ');
    const normalizedSearchable = normalizeSearch(searchable);
    return normalizedSearchable.includes(normalizedQuery) && (rarity === 'all' || row.rarity === rarity) && (arcType === 'all' || row.type === arcType);
  }), [arcType, normalizedQuery, rarity]);

  const resetArcFilters = () => {
    setRarity('all');
    setArcType('all');
  };

  const resetCharacterFilters = () => {
    setCharacterRarity('all');
    setCharacterAttribute('all');
    setCharacterRole('all');
    setCharacterArcType('all');
    setCharacterStatus('all');
  };

  const showCompatibleArcs = (compatibleType: ArcDirectoryType) => {
    setTab('arcs');
    setQuery('');
    setRarity('all');
    setArcType(compatibleType);
    requestAnimationFrame(() => document.querySelector('.database-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const hasCharacterFilters = characterRarity !== 'all' || characterAttribute !== 'all' || characterRole !== 'all' || characterArcType !== 'all' || characterStatus !== 'all';

  return <div className="page calc-page database-page">
    <header className="page-heading"><div><span>{ru ? 'БАЗА ДАННЫХ' : 'DATABASE'}</span><h1>{ru ? 'Персонажи и дуги NTE' : 'NTE database'}</h1><p>{ru ? 'Найди персонажа, проверь его роль, тип дуги и полный справочник пробуждений. Основным показывается название с наиболее сильными доступными доказательствами; английское имя и конфликтующие варианты остаются доступны для проверки и поиска.' : 'Find a character, verify role, Arc type and the full Awakening reference. The strongest supported localized label is primary while canonical and conflicting alternatives remain searchable and reviewable.'}</p></div></header>

    <QuickStart title={ru ? 'Как пользоваться базой' : 'How to use the database'} steps={ru ? [
      'Открой вкладку персонажей или введи имя. Поиск понимает официальное «Шинку», старое «Синку», «Оценщик», «Зеро» и другие зафиксированные варианты.',
      'Нажми «Показать совместимые дуги» — база сама переключится на подходящий тип оружия.',
      'Раскрой «Пробуждения A1–A6» в карточке персонажа: здесь хранится полный справочник, а калькулятор показывает только узлы, нужные выбранной формуле.',
    ] : [
      'Open Characters and filter by role, attribute or rarity. Recorded alternative names remain searchable.',
      'Select “Show compatible Arcs” to switch to matching weapons automatically.',
      'Open the A1–A6 Awakening reference in a character card. The calculator shows only nodes required by the selected formula.',
    ]} />

    <LocalizationEvidenceLegend />

    <div className="database-toolbar">
      <div className="segmented" role="tablist" aria-label={ru ? 'Раздел базы данных' : 'Database section'}>
        <button role="tab" aria-selected={tab === 'characters'} className={tab === 'characters' ? 'active' : ''} onClick={() => setTab('characters')}>{ru ? `Персонажи · ${characterCatalog.length}` : `Characters · ${characterCatalog.length}`}</button>
        <button role="tab" aria-selected={tab === 'arcs'} className={tab === 'arcs' ? 'active' : ''} onClick={() => setTab('arcs')}>{ru ? `Дуги · ${arcCatalog.length}` : `Arcs · ${arcCatalog.length}`}</button>
      </div>
      <label className="search-field"><Search size={18} /><span className="sr-only">{ru ? 'Поиск' : 'Search'}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === 'arcs' ? (ru ? 'Название, альтернативный вариант, тип, эффект…' : 'Name, alternative, type, effect…') : (ru ? 'Имя, роль, атрибут, пробуждение…' : 'Name, role, attribute, Awakening…')} /></label>
    </div>

    {tab === 'characters' ? <div className="character-filter-panel" aria-label={ru ? 'Фильтры персонажей' : 'Character filters'}>
      <label><span>{ru ? 'Редкость' : 'Rarity'}</span><select value={characterRarity} onChange={(event) => setCharacterRarity(event.target.value as CharacterRarity | 'all')}><option value="all">{ru ? 'Все' : 'All'}</option>{characterRarities.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label><span>{ru ? 'Атрибут' : 'Attribute'}</span><select value={characterAttribute} onChange={(event) => setCharacterAttribute(event.target.value as CharacterAttribute | 'all')}><option value="all">{ru ? 'Все' : 'All'}</option>{characterAttributes.map((value) => <option key={value} value={value}>{localizedAttribute(value, locale)}</option>)}</select></label>
      <label><span>{ru ? 'Роль' : 'Role'}</span><select value={characterRole} onChange={(event) => setCharacterRole(event.target.value as CharacterRole | 'all')}><option value="all">{ru ? 'Все' : 'All'}</option>{characterRoles.map((value) => <option key={value} value={value}>{localizedRole(value, locale)}</option>)}</select></label>
      <label><span>{ru ? 'Тип дуги' : 'Arc type'}</span><select value={characterArcType} onChange={(event) => setCharacterArcType(event.target.value as ArcDirectoryType | 'all')}><option value="all">{ru ? 'Все' : 'All'}</option>{arcTypes.map((value) => <option key={value} value={value}>{localizedArcType(value, locale)}</option>)}</select></label>
      <label><span>{ru ? 'Статус' : 'Status'}</span><select value={characterStatus} onChange={(event) => setCharacterStatus(event.target.value as CharacterReleaseStatus | 'all')}><option value="all">{ru ? 'Все' : 'All'}</option>{characterStatuses.map((value) => <option key={value} value={value}>{value === 'released' ? (ru ? 'Доступен' : 'Released') : (ru ? 'Ожидается' : 'Upcoming')}</option>)}</select></label>
      <div className="character-filter-result"><b>{characters.length}</b><span>{ru ? 'найдено' : 'shown'}</span>{hasCharacterFilters ? <button onClick={resetCharacterFilters}>{ru ? 'Сбросить' : 'Reset'}</button> : null}</div>
    </div> : null}

    {tab === 'arcs' ? <div className="arc-filter-panel" aria-label={ru ? 'Фильтры дуг' : 'Arc filters'}>
      <div className="filter-group"><span>{ru ? 'Редкость' : 'Rarity'}</span><div><button className={rarity === 'all' ? 'active' : ''} aria-pressed={rarity === 'all'} onClick={() => setRarity('all')}>{ru ? 'Все' : 'All'}</button>{rarities.map((value) => <button key={value} className={rarity === value ? 'active' : ''} aria-pressed={rarity === value} onClick={() => setRarity(value)}>{value}</button>)}</div></div>
      <div className="filter-group"><span>{ru ? 'Тип дуги' : 'Arc type'}</span><div><button className={arcType === 'all' ? 'active' : ''} aria-pressed={arcType === 'all'} onClick={() => setArcType('all')}>{ru ? 'Все' : 'All'}</button>{arcTypes.map((value) => <button key={value} className={arcType === value ? 'active' : ''} aria-pressed={arcType === value} onClick={() => setArcType(value)}>{localizedArcType(value, locale)}</button>)}</div></div>
      <div className="filter-result"><b>{arcs.length}</b><span>{ru ? 'найдено' : 'shown'}</span>{(rarity !== 'all' || arcType !== 'all') ? <button onClick={resetArcFilters}>{ru ? 'Сбросить фильтры' : 'Reset filters'}</button> : null}</div>
    </div> : null}

    {tab === 'characters' ? <>
      {characters.length > 0 ? <section className="character-directory-grid" aria-live="polite">{characters.map((character) => {
        const displayName = localizedCharacterName(character.name, locale);
        const nameEvidence = characterNameEvidence[character.name];
        const typeEvidence = character.arcType ? arcTypeEvidence[character.arcType] : undefined;
        return <article className={`character-directory-card rarity-${character.rarity.toLowerCase()} ${character.releaseStatus}`} key={character.id}>
          <div className="character-card-top">
            <ResilientImage src={character.image} alt={displayName} wrapperClassName="character-card-image" loading="lazy" />
            <div className="character-card-heading"><div className="character-badges"><span className="character-rarity">{character.rarity}</span><span className={`release-badge ${character.releaseStatus}`}>{character.releaseStatus === 'released' ? (ru ? 'Доступен' : 'Released') : `${ru ? 'Версия' : 'Version'} ${character.releaseVersion ?? '?'}`}</span></div><h2>{displayName}</h2>{ru ? <small>{character.name}</small> : null}</div>
          </div>
          <dl className="character-facts">
            <div><dt>{ru ? 'Атрибут' : 'Attribute'}</dt><dd>{localizedAttribute(character.attribute, locale)}</dd></div>
            <div><dt>{ru ? 'Роль' : 'Role'}</dt><dd>{character.role ? localizedRole(character.role, locale) : (ru ? 'Ещё не объявлена' : 'Not announced')}</dd></div>
            <div><dt>{ru ? 'Тип дуги' : 'Arc type'}</dt><dd>{character.arcType ? localizedArcType(character.arcType, locale) : (ru ? 'Ещё не объявлен' : 'Not announced')}</dd></div>
          </dl>
          <p className="character-summary">{character.summary[locale]}</p>
          {ru && nameEvidence ? <LocalizationEvidenceNote evidence={nameEvidence} subject="Имя" /> : null}
          {ru && typeEvidence ? <LocalizationEvidenceNote evidence={typeEvidence} subject="Тип дуги" /> : null}
          <CharacterAwakeningReference characterName={character.name} locale={locale} />
          <div className="character-card-actions">
            {character.arcType ? <button className="button ghost compact-button" type="button" onClick={() => showCompatibleArcs(character.arcType!)}>{ru ? 'Показать совместимые дуги' : 'Show compatible Arcs'}</button> : <span className="character-unknown-note">{ru ? 'Совместимые дуги появятся после объявления типа.' : 'Compatible Arcs will appear after the type is announced.'}</span>}
            <a href={character.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Источник характеристик' : 'Profile source'} <ExternalLink size={14} /></a>
          </div>
          <small className="character-source-meta">{character.sourcePublisher} · {ru ? 'проверено' : 'verified'} {character.verifiedAt}</small>
        </article>;
      })}</section> : <Panel className="empty-database"><Search size={24} /><h2>{ru ? 'Персонажи не найдены' : 'No characters found'}</h2><p>{ru ? 'Измени запрос или сбрось фильтры.' : 'Change the query or reset the filters.'}</p><button className="button ghost" onClick={() => { setQuery(''); resetCharacterFilters(); }}>{ru ? 'Очистить поиск и фильтры' : 'Reset'}</button></Panel>}
    </> : null}

    {tab === 'arcs' ? <>
      {arcs.length > 0 ? <section className="arc-directory-grid" aria-live="polite">{arcs.map((arc) => {
        const source = sourceMap.get(arc.sourceId);
        const displayName = localizedArcName(arc.name, locale);
        const nameEvidence = arcNameEvidence[arc.name];
        const typeEvidence = arcTypeEvidence[arc.type];
        return <details className={`arc-directory-card rarity-${arc.rarity.toLowerCase()}`} key={arc.id}>
          <summary>
            <div className="arc-directory-art"><span>{displayName.slice(0, 2).toUpperCase()}</span><img src={arc.image} alt="" loading="lazy" /></div>
            <div className="arc-directory-title"><span className="arc-rarity">{arc.rarity}</span><h2>{displayName}</h2>{ru ? <small className="original-name">{arc.name}</small> : null}<p>{localizedArcType(arc.type, locale)}</p></div>
            <div className="arc-directory-stats"><span><small>ATK</small><b>{arc.baseAtk}</b></span><span><small>{localizedStatLabel(arc.secondaryLabel, locale)}</small><b>{arc.secondaryValue}%</b></span></div>
            <ChevronDown className="arc-directory-chevron" size={20} />
          </summary>
          <div className="arc-directory-details"><div className="arc-effect-title"><BookOpenText size={17} /><b>{ru ? 'Эффект от M1 до M5' : 'M1 → M5 effect'}</b></div><p>{arc.effect[locale]}</p>
            {ru && nameEvidence ? <LocalizationEvidenceNote evidence={nameEvidence} subject="Название" /> : null}
            {ru ? <LocalizationEvidenceNote evidence={typeEvidence} subject="Тип дуги" /> : null}
            <div className="arc-source-line"><span><CheckCircle2 size={14} /> {source?.publisher ?? arc.sourceId}</span><small>{ru ? 'Данные дуги проверены' : 'Arc data verified'}: {source?.verifiedAt ?? arc.verifiedAt}</small>{source?.url ? <a href={source.url} target="_blank" rel="noreferrer">{ru ? 'Открыть источник характеристик' : 'Data source'}</a> : null}</div></div>
        </details>;
      })}</section> : <Panel className="empty-database"><Search size={24} /><h2>{ru ? 'Ничего не найдено' : 'No Arcs found'}</h2><p>{ru ? 'Измени запрос или сбрось фильтры.' : 'Change the query or reset the filters.'}</p><button className="button ghost" onClick={() => { setQuery(''); resetArcFilters(); }}>{ru ? 'Очистить поиск и фильтры' : 'Reset'}</button></Panel>}
    </> : null}
  </div>;
}