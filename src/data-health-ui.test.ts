/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; the browser app intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/DataHealthPanel.tsx?raw';
import methodologySource from './pages/MethodologyPage.tsx?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./data-health.css', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/data-freshness.yml', import.meta.url), 'utf8');

describe('data health product contract', () => {
  it('places live health after terminology evidence and before formula methodology', () => {
    expect(methodologySource).toContain("import { DataHealthPanel }");
    expect(methodologySource.indexOf('<DataHealthPanel />')).toBeGreaterThan(methodologySource.indexOf('<TerminologyEvidenceTable />'));
    expect(methodologySource.indexOf('<DataHealthPanel />')).toBeLessThan(methodologySource.indexOf('className="method-grid"'));
  });

  it('derives UI state from runtime records instead of hard-coded totals', () => {
    expect(panelSource).toContain('buildDataHealthReport(new Date())');
    expect(panelSource).toContain('report.total');
    expect(panelSource).toContain('report.domains.map');
    expect(panelSource).toContain('report.actionable.slice(0, 12)');
    expect(panelSource).not.toMatch(/Записей под контролем[^\n]*\d{2,}/u);
  });

  it('keeps freshness separate from authority and correctness', () => {
    expect(panelSource).toContain('Дата сама по себе не делает источник официальным или точным');
    expect(panelSource).toContain('Свежесть и сила доказательства — разные вещи');
    expect(panelSource).toContain('A recent date does not make a source official or correct');
  });

  it('uses a flat responsive presentation without decorative dashboard motion', () => {
    expect(mainSource).toContain("import './data-health.css'");
    expect(css).toContain('border-top:2px solid');
    expect(css).toContain('grid-template-columns:repeat(6');
    expect(css).toContain('@media(max-width:760px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/u);
    expect(css).not.toContain('box-shadow');
    expect(css).not.toMatch(/translate(?:X|Y)?\s*\(/u);
  });

  it('runs the same hard-expiry contract every day', () => {
    expect(workflow).toContain("cron: '17 5 * * *'");
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('npm run typecheck');
    expect(workflow).toContain('npm test -- src/data-health.test.ts');
    expect(workflow).toContain('permissions:\n  contents: read');
  });
});
