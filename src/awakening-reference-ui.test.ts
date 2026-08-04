/// <reference types="vite/client" />
// @ts-expect-error Vitest evaluates raw source contracts in Node without Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import databaseSource from './pages/DatabasePage.tsx?raw';
import calculatorSource from './pages/GameVisibleTeamCalculatorPage.tsx?raw';
import componentSource from './components/CharacterAwakeningReference.tsx?raw';
import referenceSource from './awakening-reference.ts?raw';
import mainSource from './main.tsx?raw';

const css = readFileSync(new URL('./awakening-reference.css', import.meta.url), 'utf8');

describe('Awakening reference placement', () => {
  it('puts the complete A1–A6 reference in Character Database cards', () => {
    expect(databaseSource).toContain('CharacterAwakeningReference');
    expect(databaseSource).toContain('awakeningSearchText(row.name)');
    expect(databaseSource).toContain('Пробуждения A1–A6');
    expect(databaseSource).toContain('полный справочник');
    expect(componentSource).toContain('awakeningNodesForCharacter(characterName)');
    expect(componentSource).toContain('nodes.map((node)');
    expect(componentSource).toContain('Открыть источник');
    expect(componentSource).toContain('Используется калькулятором:');
    expect(componentSource).toContain('Справочный узел: не применяется к урону');
  });

  it('keeps Russian evidence and disclosed English fallback visible', () => {
    expect(componentSource).toContain("node.evidence === 'current-russian-reference'");
    expect(componentSource).toContain('RU подтверждено');
    expect(componentSource).toContain('EN с пометкой');
    expect(componentSource).toContain('sourceUpdatedAt');
    expect(componentSource).toContain('verifiedAt');
  });

  it('prevents the complete reference from returning to Team Calculator', () => {
    expect(calculatorSource).toContain('relevantAwakeningNodes(');
    expect(calculatorSource).toContain('Требуемое пробуждение');
    expect(calculatorSource).toContain('Полный справочник A1–A6 находится в Базе персонажей');
    expect(calculatorSource).not.toContain('awakeningNodesByCharacter');
    expect(calculatorSource).not.toContain('supportAwakeningNodesByCharacter');
    expect(calculatorSource).not.toContain('Все предыдущие считаются открытыми автоматически');
    expect(referenceSource).toContain('relatedActionIds?.includes(actionId)');
    expect(referenceSource).toContain('teamEffectAwakeningRequirements');
  });

  it('loads a responsive border-led Database reference without gradients or shadows', () => {
    expect(mainSource).toContain("import './awakening-reference.css'");
    expect(css).toContain('.character-awakening-reference');
    expect(css).toContain('.character-awakening-nodes article.applied');
    expect(css).toContain('@media(max-width:620px)');
    expect(css).not.toMatch(/(?:linear|radial|conic)-gradient\s*\(/iu);
    expect(css).not.toMatch(/box-shadow\s*:/iu);
  });
});
