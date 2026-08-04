import { awakeningNodes, type AwakeningNode } from './awakening-data';
import { jiuyuanAwakeningNodes } from './awakening-data-batch-b';
import { supportAwakeningNodes } from './support-awakening-data';
import type { VerifiedTeamEffectId } from './team-effects';

export interface TeamEffectAwakeningRequirement {
  effectId: VerifiedTeamEffectId;
  characterName: string;
  level: AwakeningNode['level'];
}

export const allAwakeningNodes: readonly AwakeningNode[] = [
  ...awakeningNodes,
  ...supportAwakeningNodes,
  ...jiuyuanAwakeningNodes,
];

export const awakeningReferenceByCharacter = new Map<string, readonly AwakeningNode[]>(
  [...new Set(allAwakeningNodes.map((node) => node.characterName))].map((characterName) => [
    characterName,
    allAwakeningNodes
      .filter((node) => node.characterName === characterName)
      .sort((left, right) => left.level - right.level),
  ]),
);

export const teamEffectAwakeningRequirements: readonly TeamEffectAwakeningRequirement[] = [
  {
    effectId: 'sakiri.awakening-four.team-atk',
    characterName: 'Sakiri',
    level: 4,
  },
];

const teamEffectRequirementById = new Map(
  teamEffectAwakeningRequirements.map((requirement) => [requirement.effectId, requirement]),
);

export function awakeningNodesForCharacter(characterName: string): readonly AwakeningNode[] {
  return awakeningReferenceByCharacter.get(characterName) ?? [];
}

export function teamEffectIdsForAwakeningNode(node: AwakeningNode): readonly VerifiedTeamEffectId[] {
  return teamEffectAwakeningRequirements
    .filter((requirement) => requirement.characterName === node.characterName && requirement.level === node.level)
    .map((requirement) => requirement.effectId);
}

export function relevantAwakeningNodes(
  characterName: string,
  selectedActionId: string | undefined,
  activeTeamEffectIds: readonly string[],
): readonly AwakeningNode[] {
  const actionId = selectedActionId?.trim() ?? '';
  const requiredLevels = new Set<AwakeningNode['level']>();

  if (actionId) {
    awakeningNodesForCharacter(characterName).forEach((node) => {
      if (node.relatedActionIds?.includes(actionId)) requiredLevels.add(node.level);
    });
  }

  activeTeamEffectIds.forEach((effectId) => {
    const requirement = teamEffectRequirementById.get(effectId as VerifiedTeamEffectId);
    if (requirement?.characterName === characterName) requiredLevels.add(requirement.level);
  });

  return awakeningNodesForCharacter(characterName).filter((node) => requiredLevels.has(node.level));
}

export function awakeningSearchText(characterName: string): string {
  return awakeningNodesForCharacter(characterName)
    .flatMap((node) => [
      `A${node.level}`,
      node.title.ru,
      node.title.en,
      node.description.ru,
      node.description.en,
      node.sourcePublisher,
    ])
    .join(' ');
}
