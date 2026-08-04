import {
  ascensionMaterialIds,
  ascensionMaterials,
  ascensionSteps,
  characterAscensionByName,
  type AscensionMaterialId,
  type AscensionStepDefinition,
} from './progression-data';
import {
  calculateMaterialShortages,
  emptyMaterialTotals,
  type RosterProgressionEntry,
} from './progression-engine';

export interface NextAscensionTarget {
  characterName: string;
  completedSteps: number;
  currentCap: number;
  step: AscensionStepDefinition;
  commonMaterial: AscensionMaterialId;
  bossMaterial: AscensionMaterialId;
}

export interface ImmediateMaterialBlocker {
  materialId: AscensionMaterialId;
  required: number;
  owned: number;
  missing: number;
  affectedCharacters: string[];
}

function safeInventoryCount(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value ?? 0)) : 0;
}

export function nextAscensionTarget(entry: RosterProgressionEntry): NextAscensionTarget | null {
  const profile = characterAscensionByName.get(entry.characterName);
  if (!profile) return null;
  const completedSteps = Math.min(ascensionSteps.length, Math.max(0, Math.floor(entry.completedSteps)));
  const step = ascensionSteps[completedSteps];
  if (!step) return null;

  return {
    characterName: entry.characterName,
    completedSteps,
    currentCap: completedSteps === 0 ? 20 : ascensionSteps[completedSteps - 1]?.unlocksLevel ?? 20,
    step,
    commonMaterial: profile.commonMaterials[step.commonTier],
    bossMaterial: profile.bossMaterial,
  };
}

export function nextAscensionTargets(entries: readonly RosterProgressionEntry[]): NextAscensionTarget[] {
  return entries.flatMap((entry) => {
    const target = nextAscensionTarget(entry);
    return target ? [target] : [];
  });
}

export function aggregateNextAscensionRequirements(
  entries: readonly RosterProgressionEntry[],
): Record<AscensionMaterialId, number> {
  const totals = emptyMaterialTotals();
  for (const target of nextAscensionTargets(entries)) {
    totals.beetleCoin += target.step.beetleCoin;
    totals[target.commonMaterial] += target.step.commonCount;
    totals[target.bossMaterial] += target.step.bossCount;
  }
  return totals;
}

export function immediateMaterialUsers(
  targets: readonly NextAscensionTarget[],
  materialId: AscensionMaterialId,
): string[] {
  return targets.flatMap((target) => {
    const usesCurrency = materialId === 'beetleCoin';
    const usesCommon = target.commonMaterial === materialId && target.step.commonCount > 0;
    const usesBoss = target.bossMaterial === materialId && target.step.bossCount > 0;
    return usesCurrency || usesCommon || usesBoss ? [target.characterName] : [];
  });
}

export function immediateMaterialBlockers(
  entries: readonly RosterProgressionEntry[],
  inventory: Partial<Record<AscensionMaterialId, number>>,
): ImmediateMaterialBlocker[] {
  const targets = nextAscensionTargets(entries);
  const required = aggregateNextAscensionRequirements(entries);
  const shortages = calculateMaterialShortages(required, inventory);
  const categoryOrder = { boss: 0, common: 1, currency: 2 } as const;

  return ascensionMaterialIds
    .filter((materialId) => materialId !== 'beetleCoin' && shortages[materialId] > 0)
    .map((materialId) => ({
      materialId,
      required: required[materialId],
      owned: safeInventoryCount(inventory[materialId]),
      missing: shortages[materialId],
      affectedCharacters: immediateMaterialUsers(targets, materialId),
    }))
    .sort((left, right) => {
      const affectedDifference = right.affectedCharacters.length - left.affectedCharacters.length;
      if (affectedDifference !== 0) return affectedDifference;
      const categoryDifference = categoryOrder[ascensionMaterials[left.materialId].category]
        - categoryOrder[ascensionMaterials[right.materialId].category];
      if (categoryDifference !== 0) return categoryDifference;
      return left.materialId.localeCompare(right.materialId);
    });
}

export function immediateCoinShortage(
  entries: readonly RosterProgressionEntry[],
  inventory: Partial<Record<AscensionMaterialId, number>>,
): { required: number; owned: number; missing: number } {
  const required = aggregateNextAscensionRequirements(entries).beetleCoin;
  const owned = safeInventoryCount(inventory.beetleCoin);
  return { required, owned, missing: Math.max(0, required - owned) };
}

export function immediateTargetsReady(
  entries: readonly RosterProgressionEntry[],
  inventory: Partial<Record<AscensionMaterialId, number>>,
): boolean {
  const targets = nextAscensionTargets(entries);
  if (targets.length === 0) return false;
  const required = aggregateNextAscensionRequirements(entries);
  const shortages = calculateMaterialShortages(required, inventory);
  return ascensionMaterialIds.every((materialId) => shortages[materialId] === 0);
}
