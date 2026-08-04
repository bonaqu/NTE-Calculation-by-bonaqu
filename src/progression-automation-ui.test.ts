/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; the browser app intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import panelSource from './components/ProgressionAutomationPanel.tsx?raw';
import pageSource from './pages/ProgressionPage.tsx?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./progression-automation.css', import.meta.url), 'utf8');

describe('Progression automation UI contract', () => {
  it('keeps the existing v2 storage and transfer contracts', () => {
    expect(pageSource).toContain("const STORAGE_KEY = 'nte.progression.roster.v2'");
    expect(pageSource).toContain('normalizeRosterProgressionState');
    expect(pageSource).toContain('buildProgressionShareUrl');
    expect(pageSource).toContain('serializeProgressionPlan');
    expect(pageSource).toContain('parseProgressionPlan');
  });

  it('uses functional state updates for inventory and atomic payments', () => {
    expect(pageSource).toContain('const applyBulkInventory');
    expect(pageSource).toContain('setState((current) => ({');
    expect(pageSource).toContain('const payReadyAscensions = () => setState((current) => applyImmediatePayments(current))');
    expect(pageSource).toContain('<ProgressionAutomationPanel');
    expect(pageSource).toContain('onApplyPayments={payReadyAscensions}');
  });

  it('requires an explicit user action and never auto-applies parsed input', () => {
    expect(panelSource).toContain("useState<InventoryApplyMode>('merge')");
    expect(panelSource).toContain("mode === 'replace-active'");
    expect(panelSource).toContain('disabled={!parsed.valid}');
    expect(panelSource).toContain('onClick={applyInventory}');
    expect(panelSource).toContain('onClick={onApplyPayments}');
    expect(panelSource).not.toContain('useEffect(');
  });

  it('explains deterministic roster order without pretending to optimize farming', () => {
    expect(panelSource).toContain('Проверка идёт сверху вниз по текущему списку персонажей');
    expect(panelSource).toContain('Это не совет по выгодности фарма');
    expect(panelSource).toContain('The simulation follows the visible roster order');
    expect(panelSource).toContain('This is not farming-efficiency advice');
  });

  it('loads a flat responsive presentation without decorative AI-dashboard motion', () => {
    expect(mainSource).toContain("import './progression-automation.css'");
    expect(css).toContain('border-top:2px solid');
    expect(css).toContain('grid-template-columns:minmax(0,1fr) minmax(360px,.72fr)');
    expect(css).toContain('@media(max-width:680px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/u);
    expect(css).not.toContain('box-shadow');
    expect(css).not.toMatch(/translate(?:X|Y)?\s*\(/u);
  });
});
