# Immediate progression target semantics

The progression page now separates two mathematically different questions.

## 1. Immediate targets

For every planned character that has not completed all six ascensions, the planner selects exactly one next unpaid ascension step.

The immediate requirement is the aggregate of those one-step targets:

- Beetle Coins for each next step;
- the exact common-material tier required by each next step;
- the character's boss material when that step has a non-zero boss count.

The shared inventory is subtracted once from this aggregate. Therefore the ready state means that the inventory can cover all displayed immediate targets simultaneously. It does not reuse the same owned material independently for every character card.

Characters with all six ascensions paid have no next target and add no immediate requirement.

## 2. Complete plan to level 80

The existing full-plan calculation remains unchanged. It aggregates every unpaid ascension from the current state through the level-70 payment that unlocks the level-80 cap.

Immediate and complete-plan totals must remain visibly separate because they answer different player questions.

## Blocker ordering

Beetle Coins are shown separately from material blockers so currency does not automatically dominate every list.

Missing non-currency materials are ordered by:

1. the number of immediate character targets that use the material, descending;
2. boss materials before common materials when the affected count is equal, because boss materials have a direct route label in the verified dataset;
3. canonical material ID for a stable final tie-break.

This is a coordination order for shared targets. It is not a stamina-efficiency ranking. The project does not have a complete verified dataset for stamina costs, drop rates or expected runs and must not imply one.

## Compatibility

This feature does not change:

- `nte.progression.roster.v2`;
- legacy Iroi migration;
- share-link payloads;
- JSON import/export;
- the verified six-step cost curve;
- character material assignments;
- full-plan aggregation.

All immediate planning is derived at runtime from the existing state and verified progression dataset.
