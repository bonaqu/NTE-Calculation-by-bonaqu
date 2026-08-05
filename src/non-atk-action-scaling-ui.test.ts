/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import panelSource from './components/VerifiedTeamEffectsPanel.tsx?raw';
import calculationSource from './game-visible-calculation.ts?raw';
import coreSource from '../packages/calculation-core/src/index.ts?raw';
import actionSource from './verified-visible-actions.ts?raw';


describe('non-ATK action scaling UI contract', () => {
  it('defaults old actions to ATK and exposes explicit DEF and Max-HP metadata', () => {
    expect(actionSource).toContain("export type ActionScalingStat = 'atk' | 'def' | 'max-hp'");
    expect(actionSource).toContain('scalingStat?: ActionScalingStat');
    expect(calculationSource).toContain("action?.scalingStat ?? 'atk'");
  });

  it('shows exactly one contextual visible-stat input for a selected non-ATK action', () => {
    expect(panelSource).toContain("scalingStat === 'def' ? 'def' : scalingStat === 'max-hp' ? 'hp' : null");
    expect(panelSource).toContain("build.testMode === 'verified-action'");
    expect(panelSource).toContain('Обязательный атрибут действия');
    expect(panelSource).toContain('Итоговая ЗАЩ');
    expect(panelSource).toContain('Максимальные ОЗ');
    expect(panelSource).toContain('stats: { ...build.stats, [scalingKey]: numberValue(event.target.value) }');
  });

  it('does not double count equipment or reinterpret visible stats', () => {
    expect(panelSource).toContain('Статы дуги, консоли и развития отдельно не прибавляй');
    expect(calculationSource).toContain("scalingValue: actionScalingStat === 'atk' ? undefined : actionScalingValue");
    expect(coreSource).toContain('input.scalingValue === undefined');
    expect(coreSource).toContain('const nonCrit = scalingValue * skill * hits');
  });

  it('keeps total ATK available while reporting the actual action scaling value', () => {
    expect(coreSource).toContain('totalAtk,');
    expect(coreSource).toContain('scalingValue,');
    expect(calculationSource).toContain('visible.final-def');
    expect(calculationSource).toContain('visible.final-max-hp');
  });
});
