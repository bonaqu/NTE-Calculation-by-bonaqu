import { useMemo, useState } from 'react';
import { CheckCircle2, Search, ShieldQuestion } from 'lucide-react';
import { arcPresets, characterDirectory } from '../data';
import { useI18n } from '../i18n';
import { Panel } from '../components/UI';

export function DatabasePage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'characters' | 'arcs'>('characters');
  const normalizedQuery = query.trim().toLowerCase();
  const characters = useMemo(() => characterDirectory.filter((row) => `${row.name} ${row.attribute ?? ''} ${row.role ?? ''} ${row.arcType ?? ''}`.toLowerCase().includes(normalizedQuery)), [normalizedQuery]);
  const arcs = useMemo(() => arcPresets.filter((row) => `${row.name} ${row.type} ${row.rarity}`.toLowerCase().includes(normalizedQuery)), [normalizedQuery]);

  return <div className="page calc-page"><header className="page-heading"><div><span>DATABASE</span><h1>{ru ? 'База данных NTE' : 'NTE database'}</h1><p>{ru ? 'Небольшой проверяемый набор для калькуляторов: 22 имени персонажей и бенчмарк дуг Ирой.' : 'A compact verifiable calculator dataset: 22 character names and the Iroi Arc benchmark.'}</p></div></header>
    <div className="database-toolbar"><div className="segmented" role="tablist"><button role="tab" aria-selected={tab === 'characters'} className={tab === 'characters' ? 'active' : ''} onClick={() => setTab('characters')}>{ru ? 'Персонажи' : 'Characters'}</button><button role="tab" aria-selected={tab === 'arcs'} className={tab === 'arcs' ? 'active' : ''} onClick={() => setTab('arcs')}>{ru ? 'Дуги' : 'Arcs'}</button></div><label className="search-field"><Search size={18} /><span className="sr-only">{ru ? 'Поиск' : 'Search'}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ru ? 'Поиск' : 'Search'} /></label></div>
    <Panel className="database-grid">{tab === 'characters' ? characters.map((character) => <article key={character.name}>{character.image ? <img src={character.image} alt={character.name} /> : <div className="avatar-placeholder">{character.name.slice(0, 2)}</div>}<h2>{character.name}</h2><p>{character.detailsVerified ? `${character.attribute} · ${character.role}` : (ru ? 'Расширенные поля ещё не проверены' : 'Detailed fields not yet verified')}</p><span className={character.detailsVerified ? '' : 'pending-data'}>{character.detailsVerified ? character.arcType : <><ShieldQuestion size={13} /> {ru ? 'Только каталог' : 'Catalog only'}</>}</span></article>) : arcs.map((arc) => <article key={arc.id}><img src={arc.image} alt={arc.name} /><h2>{arc.name}</h2><p>{arc.rarity} · {arc.type}</p><span><CheckCircle2 size={13} /> ATK {arc.baseAtk} · M{arc.mixing}</span></article>)}</Panel>
  </div>;
}
