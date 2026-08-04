/// <reference types="vite/client" />
// @ts-expect-error Vitest runs this source contract in Node; browser code intentionally omits Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';
import namedRequirementsSource from './components/NamedAwakeningRequirements.tsx?raw';
import pageSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import modelSource from './game-visible-build.ts?raw';
import calculationSource from './game-visible-calculation.ts?raw';
import awakeningSource from './awakening-data.ts?raw';
import awakeningReferenceSource from './awakening-reference.ts?raw';
import mainSource from './main.tsx?raw';

const baseCss = readFileSync(new URL('./game-visible-calculator.css', import.meta.url), 'utf8');
const minimalCss = readFileSync(new URL('./game-visible-minimal-inputs.css', import.meta.url), 'utf8');

describe('formula-driven Team Calculator product contract', () => {
  it('keeps the game-visible calculator on the primary team route and migrates the existing storage shape', () => {
    expect(appSource).toContain("import { GameVisibleTeamCalculatorPage }");
    expect(appSource).toContain("route === 'team' ? <GameVisibleTeamCalculatorPage />");
    expect(modelSource).toContain("GAME_VISIBLE_TEAM_STORAGE_KEY = 'nte.team.visible.v1'");
    expect(pageSource).toContain('normalizeGameVisibleTeamState');
  });

  it('asks only for damage-formula inputs in the normal path', () => {
    for (const required of [
      'Уровень персонажа',
      'screenshotConfirmedRussianLabels.atk',
      'screenshotConfirmedRussianLabels.critRate',
      'screenshotConfirmedRussianLabels.critDamage',
      "key: 'damageBonus'",
      "key: 'attributeDamageBonus'",
    ]) expect(pageSource).toContain(required);

    for (const removedManualField of [
      "label={ru ? 'Атака дуги'",
      "label={ru ? 'Уровень дуги'",
      "label={ru ? 'Тип сетки консоли'",
      "label={ru ? 'Модулей типа III'",
      "key: 'hp'",
      "key: 'def'",
      "key: 'chargeSpeed'",
      "key: 'cycleIntensity'",
      "key: 'breakIntensity'",
      "label={ru ? 'Текущий максимум уровня'",
    ]) expect(pageSource).not.toContain(removedManualField);
  });

  it('reveals skill, target and Arc conditions only when the selected test needs them', () => {
    expect(pageSource).toContain('actionNeedsSkill(selectedAction)');
    expect(pageSource).toContain("activeBuild.testMode === 'training-target'");
    expect(pageSource).toContain("activeBuild.testMode === 'verified-action'");
    expect(pageSource).toContain("activeBuild.characterName === 'Shinku' && activeBuild.testMode === 'burst-reference'");
    expect(pageSource).toContain('Атака дуги и её вторичный стат не вводятся');
    expect(pageSource).toContain("activeBuild.arc.arcName === 'Blushing Mirage'");
  });

  it('uses only named formula-required Awakening confirmations', () => {
    expect(pageSource).toContain('relevantAwakeningNodes(');
    expect(pageSource).toContain('<NamedAwakeningRequirements');
    expect(pageSource).not.toContain('awakeningNodesByCharacter');
    expect(pageSource).not.toContain('supportAwakeningNodesByCharacter');
    expect(pageSource).not.toContain("Array.from({ length: 7 }");
    expect(pageSource).not.toContain('nte-awakening-picker');
    expect(pageSource).not.toContain('Максимальное открытое пробуждение');

    expect(namedRequirementsSource).toContain('type="checkbox"');
    expect(namedRequirementsSource).toContain('A{node.level} · {node.title[locale]}');
    expect(namedRequirementsSource).toContain('Полный список A1–A6 находится в Базе персонажей');
    expect(namedRequirementsSource).toContain('Само по себе оно не добавляет урон');
    expect(namedRequirementsSource).toContain('Math.max(build.awakeningLevel, node.level)');

    expect(awakeningReferenceSource).toContain('teamEffectAwakeningRequirements');
    expect(awakeningSource).toContain("'current-russian-reference'");
    expect(awakeningSource).toContain("'current-english-reference'");
    expect(awakeningSource).toContain("'nanally.awakening-three-follow-up.level-11'");
    expect(awakeningSource).toContain("'zero.blooming-gaze.awakening-one'");
    expect(awakeningSource).toContain("'zero.appraise-and-engrave-extra.awakening-six'");
  });

  it('keeps final ATK direct and never adds static Arc or Console values again', () => {
    expect(pageSource).toContain('1126 + 900 = 2026');
    expect(pageSource).toContain('Постоянные бонусы снаряжения уже входят в них');
    expect(calculationSource).toContain('baseAtk: build.stats.atk');
    expect(calculationSource).toContain('arcAtk: 0');
    expect(calculationSource).toContain('flatAtk: modifier.flatAtk');
    expect(calculationSource).toContain('atkPercent: 0');
  });

  it('uses four focused sections and retains evidence states', () => {
    for (const tab of ['overview', 'damage', 'conditions', 'test']) {
      expect(pageSource).toContain(`'${tab}'`);
    }
    for (const removedTab of ["'arc'", "'ability'", "'console'"]) {
      expect(pageSource.split('const tabs = ')[1]?.split(' as const')[0]).not.toContain(removedTab);
    }
    for (const coverage of ['verified', 'partial', 'relative-only', 'unavailable']) {
      expect(modelSource).toContain(`'${coverage}'`);
    }
  });

  it('loads the responsive requirement layer without decorative gradients or shadows', () => {
    expect(mainSource).toContain("import './game-visible-calculator.css'");
    expect(mainSource).toContain("import './game-visible-minimal-inputs.css'");
    expect(baseCss).toContain('.nte-team-rail');
    expect(minimalCss).toContain('@media(max-width:620px)');
    expect(`${baseCss}\n${minimalCss}`).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(`${baseCss}\n${minimalCss}`).not.toMatch(/box-shadow\s*:/iu);
  });
});
