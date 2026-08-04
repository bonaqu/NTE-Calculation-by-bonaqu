import { ExternalLink, Info } from 'lucide-react';
import { arcDirectory } from '../arc-directory';
import { characterArcGuideByName, characterArcGuides, guideMeasurementKind } from '../arc-recommendations';
import { canonicalCharacterName, characterByName } from '../characters';
import { localizedArcName, localizedArcType, localizedAttribute, localizedCharacterName, localizedRole, localizedStatLabel } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';
import { ResilientImage } from './ResilientImage';

const guideNames = new Set(characterArcGuides.map((guide) => guide.characterName));
const arcByName = new Map(arcDirectory.map((arc) => [arc.name, arc]));

function normalizeGuideCharacter(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const canonical = canonicalCharacterName(value);
  return canonical && guideNames.has(canonical) ? canonical : null;
}

function displayDate(value: string, locale: 'ru' | 'en'): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function CharacterArcGuide() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [selectedName, setSelectedName] = useLocalStorage<string>('nte.arcs.character.v1', 'Iroi', {
    normalize: normalizeGuideCharacter,
  });
  const guide = characterArcGuideByName.get(selectedName) ?? characterArcGuides[0]!;
  const character = characterByName.get(guide.characterName);
  const measurementKind = guideMeasurementKind(guide);
  const recommendedNames = new Set(guide.recommendations.map((entry) => entry.arcName));
  const compatibleUnranked = arcDirectory.filter((arc) => arc.type === character?.arcType && !recommendedNames.has(arc.name));
  const displayName = localizedCharacterName(guide.characterName, locale);

  const methodText = measurementKind === 'quantitative'
    ? (ru
      ? 'Источник опубликовал относительные результаты одного сравнения. 100% — базовая точка именно этого гайда, а не универсальная сила дуги.'
      : 'The source published relative results for one comparison. 100% is that guide’s baseline, not a universal Arc power score.')
    : measurementKind === 'qualitative'
      ? (ru
        ? 'Источник опубликовал рекомендуемый порядок и комментарии, но не дал сопоставимых процентов. Сайт не дорисовывает их самостоятельно.'
        : 'The source published recommendation order and commentary without comparable percentages. The site does not invent them.')
      : (ru
        ? 'Основной список содержит относительные результаты, а специализированный вариант вынесен отдельно без несопоставимого процента.'
        : 'The main list contains relative results, while the specialist option is separated without an incomparable percentage.');

  return <section className="character-arc-guide" aria-labelledby="character-arc-guide-title">
    <header className="arc-guide-heading">
      <div><span>{ru ? 'ДУГИ ДЛЯ ПЕРСОНАЖА' : 'CHARACTER ARC GUIDE'}</span><h2 id="character-arc-guide-title">{ru ? 'Рекомендации для всего выпущенного ростера' : 'Recommendations for every released character'}</h2><p>{ru ? 'Выбери персонажа: сайт покажет совместимые дуги, порядок из актуального гайда, нужный уровень M и честно отметит, где у источника нет процентов.' : 'Choose a character to see compatible Arcs, the current guide order, required Mixing level and an explicit note when the source has no percentages.'}</p></div>
      <label className="arc-character-select"><span>{ru ? 'Персонаж' : 'Character'}</span><select value={guide.characterName} onChange={(event) => setSelectedName(event.target.value)}>{characterArcGuides.map((entry) => <option key={entry.characterName} value={entry.characterName}>{localizedCharacterName(entry.characterName, locale)}</option>)}</select></label>
    </header>

    <div className="arc-guide-identity">
      <ResilientImage src={character?.image} alt={displayName} wrapperClassName="arc-guide-character-art" loading="lazy" />
      <div className="arc-guide-character-copy"><h3>{displayName}</h3>{ru ? <small>{guide.characterName}</small> : null}<p>{character?.rarity ?? '?'} · {localizedAttribute(character?.attribute, locale)} · {localizedRole(character?.role, locale)} · {localizedArcType(character?.arcType ?? '', locale)}</p></div>
      <div className="arc-guide-source"><span>{guide.sourcePublisher}</span><small>{ru ? 'Гайд обновлён' : 'Guide updated'}: {displayDate(guide.sourceUpdatedAt, locale)}</small><small>{ru ? 'Проверено для сайта' : 'Verified for site'}: {displayDate(guide.verifiedAt, locale)}</small><a href={guide.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Открыть гайд' : 'Open guide'} <ExternalLink size={14} /></a></div>
    </div>

    <div className={`arc-guide-method method-${measurementKind}`}><Info size={18} /><span><b>{measurementKind === 'quantitative' ? (ru ? 'Расчёт источника' : 'Source calculation') : measurementKind === 'qualitative' ? (ru ? 'Порядок без процентов' : 'Order without percentages') : (ru ? 'Смешанный формат' : 'Mixed format')}</b>{methodText}</span></div>

    <div className="arc-guide-table" role="table" aria-label={ru ? `Рекомендованные дуги для ${displayName}` : `Recommended Arcs for ${displayName}`}>
      <div className="arc-guide-table-head" role="row"><span>#</span><span>{ru ? 'Дуга и характеристики' : 'Arc and stats'}</span><span>{ru ? 'Данные источника' : 'Source data'}</span><span>{ru ? 'Почему в списке' : 'Why it is listed'}</span></div>
      {guide.recommendations.map((recommendation, index) => {
        const arc = arcByName.get(recommendation.arcName);
        if (!arc) return null;
        const specialist = recommendation.category === 'specialist';
        return <article className={`arc-guide-row ${specialist ? 'is-specialist' : ''}`} role="row" key={`${recommendation.arcName}-m${recommendation.mixing}`}>
          <span className="arc-guide-rank">{specialist ? '↳' : index + 1}</span>
          <span className="arc-guide-arc"><ResilientImage src={arc.image} alt={localizedArcName(arc.name, locale)} wrapperClassName="arc-guide-arc-art" loading="lazy" /><span><b>{localizedArcName(arc.name, locale)} <em>M{recommendation.mixing}</em></b>{ru ? <small>{arc.name}</small> : null}<small>{arc.rarity} · {localizedArcType(arc.type, locale)} · {localizedStatLabel(arc.secondaryLabel, locale)} {arc.secondaryValue}%</small></span></span>
          <span className="arc-guide-score">{recommendation.relativePercent !== undefined ? <><b>{recommendation.relativePercent.toFixed(2)}%</b><small>{ru ? 'относительный результат' : 'relative result'}</small></> : specialist ? <><b>{ru ? 'Отдельная роль' : 'Specialist'}</b><small>{ru ? 'без общего процента' : 'no shared percentage'}</small></> : <><b>{ru ? `Место ${index + 1}` : `Rank ${index + 1}`}</b><small>{ru ? 'процент не опубликован' : 'percentage not published'}</small></>}</span>
          <span className="arc-guide-note"><p>{recommendation.note[locale]}</p><small>{arc.effect[locale]}</small></span>
        </article>;
      })}
    </div>

    <details className="compatible-arcs"><summary>{ru ? `Другие совместимые дуги без позиции в этом гайде (${compatibleUnranked.length})` : `Other compatible Arcs not ranked by this guide (${compatibleUnranked.length})`}</summary><p>{ru ? 'Совместимость по типу не означает, что источник рекомендует дугу этому персонажу.' : 'Type compatibility does not mean the source recommends the Arc for this character.'}</p><ul>{compatibleUnranked.map((arc) => <li key={arc.id}><span>{localizedArcName(arc.name, locale)}{ru ? <small>{arc.name}</small> : null}</span><b>{arc.rarity} · {localizedStatLabel(arc.secondaryLabel, locale)} {arc.secondaryValue}%</b></li>)}</ul></details>
  </section>;
}
