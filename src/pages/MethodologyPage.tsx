import { ExternalLink, FlaskConical, GitCompareArrows, ShieldAlert } from 'lucide-react';
import { arcBenchmarkScenarios, sources } from '../data';
import { useI18n } from '../i18n';
import { Panel } from '../components/UI';

export function MethodologyPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';

  return <div className="page calc-page">
    <header className="page-heading"><div><span>METHODOLOGY</span><h1>{ru ? 'Формулы, допущения и источники' : 'Formulas, assumptions and sources'}</h1><p>{ru ? 'Публичный калькулятор должен объяснять цифры, а не просить поверить красивой таблице.' : 'A public calculator should explain its numbers instead of asking users to trust a polished table.'}</p></div></header>
    <div className="method-grid">
      <Panel><div className="panel-title"><FlaskConical size={20} /><div><h2>{ru ? 'Базовая формула урона' : 'Baseline damage formula'}</h2><p>Model v0.1</p></div></div><pre>DMG = Total ATK × Skill Multiplier × DMG Bonus × DEF × RES × Expected CRIT</pre><p>{ru ? 'Total ATK складывает базовую атаку персонажа и дуги, затем применяет ATK% и плоскую ATK. DEF зависит от уровней и снижения защиты. RES использует линейную модель сопротивления из публичного калькулятора NTE.wiki.' : 'Total ATK combines character and Arc base attack, then applies ATK% and flat ATK. DEF uses character/enemy levels and defence reduction. RES follows the linear resistance model documented by NTE.wiki.'}</p></Panel>
      <Panel><div className="panel-title"><ShieldAlert size={20} /><div><h2>{ru ? 'Что пока не симулируется точно' : 'What is not yet simulated exactly'}</h2></div></div><ul><li>{ru ? 'Покадровый таймлайн анимаций, отмен и попаданий.' : 'Frame-level animation, cancel and hit timelines.'}</li><li>{ru ? 'Все Esper Cycle, Break и уникальные пассивы персонажей.' : 'Every Esper Cycle, Break and character-specific passive.'}</li><li>{ru ? 'Скрытая внутренняя модель Rivyn Elowen.' : 'Rivyn Elowen’s private internal model.'}</li></ul></Panel>
    </div>

    <Panel className="benchmark-method-panel"><div className="panel-title"><GitCompareArrows size={20} /><div><h2>{ru ? 'Почему бенчмарки разделены' : 'Why benchmarks are separated'}</h2><p>{ru ? 'Результаты из разных таблиц не смешиваются в один рейтинг.' : 'Results from different tables are not mixed into one ranking.'}</p></div></div><p>{ru ? 'Публичная таблица Prydwen и расширенный скриншот Rivyn используют разные наборы Mixing Level и разную детализацию. Каждый сценарий отображается отдельно со своим источником, условиями и датой проверки.' : 'The public Prydwen table and the extended Rivyn screenshot use different Mixing Level sets and expose different detail. Each scenario is displayed separately with its own source, conditions and verification date.'}</p><div className="benchmark-method-list">{arcBenchmarkScenarios.map((scenario) => <div key={scenario.id}><b>{scenario.title[locale]}</b><span>{sources.find((source) => source.id === scenario.sourceId)?.publisher} · {scenario.verifiedAt}</span><p>{scenario.description[locale]}</p></div>)}</div></Panel>

    <h2 className="section-title">{ru ? 'Реестр источников' : 'Source registry'}</h2><div className="source-list">{sources.map((source) => <Panel key={source.id}><div><b>{source.title}</b><span>{source.publisher}</span></div><p>{source.scope[locale]}</p><small>{ru ? 'Проверено' : 'Verified'}: {source.verifiedAt}</small>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{ru ? 'Открыть' : 'Open'} <ExternalLink size={15} /></a> : <span className="muted">{ru ? 'Локальный пользовательский источник' : 'Local user-provided source'}</span>}</Panel>)}</div>
  </div>;
}
