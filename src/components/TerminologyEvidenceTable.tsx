import { useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  allLocalizationEvidence,
  localizationEvidenceKindLabel,
  localizationEvidenceKinds,
  localizationEvidenceLabel,
  type LocalizationEvidenceKind,
} from '../localization-evidence';

export function TerminologyEvidenceTable() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<LocalizationEvidenceKind | 'all'>('all');
  const normalizedQuery = query.trim().toLocaleLowerCase(locale).replaceAll('ё', 'е');

  const rows = useMemo(() => allLocalizationEvidence.filter((entry) => {
    if (kind !== 'all' && entry.kind !== kind) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      entry.russian,
      entry.english,
      entry.canonical,
      entry.sourcePublisher,
      entry.note.ru,
      entry.note.en,
      ...(entry.alternatives?.flatMap((alternative) => [alternative.russian, alternative.note.ru, alternative.note.en]) ?? []),
    ].join(' ').toLocaleLowerCase(locale).replaceAll('ё', 'е');
    return searchable.includes(normalizedQuery);
  }), [kind, locale, normalizedQuery]);

  const disputedCount = allLocalizationEvidence.filter((entry) => entry.alternatives?.length).length;
  const fallbackCount = allLocalizationEvidence.filter((entry) => entry.level === 'project-fallback').length;

  return <section className="terminology-audit" aria-labelledby="terminology-audit-title">
    <header className="terminology-audit-heading">
      <div><span>{ru ? 'ПРОВЕРЯЕМЫЙ СЛОВАРЬ' : 'AUDITABLE GLOSSARY'}</span><h2 id="terminology-audit-title">{ru ? 'Русские и английские игровые термины' : 'Russian and English game terminology'}</h2><p>{ru ? 'Таблица строится из тех же словарей, которые использует интерфейс. Поэтому методология больше не может незаметно расходиться с калькулятором, базой или планировщиком.' : 'This table is generated from the same dictionaries used by the interface, so Methodology cannot silently drift away from the calculator, database or planner.'}</p></div>
      <div className="terminology-audit-facts"><span><b>{allLocalizationEvidence.length}</b>{ru ? 'терминов' : 'terms'}</span><span><b>{disputedCount}</b>{ru ? 'с вариантами' : 'with alternatives'}</span><span><b>{fallbackCount}</b>{ru ? 'рабочих переводов' : 'fallbacks'}</span></div>
    </header>

    <div className="terminology-audit-toolbar">
      <label className="terminology-search"><Search size={17} /><span className="sr-only">{ru ? 'Поиск по словарю' : 'Search terminology'}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ru ? 'Название, английский термин, источник…' : 'Russian name, English term, source…'} /></label>
      <label><span>{ru ? 'Раздел' : 'Category'}</span><select value={kind} onChange={(event) => setKind(event.target.value as LocalizationEvidenceKind | 'all')}><option value="all">{ru ? 'Все разделы' : 'All categories'}</option>{localizationEvidenceKinds.map((value) => <option value={value} key={value}>{localizationEvidenceKindLabel(value, locale)}</option>)}</select></label>
      <strong>{rows.length} {ru ? 'найдено' : 'shown'}</strong>
    </div>

    <div className="terminology-evidence-list" aria-live="polite">
      {rows.map((entry) => <article className={`terminology-evidence-row evidence-${entry.level}`} key={`${entry.kind}:${entry.canonical}`}>
        <div className="terminology-primary"><b>{entry.russian}</b><span>{entry.english}</span><small>{localizationEvidenceKindLabel(entry.kind, locale)}</small></div>
        <div className="terminology-confidence"><ShieldCheck size={15} /><span><b>{localizationEvidenceLabel(entry.level, locale)}</b><small>{entry.sourcePublisher}</small></span></div>
        <div className="terminology-note"><p>{entry.note[locale]}</p>{entry.alternatives?.length ? <details><summary><AlertTriangle size={14} /> {ru ? 'Другие встречающиеся варианты' : 'Other recorded variants'}</summary>{entry.alternatives.map((alternative) => <div key={`${entry.canonical}:${alternative.russian}`}><b>{alternative.russian}</b><span>{alternative.note[locale]}</span>{alternative.source.url ? <a href={alternative.source.url} target="_blank" rel="noreferrer">{alternative.source.publisher} <ExternalLink size={12} /></a> : <em>{alternative.source.publisher}</em>}</div>)}</details> : null}</div>
        <div className="terminology-source"><small>{ru ? 'Проверено' : 'Verified'}: {entry.verifiedAt}</small>{entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Основной источник' : 'Primary source'} <ExternalLink size={12} /></a> : <em>{ru ? 'Публичный источник не найден' : 'No public source located'}</em>}{entry.supportingSources?.length ? <span>{ru ? 'Доп. источников' : 'Supporting sources'}: {entry.supportingSources.length}</span> : null}</div>
      </article>)}
      {!rows.length ? <div className="terminology-empty"><Search size={22} /><b>{ru ? 'Ничего не найдено' : 'No terms found'}</b><span>{ru ? 'Измени запрос или выбери другой раздел.' : 'Change the query or choose another category.'}</span></div> : null}
    </div>
  </section>;
}
