import { describe, expect, it } from 'vitest';
import { ascensionMaterialIds, type AscensionMaterialId } from './progression-data';
import {
  applyImmediatePayments,
  applyParsedInventory,
  normalizeInventoryIdentity,
  parseBulkInventory,
  resolveInventoryMaterial,
  serializeInventoryText,
  simulateImmediatePayments,
} from './progression-automation';
import {
  defaultRosterProgressionState,
  emptyAscensionInventory,
  type RosterProgressionState,
} from './progression-engine';

function inventory(values: Partial<Record<AscensionMaterialId, number>> = {}) {
  return { ...emptyAscensionInventory(), ...values };
}

describe('bulk progression inventory', () => {
  it('resolves Russian, English and canonical identities with tolerant normalization', () => {
    expect(resolveInventoryMaterial('Жук-монета')).toBe('beetleCoin');
    expect(resolveInventoryMaterial('Beetle Coin')).toBe('beetleCoin');
    expect(resolveInventoryMaterial('beetleCoin')).toBe('beetleCoin');
    expect(resolveInventoryMaterial('Семя исповедального цветка')).toBe('confessionalFlowerSeed');
    expect(normalizeInventoryIdentity('  СЛЕЗА   МОРЯ ')).toBe('слеза моря');
  });

  it('parses supported separators and exact non-negative integers', () => {
    const parsed = parseBulkInventory([
      'Жук-монета: 25000',
      'Lost Whispers = 12',
      'chargingKnightSparkPlug\t2',
      'Слеза моря 8',
      '',
    ].join('\n'));
    expect(parsed.valid).toBe(true);
    expect(parsed.issues).toEqual([]);
    expect(parsed.values).toMatchObject({
      beetleCoin: 25_000,
      lostWhispers: 12,
      chargingKnightSparkPlug: 2,
      tearOfTheSea: 8,
    });
  });

  it('reports unknown, missing, invalid and duplicate lines without a partial valid result', () => {
    const parsed = parseBulkInventory([
      'Неизвестная штука: 4',
      'Жук-монета',
      'Lost Whispers: -2',
      'Obscure Whispers: 1.5',
      'beetleCoin: 3',
      'Beetle Coin: 4',
    ].join('\n'));
    expect(parsed.valid).toBe(false);
    expect(parsed.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ line: 1, code: 'unknown-material' }),
      expect.objectContaining({ line: 2, code: 'missing-amount' }),
      expect.objectContaining({ line: 3, code: 'invalid-amount' }),
      expect.objectContaining({ line: 4, code: 'invalid-amount' }),
      expect.objectContaining({ line: 6, code: 'duplicate-material', detail: '5' }),
    ]));
  });

  it('keeps merge and active-only replacement semantics distinct', () => {
    const current = inventory({ beetleCoin: 100, lostWhispers: 7, tearOfTheSea: 9 });
    const parsed = parseBulkInventory('Жук-монета: 250\nПотерянный шёпот: 3');
    const active: AscensionMaterialId[] = ['beetleCoin', 'lostWhispers', 'obscureWhispers'];

    const merged = applyParsedInventory(current, parsed, 'merge', active);
    expect(merged).toMatchObject({ beetleCoin: 250, lostWhispers: 3, obscureWhispers: 0, tearOfTheSea: 9 });

    const replaced = applyParsedInventory(current, parsed, 'replace-active', active);
    expect(replaced).toMatchObject({ beetleCoin: 250, lostWhispers: 3, obscureWhispers: 0, tearOfTheSea: 9 });

    const partial = parseBulkInventory('Жук-монета: 250');
    expect(applyParsedInventory(current, partial, 'merge', active).lostWhispers).toBe(7);
    expect(applyParsedInventory(current, partial, 'replace-active', active).lostWhispers).toBe(0);
    expect(applyParsedInventory(current, partial, 'replace-active', active).tearOfTheSea).toBe(9);
  });

  it('round-trips active inventory through plain text export', () => {
    const current = inventory({ beetleCoin: 125_000, lostWhispers: 12, chargingKnightSparkPlug: 6 });
    const ids: AscensionMaterialId[] = ['beetleCoin', 'lostWhispers', 'chargingKnightSparkPlug'];
    const text = serializeInventoryText(current, ids, 'ru');
    const parsed = parseBulkInventory(text);
    expect(parsed.valid).toBe(true);
    expect(parsed.values).toEqual({ beetleCoin: 125_000, lostWhispers: 12, chargingKnightSparkPlug: 6 });
  });

  it('does not apply a block containing any invalid line', () => {
    const current = inventory({ beetleCoin: 100 });
    const invalid = parseBulkInventory('Жук-монета: 250\nunknown: 1');
    expect(applyParsedInventory(current, invalid, 'merge', ascensionMaterialIds)).toEqual(current);
  });
});

describe('immediate ascension payment automation', () => {
  it('pays in visible roster order without double-spending shared resources', () => {
    const entries = [
      { characterName: 'Shinku', completedSteps: 1 },
      { characterName: 'Zero', completedSteps: 1 },
    ];
    const current = inventory({ beetleCoin: 100_000, lostWhispers: 24, chargingKnightSparkPlug: 2 });
    const simulation = simulateImmediatePayments(entries, current);

    expect(simulation.payableCharacters).toEqual(['Shinku']);
    expect(simulation.blockedCharacters).toEqual(['Zero']);
    expect(simulation.allocations[0]).toMatchObject({ payable: true, unlocksLevel: 40 });
    expect(simulation.allocations[1]).toMatchObject({
      payable: false,
      shortages: { chargingKnightSparkPlug: 2 },
    });
    expect(simulation.remainingInventory).toMatchObject({ beetleCoin: 50_000, lostWhispers: 12, chargingKnightSparkPlug: 0 });
    expect(simulation.consumed).toMatchObject({ beetleCoin: 50_000, lostWhispers: 12, chargingKnightSparkPlug: 2 });
  });

  it('does not reserve partial materials for a blocked earlier target', () => {
    const entries = [
      { characterName: 'Shinku', completedSteps: 1 },
      { characterName: 'Chiz', completedSteps: 0 },
    ];
    const current = inventory({ beetleCoin: 75_000, lostWhispers: 5, tearOfTheSea: 0 });
    const simulation = simulateImmediatePayments(entries, current);

    expect(simulation.payableCharacters).toEqual(['Chiz']);
    expect(simulation.blockedCharacters).toEqual(['Shinku']);
    expect(simulation.remainingInventory).toMatchObject({ beetleCoin: 50_000, lostWhispers: 0 });
  });

  it('atomically advances only payable characters and deducts exact costs', () => {
    const state: RosterProgressionState = {
      version: 2,
      entries: [
        { characterName: 'Shinku', completedSteps: 1 },
        { characterName: 'Zero', completedSteps: 1 },
        { characterName: 'Iroi', completedSteps: 6 },
      ],
      inventory: inventory({ beetleCoin: 100_000, lostWhispers: 24, chargingKnightSparkPlug: 2, tearOfTheSea: 99 }),
    };
    const next = applyImmediatePayments(state);

    expect(next.version).toBe(2);
    expect(next.entries).toEqual([
      { characterName: 'Shinku', completedSteps: 2 },
      { characterName: 'Zero', completedSteps: 1 },
      { characterName: 'Iroi', completedSteps: 6 },
    ]);
    expect(next.inventory).toMatchObject({
      beetleCoin: 50_000,
      lostWhispers: 12,
      chargingKnightSparkPlug: 0,
      tearOfTheSea: 99,
    });
    expect(state.entries[0]?.completedSteps).toBe(1);
    expect(state.inventory.beetleCoin).toBe(100_000);
  });

  it('returns a safe copied state when no target is payable', () => {
    const state = defaultRosterProgressionState();
    const next = applyImmediatePayments(state);
    expect(next).toEqual(state);
    expect(next).not.toBe(state);
    expect(next.inventory).not.toBe(state.inventory);
    expect(next.entries).not.toBe(state.entries);
  });
});
