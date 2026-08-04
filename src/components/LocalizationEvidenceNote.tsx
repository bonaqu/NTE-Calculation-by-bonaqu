import { BadgeCheck, CircleAlert, ExternalLink, SearchCheck, ShieldCheck } from 'lucide-react';
import {
  localizationEvidenceLabel,
  localizationEvidenceLevels,
  type LocalizationEvidence,
  type LocalizationEvidenceLevel,
} from '../localization-evidence';
import { useI18n } from '../i18n';

const evidenceIcons = {
  'official-russian': ShieldCheck,
  'owner-confirmed-client': BadgeCheck,
  'current-russian-reference': SearchCheck,
  'project-fallback': CircleAlert,
} as const;

function EvidenceSource({ publisher, url }: { publisher: string; url?: string }) {
  return url
    ? <a href={url} target="_blank" rel="noreferrer">{publisher} <ExternalLink size={12} /></a>
    : <em>{publisher}</em>;
}

export function LocalizationEvidenceNote({
  evidence,
  subject,
}: {
  evidence: LocalizationEvidence;
  subject?: string;
}) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const Icon = evidenceIcons[evidence.level];
  return <div className={`localization-evidence evidence-${evidence.level}`}>
    <Icon size={15} />
    <span><b>{subject ? `${subject}: ` : ''}{localizationEvidenceLabel(evidence.level, locale)}</b><small>{evidence.note[locale]}</small>
      {evidence.supportingSources?.length ? <details><summary>{ru ? `Дополнительные источники · ${evidence.supportingSources.length}` : `Supporting sources · ${evidence.supportingSources.length}`}</summary><div>{evidence.supportingSources.map((source) => <EvidenceSource key={`${source.publisher}-${source.url ?? ''}`} {...source} />)}</div></details> : null}
      {evidence.alternatives?.length ? <details className="localization-conflicts"><summary>{ru ? `Зафиксированные варианты · ${evidence.alternatives.length}` : `Recorded alternatives · ${evidence.alternatives.length}`}</summary><div>{evidence.alternatives.map((alternative) => <span key={`${alternative.russian}-${alternative.source.publisher}`}><b>{alternative.russian}</b><small>{alternative.note[locale]}</small><EvidenceSource {...alternative.source} /></span>)}</div></details> : null}
    </span>
    <EvidenceSource publisher={evidence.sourcePublisher} url={evidence.sourceUrl} />
  </div>;
}

export function LocalizationEvidenceLegend() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const descriptions: Record<LocalizationEvidenceLevel, string> = {
    'official-russian': ru ? 'Название найдено на официальном русском ресурсе NTE.' : 'The term appears on an official Russian NTE resource.',
    'owner-confirmed-client': ru ? 'Написание проверено владельцем проекта непосредственно в текущем клиенте.' : 'The spelling was checked by the project owner directly in the current client.',
    'current-russian-reference': ru ? 'Название сверено с несколькими актуальными русскоязычными источниками, но не объявляется официальным.' : 'The term is checked against current Russian references but is not labelled official.',
    'project-fallback': ru ? 'Официальное написание пока не найдено; используется явно обозначенный рабочий вариант.' : 'No official spelling was found yet; an explicitly marked fallback is used.',
  };

  return <details className="localization-evidence-legend">
    <summary>{ru ? 'Как сайт подтверждает русские названия' : 'How Russian names are verified'}</summary>
    <p>{ru ? 'Английское имя остаётся постоянным идентификатором. Русское отображение меняется только при более сильных доказательствах; конфликтующие варианты сохраняются в карточке, но не становятся основными автоматически.' : 'The English name remains the stable identifier. Russian display text changes only with stronger evidence; conflicting variants remain visible without becoming primary automatically.'}</p>
    <div>{localizationEvidenceLevels.map((level) => {
      const LevelIcon = evidenceIcons[level];
      return <span className={`evidence-${level}`} key={level}><LevelIcon size={15} /><b>{localizationEvidenceLabel(level, locale)}</b><small>{descriptions[level]}</small></span>;
    })}</div>
  </details>;
}
