/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; browser code intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';
import pageSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import modelSource from './game-visible-build.ts?raw';
import calculationSource from './game-visible-calculation.ts?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./game-visible-calculator.css', import.meta.url), 'utf8');

describe('game-visible Team Calculator product contract', () => {
  it('uses the new calculator on the primary team route while preserving legacy files', () => {
    expect(appSource).toContain("import { GameVisibleTeamCalculatorPage }");
    expect(appSource).toContain("route === 'team' ? <GameVisibleTeamCalculatorPage />");
    expect(appSource).not.toContain("import { TeamCalculatorPage } from './pages/TeamCalculatorPage'");
    expect(modelSource).toContain("GAME_VISIBLE_TEAM_STORAGE_KEY = 'nte.team.visible.v1'");
    expect(modelSource).not.toContain("'nte.team.v2'");
  });

  it('asks for current-client fields instead of model multipliers in the normal path', () => {
    for (const label of [
      'Атака',
      'Шанс крит. удара',
      'Крит. урон',
      'Скорость зарядки',
      'Интенсивность цикла',
      'Интенсивность разрушения',
      'Способность эспера',
      'Консоль',
    ]) expect(pageSource).toContain(label);

    expect(pageSource).not.toContain('Множитель одного одинакового попадания');
    expect(pageSource).not.toContain('Одинаковых попаданий за применение');
    expect(pageSource).not.toContain('AttackSequenceBuilder');
  });

  it('states and enforces the no-double-counting ATK rule', () => {
    expect(pageSource).toContain('АТК дуги не складывается с ней повторно');
    expect(pageSource).toContain('Дуга отдельно не прибавляется');
    expect(calculationSource).toContain('baseAtk: build.stats.atk');
    expect(calculationSource).toContain('arcAtk: 0');
    expect(calculationSource).toContain('atkPercent: 0');
  });

  it('provides the six game-like build tabs and explicit evidence states', () => {
    for (const tab of ['overview', 'attributes', 'arc', 'ability', 'console', 'test']) {
      expect(pageSource).toContain(`'${tab}'`);
    }
    for (const coverage of ['verified', 'partial', 'relative-only', 'unavailable']) {
      expect(modelSource).toContain(`'${coverage}'`);
    }
    expect(modelSource).toContain('characterCombatCoverage');
    expect(modelSource).toContain("character.releaseStatus === 'released'");
  });

  it('never invents unsupported skill scaling', () => {
    expect(calculationSource).toContain('The site does not interpolate or invent scaling');
    expect(calculationSource).toContain('сайт не интерполирует значения и не придумывает формулу роста');
    expect(calculationSource).toContain('normalized test, not a claimed skill result');
    expect(calculationSource).toContain('нормализованный тест, а не заявленный урон конкретного навыка');
  });

  it('loads an original responsive NTE-inspired interface', () => {
    expect(mainSource).toContain("import './game-visible-calculator.css'");
    expect(css).toContain('.nte-team-rail');
    expect(css).toContain('.nte-editor-tabs');
    expect(css).toContain('--nte-pink:#ff3f91');
    expect(css).toContain('--nte-yellow:#f2bf31');
    expect(css).toContain('@media(max-width:900px)');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
