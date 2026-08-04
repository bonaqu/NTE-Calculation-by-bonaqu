import { useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { characterTermKindLabel, characterTerms, normalizeCharacterTermSearch } from '../character-terms';
import { localizedCharacterName } from '../gameTerms';
import { useI18n } from '../i18n';
import {
  allLocalizationEvidence,
  localizationEvidenceKindLabel,
  localizationEvidenceKinds,
  localizationEvidenceLabel,
  type LocalizationEvidenceKind,
} from '../localization-evidence';

type GlossaryCategory = LocalizationEvidenceKind | 'character-specific' | 'all';

export function TerminologyEvidenceTable() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<GlossaryCategory>('all');
  const normalizedQuery = normalizeCharacterTermSearch(query);

  const rows = useMemo(() => allLocalizationEvidence.filter((entry) => {
    if (kind === 'character-specific') return false;
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
    ].join(' ');
    return normalizeCharacterTermSearch(searchable).includes(normalizedQuery);
  }), [kind, normalizedQuery]);

  const characterRows = useMemo(() => characterTerms.filter((entry) => {
    if (kind !== 'all' && kind !== 'character-specific') return false;
    if (!normalizedQuery) return true;
    return [
      entry.id,
      entry.characterName,
      entry.russian,
      entry.english,
      entry.sourcePublisher,
      entry.note.ru,
      entry.note.en,
      ...(entry.aliases ?? []),
      ...(entry.alternatives?.flatMap((alternative) => [alternative.russian, alternative.english ?? '', alternative.note.ru, alternative.note.en]) ?? []),
    ].some((value) => normalizeCharacterTermSearch(value).includes(normalizedQuery));
  }), [kind, normalizedQuery]);

  const allTermsCount = allLocalizationEvidence.length + characterTerms.length;
  const disputedCount = allLocalizationEvidence.filter((entry) => entry.alternatives?.length).length
    + characterTerms.filter((entry) => entry.alternatives?.length).length;
  const fallbackCount = allLocalizationEvidence.filter((entry) => entry.level === 'project-fallback').length
    + characterTerms.filter((entry) => entry.level === 'project-fallback').length;

  return <section className="terminology-audit" aria-labelledby="terminology-audit-title">
    <header className="terminology-audit-heading">
      <div><span>{ru ? 'ПРОВЕРЯЕМЫЙ СЛОВАРЬ' : 'AUDITABLE GLOSSARY'}</span><h2 id="terminology-audit-title">{ru ? 'Русские и английские игровые термины' : 'Russian and English game terminology'}</h2><p>{ru ? 'Таблица строится из тех же реестров, которые использует интерфейс. Общие термины и индивидуальные названия навыков не дублируются вручную в Методологии.' : 'This table is generated from the same registries used by the interface. Core terminology and character-specific skill labels are not duplicated manually in Methodology.'}</p></div>
      <div className="terminology-audit-facts"><span><b>{allTermsCount}</b>{ru ? 'терминов' : 'terms'}</span><span><b>{disputedCount}</b>{ru ? 'с вариантами' : 'with alternatives'}</span><span><b>{fallbackCount}</b>{ru ? 'не подтверждено' : 'unresolved/fallback'}</span></div>
    </header>

    <div className="terminology-audit-toolbar">
      <label className="terminology-search"><Search size={17} /><span className="sr-only">{ru ? 'Поиск по словарю' : 'Search terminology'}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ru ? 'Навык, персонаж, английский термин, источник…' : 'Skill, character, Russian term, source…'} /></label>
      <label><span>{ru ? 'Раздел' : 'Category'}</span><select value={kind} onChange={(event) => setKind(event.target.value as GlossaryCategory)}><option value="all">{ru ? 'Все разделы' : 'All categories'}</option><option value="character-specific">{ru ? 'Навыки и термины персонажей' : 'Character skills and terms'}</option>{localizationEvidenceKinds.map((value) => <option value={value} key={value}>{localizationEvidenceKindLabel(value, locale)}</option>)}</select></label>
      <strong>{rows.length + characterRows.length} {ru ? 'найдено' : 'shown'}</strong>
    </div>

    <div className="terminology-evidence-list" aria-live="polite">
      {rows.map((entry) => <article className={`terminology-evidence-row evidence-${entry.level}`} key={`${entry.kind}:${entry.canonical}`}>
        <div className="terminology-primary"><b>{entry.russian}</b><span>{entry.english}</span><small>{localizationEvidenceKindLabel(entry.kind, locale)}</small></div>
        <div className="terminology-confidence"><ShieldCheck size={15} /><span><b>{localizationEvidenceLabel(entry.level, locale)}</b><small>{entry.sourcePublisher}</small></span></div>
        <div className="terminology-note"><p>{entry.note[locale]}</p>{entry.alternatives?.length ? <details><summary><AlertTriangle size={14} /> {ru ? 'Другие встречающиеся варианты' : 'Other recorded variants'}</summary>{entry.alternatives.map((alternative) => <div key={`${entry.canonical}:${alternative.russian}`}><b>{alternative.russian}</b><span>{alternative.note[locale]}</span>{alternative.source.url ? <a href={alternative.source.url} target="_blank" rel="noreferrer">{alternative.source.publisher} <ExternalLink size={12} /></a> : <em>{alternative.source.publisher}</em>}</div>)}</details> : null}</div>
        <div className="terminology-source"><small>{ru ? 'Проверено' : 'Verified'}: {entry.verifiedAt}</small>{entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Основной источник' : 'Primary source'} <ExternalLink size={12} /></a> : <em>{ru ? 'Публичный источник не найден' : 'No public source located'}</em>}{entry.supportingSources?.length ? <span>{ru ? 'Доп. источников' : 'Supporting sources'}: {entry.supportingSources.length}</span> : null}</div>
      </article>)}

      {characterRows.map((entry) => <article className={`terminology-evidence-row character-term-row evidence-${entry.level}`} key={entry.id}>
        <div className="terminology-primary"><b>{entry.russian}</b><span>{entry.english}</span><small>{localizedCharacterName(entry.characterName, locale)} · {characterTermKindLabel(entry.kind, locale)}</small></div>
        <div className="terminology-confidence"><ShieldCheck size={15} /><span><b className={`character-term-resolution ${entry.resolution}`}>{entry.resolution === 'exact' ? (ru ? 'Сопоставлено' : 'Mapped') : entry.resolution === 'conflicted' ? (ru ? 'Есть конфликт' : 'Conflict recorded') : (ru ? 'Не подтверждено' : 'Unresolved')}</b><small>{entry.sourcePublisher}</small></span></div>
        <div className="terminology-note"><p>{entry.note[locale]}</p>{entry.alternatives?.length ? <details open={entry.resolution === 'conflicted'}><summary><AlertTriangle size={14} /> {ru ? 'Зафиксированные варианты' : 'Recorded variants'}</summary>{entry.alternatives.map((alternative) => <div key={`${entry.id}:${alternative.russian}`}><b>{alternative.russian}</b>{alternative.english ? <em>{alternative.english}</em> : null}<span>{alternative.note[locale]}</span></div>)}</details> : null}{entry.aliases?.length ? <small>{ru ? 'Поисковые варианты' : 'Search aliases'}: {entry.aliases.join(' · ')}</small> : null}</div>
        <div className="terminology-source"><small>{ru ? 'Проверено' : 'Verified'}: {entry.verifiedAt}</small>{entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer">{ru ? 'Русская карточка' : 'Russian record'} <ExternalLink size={12} /></a> : <em>{ru ? 'Точная карточка не найдена' : 'Exact record not found'}</em>}{entry.supportingSourceUrl ? <a href={entry.supportingSourceUrl} target="_blank" rel="noreferrer">{ru ? 'Английская карточка' : 'English record'} <ExternalLink size={12} /></a> : null}</div>
      </article>)}

      {!rows.length && !characterRows.length ? <div className="terminology-empty"><Search size={22} /><b>{ru ? 'Ничего не найдено' : 'No terms found'}</b><span>{ru ? 'Измени запрос или выбери другой раздел.' : 'Change the query or choose another category.'}</span></div> : null}
    </div>
  </section>;
}