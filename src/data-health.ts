import { arcDirectory } from './arc-directory';
import { characterArcGuides } from './arc-recommendations';
import { arcPresetSources } from './arc-presets';
import { characterCatalog } from './characters';
import { arcBenchmarkScenarios, sources } from './data';
import { esperCycles } from './esper-cycles';
import { allLocalizationEvidence } from './localization-evidence';
import { characterAscensionProfiles, progressionDatasetSources } from './progression-data';
import { rotationPresets } from './rotation-presets';
import type { Locale, LocalizedText } from './types';

const DAY_MS = 86_400_000;

export type DataHealthDomain =
  | 'localization'
  | 'characters'
  | 'arc-catalog'
  | 'arc-guides'
  | 'rotations'
  | 'esper-cycles'
  | 'progression'
  | 'benchmarks';
export type DataHealthStatus = 'fresh' | 'review-due' | 'expired' | 'invalid';
export type DataHealthReason =
  | 'missing-publisher'
  | 'missing-verified-date'
  | 'missing-source-update-date'
  | 'malformed-verified-date'
  | 'malformed-source-update-date'
  | 'future-verified-date'
  | 'future-source-update-date'
  | 'verification-review-due'
  | 'source-review-due'
  | 'verification-expired'
  | 'source-expired';

export interface DataHealthPolicy {
  reviewAfterDays: number;
  expireAfterDays: number;
  requiresSourceUpdatedAt: boolean;
}
export interface DataHealthRecord {
  id: string;
  domain: DataHealthDomain;
  title: string;
  sourcePublisher: string;
  sourceUrl?: string;
  sourceUpdatedAt?: string;
  verifiedAt: string;
}
export interface DataHealthEvaluation extends DataHealthRecord {
  status: DataHealthStatus;
  reasons: readonly DataHealthReason[];
  verificationAgeDays?: number;
  sourceAgeDays?: number;
  reviewBy?: string;
  expiresBy?: string;
}
export interface DataHealthDomainSummary {
  domain: DataHealthDomain;
  total: number;
  fresh: number;
  reviewDue: number;
  expired: number;
  invalid: number;
  oldestVerifiedAt?: string;
  nextReviewAt?: string;
}
export interface DataHealthReport {
  asOf: string;
  total: number;
  fresh: number;
  reviewDue: number;
  expired: number;
  invalid: number;
  oldestVerifiedAt?: string;
  nextReviewAt?: string;
  duplicateIds: readonly string[];
  evaluations: readonly DataHealthEvaluation[];
  actionable: readonly DataHealthEvaluation[];
  domains: readonly DataHealthDomainSummary[];
  contractErrors: readonly string[];
}

export const dataHealthPolicies: Readonly<Record<DataHealthDomain, DataHealthPolicy>> = {
  localization: { reviewAfterDays: 120, expireAfterDays: 240, requiresSourceUpdatedAt: false },
  characters: { reviewAfterDays: 60, expireAfterDays: 120, requiresSourceUpdatedAt: false },
  'arc-catalog': { reviewAfterDays: 60, expireAfterDays: 120, requiresSourceUpdatedAt: false },
  'arc-guides': { reviewAfterDays: 45, expireAfterDays: 120, requiresSourceUpdatedAt: true },
  rotations: { reviewAfterDays: 45, expireAfterDays: 120, requiresSourceUpdatedAt: true },
  'esper-cycles': { reviewAfterDays: 90, expireAfterDays: 180, requiresSourceUpdatedAt: true },
  progression: { reviewAfterDays: 60, expireAfterDays: 150, requiresSourceUpdatedAt: true },
  benchmarks: { reviewAfterDays: 60, expireAfterDays: 150, requiresSourceUpdatedAt: false },
};

const domainLabels: Readonly<Record<DataHealthDomain, LocalizedText>> = {
  localization: { ru: 'Терминология', en: 'Terminology' },
  characters: { ru: 'Персонажи', en: 'Characters' },
  'arc-catalog': { ru: 'Каталог дуг', en: 'Arc catalog' },
  'arc-guides': { ru: 'Рекомендации дуг', en: 'Arc recommendations' },
  rotations: { ru: 'Ротации', en: 'Rotations' },
  'esper-cycles': { ru: 'Циклы эспера', en: 'Esper Cycles' },
  progression: { ru: 'Прокачка', en: 'Progression' },
  benchmarks: { ru: 'Сравнения и модели', en: 'Benchmarks and models' },
};
const statusLabels: Readonly<Record<DataHealthStatus, LocalizedText>> = {
  fresh: { ru: 'Проверено недавно', en: 'Recently reviewed' },
  'review-due': { ru: 'Пора перепроверить', en: 'Review due' },
  expired: { ru: 'Просрочено', en: 'Expired' },
  invalid: { ru: 'Ошибка метаданных', en: 'Invalid metadata' },
};
const reasonLabels: Readonly<Record<DataHealthReason, LocalizedText>> = {
  'missing-publisher': { ru: 'Не указан источник или издатель.', en: 'Source publisher is missing.' },
  'missing-verified-date': { ru: 'Не указана дата проверки в проекте.', en: 'Project verification date is missing.' },
  'missing-source-update-date': { ru: 'Для этого типа данных нужна дата обновления исходного гайда.', en: 'This data type requires the source guide update date.' },
  'malformed-verified-date': { ru: 'Дата проверки записана не в формате ГГГГ-ММ-ДД.', en: 'Verification date is not a valid YYYY-MM-DD date.' },
  'malformed-source-update-date': { ru: 'Дата обновления источника записана некорректно.', en: 'Source update date is malformed.' },
  'future-verified-date': { ru: 'Дата проверки находится в будущем.', en: 'Verification date is in the future.' },
  'future-source-update-date': { ru: 'Дата обновления источника находится в будущем.', en: 'Source update date is in the future.' },
  'verification-review-due': { ru: 'Данные давно не перепроверялись в проекте.', en: 'The project verification is due for review.' },
  'source-review-due': { ru: 'Исходный гайд или база давно не обновлялись.', en: 'The source guide or database is due for review.' },
  'verification-expired': { ru: 'Срок обязательной перепроверки проекта истёк.', en: 'The project verification hard deadline has expired.' },
  'source-expired': { ru: 'Источник старше допустимого предельного срока.', en: 'The source is beyond its hard freshness deadline.' },
};

export const dataHealthDomains: readonly DataHealthDomain[] = [
  'localization', 'characters', 'arc-catalog', 'arc-guides', 'rotations', 'esper-cycles', 'progression', 'benchmarks',
];
export const dataHealthDomainLabel = (domain: DataHealthDomain, locale: Locale): string => domainLabels[domain][locale];
export const dataHealthStatusLabel = (status: DataHealthStatus, locale: Locale): string => statusLabels[status][locale];
export const dataHealthReasonLabel = (reason: DataHealthReason, locale: Locale): string => reasonLabels[reason][locale];

function parseIsoDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10) === value ? parsed : null;
}
function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
function isoDay(value: number): string {
  return new Date(value).toISOString().slice(0, 10);
}
function addDays(value: string, days: number): string | undefined {
  const parsed = parseIsoDay(value);
  return parsed === null ? undefined : isoDay(parsed + days * DAY_MS);
}
function ageInDays(value: string, asOfMs: number): number | undefined {
  const parsed = parseIsoDay(value);
  return parsed === null ? undefined : Math.floor((asOfMs - parsed) / DAY_MS);
}
function isDefinedString(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}
function earliest(values: Array<string | undefined>): string | undefined {
  return values.filter(isDefinedString).sort()[0];
}
function sourceRecord(id: string, title: string, publisher: string, verifiedAt: string, sourceUrl?: string): DataHealthRecord {
  return { id, domain: 'benchmarks', title, sourcePublisher: publisher, sourceUrl, verifiedAt };
}

export function buildDataHealthRecords(): DataHealthRecord[] {
  const sourceById = new Map([...sources, ...arcPresetSources].map((source) => [source.id, source]));
  return [
    ...allLocalizationEvidence.map((entry) => ({
      id: `localization:${entry.kind}:${entry.canonical}`, domain: 'localization' as const,
      title: `${entry.english} / ${entry.russian}`, sourcePublisher: entry.sourcePublisher,
      sourceUrl: entry.sourceUrl, verifiedAt: entry.verifiedAt,
    })),
    ...characterCatalog.map((entry) => ({
      id: `character:${entry.name}`, domain: 'characters' as const, title: entry.name,
      sourcePublisher: entry.sourcePublisher, sourceUrl: entry.sourceUrl, verifiedAt: entry.verifiedAt,
    })),
    ...arcDirectory.map((entry) => {
      const source = sourceById.get(entry.sourceId);
      return {
        id: `arc:${entry.id}`, domain: 'arc-catalog' as const, title: entry.name,
        sourcePublisher: source?.publisher ?? '', sourceUrl: source?.url, verifiedAt: entry.verifiedAt,
      };
    }),
    ...characterArcGuides.map((entry) => ({
      id: `arc-guide:${entry.characterName}`, domain: 'arc-guides' as const, title: entry.characterName,
      sourcePublisher: entry.sourcePublisher, sourceUrl: entry.sourceUrl,
      sourceUpdatedAt: entry.sourceUpdatedAt, verifiedAt: entry.verifiedAt,
    })),
    ...rotationPresets.map((entry) => ({
      id: `rotation:${entry.id}`, domain: 'rotations' as const, title: entry.title.en,
      sourcePublisher: entry.sourcePublisher, sourceUrl: entry.sourceUrl,
      sourceUpdatedAt: entry.sourceUpdatedAt, verifiedAt: entry.verifiedAt,
    })),
    ...esperCycles.map((entry) => ({
      id: `esper-cycle:${entry.id}`, domain: 'esper-cycles' as const, title: entry.name.en,
      sourcePublisher: entry.sourcePublisher, sourceUrl: entry.sourceUrl,
      sourceUpdatedAt: entry.sourceUpdatedAt, verifiedAt: entry.verifiedAt,
    })),
    ...characterAscensionProfiles.map((entry) => ({
      id: `progression:${entry.characterName}`, domain: 'progression' as const, title: entry.characterName,
      sourcePublisher: entry.sourcePublisher, sourceUrl: entry.sourceUrl,
      sourceUpdatedAt: entry.sourceUpdatedAt, verifiedAt: entry.verifiedAt,
    })),
    ...progressionDatasetSources.map((entry, index) => ({
      id: `progression-source:${index}:${entry.publisher}`, domain: 'progression' as const, title: entry.publisher,
      sourcePublisher: entry.publisher, sourceUrl: entry.url,
      sourceUpdatedAt: entry.updatedAt, verifiedAt: entry.verifiedAt,
    })),
    ...sources.map((entry) => sourceRecord(
      `benchmark-source:${entry.id}`, entry.title, entry.publisher, entry.verifiedAt, entry.url || undefined,
    )),
    ...arcPresetSources.map((entry) => sourceRecord(
      `model-source:${entry.id}`, entry.title, entry.publisher, entry.verifiedAt, entry.url || undefined,
    )),
    ...arcBenchmarkScenarios.map((entry) => {
      const source = sourceById.get(entry.sourceId);
      return sourceRecord(`benchmark:${entry.id}`, entry.title.en, source?.publisher ?? '', entry.verifiedAt, source?.url || undefined);
    }),
  ];
}

export function evaluateDataHealthRecord(record: DataHealthRecord, asOf: Date): DataHealthEvaluation {
  const policy = dataHealthPolicies[record.domain];
  const asOfMs = utcDay(asOf);
  const reasons: DataHealthReason[] = [];
  if (!record.sourcePublisher.trim()) reasons.push('missing-publisher');
  if (!record.verifiedAt) reasons.push('missing-verified-date');
  if (policy.requiresSourceUpdatedAt && !record.sourceUpdatedAt) reasons.push('missing-source-update-date');

  const verificationAgeDays = record.verifiedAt ? ageInDays(record.verifiedAt, asOfMs) : undefined;
  const sourceAgeDays = record.sourceUpdatedAt ? ageInDays(record.sourceUpdatedAt, asOfMs) : undefined;
  if (record.verifiedAt && verificationAgeDays === undefined) reasons.push('malformed-verified-date');
  if (record.sourceUpdatedAt && sourceAgeDays === undefined) reasons.push('malformed-source-update-date');
  if (verificationAgeDays !== undefined && verificationAgeDays < 0) reasons.push('future-verified-date');
  if (sourceAgeDays !== undefined && sourceAgeDays < 0) reasons.push('future-source-update-date');

  const invalidMetadata = reasons.length > 0;
  if (!invalidMetadata) {
    if (verificationAgeDays !== undefined && verificationAgeDays > policy.expireAfterDays) reasons.push('verification-expired');
    else if (verificationAgeDays !== undefined && verificationAgeDays > policy.reviewAfterDays) reasons.push('verification-review-due');
    if (sourceAgeDays !== undefined && sourceAgeDays > policy.expireAfterDays) reasons.push('source-expired');
    else if (sourceAgeDays !== undefined && sourceAgeDays > policy.reviewAfterDays) reasons.push('source-review-due');
  }

  const status: DataHealthStatus = invalidMetadata
    ? 'invalid'
    : reasons.some((reason) => reason.endsWith('expired'))
      ? 'expired'
      : reasons.some((reason) => reason.endsWith('review-due'))
        ? 'review-due'
        : 'fresh';
  const reviewBy = earliest([
    addDays(record.verifiedAt, policy.reviewAfterDays),
    record.sourceUpdatedAt ? addDays(record.sourceUpdatedAt, policy.reviewAfterDays) : undefined,
  ]);
  const expiresBy = earliest([
    addDays(record.verifiedAt, policy.expireAfterDays),
    record.sourceUpdatedAt ? addDays(record.sourceUpdatedAt, policy.expireAfterDays) : undefined,
  ]);
  return {
    ...record, status, reasons,
    ...(verificationAgeDays !== undefined ? { verificationAgeDays } : {}),
    ...(sourceAgeDays !== undefined ? { sourceAgeDays } : {}),
    ...(reviewBy ? { reviewBy } : {}),
    ...(expiresBy ? { expiresBy } : {}),
  };
}

function countStatus(entries: readonly DataHealthEvaluation[], status: DataHealthStatus): number {
  return entries.filter((entry) => entry.status === status).length;
}
function compareActionable(left: DataHealthEvaluation, right: DataHealthEvaluation): number {
  const priority: Record<DataHealthStatus, number> = { invalid: 0, expired: 1, 'review-due': 2, fresh: 3 };
  return priority[left.status] - priority[right.status]
    || (left.reviewBy ?? '').localeCompare(right.reviewBy ?? '')
    || left.title.localeCompare(right.title);
}
function validDates(entries: readonly DataHealthEvaluation[]): string[] {
  return entries.map((entry) => parseIsoDay(entry.verifiedAt) === null ? undefined : entry.verifiedAt).filter(isDefinedString);
}
function futureDates(values: Array<string | undefined>, asOfIso: string): string[] {
  return values.filter(isDefinedString).filter((value) => value > asOfIso).sort();
}

export function buildDataHealthReport(
  asOf = new Date(),
  records: readonly DataHealthRecord[] = buildDataHealthRecords(),
): DataHealthReport {
  const asOfIso = isoDay(utcDay(asOf));
  const idCounts = new Map<string, number>();
  records.forEach((record) => idCounts.set(record.id, (idCounts.get(record.id) ?? 0) + 1));
  const duplicateIds = [...idCounts].filter(([, count]) => count > 1).map(([id]) => id).sort();
  const evaluations = records.map((record) => evaluateDataHealthRecord(record, asOf));
  const actionable = evaluations.filter((entry) => entry.status !== 'fresh').sort(compareActionable);
  const verificationDates = validDates(evaluations).sort();
  const nextReviewDates = futureDates(evaluations.map((entry) => entry.reviewBy), asOfIso);
  const domains = dataHealthDomains.map((domain): DataHealthDomainSummary => {
    const entries = evaluations.filter((entry) => entry.domain === domain);
    const dates = validDates(entries).sort();
    const nextDates = futureDates(entries.map((entry) => entry.reviewBy), asOfIso);
    return {
      domain,
      total: entries.length,
      fresh: countStatus(entries, 'fresh'),
      reviewDue: countStatus(entries, 'review-due'),
      expired: countStatus(entries, 'expired'),
      invalid: countStatus(entries, 'invalid'),
      ...(dates[0] ? { oldestVerifiedAt: dates[0] } : {}),
      ...(nextDates[0] ? { nextReviewAt: nextDates[0] } : {}),
    };
  });
  const contractErrors = [
    ...duplicateIds.map((id) => `Duplicate data-health identity: ${id}`),
    ...evaluations
      .filter((entry) => entry.status === 'invalid' || entry.status === 'expired')
      .map((entry) => `${entry.id}: ${entry.status} (${entry.reasons.join(', ')})`),
  ];
  return {
    asOf: asOfIso,
    total: evaluations.length,
    fresh: countStatus(evaluations, 'fresh'),
    reviewDue: countStatus(evaluations, 'review-due'),
    expired: countStatus(evaluations, 'expired'),
    invalid: countStatus(evaluations, 'invalid'),
    ...(verificationDates[0] ? { oldestVerifiedAt: verificationDates[0] } : {}),
    ...(nextReviewDates[0] ? { nextReviewAt: nextReviewDates[0] } : {}),
    duplicateIds,
    evaluations,
    actionable,
    domains,
    contractErrors,
  };
}
