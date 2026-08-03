import { useMemo, useState } from 'react';
import { BookOpenText, CheckCircle2, ChevronDown, Search, ShieldQuestion } from 'lucide-react';
import { type ArcDirectoryRarity, type ArcDirectoryType } from '../arc-directory';
import { arcCatalog } from '../arc-catalog';
import { arcPresetSources } from '../arc-presets';
import { characterDirectory, sources } from '../data';
import { useI18n } from '../i18n';
import { Panel } from '../components/UI';

const rarities: ArcDirectoryRarity[] = ['S', 'A', 'B'];
const arcTypes: ArcDirectoryType[] = ['Solid', 'Gas', 'Liquid', 'Plasma', 'Synthesis'];

export function DatabasePage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'characters' | 'arcs'>('characters');
  const [rarity, setRarity] = useState<ArcDirectoryRarity | 'all'>('all');
  const [arcType, setArcType] = useState<ArcDirectoryType | 'all'>('all');
  const normalizedQuery = query.trim().toLowerCase();
  const sourceMap = useMemo(() => new Map([...sources, ...arcPresetSources].map((source) => [source.id, source])), []);

  const characters = useMemo(() => characterDirectory.filter((row) =>
    `${row.name} ${row.attribute ?? ''} ${row.role ?? ''} ${row.arcType ?? ''}`.toLowerCase().includes(normalizedQuery),
  ), [normalizedQuery]);

  const arcs = useMemo(() => arcCatalog.filter((row) => {
    const matchesQuery = `${row.name} ${row.type} ${row.rarity} ${row.secondaryLabel} ${row.effect[locale]}`.toLowerCase().includes(normalizedQuery);
    return matchesQuery && (rarity === 'all' || row.rarity === rarity) && (arcType === 'all' || row.type === arcType);
  }), [arcType, locale, normalizedQuery, rarity]);

  const resetArcFilters = () => {
    setRarity('all');
    setArcType('all');
  };

  return <div className="page calc-page database-page">
    <header className="page-heading"><div><span>DATABASE</span><h1>{ru ? 'База данных NTE' : 'NTE database'}</h1><p>{ru ? '22 персонажа и полный опубликованный каталог из 47 дуг — с поиском, фильтрами, характеристиками, эффектами и источниками.' : '22 characters and the complete published 47-Arc catalog with search, filters, stats, effects and source metadata.'}</p></div></header>

    <div className="database-toolbar">
      <div className="segmented" role="tablist" aria-label={ru ? 'Раздел базы данных' : 'Database section'}>
        <button role="tab" aria-selected={tab === 'characters'} className={tab === 'characters' ? 'active' : ''} onClick={() => setTab('characters')}>{ru ? `Персонажи · ${characterDirectory.length}` : `Characters · ${characterDirectory.length}`}</button>
        <button role="tab" aria-selected={tab === 'arcs'} className={tab === 'arcs' ? 'active' : ''} onClick={() => setTab('arcs')}>{ru ? `Дуги · ${arcCatalog.length}` : `Arcs · ${arcCatalog.length}`}</button>
      </div>
      <label className="search-field"><Search size={18} /><span className="sr-only">{ru ? 'Поиск' : 'Search'}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === 'arcs' ? (ru ? 'Название, тип, эффект…' : 'Name, type, effect…') : (ru ? 'Имя, роль, атрибут…' : 'Name, role, attribute…')} /></label>
    </div>

    {tab === 'arcs' ? <div className="arc-filter-panel" aria-label={ru ? 'Фильтры дуг' : 'Arc filters'}>
      <div className="filter-group"><span>{ru ? 'Редкость' : 'Rarity'}</span><div><button className={rarity === 'all' ? 'active' : ''} aria-pressed={rarity === 'all'} onClick={() => setRarity('all')}>{ru ? 'Все' : 'All'}</button>{rarities.map((value) => <button key={value} className={rarity === value ? 'active' : ''} aria-pressed={rarity === value} onClick={() => setRarity(value)}>{value}</button>)}</div></div>
      <div className="filter-group"><span>{ru ? 'Тип дуги' : 'Arc type'}</span><div><button className={arcType === 'all' ? 'active' : ''} aria-pressed={arcType === 'all'} onClick={() => setArcType('all')}>{ru ? 'Все' : 'All'}</button>{arcTypes.map((value) => <button key={value} className={arcType === value ? 'active' : ''} aria-pressed={arcType === value} onClick={() => setArcType(value)}>{value}</button>)}</div></div>
      <div className="filter-result"><b>{arcs.length}</b><span>{ru ? 'найдено' : 'shown'}</span>{(rarity !== 'all' || arcType !== 'all') ? <button onClick={resetArcFilters}>{ru ? 'Сбросить фильтры' : 'Reset filters'}</button> : null}</div>
    </div> : null}

    {tab === 'characters' ? <Panel className="database-grid character-database">{characters.map((character) => <article key={character.name}>{character.image ? <img src={character.image} alt={character.name} /> : <div className="avatar-placeholder">{character.name.slice(0, 2)}</div>}<h2>{character.name}</h2><p>{character.detailsVerified ? `${character.attribute} · ${character.role}` : (ru ? 'Расширенные поля ещё не проверены' : 'Detailed fields not yet verified')}</p><span className={character.detailsVerified ? '' : 'pending-data'}>{character.detailsVerified ? character.arcType : <><ShieldQuestion size={13} /> {ru ? 'Только каталог' : 'Catalog only'}</>}</span></article>)}</Panel> : null}

    {tab === 'arcs' ? <>
      {arcs.length > 0 ? <section className="arc-directory-grid" aria-live="polite">{arcs.map((arc) => {
        const source = sourceMap.get(arc.sourceId);
        return <details className={`arc-directory-card rarity-${arc.rarity.toLowerCase()}`} key={arc.id}>
          <summary>
            <div className="arc-directory-art"><span>{arc.name.slice(0, 2).toUpperCase()}</span><img src={arc.image} alt="" loading="lazy" /></div>
            <div className="arc-directory-title"><span className="arc-rarity">{arc.rarity}</span><h2>{arc.name}</h2><p>{arc.type}</p></div>
            <div className="arc-directory-stats"><span><small>ATK</small><b>{arc.baseAtk}</b></span><span><small>{arc.secondaryLabel}</small><b>{arc.secondaryValue}%</b></span></div>
            <ChevronDown className="arc-directory-chevron" size={20} />
          </summary>
          <div className="arc-directory-details"><div className="arc-effect-title"><BookOpenText size={17} /><b>{ru ? 'Эффект M1 → M5' : 'M1 → M5 effect'}</b></div><p>{arc.effect[locale]}</p><div className="arc-source-line"><span><CheckCircle2 size={14} /> {source?.publisher ?? arc.sourceId}</span><small>{ru ? 'Проверено' : 'Verified'}: {source?.verifiedAt ?? arc.verifiedAt}</small>{source?.url ? <a href={source.url} target="_blank" rel="noreferrer">{ru ? 'Источник' : 'Source'}</a> : null}</div></div>
        </details>;
      })}</section> : <Panel className="empty-database"><Search size={24} /><h2>{ru ? 'Дуги не найдены' : 'No Arcs found'}</h2><p>{ru ? 'Измени запрос или сбрось фильтры.' : 'Change the query or reset the filters.'}</p><button className="button ghost" onClick={() => { setQuery(''); resetArcFilters(); }}>{ru ? 'Сбросить' : 'Reset'}</button></Panel>}
    </> : null}
  </div>;
}
