import type { EnemyProfile, TeamMemberInput } from '../packages/calculation-core/src';

export function makeDefaultMember(id: string, name: string, baseAtk: number, multiplier: number, actions: number): TeamMemberInput {
  return {
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
  };
}

export const defaultMembers: TeamMemberInput[] = [
  makeDefaultMember('shinku', 'Shinku', 1550, 900, 3),
  makeDefaultMember('iroi', 'Iroi', 1450, 420, 2),
  makeDefaultMember('hathor', 'Hathor', 1400, 520, 2),
  makeDefaultMember('zero', 'Zero', 1300, 300, 2),
];

export const defaultEnemy: EnemyProfile = {
  level: 82,
  resistance: 20,
  defenceReduction: 10,
  resistanceReduction: 0,
};
