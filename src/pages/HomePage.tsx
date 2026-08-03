import { ArrowRight, BarChart3, Boxes, Languages, Route, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { RouteKey } from '../types';
import { useI18n } from '../i18n';
import { localizedArcName } from '../gameTerms';

export function HomePage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const tools = [
    { route: 'team' as const, icon: Users, title: ru ? 'РАСЧЁТ КОМАНДЫ' : 'TEAM CALCULATION', text: ru ? 'Укажи характеристики четырёх персонажей и сразу увидь вклад каждого в общий урон.' : 'Model a four-character rotation with buffs, defence and target resistance.' },
    { route: 'rotations' as const, icon: Route, title: ru ? 'РОТАЦИИ И РЕАКЦИИ' : 'ROTATION LAB', text: ru ? 'Тренируй подтверждённые ротации и проверяй, какие Esper Cycle доступны выбранной четвёрке.' : 'Practice sourced rotations and derive the Esper Cycles available to any four-character team.' },
    { route: 'arcs' as const, icon: BarChart3, title: ru ? 'СРАВНЕНИЕ ДУГ' : 'ARCS CALCULATION', text: ru ? 'Открой готовые сравнения или введи свои характеристики — результат пересчитается автоматически.' : 'Compare Arcs using separate sourced benchmarks and your own stat model.' },
    { route: 'progression' as const, icon: Boxes, title: ru ? 'ПЛАН ПРОКАЧКИ' : 'PROGRESSION', text: ru ? 'Отметь уже пройденный этап и введи свой инвентарь, чтобы получить точный остаток материалов.' : 'Calculate remaining materials using your current inventory.' },
  ];
  const wrongGate = localizedArcName('The Wrong Gate', locale);

  return <div className="page home-page">
    <section className="hero">
      <div className="hero-copy">
        <div className="brand-line"><span>NTE</span> Calculation by bonaqu</div>
        <h1>{ru ? 'Понятные расчёты NTE без ручных таблиц.' : 'Theorycrafting without spreadsheet sorcery.'}</h1>
        <p>{ru ? 'Выбирай готовый сценарий или вводи свои данные. Формулы, ограничения и источники всегда показаны рядом с результатом.' : 'Fast Neverness to Everness calculators with transparent formulas, versioned data and explicit assumptions.'}</p>
        <div className="hero-actions">
          <button className="button primary" onClick={() => navigate('rotations')}>{ru ? 'Открыть ротации' : 'Open Rotation Lab'} <ArrowRight size={18} /></button>
          <button className="button ghost" onClick={() => navigate('methodology')}>{ru ? 'Как устроены расчёты' : 'How calculations work'}</button>
        </div>
        <div className="trust-row">
          <span><ShieldCheck size={17} /> {ru ? 'Источник указан у каждого результата' : 'Source metadata per scenario'}</span>
          <span><Languages size={17} /> RU / EN</span>
          <span><Sparkles size={17} /> {ru ? 'Настройки сохраняются в браузере' : 'Local state persistence'}</span>
        </div>
      </div>
      <div className="hero-art" aria-label={ru ? 'Иллюстрация Ирой' : 'Iroi artwork'}>
        <div className="orb orb-a" /><div className="orb orb-b" />
        <img src="https://cdn.prydwen.gg/images/nte/characters/iroi_full.webp" alt={ru ? 'Ирой' : 'Iroi'} />
        <div className="hero-data-card">
          <small>{ru ? 'Ирой · два готовых сравнения' : 'Iroi · two sourced scenarios'}</small>
          <strong>{wrongGate}</strong>
          {ru ? <span className="original-name">The Wrong Gate</span> : null}
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
