# Progression bulk input and immediate payments

This feature reduces repetitive inventory entry and safely applies already-payable ascension stages. It does not estimate stamina efficiency, farming time or character priority.

## Bulk inventory format

Use one material per line. A material may be identified by:

- its current Russian display name;
- its English name;
- its canonical internal ID.

Accepted separators:

```text
Жук-монета: 125000
Lost Whispers = 12
chargingKnightSparkPlug	6
Слеза моря 8
```

Amounts must be non-negative safe integers. Empty lines are ignored.

Identity matching is case-insensitive and normalizes Unicode width, `ё/е`, repeated spaces and typographic quotation marks. The parser does not guess unknown names.

## Validation

Every non-empty line is checked before inventory is changed. The preview reports line numbers for:

- unknown materials;
- missing amounts;
- negative, decimal or otherwise invalid amounts;
- duplicate entries that resolve to the same material ID.

If one line is invalid, the entire block is rejected. Parsed values are never partially applied.

## Apply modes

### Update listed

Only parsed material IDs are replaced. Every unlisted inventory value is preserved.

### Replace active set

Every material currently required by the selected roster is set to zero first, then parsed values are applied. Materials unrelated to the current roster remain untouched. This makes a pasted snapshot authoritative for the current plan without destroying inventory saved for another future character.

## Plain-text round trip

The UI can load the current active inventory into the editor. The resulting Russian or English text is accepted by the same parser and reproduces the same values.

## Immediate-payment simulation

The engine evaluates one next unpaid ascension for each character in the visible roster order.

For each target:

1. Build the exact cost: Beetle Coins, the step’s common material and the character’s boss material when required.
2. Compare the complete cost with the one remaining shared inventory snapshot.
3. If every requirement is available, reserve and deduct the full cost.
4. If any requirement is missing, consume nothing for that target and continue to the next character.

A blocked earlier character therefore does not partially reserve materials. A later character may be payable when its full exact cost is available.

The simulation returns every allocation, exact shortages, consumed totals and the final remaining inventory. It never compares unlike material units or claims that roster order is optimal.

## Applying payments

The action is explicit and never runs on load or after an inventory edit. One functional state update:

- increments `completedSteps` by one only for simulated payable characters;
- deducts exactly the simulated costs;
- preserves roster order;
- preserves blocked and MAX characters;
- preserves unrelated inventory;
- keeps state version `2`.

## Compatibility

Unchanged:

- `nte.progression.roster.v2`;
- legacy Iroi migration;
- JSON import/export;
- share links and inventory-sharing semantics;
- ascension prices and material mappings;
- progression normalization.
