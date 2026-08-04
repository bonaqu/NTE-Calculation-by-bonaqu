/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pageSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import panelSource from './components/VerifiedTeamEffectsPanel.tsx?raw';
import buildSource from './game-visible-build.ts?raw';
import calculationSource from './game-visible-calculation.ts?raw';
import effectSource from './team-effects.ts?raw';
import awakeningReferenceSource from './awakening-reference.ts?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./team-effects.css', import.meta.url), 'utf8');

describe('verified team effect UI contract', () => {
  it('places support effects in the conditional section rather than the ordinary damage form', () => {
    expect(pageSource).toContain('VerifiedTeamEffectsPanel');
    expect(pageSource).toContain('evaluations={teamCalculation.teamEffects}');
    expect(pageSource).toContain("tab === 'conditions'");
    expect(pageSource).not.toContain("key: 'baseAtk'");
    expect(panelSource).toContain('enabled && effect.baseAtkPercent !== undefined');
    expect(panelSource).toContain('Левое число в подробной строке «Атака»');
  });

  it('stores only conditional base ATK and enabled IDs with safe v1 migration defaults', () => {
    expect(buildSource).toContain('baseAtk: number');
    expect(buildSource).toContain('activeTeamEffectIds: string[]');
    expect(buildSource).toContain('baseAtk: clamp(input.baseAtk');
    expect(buildSource).toContain('activeTeamEffectIds: normalizeStringArray(input.activeTeamEffectIds)');
    expect(buildSource).toContain('baseAtk: 0');
    expect(buildSource).toContain('activeTeamEffectIds: []');
  });

  it('shows exact effect requirements through the centralized Sakiri A4 relationship', () => {
    expect(effectSource).toContain("'haniel.friendship.nova-atk-drain'");
    expect(effectSource).toContain("'sakiri.awakening-four.team-atk'");
    expect(effectSource).toContain("'sakiri.impish-trick.def-reduction'");
    expect(awakeningReferenceSource).toContain("effectId: 'sakiri.awakening-four.team-atk'");
    expect(awakeningReferenceSource).toContain("characterName: 'Sakiri'");
    expect(awakeningReferenceSource).toContain('level: 4');
    expect(pageSource).toContain('relevantAwakeningNodes(');
    expect(pageSource).not.toContain('node.level === 4');
    expect(pageSource).not.toContain("activeBuild.activeTeamEffectIds.includes('sakiri.awakening-four.team-atk')");
    expect(panelSource).toContain('effect.minimumAwakening');
  });

  it('renders derived provenance while keeping final ATK and temporary flat ATK separate', () => {
    expect(calculationSource).toContain('baseAtk: build.stats.atk');
    expect(calculationSource).toContain('flatAtk: modifier.flatAtk');
    expect(calculationSource).toContain('supportConditions(modifier)');
    expect(calculationSource).toContain('modifier.enemyDefenceReduction');
    expect(calculationSource).toContain('deriveVerifiedTeamEffects(state)');
  });

  it('loads a responsive, border-led effect layer without decorative gradients or shadows', () => {
    expect(mainSource).toContain("import './team-effects.css'");
    expect(css).toContain('.nte-team-effect-base-atk');
    expect(css).toContain('.nte-team-effect-status.active');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
