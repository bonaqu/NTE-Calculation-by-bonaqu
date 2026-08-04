import { describe, expect, it } from 'vitest';
import { calculateTeam, type TeamMemberInput } from '../packages/calculation-core/src';
import {
  applyAttackSequence,
  createAttackSequenceDraft,
  emptyAttackSequenceStore,
  evaluateAttackSequence,
  MAX_ATTACK_SEQUENCE_COMPONENTS,
  nextAttackSequenceComponentId,
  normalizeAttackSequenceStore,
  updateAttackSequenceDraft,
  type AttackSequenceDraft,
} from './team-sequence-builder';

const member = (overrides: Partial<TeamMemberInput> = {}): TeamMemberInput => ({
  id: 'zero',
  name: 'Zero',
  characterLevel: 80,
  baseAtk: 1_000,
  arcAtk: 0,
  flatAtk: 0,
  atkPercent: 0,
  teamAtkPercent: 0,
  skillMultiplier: 100,
  hits: 1,
  damageBonus: 0,
  teamDamageBonus: 0,
  critRate: 0,
  critDamage: 0,
  enemy: { level: 80, resistance: 0, defenceReduction: 0, resistanceReduction: 0 },
  actionsPerRotation: 1,
  ...overrides,
});

const draft = (overrides: Partial<AttackSequenceDraft> = {}): AttackSequenceDraft => ({
  components: [
    { id: 'skill', label: 'Навык', multiplierPerHit: 120, identicalHits: 1 },
    { id: 'follow-up', label: 'Дополнительные удары', multiplierPerHit: 90, identicalHits: 3 },
    { id: 'finisher', label: 'Финал', multiplierPerHit: 180, identicalHits: 1 },
  ],
  usesPerRotation: 2,
  ...overrides,
});

describe('team attack sequence builder', () => {
  it('adds heterogeneous rows and multiplies only identical hits inside each row', () => {
    const result = evaluateAttackSequence(draft());
    expect(result.valid).toBe(true);
    expect(result.rows.map((row) => row.subtotalPerUse)).toEqual([120, 270, 180]);
    expect(result.totalMultiplierPerUse).toBe(570);
    expect(result.totalMultiplierPerRotation).toBe(1_140);
  });

  it('flattens a valid sequence to one virtual hit and preserves the team result', () => {
    const original = member({ skillMultiplier: 57, hits: 10, actionsPerRotation: 2 });
    const application = applyAttackSequence(original, draft());
    expect(application.applied).toBe(true);
    expect(application.member).toMatchObject({ skillMultiplier: 570, hits: 1, actionsPerRotation: 2 });

    const expandedEquivalent = member({ skillMultiplier: 57, hits: 10, actionsPerRotation: 2 });
    const flattened = application.member as TeamMemberInput;
    expect(calculateTeam([flattened], 30).totalDamage)
      .toBeCloseTo(calculateTeam([expandedEquivalent], 30).totalDamage, 10);
  });

  it('does not apply any part of an invalid draft', () => {
    const original = member({ skillMultiplier: 333, hits: 2, actionsPerRotation: 4 });
    const invalid = draft({
      components: [
        { id: 'empty', label: '', multiplierPerHit: 120, identicalHits: 1 },
        { id: 'bad-hits', label: 'Bad hits', multiplierPerHit: 80, identicalHits: 1.5 },
      ],
    });
    const application = applyAttackSequence(original, invalid);
    expect(application.applied).toBe(false);
    expect(application.member).toBe(original);
    expect(application.evaluation.errors).toEqual([
      expect.objectContaining({ code: 'empty-label', componentId: 'empty', componentIndex: 0 }),
      expect.objectContaining({ code: 'invalid-hits', componentId: 'bad-hits', componentIndex: 1 }),
    ]);
  });

  it('reports invalid uses, empty rows and a zero-total sequence explicitly', () => {
    const empty = evaluateAttackSequence({ components: [], usesPerRotation: 0 });
    expect(empty.valid).toBe(false);
    expect(empty.errors.map((error) => error.code)).toEqual(['no-components', 'invalid-uses']);

    const zero = evaluateAttackSequence({
      components: [{ id: 'zero', label: 'Zero row', multiplierPerHit: 0, identicalHits: 1 }],
      usesPerRotation: 1,
    });
    expect(zero.errors.map((error) => error.code)).toEqual(['zero-total']);
  });

  it('rejects non-finite/negative multipliers and non-positive hit counts', () => {
    const result = evaluateAttackSequence({
      components: [
        { id: 'negative', label: 'Negative', multiplierPerHit: -1, identicalHits: 1 },
        { id: 'nan', label: 'NaN', multiplierPerHit: Number.NaN, identicalHits: 1 },
        { id: 'hits', label: 'Hits', multiplierPerHit: 100, identicalHits: 0 },
      ],
      usesPerRotation: 1,
    });
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'invalid-multiplier', componentId: 'negative' }),
      expect.objectContaining({ code: 'invalid-multiplier', componentId: 'nan' }),
      expect.objectContaining({ code: 'invalid-hits', componentId: 'hits' }),
    ]);
  });

  it('enforces the practical row limit', () => {
    const components = Array.from({ length: MAX_ATTACK_SEQUENCE_COMPONENTS + 1 }, (_, index) => ({
      id: `row-${index}`,
      label: `Row ${index}`,
      multiplierPerHit: 1,
      identicalHits: 1,
    }));
    const result = evaluateAttackSequence({ components, usesPerRotation: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({ code: 'too-many-components' });
    expect(result.rows).toHaveLength(MAX_ATTACK_SEQUENCE_COMPONENTS);
  });

  it('creates a safe initial draft from the current quick multiplier', () => {
    const seeded = createAttackSequenceDraft(member({ skillMultiplier: 120, hits: 3, actionsPerRotation: 2.5 }), 'Current sequence');
    expect(seeded).toEqual({
      components: [{ id: 'action-1', label: 'Current sequence', multiplierPerHit: 360, identicalHits: 1 }],
      usesPerRotation: 2.5,
    });
  });

  it('normalizes separate draft storage without touching team state', () => {
    const normalized = normalizeAttackSequenceStore({
      version: 1,
      drafts: {
        Zero: {
          components: [{ id: '', label: '  Skill   hit ', multiplierPerHit: 120, identicalHits: 3.8 }],
          usesPerRotation: 2,
        },
        Broken: 'not-a-draft',
      },
    });
    expect(normalized).toEqual({
      version: 1,
      drafts: {
        Zero: {
          components: [{ id: 'action-1', label: 'Skill hit', multiplierPerHit: 120, identicalHits: 3 }],
          usesPerRotation: 2,
        },
      },
    });
    expect(normalizeAttackSequenceStore({ version: 2, drafts: {} })).toBeNull();
  });

  it('updates one character draft and preserves unrelated drafts', () => {
    const store = updateAttackSequenceDraft(emptyAttackSequenceStore(), 'Zero', draft());
    const next = updateAttackSequenceDraft(store, 'Hathor', {
      components: [{ id: 'a', label: 'Ultimate', multiplierPerHit: 500, identicalHits: 1 }],
      usesPerRotation: 1,
    });
    expect(Object.keys(next.drafts)).toEqual(['Zero', 'Hathor']);
    expect(next.drafts.Zero).toEqual(store.drafts.Zero);
  });

  it('generates the first unused stable row id', () => {
    expect(nextAttackSequenceComponentId([])).toBe('action-1');
    expect(nextAttackSequenceComponentId([
      { id: 'action-1', label: 'A', multiplierPerHit: 1, identicalHits: 1 },
      { id: 'action-3', label: 'B', multiplierPerHit: 1, identicalHits: 1 },
    ])).toBe('action-2');
  });
});
