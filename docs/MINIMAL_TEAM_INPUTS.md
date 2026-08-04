# Formula-driven Team Calculator inputs

## Why this change exists

The NTE Attributes screen already displays final values after permanent character, Arc, Console and progression contributions are combined. The owner-supplied Russian-client screenshots show this directly:

- summary ATK: `2026`;
- detailed ATK: `1126 + 900`;
- detailed HP: `13992 + 7324`;
- detailed DEF: `778 + 190`.

The Team Calculator must not ask the player to type Arc ATK, Console module counts or other static contributors again. Doing so creates duplicate work and risks counting the same value twice.

## Main input contract

The ordinary damage path asks for only:

- character level;
- final displayed ATK;
- CRIT Rate;
- CRIT DMG;
- universal DMG Bonus;
- matching attribute DMG Bonus;
- the selected test/action;
- target values when the selected test uses a custom target.

## Conditional fields

A field appears only when the selected test requires it:

- exact ability level for a sourced level-specific coefficient;
- highest unlocked Awakening when a selected action has an Awakening requirement;
- Arc identity, Mixing rank and active-window switch for a verified temporary Arc effect;
- target level for a lower-level-target requirement;
- target resistance and reductions for an exact/custom-target calculation.

## Removed from the main calculator

The following remain useful elsewhere in the project but are not ordinary Team Calculator inputs:

- HP and DEF for damage-only tests;
- current level cap;
- Charge Speed;
- Cycle Intensity;
- Break Intensity;
- Arc level and Arc ATK;
- Arc secondary stat value;
- Console grid type;
- number of modules of a given type;
- complete build-sheet metadata that does not alter the selected formula.

The legacy `nte.team.visible.v1` state is still normalized. Existing saves keep character choices, final attributes, skill levels, target values and test selection; obsolete metadata is simply not exposed as manual damage input.

## Awakening policy

Awakening is represented as six sequential sourced nodes rather than an unexplained numeric damage field.

- Selecting A4 means A1–A4 are unlocked.
- A node is marked as `used by test` only when the current verified action explicitly depends on it.
- Informational nodes do not enter the calculation.
- Current Russian-reference labels are preferred.
- When a reliable current Russian label is unavailable, the current English title is displayed and the fallback is disclosed instead of silently inventing localization.

Initial full-node coverage:

- Shinku;
- Nanally;
- Chaos;
- Lacrimosa;
- Zero.

Currently calculation-linked nodes:

- Nanally A3;
- Zero A1;
- Zero A6.

## Static equipment rule

Final ATK is still flattened into the calculation core as:

```text
baseAtk = final displayed ATK
arcAtk = 0
flatAtk = 0
atkPercent = 0
```

Arc and Console data can provide separately verified temporary effects, but their static values are never added to final Attributes again.
