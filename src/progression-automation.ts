import {
  ascensionMaterialIds,
  ascensionMaterials,
  type AscensionMaterialId,
} from './progression-data';
import {
  emptyAscensionInventory,
  type RosterProgressionEntry,
  type RosterProgressionState,
} from './progression-engine';
import { nextAscensionTargets, type NextAscensionTarget } from './progression-next';

export type InventoryApplyMode = 'merge' | 'replace-active';
export type InventoryParseIssueCode =
  | 'missing-amount'
  | 'invalid-amount'
  | 'unknown-material'
  | 'duplicate-material';

export interface InventoryParseIssue {
  line: number;
  code: InventoryParseIssueCode;
  input: string;
  detail?: string;
}

export interface ParsedInventoryLine {
  line: number;
  materialId: AscensionMaterialId;
  amount: number;
  sourceName: string;
}

export interface InventoryParseResult {
  values: Partial<Record<AscensionMaterialId, number>>;
  lines: readonly ParsedInventoryLine[];
  issues: readonly InventoryParseIssue[];
  valid: boolean;
}

export interface ImmediatePaymentAllocation {
  characterName: string;
  currentCap: number;
  unlocksLevel: number;
  payable: boolean;
  required: Partial<Record<AscensionMaterialId, number>>;
  shortages: Partial<Record<AscensionMaterialId, number>>;
  remainingInventory: Record<AscensionMaterialId, number>;
}

export interface ImmediatePaymentSimulation {
  allocations: readonly ImmediatePaymentAllocation[];
  payableCharacters: readonly string[];
  blockedCharacters: readonly string[];
  consumed: Record<AscensionMaterialId, number>;
  remainingInventory: Record<AscensionMaterialId, number>;
}

function safeCount(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value ?? 0)) : 0;
}

function copyInventory(inventory: Partial<Record<AscensionMaterialId, number>>): Record<AscensionMaterialId, number> {
  const copy = emptyAscensionInventory();
  for (const id of ascensionMaterialIds) copy[id] = safeCount(inventory[id]);
  return copy;
}

export function normalizeInventoryIdentity(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[«»„“”]/gu, '"')
    .replace(/[’‘]/gu, "'")
    .replace(/ё/giu, 'е')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('ru');
}

const materialIdentityMap: ReadonlyMap<string, AscensionMaterialId> = (() => {
  const identities = new Map<string, AscensionMaterialId>();
  for (const id of ascensionMaterialIds) {
    const material = ascensionMaterials[id];
    for (const identity of [id, material.name.ru, material.name.en]) {
      identities.set(normalizeInventoryIdentity(identity), id);
    }
  }
  return identities;
})();

export function resolveInventoryMaterial(value: string): AscensionMaterialId | null {
  return materialIdentityMap.get(normalizeInventoryIdentity(value)) ?? null;
}

function splitInventoryLine(value: string): { name: string; amount: string } | null {
  const explicit = value.match(/^(.+?)(?:\s*[:=\t]\s*)([^\s]+)\s*$/u);
  if (explicit?.[1] && explicit[2]) return { name: explicit[1].trim(), amount: explicit[2].trim() };
  const whitespace = value.match(/^(.+\S)\s+([^\s]+)\s*$/u);
  if (whitespace?.[1] && whitespace[2]) return { name: whitespace[1].trim(), amount: whitespace[2].trim() };
  return null;
}

export function parseBulkInventory(text: string): InventoryParseResult {
  const values: Partial<Record<AscensionMaterialId, number>> = {};
  const parsedLines: ParsedInventoryLine[] = [];
  const issues: InventoryParseIssue[] = [];
  const seen = new Map<AscensionMaterialId, number>();

  text.split(/\r?\n/u).forEach((rawLine, index) => {
    const input = rawLine.trim();
    if (!input) return;
    const line = index + 1;
    const split = splitInventoryLine(input);
    if (!split) {
      issues.push({ line, code: 'missing-amount', input });
      return;
    }
    const materialId = resolveInventoryMaterial(split.name);
    if (!materialId) {
      issues.push({ line, code: 'unknown-material', input, detail: split.name });
      return;
    }
    if (!/^\d+$/u.test(split.amount)) {
      issues.push({ line, code: 'invalid-amount', input, detail: split.amount });
      return;
    }
    const amount = Number(split.amount);
    if (!Number.isSafeInteger(amount)) {
      issues.push({ line, code: 'invalid-amount', input, detail: split.amount });
      return;
    }
    const previousLine = seen.get(materialId);
    if (previousLine !== undefined) {
      issues.push({ line, code: 'duplicate-material', input, detail: String(previousLine) });
      return;
    }
    seen.set(materialId, line);
    values[materialId] = amount;
    parsedLines.push({ line, materialId, amount, sourceName: split.name });
  });

  return { values, lines: parsedLines, issues, valid: issues.length === 0 && parsedLines.length > 0 };
}

export function applyParsedInventory(
  inventory: Partial<Record<AscensionMaterialId, number>>,
  parsed: InventoryParseResult,
  mode: InventoryApplyMode,
  activeMaterialIds: readonly AscensionMaterialId[],
): Record<AscensionMaterialId, number> {
  if (!parsed.valid) return copyInventory(inventory);
  const next = copyInventory(inventory);
  if (mode === 'replace-active') {
    for (const id of activeMaterialIds) next[id] = 0;
  }
  for (const id of ascensionMaterialIds) {
    const value = parsed.values[id];
    if (value !== undefined) next[id] = safeCount(value);
  }
  return next;
}

export function serializeInventoryText(
  inventory: Partial<Record<AscensionMaterialId, number>>,
  materialIds: readonly AscensionMaterialId[],
  locale: 'ru' | 'en',
): string {
  return materialIds.map((id) => `${ascensionMaterials[id].name[locale]}: ${safeCount(inventory[id])}`).join('\n');
}

function targetRequirements(target: NextAscensionTarget): Partial<Record<AscensionMaterialId, number>> {
  return {
    beetleCoin: target.step.beetleCoin,
    [target.commonMaterial]: target.step.commonCount,
    ...(target.step.bossCount > 0 ? { [target.bossMaterial]: target.step.bossCount } : {}),
  };
}

export function simulateImmediatePayments(
  entries: readonly RosterProgressionEntry[],
  inventory: Partial<Record<AscensionMaterialId, number>>,
): ImmediatePaymentSimulation {
  const remaining = copyInventory(inventory);
  const consumed = emptyAscensionInventory();
  const allocations: ImmediatePaymentAllocation[] = [];

  for (const target of nextAscensionTargets(entries)) {
    const required = targetRequirements(target);
    const shortages: Partial<Record<AscensionMaterialId, number>> = {};
    for (const id of ascensionMaterialIds) {
      const amount = required[id] ?? 0;
      if (amount > remaining[id]) shortages[id] = amount - remaining[id];
    }
    const payable = Object.keys(shortages).length === 0;
    if (payable) {
      for (const id of ascensionMaterialIds) {
        const amount = required[id] ?? 0;
        if (amount === 0) continue;
        remaining[id] -= amount;
        consumed[id] += amount;
      }
    }
    allocations.push({
      characterName: target.characterName,
      currentCap: target.currentCap,
      unlocksLevel: target.step.unlocksLevel,
      payable,
      required,
      shortages,
      remainingInventory: { ...remaining },
    });
  }

  return {
    allocations,
    payableCharacters: allocations.filter((entry) => entry.payable).map((entry) => entry.characterName),
    blockedCharacters: allocations.filter((entry) => !entry.payable).map((entry) => entry.characterName),
    consumed,
    remainingInventory: remaining,
  };
}

export function applyImmediatePayments(state: RosterProgressionState): RosterProgressionState {
  const simulation = simulateImmediatePayments(state.entries, state.inventory);
  const payable = new Set(simulation.payableCharacters);
  if (payable.size === 0) return {
    ...state,
    entries: state.entries.map((entry) => ({ ...entry })),
    inventory: copyInventory(state.inventory),
  };
  return {
    ...state,
    entries: state.entries.map((entry) => payable.has(entry.characterName)
      ? { ...entry, completedSteps: entry.completedSteps + 1 }
      : { ...entry }),
    inventory: simulation.remainingInventory,
  };
}
