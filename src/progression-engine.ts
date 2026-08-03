import {
  ascensionMaterialIds,
  ascensionMaterials,
  ascensionSteps,
  characterAscensionByName,
  type AscensionMaterialId,
  type CharacterAscensionProfile,
} from './progression-data';

export interface RosterProgressionEntry {
  characterName: string;
  completedSteps: number;
}

export interface RosterProgressionState {
  version: 2;
  entries: RosterProgressionEntry[];
  inventory: Record<AscensionMaterialId, number>;
}

const legacyMaterialMap: Record<string, AscensionMaterialId> = {
  beetleCoin: 'beetleCoin',
  page: 'pageDelusionsShore',
  fading: 'fadingSilhouette',
  blurred: 'blurredSilhouette',
  chaos: 'chaosSilhouette',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function emptyAscensionInventory(): Record<AscensionMaterialId, number> {
  return Object.fromEntries(ascensionMaterialIds.map((id) => [id, 0])) as Record<AscensionMaterialId, number>;
}

export function emptyMaterialTotals(): Record<AscensionMaterialId, number> {
  return emptyAscensionInventory();
}

export function defaultRosterProgressionState(): RosterProgressionState {
  return {
    version: 2,
    entries: [{ characterName: 'Iroi', completedSteps: 0 }],
    inventory: emptyAscensionInventory(),
  };
}

export function normalizeRosterProgressionState(value: unknown): RosterProgressionState | null {
  if (!isRecord(value) || !Array.isArray(value.entries) || !isRecord(value.inventory)) return null;

  const seen = new Set<string>();
  const entries: RosterProgressionEntry[] = [];
  for (const rawEntry of value.entries) {
    if (!isRecord(rawEntry) || typeof rawEntry.characterName !== 'string') continue;
    if (!characterAscensionByName.has(rawEntry.characterName) || seen.has(rawEntry.characterName)) continue;
    const completedSteps = Math.min(ascensionSteps.length, safeCount(rawEntry.completedSteps));
    entries.push({ characterName: rawEntry.characterName, completedSteps });
    seen.add(rawEntry.characterName);
  }

  const inventory = emptyAscensionInventory();
  for (const id of ascensionMaterialIds) inventory[id] = safeCount(value.inventory[id]);

  return { version: 2, entries, inventory };
}

export function migrateLegacyIroiState(completed: unknown, inventoryValue: unknown): RosterProgressionState {
  const inventory = emptyAscensionInventory();
  if (isRecord(inventoryValue)) {
    for (const [legacyKey, materialId] of Object.entries(legacyMaterialMap)) {
      inventory[materialId] = safeCount(inventoryValue[legacyKey]);
    }
  }
  return {
    version: 2,
    entries: [{ characterName: 'Iroi', completedSteps: Math.min(ascensionSteps.length, safeCount(completed)) }],
    inventory,
  };
}

export function requirementsForCharacter(
  profile: CharacterAscensionProfile,
  completedSteps: number,
): Record<AscensionMaterialId, number> {
  const totals = emptyMaterialTotals();
  const start = Math.min(ascensionSteps.length, Math.max(0, Math.floor(completedSteps)));
  for (const step of ascensionSteps.slice(start)) {
    totals.beetleCoin += step.beetleCoin;
    totals[profile.bossMaterial] += step.bossCount;
    totals[profile.commonMaterials[step.commonTier]] += step.commonCount;
  }
  return totals;
}

export function aggregateRosterRequirements(entries: RosterProgressionEntry[]): Record<AscensionMaterialId, number> {
  const totals = emptyMaterialTotals();
  for (const entry of entries) {
    const profile = characterAscensionByName.get(entry.characterName);
    if (!profile) continue;
    const characterTotals = requirementsForCharacter(profile, entry.completedSteps);
    for (const id of ascensionMaterialIds) totals[id] += characterTotals[id];
  }
  return totals;
}

export function calculateMaterialShortages(
  required: Record<AscensionMaterialId, number>,
  inventory: Partial<Record<AscensionMaterialId, number>>,
): Record<AscensionMaterialId, number> {
  const shortages = emptyMaterialTotals();
  for (const id of ascensionMaterialIds) shortages[id] = Math.max(0, required[id] - safeCount(inventory[id]));
  return shortages;
}

export function usedMaterialIds(totals: Record<AscensionMaterialId, number>): AscensionMaterialId[] {
  return ascensionMaterialIds.filter((id) => totals[id] > 0);
}

export function totalForCategory(
  totals: Record<AscensionMaterialId, number>,
  category: 'currency' | 'common' | 'boss',
): number {
  return ascensionMaterialIds
    .filter((id) => ascensionMaterials[id].category === category)
    .reduce((sum, id) => sum + totals[id], 0);
}

export function charactersUsingMaterial(
  entries: RosterProgressionEntry[],
  materialId: AscensionMaterialId,
): string[] {
  return entries
    .filter((entry) => {
      const profile = characterAscensionByName.get(entry.characterName);
      return profile?.bossMaterial === materialId || profile?.commonMaterials.includes(materialId);
    })
    .map((entry) => entry.characterName);
}
