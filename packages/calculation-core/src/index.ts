export interface EnemyProfile {
  level: number;
  resistance: number;
  defenceReduction: number;
  resistanceReduction: number;
}

export interface DamageInput {
  characterLevel: number;
  baseAtk: number;
  arcAtk: number;
  flatAtk: number;
  atkPercent: number;
  teamAtkPercent: number;
  skillMultiplier: number;
  hits: number;
  damageBonus: number;
  teamDamageBonus: number;
  critRate: number;
  critDamage: number;
  enemy: EnemyProfile;
}

export interface DamageResult {
  totalAtk: number;
  nonCrit: number;
  crit: number;
  expected: number;
  defenceMultiplier: number;
  resistanceMultiplier: number;
  expectedCritMultiplier: number;
}

export interface TeamMemberInput extends DamageInput {
  id: string;
  name: string;
  actionsPerRotation: number;
}

export interface TeamResult {
  totalDamage: number;
  dps: number;
  duration: number;
  members: Array<DamageResult & { id: string; name: string; rotationDamage: number; share: number }>;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const finite = (value: number, fallback = 0): number => Number.isFinite(value) ? value : fallback;

export function defenceMultiplier(characterLevel: number, enemyLevel: number, defenceReduction: number): number {
  const attacker = clamp(finite(characterLevel, 80), 1, 100) + 100;
  const defender = clamp(finite(enemyLevel, 80), 1, 200) + 100;
  const reduction = clamp(finite(defenceReduction), 0, 100) / 100;
  return attacker / (attacker + defender * (1 - reduction));
}

export function resistanceMultiplier(resistance: number, reduction: number): number {
  const effectiveResistance = finite(resistance) - finite(reduction);
  return Math.max(0, 1 - effectiveResistance / 100);
}

export function calculateDamage(input: DamageInput): DamageResult {
  const totalAtk = Math.max(
    0,
    (finite(input.baseAtk) + finite(input.arcAtk)) *
      (1 + (finite(input.atkPercent) + finite(input.teamAtkPercent)) / 100) +
      finite(input.flatAtk),
  );
  const skill = Math.max(0, finite(input.skillMultiplier)) / 100;
  const hits = Math.max(0, finite(input.hits, 1));
  const bonus = 1 + (finite(input.damageBonus) + finite(input.teamDamageBonus)) / 100;
  const def = defenceMultiplier(input.characterLevel, input.enemy.level, input.enemy.defenceReduction);
  const res = resistanceMultiplier(input.enemy.resistance, input.enemy.resistanceReduction);
  const nonCrit = totalAtk * skill * hits * Math.max(0, bonus) * def * res;
  const critRate = clamp(finite(input.critRate), 0, 100) / 100;
  const critBonus = Math.max(0, finite(input.critDamage)) / 100;
  const crit = nonCrit * (1 + critBonus);
  const expectedCritMultiplier = 1 + critRate * critBonus;
  const expected = nonCrit * expectedCritMultiplier;
  return { totalAtk, nonCrit, crit, expected, defenceMultiplier: def, resistanceMultiplier: res, expectedCritMultiplier };
}

export function calculateTeam(members: TeamMemberInput[], duration: number): TeamResult {
  const safeDuration = Math.max(1, finite(duration, 30));
  const calculated = members.map((member) => {
    const result = calculateDamage(member);
    const rotationDamage = result.expected * Math.max(0, finite(member.actionsPerRotation, 1));
    return { ...result, id: member.id, name: member.name, rotationDamage };
  });
  const totalDamage = calculated.reduce((sum, member) => sum + member.rotationDamage, 0);
  return {
    totalDamage,
    dps: totalDamage / safeDuration,
    duration: safeDuration,
    members: calculated.map((member) => ({
      ...member,
      share: totalDamage > 0 ? member.rotationDamage / totalDamage : 0,
    })),
  };
}

export interface ArcModifierSet {
  atkPercent: number;
  critRate: number;
  critDamage: number;
  damageBonus: number;
  allyDamageBonus: number;
}

export interface ArcModelInput {
  id: string;
  name: string;
  arcAtk: number;
  static: ArcModifierSet;
  conditional: ArcModifierSet;
  conditionalUptime: number;
}

export interface ArcTeamComparisonResult extends ArcModelInput, DamageResult {
  wearerDamage: number;
  allyDamage: number;
  teamDamage: number;
  relative: number;
}

const scaledModifiers = (arc: ArcModelInput): ArcModifierSet => {
  const uptime = clamp(finite(arc.conditionalUptime), 0, 100) / 100;
  return {
    atkPercent: finite(arc.static.atkPercent) + finite(arc.conditional.atkPercent) * uptime,
    critRate: finite(arc.static.critRate) + finite(arc.conditional.critRate) * uptime,
    critDamage: finite(arc.static.critDamage) + finite(arc.conditional.critDamage) * uptime,
    damageBonus: finite(arc.static.damageBonus) + finite(arc.conditional.damageBonus) * uptime,
    allyDamageBonus: finite(arc.static.allyDamageBonus) + finite(arc.conditional.allyDamageBonus) * uptime,
  };
};

export function compareArcTeams(
  base: Omit<DamageInput, 'arcAtk' | 'atkPercent' | 'critRate' | 'critDamage' | 'damageBonus'> & {
    atkPercent: number;
    critRate: number;
    critDamage: number;
    damageBonus: number;
  },
  arcs: ArcModelInput[],
  fixedAllyDamage: number,
): ArcTeamComparisonResult[] {
  const safeAllyDamage = Math.max(0, finite(fixedAllyDamage));
  const rows = arcs.map((arc) => {
    const modifiers = scaledModifiers(arc);
    const result = calculateDamage({
      ...base,
      arcAtk: arc.arcAtk,
      atkPercent: finite(base.atkPercent) + modifiers.atkPercent,
      critRate: finite(base.critRate) + modifiers.critRate,
      critDamage: finite(base.critDamage) + modifiers.critDamage,
      damageBonus: finite(base.damageBonus) + modifiers.damageBonus,
    });
    const allyDamage = safeAllyDamage * Math.max(0, 1 + modifiers.allyDamageBonus / 100);
    const wearerDamage = result.expected;
    const teamDamage = wearerDamage + allyDamage;
    return { ...arc, ...result, wearerDamage, allyDamage, teamDamage, relative: 0 };
  });
  const best = rows.reduce((max, row) => Math.max(max, row.teamDamage), 0);
  return rows
    .map((row) => ({ ...row, relative: best > 0 ? row.teamDamage / best : 0 }))
    .sort((a, b) => b.teamDamage - a.teamDamage);
}
