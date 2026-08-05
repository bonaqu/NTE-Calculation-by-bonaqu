import { ArrowRight, BarChart3, Boxes, Database, Languages, Route, ShieldCheck, Users } from 'lucide-react';
import { homeProductStats } from '../home-product-stats';
import { useI18n } from '../i18n';
import type { RouteKey } from '../types';

interface HomePageProps {
  navigate: (route: RouteKey) => void;
  preload: (route: RouteKey) => void;
}

export function HomePage({ navigate, preload }: HomePageProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const intent = (route: RouteKey) => ({
    onPointerEnter: () => preload(route),
    onFocus: () => preload(route),
  });
  const tools = [
    {
      route: 'team' as const,
      icon: Users,
      title: ru ? 'Рассчитать команду' : 'Calculate a team',
      text: ru ? 'Задай одну основную атаку или серию для каждого персонажа и посмотри вклад в общую ротацию.' : 'Describe one main attack or sequence for each character and inspect their rotation contribution.',
    },
    {
      route: 'rotations' as const,
      icon: Route,
      title: ru ? 'Разобрать ротацию' : 'Read a rotation',
      text: ru ? 'Открой полный план либо тренируй подтверждённую последовательность по одному шагу.' : 'Open the full plan or practice a sourced sequence one step at a time.',
    },
    {
      route: 'arcs' as const,
      icon: BarChart3,
      title: ru ? 'Подобрать дуги' : 'Choose Arcs',
      text: ru ? 'Смотри рекомендации для всех выпущенных персонажей и отдельные расчёты Ирой.' : 'Review recommendations for every released character and separate Iroi calculations.',
    },
    {
      route: 'progression' as const,
      icon: Boxes,
      title: ru ? 'Спланировать прокачку' : 'Plan progression',
      text: ru ? 'Узнай ближайшие блокеры общего инвентаря и полный остаток материалов до ур. 80.' : 'Find immediate shared-inventory blockers and the complete remainder to level 80.',
    },
  ];
  const facts = [
    { value: homeProductStats.arcGuideCharacters, label: ru ? 'персонажей с гайдами по дугам' : 'characters with Arc guides' },
    { value: homeProductStats.sourcedArcs, label: ru ? 'дуг в проверяемом каталоге' : 'Arcs in the validated catalog' },
    { value: homeProductStats.iroiBenchmarkScenarios, label: ru ? 'отдельных сценария сравнения Ирой' : 'separate Iroi benchmark scenarios' },
  ];

  return <div className="page home-page product-home">
    <section className="home-intro">
      <div className="home-intro-copy">
        <div className="home-kicker"><span>NTE</span><b>Calculation by bonaqu</b></div>
        <h1>{ru ? 'Инструменты NTE, которые объясняют результат.' : 'NTE tools that explain the result.'}</h1>
        <p>{ru ? 'Рекомендации источника, пользовательские расчёты и ограничения модели больше не смешиваются. Выбирай задачу — нужные данные и пояснения будут рядом.' : 'Sourced recommendations, custom calculations and model limits stay separate. Choose a task and keep the relevant data plus explanation together.'}</p>
        <div className="home-actions">
          <button className="button primary" {...intent('arcs')} onClick={() => navigate('arcs')}>{ru ? 'Подобрать дугу' : 'Choose an Arc'} <ArrowRight size={18} /></button>
          <button className="button ghost" {...intent('methodology')} onClick={() => navigate('methodology')}>{ru ? 'Проверить методику' : 'Review methodology'}</button>
        </div>
        <div className="home-trust"><span><ShieldCheck size={16} /> {ru ? 'Источники и даты рядом с данными' : 'Sources and dates beside the data'}</span><span><Languages size={16} /> RU / EN</span><span><Database size={16} /> {ru ? 'Состояние хранится локально' : 'State is stored locally'}</span></div>
        <dl className="home-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>)}</dl>
      </div>

      <figure className="home-character">
        <img src="https://cdn.prydwen.gg/images/nte/characters/iroi_full.webp" alt={ru ? 'Ирой' : 'Iroi'} />
        <figcaption><span>{ru ? 'Ирой' : 'Iroi'}</span><p>{ru ? 'Её отдельные сравнения остаются в разделе дуг и не выдаются за универсальный рейтинг для остальных персонажей.' : 'Her separate comparisons remain in the Arc section and are not presented as a universal ranking for other characters.'}</p></figcaption>
      </figure>
    </section>

    <section className="home-tool-index" aria-labelledby="home-tools-title">
      <header><span>{ru ? 'С чего начать' : 'Start here'}</span><h2 id="home-tools-title">{ru ? 'Выбери задачу, а не раздел меню' : 'Choose a task, not a dashboard tile'}</h2><p>{ru ? 'Каждый инструмент отвечает на отдельный вопрос и явно показывает границы своих данных.' : 'Each tool answers one distinct question and states the boundary of its data.'}</p></header>
      <div>{tools.map(({ route, icon: Icon, title, text }, index) => <button key={route} className="home-tool-row" {...intent(route)} onClick={() => navigate(route)}><span className="home-tool-number">{String(index + 1).padStart(2, '0')}</span><Icon size={22} /><span className="home-tool-copy"><b>{title}</b><small>{text}</small></span><ArrowRight size={19} /></button>)}</div>
    </section>
  </div>;
}