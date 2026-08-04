import { CharacterArcGuide } from '../components/CharacterArcGuide';
import { useI18n } from '../i18n';
import { ArcCalculatorPage } from './ArcCalculatorPage';

export function ArcExperiencePage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';

  return <div className="arc-experience-page">
    <div className="page calc-page arc-experience-intro">
      <header className="page-heading arc-experience-heading"><div><span>{ru ? 'ДУГИ NTE' : 'NTE ARCS'}</span><h1>{ru ? 'Подбор дуг для всех персонажей' : 'Arc recommendations for every character'}</h1><p>{ru ? 'Сначала выбери персонажа и посмотри актуальные рекомендации источника. Ниже остаются отдельные точные сравнения и пользовательский расчёт Ирой — они не смешиваются с общими советами.' : 'Choose a character first and review current sourced recommendations. Separate Iroi benchmarks and the custom model remain below without being mixed into the general advice.'}</p></div></header>
      <CharacterArcGuide />
    </div>

    <section className="page calc-page iroi-calculation-intro" aria-labelledby="iroi-calculation-title"><div><span>{ru ? 'ОТДЕЛЬНЫЙ ИНСТРУМЕНТ' : 'SEPARATE TOOL'}</span><h2 id="iroi-calculation-title">{ru ? 'Сравнения и пользовательский расчёт Ирой' : 'Iroi benchmarks and custom calculation'}</h2><p>{ru ? 'Следующий блок относится только к Ирой. Готовые таблицы сохраняют условия своих источников, а режим «Мои характеристики» использует прозрачную частичную модель сайта.' : 'The following block applies only to Iroi. Sourced tables retain their original assumptions, while Custom stats uses the site’s transparent partial model.'}</p></div></section>
    <ArcCalculatorPage />
  </div>;
}
