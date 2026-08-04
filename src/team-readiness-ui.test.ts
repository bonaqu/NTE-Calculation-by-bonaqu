/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; the browser app intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import page from './pages/TeamCalculatorPage.tsx?raw';
import panel from './components/TeamReadinessPanel.tsx?raw';

const css = readFileSync(new URL('./team-readiness.css', import.meta.url), 'utf8');

describe('Team Calculator readiness UI contract', () => {
  it('preserves existing calculation storage and adds isolated confirmation metadata', () => {
    expect(page).toContain("useLocalStorage<TeamMemberInput[]>('nte.team.v2'");
    expect(page).toContain("useLocalStorage<number>('nte.team.duration.v2'");
    expect(page).toContain("useLocalStorage<EnemyProfile>('nte.team.enemy.v2'");
    expect(page).toContain("useLocalStorage<string>('nte.team.confirmed-digest.v1'");
  });

  it('shows readiness before the result summary and labels result trust state', () => {
    expect(page.indexOf('<TeamReadinessPanel')).toBeGreaterThan(0);
    expect(page.indexOf('<TeamReadinessPanel')).toBeLessThan(page.indexOf('summary-strip'));
    expect(page).toContain('resultStateNote');
    expect(page).toContain('note={resultStateNote}');
  });

  it('provides explicit sample, incomplete, unchecked and checked states', () => {
    for (const status of ['sample', 'incomplete', 'unchecked', 'checked']) {
      expect(panel).toContain(`${status}:`);
      expect(css).toContain(`status-${status}`);
    }
  });

  it('does not claim that player confirmation makes the model official', () => {
    expect(panel).toContain('Это по-прежнему оценочная модель');
    expect(panel).toContain('The model remains an estimate');
    expect(page).toContain('Сайт не выдумывает множители навыков');
    expect(page).toContain('не подставляются как числовые пресеты');
    expect(page).toContain('does not invent skill multipliers');
    expect(page).toContain('are not inserted as numeric presets');
  });

  it('keeps the layout flat and responsive instead of adding floating dashboard cards', () => {
    expect(css).toContain('border-top:2px solid');
    expect(css).toContain('grid-template-columns:repeat(4');
    expect(css).not.toContain('box-shadow');
    expect(css).not.toContain('transform:translate');
    expect(css).not.toContain('linear-gradient');
  });
});