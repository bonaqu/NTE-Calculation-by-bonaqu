# Team attack sequence builder

Implemented: 2026-08-04

## User problem

The Team Calculator stores one multiplier, one identical-hit count and one number of uses per rotation. That is sufficient for a single repeated hit but awkward for a heterogeneous sequence such as:

- one skill hit at 120%;
- three follow-up hits at 90% each;
- one finisher at 180%.

Asking the player to calculate this externally encourages a common double-counting mistake: entering the already summed total and leaving a hit count greater than one.

## Mathematical contract

For every row:

```text
row subtotal = multiplier per identical hit × identical hit count
```

For one full sequence use:

```text
total multiplier per use = sum of every row subtotal
```

For the full team rotation:

```text
rotation multiplier = total multiplier per use × whole-sequence uses per rotation
```

Example:

```text
120% × 1 + 90% × 3 + 180% × 1 = 570% per use
570% × 2 uses = 1140% ATK per rotation
```

## Transfer to calculation-core

The existing core is intentionally unchanged. A valid sequence is flattened to:

```text
skillMultiplier = total multiplier per use
hits = 1
actionsPerRotation = whole-sequence uses per rotation
```

This is equivalent because calculation-core multiplies:

```text
skillMultiplier × hits × actionsPerRotation
```

Storing the completed per-use sum as one virtual hit prevents the sum from being multiplied by an old hit count again.

## Validation

A draft transfers only when all conditions pass:

- at least one row;
- no more than 16 rows;
- every row has a non-empty player-facing label;
- every multiplier is finite and non-negative;
- every identical-hit count is a positive integer;
- sequence uses are finite and greater than zero;
- total multiplier per use is greater than zero.

An invalid draft is never partially applied. The original member input is returned unchanged.

## Storage

Sequence drafts use a separate key:

```text
nte.team.sequence-builder.v1
```

The existing calculation state remains:

```text
nte.team.v2
nte.team.duration.v2
nte.team.enemy.v2
nte.team.confirmed-digest.v1
```

Drafts are stored by canonical character name. Switching away from a character preserves that character's draft for later use.

## Readiness semantics

Applying a valid sequence changes formula-relevant fields in `nte.team.v2`. The existing readiness digest therefore no longer matches and the calculation returns to the unchecked state automatically.

The sequence builder does not directly clear or rewrite the confirmation key; the existing digest contract remains the source of truth.

## Terminology policy

Row labels are entered by the player and exist only to make the formula readable. They are not presented as official skill names.

Evidence-backed character-specific labels remain available in Rotation Lab and the Methodology glossary. They are not converted into numeric presets because the project does not have a complete authoritative multiplier dataset for every skill, level and condition.

## Deliberate boundaries

The builder does not model:

- animation duration;
- cancellation timing;
- buffs or debuffs;
- critical values;
- enemy defence or resistance;
- Esper Cycles;
- conditional passives;
- unsourced skill multipliers.

Those remain in their existing explicit calculator fields or outside the current model.

## Compatibility

Unchanged:

- calculation-core formulas and types;
- team storage schema;
- enemy and duration storage;
- Worker/API contracts;
- readiness digest algorithm;
- character and terminology datasets;
- Rotation Lab state.
