import type { EnemyProfile, TeamMemberInput } from '../packages/calculation-core/src';
import { effectiveAtk, totalMultiplierPerUse } from './state/teamForm';

export type TeamReadinessStatus = 'sample' | 'incomplete' | 'unchecked' | 'checked';
export type TeamMemberCheckField = 'effectiveAtk' | 'totalMultiplier' | 'uses' | 'critRate' | 'critDamage';
export type TeamGlobalCheckField = 'memberCount' | 'uniqueCharacters' | 'duration' | 'enemyLevel' | 'enemyNumbers';

export interface TeamInputCheck<T extends string> {
  field: T;
  valid: boolean;
}

export interface TeamMemberReadiness {
  index: number;
  name: string;
  checks: readonly TeamInputCheck<TeamMemberCheckField>[];
}

export interface TeamReadinessIssue {
  scope: 'member' | 'global';
  field: TeamMemberCheckField | TeamGlobalCheckField;
  memberIndex?: number;
}

export interface TeamReadinessReport {
  status: TeamReadinessStatus;
  digest: string;
  sample: boolean;
  canConfirm: boolean;
  issues: readonly TeamReadinessIssue[];
  memberChecks: readonly TeamMemberReadiness[];
  globalChecks: readonly TeamInputCheck<TeamGlobalCheckField>[];
}

const makeMember = (id: string, name: string, baseAtk: number, multiplier: number, actions: number): TeamMemberInput => ({
  id,
  name,
  characterLevel: 80,
  baseAtk,
  arcAtk: 500,
  flatAtk: 250,
  atkPercent: 65,
  teamAtkPercent: 15,
  skillMultiplier: multiplier,
  hits: 1,
  damageBonus: 30,
  teamDamageBonus: 15,
  critRate: 60,
  critDamage: 120,
  actionsPerRotation: actions,
  enemy: { level: 82, resistance: 20, defenceReduction: 10, resistanceReduction: 0 },
});

export const sampleTeamMembers: readonly TeamMemberInput[] = [
  makeMember('shinku', 'Shinku', 1550, 900, 3),
  makeMember('iroi', 'Iroi', 1450, 420, 2),
  makeMember('hathor', 'Hathor', 1400, 520, 2),
  makeMember('zero', 'Zero', 1300, 300, 2),
];

export const sampleTeamEnemy: EnemyProfile = {
  level: 82,
  resistance: 20,
  defenceReduction: 10,
  resistanceReduction: 0,
};

export const sampleTeamDuration = 35;

const finiteNumber = (value: number): boolean => Number.isFinite(value);
const positive = (value: number): boolean => finiteNumber(value) && value > 0;
const nonNegative = (value: number): boolean => finiteNumber(value) && value >= 0;

function digestNumber(value: number): number | string {
  return finiteNumber(value) ? Number(value.toFixed(8)) : String(value);
}

function digestMember(member: TeamMemberInput) {
  return {
    id: member.id,
    name: member.name,
    characterLevel: digestNumber(member.characterLevel),
    baseAtk: digestNumber(member.baseAtk),
    arcAtk: digestNumber(member.arcAtk),
    flatAtk: digestNumber(member.flatAtk),
    atkPercent: digestNumber(member.atkPercent),
    teamAtkPercent: digestNumber(member.teamAtkPercent),
    skillMultiplier: digestNumber(member.skillMultiplier),
    hits: digestNumber(member.hits),
    damageBonus: digestNumber(member.damageBonus),
    teamDamageBonus: digestNumber(member.teamDamageBonus),
    critRate: digestNumber(member.critRate),
    critDamage: digestNumber(member.critDamage),
    actionsPerRotation: digestNumber(member.actionsPerRotation),
  };
}

/**
 * Stable snapshot identity for every value that can affect the team result or
 * its character attribution. Display-only UI state is intentionally excluded.
 */
export function teamInputDigest(
  members: readonly TeamMemberInput[],
  duration: number,
  enemy: EnemyProfile,
): string {
  return JSON.stringify({
    members: members.map(digestMember),
    duration: digestNumber(duration),
    enemy: {
      level: digestNumber(enemy.level),
      resistance: digestNumber(enemy.resistance),
      defenceReduction: digestNumber(enemy.defenceReduction),
      resistanceReduction: digestNumber(enemy.resistanceReduction),
    },
  });
}

export function teamMemberReadiness(member: TeamMemberInput, index: number): TeamMemberReadiness {
  return {
    index,
    name: member.name,
    checks: [
      { field: 'effectiveAtk', valid: positive(effectiveAtk(member)) },
      { field: 'totalMultiplier', valid: positive(totalMultiplierPerUse(member)) },
      { field: 'uses', valid: positive(member.actionsPerRotation) },
      { field: 'critRate', valid: finiteNumber(member.critRate) && member.critRate >= 0 && member.critRate <= 100 },
      { field: 'critDamage', valid: nonNegative(member.critDamage) },
    ],
  };
}

export function teamGlobalReadiness(
  members: readonly TeamMemberInput[],
  duration: number,
  enemy: EnemyProfile,
): readonly TeamInputCheck<TeamGlobalCheckField>[] {
  const uniqueNames = new Set(members.map((member) => member.name));
  return [
    { field: 'memberCount', valid: members.length === 4 },
    { field: 'uniqueCharacters', valid: members.length === 4 && uniqueNames.size === 4 },
    { field: 'duration', valid: positive(duration) },
    { field: 'enemyLevel', valid: positive(enemy.level) },
    {
      field: 'enemyNumbers',
      valid: finiteNumber(enemy.resistance)
        && finiteNumber(enemy.defenceReduction)
        && finiteNumber(enemy.resistanceReduction),
    },
  ];
}

export function evaluateTeamReadiness(
  members: readonly TeamMemberInput[],
  duration: number,
  enemy: EnemyProfile,
  confirmedDigest = '',
): TeamReadinessReport {
  const digest = teamInputDigest(members, duration, enemy);
  const sampleDigest = teamInputDigest(sampleTeamMembers, sampleTeamDuration, sampleTeamEnemy);
  const sample = digest === sampleDigest;
  const memberChecks = members.map(teamMemberReadiness);
  const globalChecks = teamGlobalReadiness(members, duration, enemy);
  const issues: TeamReadinessIssue[] = [
    ...memberChecks.flatMap((member) => member.checks
      .filter((check) => !check.valid)
      .map((check) => ({ scope: 'member' as const, field: check.field, memberIndex: member.index }))),
    ...globalChecks
      .filter((check) => !check.valid)
      .map((check) => ({ scope: 'global' as const, field: check.field })),
  ];

  const status: TeamReadinessStatus = sample
    ? 'sample'
    : issues.length > 0
      ? 'incomplete'
      : confirmedDigest === digest
        ? 'checked'
        : 'unchecked';

  return {
    status,
    digest,
    sample,
    canConfirm: !sample && issues.length === 0,
    issues,
    memberChecks,
    globalChecks,
  };
}

/**
 * Clear only player-specific combat values. Character identities and levels are
 * retained so existing selections remain useful and the v2 storage shape stays intact.
 */
export function emptyTeamInputs(
  members: readonly TeamMemberInput[],
  enemy: EnemyProfile,
): TeamMemberInput[] {
  return members.map((member) => ({
    ...member,
    baseAtk: 0,
    arcAtk: 0,
    flatAtk: 0,
    atkPercent: 0,
    teamAtkPercent: 0,
    skillMultiplier: 0,
    hits: 1,
    damageBonus: 0,
    teamDamageBonus: 0,
    critRate: 0,
    critDamage: 0,
    actionsPerRotation: 0,
    enemy,
  }));
}
