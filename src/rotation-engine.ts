import type { TeamMemberInput } from '../packages/calculation-core/src';
import { characterByName, characterCatalog, canonicalCharacterName } from './characters';
import { esperCycleById, esperCycles } from './esper-cycles';
import type { CharacterAttribute, EsperCycleDefinition, RotationPreset } from './types';

export interface RotationValidationResult {
  valid: boolean;
  errors: string[];
}

function attributeSet(teamNames: string[]): Set<CharacterAttribute> {
  const attributes = new Set<CharacterAttribute>();
  teamNames.forEach((name) => {
    const canonical = canonicalCharacterName(name);
    const character = canonical ? characterByName.get(canonical) : undefined;
    if (character) attributes.add(character.attribute);
  });
  return attributes;
}

export function availableEsperCycles(teamNames: string[]): EsperCycleDefinition[] {
  const attributes = attributeSet(teamNames);
  return esperCycles.filter((cycle) => cycle.attributes.every((attribute) => attributes.has(attribute)));
}

export function validateRotationPreset(preset: RotationPreset): RotationValidationResult {
  const errors: string[] = [];
  const canonicalTeam = preset.team.map((name) => canonicalCharacterName(name));
  const resolvedTeam = canonicalTeam.filter((name): name is string => Boolean(name));
  if (preset.team.length !== 4) errors.push(`Preset ${preset.id} must contain exactly four characters.`);
  if (resolvedTeam.length !== preset.team.length) errors.push(`Preset ${preset.id} contains an unknown character.`);
  if (new Set(resolvedTeam).size !== resolvedTeam.length) errors.push(`Preset ${preset.id} contains duplicate characters.`);
  if (!preset.sourceUrl || !preset.sourcePublisher || !preset.sourceUpdatedAt || !preset.verifiedAt) errors.push(`Preset ${preset.id} has incomplete source metadata.`);
  if (preset.steps.length === 0) errors.push(`Preset ${preset.id} has no rotation steps.`);
  const available = new Set(availableEsperCycles(resolvedTeam).map((cycle) => cycle.id));
  preset.cyclePlan.forEach((cycleId) => {
    if (!esperCycleById.has(cycleId)) errors.push(`Preset ${preset.id} references unknown cycle ${cycleId}.`);
    else if (!available.has(cycleId)) errors.push(`Preset ${preset.id} cannot form declared cycle ${cycleId}.`);
  });
  const stepIds = new Set<string>();
  preset.steps.forEach((step) => {
    if (stepIds.has(step.id)) errors.push(`Preset ${preset.id} repeats step id ${step.id}.`);
    stepIds.add(step.id);
    if (!resolvedTeam.includes(step.actor)) errors.push(`Step ${step.id} uses actor ${step.actor} outside the preset team.`);
    if (!step.instruction.ru || !step.instruction.en || !step.outcome.ru || !step.outcome.en) errors.push(`Step ${step.id} is missing bilingual text.`);
    if (step.cycle && !available.has(step.cycle)) errors.push(`Step ${step.id} references unavailable cycle ${step.cycle}.`);
  });
  return { valid: errors.length === 0, errors };
}

export function applyTeamIdentities(members: TeamMemberInput[], teamNames: string[]): TeamMemberInput[] {
  return members.slice(0, 4).map((member, index) => {
    const requestedName = canonicalCharacterName(teamNames[index] ?? '') ?? member.name;
    const character = characterByName.get(requestedName);
    return { ...member, id: character?.id ?? member.id, name: character?.name ?? member.name };
  });
}

export function normalizeExplorerTeam(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const result: string[] = [];
  value.forEach((entry) => {
    if (typeof entry !== 'string') return;
    const canonical = canonicalCharacterName(entry);
    if (canonical && !result.includes(canonical)) result.push(canonical);
  });
  for (const fallbackName of fallback) {
    const canonical = canonicalCharacterName(fallbackName);
    if (canonical && !result.includes(canonical)) result.push(canonical);
    if (result.length === 4) return result;
  }
  for (const character of characterCatalog) {
    if (!result.includes(character.name)) result.push(character.name);
    if (result.length === 4) break;
  }
  return result.slice(0, 4);
}

export function normalizePresetProgress(value: unknown, validPresetIds: Set<string>, validStepIds: Map<string, Set<string>>): Record<string, string[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const normalized: Record<string, string[]> = {};
  Object.entries(value as Record<string, unknown>).forEach(([presetId, stepValue]) => {
    if (!validPresetIds.has(presetId) || !Array.isArray(stepValue)) return;
    const allowed = validStepIds.get(presetId) ?? new Set<string>();
    normalized[presetId] = [...new Set(stepValue.filter((step): step is string => typeof step === 'string' && allowed.has(step)))];
  });
  return normalized;
}
