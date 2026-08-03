import { ArrowRight, BarChart3, Boxes, Languages, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { RouteKey } from '../types';
import { useI18n } from '../i18n';

export function HomePage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const tools = [
    { route: 'team' as const, icon: Users, title: 'TEAM CALCULATION', text: ru ? 'Собери ротацию из четырёх персонажей, учти баффы, защиту и сопротивление цели.' : 'Model a four-character rotation with buffs, defence and target resistance.' },
    { route: 'arcs' as const, icon: BarChart3, title: 'ARCS CALCULATION', text: ru ? 'Сравни дуги по раздельным исходным бенчмаркам и по своей конфигурации статов.' : 'Compare Arcs using separate sourced benchmarks and your own stat model.' },
    { route: 'progression' as const, icon: Boxes, title: ru ? 'ПРОКАЧКА' : 'PROGRESSION', text: ru ? 'Посчитай оставшиеся материалы с учётом уже накопленного инвентаря.' : 'Calculate remaining materials using your current inventory.' },
  ];
  return <div className="page home-page">
    <section className="hero">
      <div className="hero-copy">
        <div className="brand-line"><span>NTE</span> Calculation by bonaqu</div>
        <h1>{ru ? 'Теорикрафтинг без магии в таблицах.' : 'Theorycrafting without spreadsheet sorcery.'}</h1>
        <p>{ru ? 'Быстрые калькуляторы для Neverness to Everness с прозрачными формулами, версиями данных и понятными допущениями.' : 'Fast Neverness to Everness calculators with transparent formulas, versioned data and explicit assumptions.'}</p>
        <div className="hero-actions">
          <button className="button primary" onClick={() => navigate('arcs')}>{ru ? 'Сравнить дуги Ирой' : 'Compare Iroi Arcs'} <ArrowRight size={18} /></button>
          <button className="button ghost" onClick={() => navigate('methodology')}>{ru ? 'Как считаем' : 'How calculations work'}</button>
        </div>
        <div className="trust-row">
          <span><ShieldCheck size={17} /> {ru ? 'Источники у каждого сценария' : 'Source metadata per scenario'}</span>
          <span><Languages size={17} /> RU / EN</span>
          <span><Sparkles size={17} /> {ru ? 'Сохраняет настройки локально' : 'Local state persistence'}</span>
        </div>
      </div>
      <div className="hero-art" aria-label="Iroi artwork">
        <div className="orb orb-a" /><div className="orb orb-b" />
        <img src="https://cdn.prydwen.gg/images/nte/characters/iroi_full.webp" alt="Iroi" />
        <div className="hero-data-card">
          <small>{ru ? 'Ирой · два исходных сценария' : 'Iroi · two sourced scenarios'}</small>
          <strong>The Wrong Gate</strong>
          <div><span>Prydwen M1</span><b>100.00%</b></div>
          <div><span>Rivyn M5</span><b>107.77%</b></div>
        </div>
      </div>
    </section>
    <section className="tool-rail">
      {tools.map(({ route, icon: Icon, title, text }) => <button key={route} className="tool-card" onClick={() => navigate(route)}>
        <Icon size={24} /><div><h2>{title}</h2><p>{text}</p></div><ArrowRight size={20} />
      </button>)}
    </section>
  </div>;
}
