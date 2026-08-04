/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; the browser app intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pageSource from './pages/TeamCalculatorPage.tsx?raw';
import componentSource from './components/AttackSequenceBuilder.tsx?raw';
import modelSource from './team-sequence-builder.ts?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./team-sequence-builder.css', import.meta.url), 'utf8');

describe('team sequence builder product contract', () => {
  it('keeps the existing team state and stores drafts under a separate versioned key', () => {
    expect(pageSource).toContain("useLocalStorage<TeamMemberInput[]>('nte.team.v2'");
    expect(pageSource).toContain("'nte.team.sequence-builder.v1'");
    expect(pageSource).toContain('normalizeAttackSequenceStore');
    expect(modelSource).toContain('ATTACK_SEQUENCE_VERSION = 1');
    expect(modelSource).not.toContain("'nte.team.v2'");
  });

  it('integrates one builder per member and transfers only through an explicit action', () => {
    expect(pageSource).toContain('<AttackSequenceBuilder');
    expect(pageSource).toContain('onApply={(draft) => applySequenceDraft(index, draft)}');
    expect(pageSource).toContain('applyAttackSequence(item, draft).member');
    expect(componentSource).toContain("onClick={() => onApply(draft)}");
    expect(componentSource).toContain('disabled={!evaluation.valid}');
    expect(componentSource).not.toContain('useEffect(');
  });

  it('states the add-then-multiply semantics in both languages', () => {
    expect(componentSource).toContain('умножает только одинаковые попадания внутри строки');
    expect(componentSource).toContain('Only identical hits inside a row are multiplied');
    expect(componentSource).toContain(".join(' + ')");
    expect(componentSource).toContain('Это число применяется к готовой сумме один раз');
    expect(componentSource).toContain('This value is applied once');
  });

  it('does not present player-entered row names as official skill labels', () => {
    expect(componentSource).toContain('Названия вводишь ты');
    expect(componentSource).toContain('not presented as official skill labels');
    expect(pageSource).toContain('не подставляются как числовые пресеты');
    expect(pageSource).toContain('are not inserted as numeric presets');
  });

  it('loads a restrained responsive stylesheet without decorative gradients or shadows', () => {
    expect(mainSource).toContain("import './team-sequence-builder.css'");
    expect(css).toContain('.attack-sequence-builder');
    expect(css).toContain('@media(max-width:860px)');
    expect(css).toContain('@media(max-width:560px)');
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });

  it('keeps formulas and enemy inputs outside the builder model', () => {
    expect(modelSource).not.toContain('defenceMultiplier');
    expect(modelSource).not.toContain('resistanceMultiplier');
    expect(modelSource).not.toContain('critRate');
    expect(modelSource).not.toContain('enemy');
    expect(modelSource).toContain('withTotalMultiplierPerUse');
    expect(modelSource).toContain('actionsPerRotation: evaluation.usesPerRotation');
  });
});
