import { Activity, AlertTriangle, CheckCircle2, Clock3, ExternalLink, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import {
  buildDataHealthReport,
  dataHealthDomainLabel,
  dataHealthReasonLabel,
  dataHealthStatusLabel,
  type DataHealthStatus,
} from '../data-health';
import { useI18n } from '../i18n';
import { Panel } from './UI';

const statusIcon: Record<DataHealthStatus, typeof Activity> = {
  fresh: CheckCircle2,
  'review-due': Clock3,
  expired: AlertTriangle,
  invalid: ShieldAlert,
};

function formatDate(value: string | undefined, locale: 'ru' | 'en'): string {
  if (!value) return '—';
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function DataHealthPanel() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const report = useMemo(() => buildDataHealthReport(new Date()), []);
  const overall: DataHealthStatus = report.invalid > 0
    ? 'invalid'
    : report.expired > 0
      ? 'expired'
      : report.reviewDue > 0
        ? 'review-due'
        : 'fresh';
  const OverallIcon = statusIcon[overall];

  return <Panel className={`data-health-panel status-${overall}`}>
    <header className="data-health-heading">
      <div className="data-health-title"><OverallIcon size={22} /><div><span>{ru ? 'СОСТОЯНИЕ ДАННЫХ' : 'DATA HEALTH'}</span><h2>{ru ? 'Свежесть и происхождение проверяются автоматически' : 'Freshness and provenance are checked automatically'}</h2><p>{ru ? 'Дата сама по себе не делает источник официальным или точным. Этот контроль отвечает только за своевременную перепроверку и целостность метаданных.' : 'A recent date does not make a source official or correct. This contract only tracks review timing and metadata integrity.'}</p></div></div>
      <div className="data-health-asof"><span>{ru ? 'Состояние на' : 'As of'}</span><b>{formatDate(report.asOf, locale)}</b></div>
    </header>

    <dl className="data-health-totals">
      <div><dt>{ru ? 'Записей под контролем' : 'Tracked records'}</dt><dd>{report.total}</dd></div>
      <div><dt>{ru ? 'Проверено недавно' : 'Recently reviewed'}</dt><dd>{report.fresh}</dd></div>
      <div><dt>{ru ? 'Пора перепроверить' : 'Review due'}</dt><dd>{report.reviewDue}</dd></div>
      <div><dt>{ru ? 'Просрочено / ошибки' : 'Expired / invalid'}</dt><dd>{report.expired + report.invalid}</dd></div>
      <div><dt>{ru ? 'Самая старая проверка' : 'Oldest verification'}</dt><dd>{formatDate(report.oldestVerifiedAt, locale)}</dd></div>
      <div><dt>{ru ? 'Следующая плановая проверка' : 'Next planned review'}</dt><dd>{formatDate(report.nextReviewAt, locale)}</dd></div>
    </dl>

    <div className="data-health-domain-table" role="table" aria-label={ru ? 'Состояние наборов данных' : 'Dataset health'}>
      <div className="data-health-domain-row header" role="row">
        <span role="columnheader">{ru ? 'Раздел' : 'Domain'}</span>
        <span role="columnheader">{ru ? 'Всего' : 'Total'}</span>
        <span role="columnheader">{ru ? 'Свежие' : 'Fresh'}</span>
        <span role="columnheader">{ru ? 'Проверить' : 'Due'}</span>
        <span role="columnheader">{ru ? 'Ошибка' : 'Blocked'}</span>
        <span role="columnheader">{ru ? 'Следующая дата' : 'Next review'}</span>
      </div>
      {report.domains.map((domain) => <div className="data-health-domain-row" role="row" key={domain.domain}>
        <b role="cell">{dataHealthDomainLabel(domain.domain, locale)}</b>
        <span role="cell">{domain.total}</span>
        <span role="cell">{domain.fresh}</span>
        <span role="cell">{domain.reviewDue}</span>
        <span role="cell">{domain.expired + domain.invalid}</span>
        <span role="cell">{formatDate(domain.nextReviewAt, locale)}</span>
      </div>)}
    </div>

    {report.actionable.length ? <section className="data-health-actions">
      <header><div><Activity size={19} /><div><h3>{ru ? 'Что требует внимания' : 'Needs attention'}</h3><p>{ru ? 'Предупреждение не удаляет данные: оно показывает, какой источник нужно открыть и перепроверить.' : 'A warning does not remove data; it identifies the source that should be reviewed.'}</p></div></div><span>{report.actionable.length}</span></header>
      <div className="data-health-action-list">{report.actionable.slice(0, 12).map((entry) => {
        const Icon = statusIcon[entry.status];
        return <article key={entry.id} className={`data-health-action status-${entry.status}`}>
          <Icon size={18} />
          <div><div><b>{entry.title}</b><span>{dataHealthDomainLabel(entry.domain, locale)}</span></div><p>{entry.reasons.map((reason) => dataHealthReasonLabel(reason, locale)).join(' ')}</p><small>{entry.sourcePublisher} · {ru ? 'источник' : 'source'}: {formatDate(entry.sourceUpdatedAt, locale)} · {ru ? 'проверено' : 'verified'}: {formatDate(entry.verifiedAt, locale)}</small></div>
          {entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer" aria-label={ru ? `Открыть источник: ${entry.title}` : `Open source: ${entry.title}`}><ExternalLink size={15} /></a> : null}
        </article>;
      })}</div>
      {report.actionable.length > 12 ? <p className="data-health-more">{ru ? `Показаны первые 12 из ${report.actionable.length}. Полный список проверяется тестами и ежедневным GitHub Action.` : `Showing the first 12 of ${report.actionable.length}. The full list is checked by tests and the daily GitHub Action.`}</p> : null}
    </section> : <div className="data-health-clear"><CheckCircle2 size={20} /><span>{ru ? 'Все записи находятся внутри планового срока перепроверки.' : 'Every record is inside its planned review window.'}</span></div>}

    <footer><AlertTriangle size={17} /><p>{ru ? 'Свежесть и сила доказательства — разные вещи. Например, свежий перевод сообщества не становится официальной локализацией, а старый официальный источник не заменяется автоматически более новым неофициальным.' : 'Freshness and evidence strength are separate. A recent community translation does not become official, and an older official source is not silently replaced by a newer unofficial one.'}</p><strong>{dataHealthStatusLabel(overall, locale)}</strong></footer>
  </Panel>;
}
