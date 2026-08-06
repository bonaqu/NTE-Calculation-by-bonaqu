import { describe, expect, it } from 'vitest';
import { currentRotationGapAuditByKey, currentRotationGapAuditSummary, currentRotationMissingActionPriorities, validateCurrentRotationGapAudit } from './rotation-gap-audit-current';
import { rotationScenarioBindings } from './rotation-scenario-import';
import { verifiedVisibleActionsBatchJ } from './verified-visible-actions-batch-j';
import { verifiedVisibleActions } from './verified-visible-actions';

const byId = new Map(verifiedVisibleActionsBatchJ.map((action) => [action.id, action]));

describe('verified Lacrimosa exact action variants', () => {
  it('adds six unique level-10 records to the 107-action catalog', () => {
    expect(verifiedVisibleActionsBatchJ).toHaveLength(6);
    expect(new Set(verifiedVisibleActionsBatchJ.map((action) => action.id)).size).toBe(6);
    expect(verifiedVisibleActions).toHaveLength(107);
    expect(verifiedVisibleActionsBatchJ.every((action) => action.characterName === 'Lacrimosa')).toBe(true);
    expect(verifiedVisibleActionsBatchJ.every((action) => action.requiredLevel === 10)).toBe(true);
  });

  it('reproduces both full Basic strings without merging the projectile explosion', () => {
    expect(byId.get('lacrimosa.tomato-metal.full-direct-sequence.level-10')?.multiplier).toBeCloseTo(974.3, 8);
    expect(byId.get('lacrimosa.tomato-metal.projectile-explosion.level-10')?.multiplier).toBeCloseTo(38.8, 8);
    expect(byId.get('lacrimosa.tomato-percussion.full-sequence.level-10')?.multiplier).toBeCloseTo(1127.6, 8);
    expect(verifiedVisibleActionsBatchJ.find((action) => action.id.includes('full-direct'))?.description.ru).toContain('хранится отдельно');
  });

  it('keeps melee and ranged fifth attacks separate from Morning Tomato', () => {
    expect(byId.get('lacrimosa.tomato-metal.fifth.level-10')?.multiplier).toBeCloseTo(386.3, 8);
    expect(byId.get('lacrimosa.tomato-percussion.fifth.level-10')?.multiplier).toBeCloseTo(247.7, 8);
    expect(byId.get('lacrimosa.morning-tomato.level-10')?.multiplier).toBeCloseTo(599.7, 8);
    expect(byId.get('lacrimosa.morning-tomato.level-10')?.requiredSkill).toBe('skill');
  });

  it('does not substitute Discord Enhancement or create unsafe Rotation Lab bindings', () => {
    expect(verifiedVisibleActionsBatchJ.some((action) => action.id.includes('discord-enhancement'))).toBe(false);
    for (const stepId of ['lacrimosa-transform', 'lacrimosa-basic-five', 'lacrimosa-redirect-five']) {
      expect(rotationScenarioBindings[`lacrimosa-discord-dot:${stepId}`]).toBeUndefined();
      expect(currentRotationGapAuditByKey.get(`lacrimosa-discord-dot:${stepId}`)?.classification).toBe('ambiguous-source-step');
    }
  });

  it('keeps Lacrimosa ambiguity while Phantom Step reduces the current gap total', () => {
    expect(validateCurrentRotationGapAudit()).toEqual([]);
    expect(currentRotationGapAuditSummary).toMatchObject({
      baselineTotal: 41,
      resolvedSinceBaseline: 16,
      total: 25,
      missingActionRecord: 9,
      ambiguousSourceStep: 5,
      verifiedActionCatalogCount: 107,
    });
    expect(currentRotationMissingActionPriorities.map((item) => item.characterName)).toEqual(['Zero']);
  });

  it('retains complete current source provenance', () => {
    for (const action of verifiedVisibleActionsBatchJ) {
      expect(action.sourcePublisher).toBe('Icy Veins');
      expect(action.sourceUrl).toBe('https://www.icy-veins.com/neverness-to-everness/lacrimosa-profile-skills');
      expect(action.sourceUpdatedAt).toBe('2026-07-07');
      expect(action.verifiedAt).toBe('2026-08-06');
    }
  });
});
