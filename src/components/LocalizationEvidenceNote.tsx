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

export function LocalizationEvidenceNote({
  evidence,
  subject,
}: {
  evidence: LocalizationEvidence;
  subject?: string;
}) {
  const { locale } = useI18n();
  const Icon = evidenceIcons[evidence.level];
  return <div className={`localization-evidence evidence-${evidence.level}`}>
    <Icon size={15} />
    <span><b>{subject ? `${subject}: ` : ''}{localizationEvidenceLabel(evidence.level, locale)}</b><small>{evidence.note[locale]}</small></span>
    {evidence.sourceUrl ? <a href={evidence.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${evidence.sourcePublisher}: ${evidence.russian}`}>{evidence.sourcePublisher} <ExternalLink size={12} /></a> : <em>{evidence.sourcePublisher}</em>}
  </div>;
}

export function LocalizationEvidenceLegend() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const descriptions: Record<LocalizationEvidenceLevel, string> = {
    'official-russian': ru ? 'Название найдено на официальном русском ресурсе NTE.' : 'The term appears on an official Russian NTE resource.',
    'owner-confirmed-client': ru ? 'Написание проверено владельцем проекта непосредственно в текущем клиенте.' : 'The spelling was checked by the project owner directly in the current client.',
    'current-russian-reference': ru ? 'Название сверено с актуальным русскоязычным справочником, но не объявляется официальным.' : 'The term is checked against a current Russian reference but is not labelled official.',
    'project-fallback': ru ? 'Официальное написание пока не найдено; используется явно обозначенный рабочий вариант.' : 'No official spelling was found yet; an explicitly marked fallback is used.',
  };

  return <details className="localization-evidence-legend">
    <summary>{ru ? 'Как сайт подтверждает русские названия' : 'How Russian names are verified'}</summary>
    <p>{ru ? 'Английское имя остаётся постоянным идентификатором. Русское отображение может меняться, когда появляется источник более высокого уровня.' : 'The English name remains the stable identifier. Russian display text may change when stronger evidence appears.'}</p>
    <div>{localizationEvidenceLevels.map((level) => {
      const Icon = evidenceIcons[level];
      return <span className={`evidence-${level}`} key={level}><Icon size={15} /><b>{localizationEvidenceLabel(level, locale)}</b><small>{descriptions[level]}</small></span>;
    })}</div>
  </details>;
}
