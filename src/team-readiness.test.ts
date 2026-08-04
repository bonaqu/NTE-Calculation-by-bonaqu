import { describe, expect, it } from 'vitest';
import {
  emptyTeamInputs,
  evaluateTeamReadiness,
  sampleTeamDuration,
  sampleTeamEnemy,
  sampleTeamMembers,
  teamInputDigest,
} from './team-readiness';

describe('team calculation readiness', () => {
  it('recognizes the exact shipped values as sample data', () => {
    const report = evaluateTeamReadiness(sampleTeamMembers, sampleTeamDuration, sampleTeamEnemy);
    expect(report.status).toBe('sample');
    expect(report.sample).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.canConfirm).toBe(false);
  });

  it('treats valid edited values as complete but unchecked', () => {
    const members = sampleTeamMembers.map((member, index) => index === 0
      ? { ...member, baseAtk: member.baseAtk + 1 }
      : { ...member });
    const report = evaluateTeamReadiness(members, sampleTeamDuration, sampleTeamEnemy);
    expect(report.status).toBe('unchecked');
    expect(report.sample).toBe(false);
    expect(report.issues).toEqual([]);
    expect(report.canConfirm).toBe(true);
  });

  it('checks only the exact confirmed formula snapshot', () => {
    const members = sampleTeamMembers.map((member, index) => index === 1
      ? { ...member, skillMultiplier: member.skillMultiplier + 25 }
      : { ...member });
    const digest = teamInputDigest(members, sampleTeamDuration, sampleTeamEnemy);
    expect(evaluateTeamReadiness(members, sampleTeamDuration, sampleTeamEnemy, digest).status).toBe('checked');

    const changed = members.map((member, index) => index === 1
      ? { ...member, actionsPerRotation: member.actionsPerRotation + 1 }
      : { ...member });
    expect(evaluateTeamReadiness(changed, sampleTeamDuration, sampleTeamEnemy, digest).status).toBe('unchecked');
  });

  it('reports missing member and global inputs without inventing valid values', () => {
    const empty = emptyTeamInputs(sampleTeamMembers, sampleTeamEnemy);
    const report = evaluateTeamReadiness(empty, 0, { ...sampleTeamEnemy, level: 0 });
    expect(report.status).toBe('incomplete');
    expect(report.canConfirm).toBe(false);
    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ scope: 'member', memberIndex: 0, field: 'effectiveAtk' }),
      expect.objectContaining({ scope: 'member', memberIndex: 0, field: 'totalMultiplier' }),
      expect.objectContaining({ scope: 'member', memberIndex: 0, field: 'uses' }),
      expect.objectContaining({ scope: 'global', field: 'duration' }),
      expect.objectContaining({ scope: 'global', field: 'enemyLevel' }),
    ]));
  });

  it('rejects invalid crit values and non-finite enemy values', () => {
    const members = sampleTeamMembers.map((member, index) => index === 2
      ? { ...member, critRate: 120, critDamage: -5 }
      : { ...member });
    const report = evaluateTeamReadiness(members, sampleTeamDuration, {
      ...sampleTeamEnemy,
      resistance: Number.NaN,
    });
    expect(report.status).toBe('incomplete');
    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ memberIndex: 2, field: 'critRate' }),
      expect.objectContaining({ memberIndex: 2, field: 'critDamage' }),
      expect.objectContaining({ scope: 'global', field: 'enemyNumbers' }),
    ]));
  });

  it('clears combat values while preserving selected identities and levels', () => {
    const empty = emptyTeamInputs(sampleTeamMembers, sampleTeamEnemy);
    expect(empty.map((member) => member.name)).toEqual(sampleTeamMembers.map((member) => member.name));
    expect(empty.map((member) => member.characterLevel)).toEqual(sampleTeamMembers.map((member) => member.characterLevel));
    expect(empty.every((member) => member.baseAtk === 0 && member.skillMultiplier === 0 && member.actionsPerRotation === 0)).toBe(true);
    expect(empty.every((member) => member.hits === 1)).toBe(true);
  });

  it('requires exactly four unique characters', () => {
    const duplicate = sampleTeamMembers.map((member) => ({ ...member }));
    const first = duplicate[0];
    const fourth = duplicate[3];
    expect(first).toBeDefined();
    expect(fourth).toBeDefined();
    if (!first || !fourth) throw new Error('Sample team must contain four members');
    duplicate[3] = { ...fourth, name: first.name };

    const report = evaluateTeamReadiness(duplicate, sampleTeamDuration, sampleTeamEnemy);
    expect(report.status).toBe('incomplete');
    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ scope: 'global', field: 'uniqueCharacters' }),
    ]));
  });
});
