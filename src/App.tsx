import { useEffect, useRef, useState } from 'react';
import { BarChart3, BookOpen, Boxes, ChevronDown, Database, GitBranch, Home, Languages, Menu, Route, Users, X } from 'lucide-react';
import { useI18n } from './i18n';
import type { RouteKey } from './types';
import { HomePage } from './pages/HomePage';
import { GameVisibleTeamCalculatorPage } from './pages/GameVisibleTeamCalculatorPage';
import { RotationLabPage } from './pages/RotationLabPage';
import { ArcExperiencePage } from './pages/ArcExperiencePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { DatabasePage } from './pages/DatabasePage';
import { MethodologyPage } from './pages/MethodologyPage';

const routes: RouteKey[] = ['home', 'team', 'rotations', 'arcs', 'progression', 'database', 'methodology'];
const routeFromHash = (): RouteKey => {
  const value = location.hash.replace('#/', '') as RouteKey;
  return routes.includes(value) ? value : 'home';
};

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const [route, setRoute] = useState<RouteKey>(routeFromHash);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setRoute(routeFromHash());
    addEventListener('hashchange', handler);
    return () => removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => {
    const pointerHandler = (event: MouseEvent) => { if (!langRef.current?.contains(event.target as Node)) setLangOpen(false); };
    const keyHandler = (event: KeyboardEvent) => { if (event.key === 'Escape') { setLangOpen(false); setMobileOpen(false); } };
    addEventListener('mousedown', pointerHandler);
    addEventListener('keydown', keyHandler);
    return () => { removeEventListener('mousedown', pointerHandler); removeEventListener('keydown', keyHandler); };
  }, []);
  useEffect(() => { document.title = `${t.nav[route]} · NTE Calculation by bonaqu`; }, [route, t]);

  const navigate = (next: RouteKey) => {
    location.hash = `#/${next}`;
    setRoute(next);
    setMobileOpen(false);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };
  const nav = [
    ['home', Home], ['team', Users], ['rotations', Route], ['arcs', BarChart3], ['progression', Boxes], ['database', Database], ['methodology', BookOpen],
  ] as const;
  const page = route === 'home' ? <HomePage navigate={navigate} />
    : route === 'team' ? <GameVisibleTeamCalculatorPage />
      : route === 'rotations' ? <RotationLabPage />
        : route === 'arcs' ? <ArcExperiencePage />
          : route === 'progression' ? <ProgressionPage />
            : route === 'database' ? <DatabasePage />
              : <MethodologyPage />;

  return <div className="app-shell">
    <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen((value) => !value)} aria-label={locale === 'ru' ? 'Открыть меню' : 'Open menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button><button className="logo" onClick={() => navigate('home')} aria-label="NTE Calculation by bonaqu"><span>N</span><div><b>NTE Calculation</b><small>by bonaqu</small></div></button>
      <nav className={mobileOpen ? 'open' : ''} aria-label={locale === 'ru' ? 'Основная навигация' : 'Primary navigation'}>{nav.map(([key, Icon]) => <button key={key} className={route === key ? 'active' : ''} aria-current={route === key ? 'page' : undefined} onClick={() => navigate(key)}><Icon size={17} />{t.nav[key]}</button>)}</nav>
      <div className="header-actions"><a className="icon-button" href="https://github.com/bonaqu/NTE-Calculation-by-bonaqu" target="_blank" rel="noreferrer" aria-label="GitHub"><GitBranch size={20} /></a><div className="language" ref={langRef}><button className="language-button" onClick={() => setLangOpen((value) => !value)} aria-haspopup="menu" aria-expanded={langOpen}><Languages size={18} /><span>{locale === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}</span><ChevronDown size={15} /></button>{langOpen ? <div className="language-menu" role="menu"><button role="menuitem" onClick={() => { setLocale('ru'); setLangOpen(false); }}>🇷🇺 <span>Русский</span><small>RU</small></button><button role="menuitem" onClick={() => { setLocale('en'); setLangOpen(false); }}>🇬🇧 <span>English</span><small>EN</small></button></div> : null}</div></div>
    </header>
    <main>{page}</main>
    <footer><span>NTE Calculation by bonaqu</span><span>{locale === 'ru' ? 'Фанатский проект с открытым исходным кодом · Не связан с Hotta Studio' : 'Fan-made open-source project · Not affiliated with Hotta Studio'}</span></footer>
  </div>;
}
