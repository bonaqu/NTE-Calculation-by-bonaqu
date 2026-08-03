import { describe, expect, it } from 'vitest';
import { arcCatalog, arcCatalogSourceIds } from './arc-catalog';

const findArc = (name: string) => arcCatalog.find((arc) => arc.name === name);

describe('complete Arc catalog', () => {
  it('contains 47 unique sourced entries', () => {
    expect(arcCatalog).toHaveLength(47);
    expect(new Set(arcCatalog.map((arc) => arc.id)).size).toBe(47);
    expect(new Set(arcCatalog.map((arc) => arc.name)).size).toBe(47);
    expect(new Set(arcCatalog.map((arc) => arc.image)).size).toBe(47);
  });

  it('keeps source and verification metadata on every Arc', () => {
    for (const arc of arcCatalog) {
      expect(arcCatalogSourceIds).toContain(arc.sourceId);
      expect(arc.verifiedAt).toBe('2026-08-04');
      expect(arc.baseAtk).toBeGreaterThan(0);
      expect(arc.secondaryValue).toBeGreaterThan(0);
      expect(arc.effect.ru.length).toBeGreaterThan(20);
      expect(arc.effect.en.length).toBeGreaterThan(20);
      expect(arc.image).toMatch(/^https:\/\/cdn\.prydwen\.gg\/images\/nte\/weapons\/\d+\.webp$/);
    }
  });

  it('uses a current independent source for The Wrong Gate', () => {
    expect(findArc('The Wrong Gate')).toMatchObject({
      rarity: 'S', type: 'Liquid', baseAtk: 570,
      secondaryLabel: 'ATK%', secondaryValue: 30,
      sourceId: 'gamewith-wrong-gate',
      image: 'https://cdn.prydwen.gg/images/nte/weapons/47.webp',
    });
    expect(findArc('Blushing Mirage')?.sourceId).toBe('prydwen-arcs');
  });

  it('preserves representative published Arc values', () => {
    expect(findArc('Blushing Mirage')).toMatchObject({
      rarity: 'S', type: 'Synthesis', baseAtk: 570,
      secondaryLabel: 'CRIT Rate', secondaryValue: 24,
      image: 'https://cdn.prydwen.gg/images/nte/weapons/46.webp',
    });
    expect(findArc('Youthful Fantasy')).toMatchObject({
      rarity: 'S', type: 'Liquid', baseAtk: 570,
      secondaryLabel: 'ATK%', secondaryValue: 30,
      image: 'https://cdn.prydwen.gg/images/nte/weapons/4.webp',
    });
  });

  it('covers every supported Arc type and rarity', () => {
    expect(new Set(arcCatalog.map((arc) => arc.rarity))).toEqual(new Set(['S', 'A', 'B']));
    expect(new Set(arcCatalog.map((arc) => arc.type))).toEqual(new Set(['Solid', 'Gas', 'Liquid', 'Plasma', 'Synthesis']));
  });
});
