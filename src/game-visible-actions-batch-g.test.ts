import { describe, expect, it } from 'vitest';
import { verifiedVisibleActionsBatchG } from './verified-visible-actions-batch-g';
import { visibleActionById, verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchG.map((action) => [action.id, action]));

describe('verified Shinku direct actions', () => {
  it('adds five unique level-10 actions to the shared catalog', () => {
    expect(verifiedVisibleActionsBatchG).toHaveLength(5);
    expect(new Set(verifiedVisibleActionsBatchG.map((action) => action.id)).size).toBe(5);
    expect(verifiedVisibleActions).toHaveLength(91);
    expect(verifiedVisibleActionsBatchG.every((action) => action.characterName === 'Shinku')).toBe(true);
    expect(verifiedVisibleActionsBatchG.every((action) => action.requiredLevel === 10)).toBe(true);
    expect(verifiedVisibleActionsBatchG.every((action) => visibleActionById.get(action.id) === action)).toBe(true);
  });

  it('reproduces High-Speed Breach and one Scarlet Descent from published components', () => {
    expect(byId.get('shinku.high-speed-breach.level-10')).toMatchObject({
      multiplier: 239.9,
      requiredSkill: 'skill',
      requiredLevel: 10,
    });
    expect(byId.get('shinku.scarlet-descent.level-10')).toMatchObject({
      multiplier: 479.8,
      requiredSkill: 'skill',
      requiredLevel: 10,
    });
    expect(34.6 + 46.2 + 159.1).toBeCloseTo(239.9, 10);
    expect(44.8 + 435).toBeCloseTo(479.8, 10);
  });

  it('keeps Crimson Fury entry damage separate from its 13-second state', () => {
    const action = byId.get('shinku.crimson-fury.level-10');
    expect(action).toMatchObject({
      multiplier: 1199.3,
      requiredSkill: 'ultimate',
      requiredLevel: 10,
    });
    expect(37 + 239.9 + 109.9 * 5 + 287.9 + 85).toBeCloseTo(1199.3, 10);
    expect(action?.description.ru).toContain('только прямой входной урон');
    expect(action?.description.en).toContain('The following 13-second state is modeled separately');
  });

  it('models one Crimson Judgment dash and the finisher as separate actions', () => {
    expect(byId.get('shinku.crimson-judgment.one-dash.level-10')).toMatchObject({
      multiplier: 479.6,
      requiredSkill: 'ultimate',
    });
    expect(byId.get('shinku.dragonflame-verdict.level-10')).toMatchObject({
      multiplier: 1199.6,
      requiredSkill: 'ultimate',
    });
    expect(119.9 * 4).toBeCloseTo(479.6, 10);
    expect(40 * 10 + 799.6).toBeCloseTo(1199.6, 10);
  });

  it('does not bake Surging Crimson, Awakening 6 or fixed rotation counts into one record', () => {
    const scarlet = byId.get('shinku.scarlet-descent.level-10');
    const dash = byId.get('shinku.crimson-judgment.one-dash.level-10');
    const verdict = byId.get('shinku.dragonflame-verdict.level-10');
    expect(scarlet?.multiplier).toBeCloseTo(479.8, 10);
    expect(dash?.multiplier).toBeCloseTo(479.6, 10);
    expect(verdict?.multiplier).toBeCloseTo(1199.6, 10);
    expect(scarlet?.description.ru).toContain('не вшиты');
    expect(scarlet?.assumedConditions?.some((condition) => condition.ru.includes('ровно одно'))).toBe(true);
    expect(dash?.description.ru).toContain('Один подтверждённый экземпляр');
  });

  it('keeps current English ability names and complete source provenance', () => {
    for (const action of verifiedVisibleActionsBatchG) {
      expect(action.title.ru).toMatch(/High-Speed Breach|Scarlet Descent|Crimson Fury|Crimson Judgment|Dragonflame Verdict/u);
      expect(action.sourcePublisher).toBe('Icy Veins');
      expect(action.sourceUrl).toBe('https://www.icy-veins.com/neverness-to-everness/shinku-profile-skills');
      expect(action.sourceUpdatedAt).toBe('2026-07-31');
      expect(action.verifiedAt).toBe('2026-08-06');
    }
  });
});
