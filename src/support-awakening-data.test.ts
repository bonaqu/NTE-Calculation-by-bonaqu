import { describe, expect, it } from 'vitest';
import { supportAwakeningNodes, supportAwakeningNodesByCharacter } from './support-awakening-data';

describe('support awakening node registry', () => {
  it('publishes six ordered current-Russian nodes for Haniel and Sakiri', () => {
    expect(supportAwakeningNodes).toHaveLength(12);
    expect([...supportAwakeningNodesByCharacter.keys()]).toEqual(['Haniel', 'Sakiri']);
    for (const nodes of supportAwakeningNodesByCharacter.values()) {
      expect(nodes.map((node) => node.level)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(nodes.every((node) => node.evidence === 'current-russian-reference')).toBe(true);
      expect(nodes.every((node) => node.sourceUrl.startsWith('https://'))).toBe(true);
    }
  });

  it('keeps the exact Russian Sakiri A4 requirement calculation-active', () => {
    const sakiri = supportAwakeningNodesByCharacter.get('Sakiri') ?? [];
    expect(sakiri[3]?.title.ru).toBe('Жажда уверенности');
    expect(sakiri[3]?.description.ru).toContain('30% базовой Атаки Сакири');
    expect(sakiri[3]?.description.ru).toContain('кроме Сакири');
    expect(sakiri[3]?.calculationStatus).toBe('applied');
    expect(sakiri.filter((node) => node.level !== 4).every((node) => node.calculationStatus === 'informational')).toBe(true);
  });

  it('uses exact Russian Haniel node titles without attaching the passive buff to an Awakening', () => {
    const haniel = supportAwakeningNodesByCharacter.get('Haniel') ?? [];
    expect(haniel[0]?.title.ru).toBe('Я тут новенькая! Встречайте отличницу по обмену!');
    expect(haniel[5]?.title.ru).toBe('Финал! Во имя рассвета!');
    expect(haniel.every((node) => node.calculationStatus === 'informational')).toBe(true);
  });
});
