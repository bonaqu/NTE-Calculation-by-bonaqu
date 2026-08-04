import { describe, expect, it } from 'vitest';
import {
  buildDataHealthRecords,
  buildDataHealthReport,
  dataHealthDomains,
  evaluateDataHealthRecord,
  type DataHealthRecord,
} from './data-health';

const auditDate = new Date('2026-08-04T12:00:00.000Z');

function record(overrides: Partial<DataHealthRecord> = {}): DataHealthRecord {
  return {
    id: 'test:record',
    domain: 'arc-guides',
    title: 'Test record',
    sourcePublisher: 'Test publisher',
    sourceUrl: 'https://example.com/guide',
    sourceUpdatedAt: '2026-07-01',
    verifiedAt: '2026-08-01',
    ...overrides,
  };
}

describe('data health contract', () => {
  it('covers every source-backed product domain with unique identities', () => {
    const records = buildDataHealthRecords();
    const report = buildDataHealthReport(auditDate, records);

    expect(report.total).toBe(records.length);
    expect(report.duplicateIds).toEqual([]);
    expect(report.contractErrors).toEqual([]);
    expect(report.invalid).toBe(0);
    expect(report.expired).toBe(0);
    expect(report.reviewDue).toBeGreaterThan(0);
    expect(report.fresh + report.reviewDue).toBe(report.total);

    for (const domain of dataHealthDomains) {
      expect(report.domains.find((entry) => entry.domain === domain)?.total).toBeGreaterThan(0);
    }
  });

  it('uses domain-specific windows instead of declaring every old source fresh', () => {
    const report = buildDataHealthReport(auditDate);
    const adlerGuide = report.evaluations.find((entry) => entry.id === 'arc-guide:Adler');
    const cycleGuide = report.evaluations.find((entry) => entry.id === 'esper-cycle:blossom');
    const currentIroiGuide = report.evaluations.find((entry) => entry.id === 'arc-guide:Iroi');

    expect(adlerGuide?.status).toBe('review-due');
    expect(adlerGuide?.reasons).toContain('source-review-due');
    expect(cycleGuide?.status).toBe('review-due');
    expect(currentIroiGuide?.status).toBe('fresh');
  });

  it('rejects missing, malformed and future provenance', () => {
    expect(evaluateDataHealthRecord(record({ sourcePublisher: '' }), auditDate)).toMatchObject({
      status: 'invalid',
      reasons: expect.arrayContaining(['missing-publisher']),
    });
    expect(evaluateDataHealthRecord(record({ sourceUpdatedAt: undefined }), auditDate)).toMatchObject({
      status: 'invalid',
      reasons: expect.arrayContaining(['missing-source-update-date']),
    });
    expect(evaluateDataHealthRecord(record({ verifiedAt: '04.08.2026' }), auditDate)).toMatchObject({
      status: 'invalid',
      reasons: expect.arrayContaining(['malformed-verified-date']),
    });
    expect(evaluateDataHealthRecord(record({ sourceUpdatedAt: '2026-08-05' }), auditDate)).toMatchObject({
      status: 'invalid',
      reasons: expect.arrayContaining(['future-source-update-date']),
    });
  });

  it('separates review warnings from hard expiry', () => {
    expect(evaluateDataHealthRecord(record({ sourceUpdatedAt: '2026-05-26' }), auditDate).status).toBe('review-due');
    expect(evaluateDataHealthRecord(record({ sourceUpdatedAt: '2026-03-01' }), auditDate)).toMatchObject({
      status: 'expired',
      reasons: expect.arrayContaining(['source-expired']),
    });
  });

  it('reports duplicate identities as contract failures', () => {
    const duplicate = record();
    const report = buildDataHealthReport(auditDate, [duplicate, { ...duplicate }]);
    expect(report.duplicateIds).toEqual(['test:record']);
    expect(report.contractErrors[0]).toContain('Duplicate data-health identity');
  });

  it('keeps the repository inside hard deadlines on the actual CI date', () => {
    const report = buildDataHealthReport(new Date());
    expect(report.contractErrors).toEqual([]);
  });
});
