# Team Calculator readiness

The Team Calculator deliberately separates formula execution from input trust.

## Why this exists

The initial screen contains plausible example values so the interface is not empty, but those values are not sourced builds for the selected characters. Showing a large damage result without identifying that state can make an example look authoritative.

The readiness layer classifies the current formula snapshot before the result summary:

1. **Sample** — the exact shipped demonstration values are still present.
2. **Incomplete** — at least one required member or global input is missing or invalid.
3. **Unchecked** — required values are complete, but the player has not confirmed reviewing this exact snapshot.
4. **Checked** — the player confirmed the exact current formula snapshot.

“Checked” does not mean official, optimal or externally verified. It means only that the player reviewed the values they entered.

## Snapshot identity

`teamInputDigest()` serializes only formula-relevant values and character attribution:

- member identity and character level;
- all ATK components;
- multiplier and identical-hit count;
- personal/team damage bonuses;
- CRIT Rate and CRIT DMG;
- uses per rotation;
- duration;
- enemy level, resistance and reductions.

The serialization uses a fixed property order and finite-number normalization. Display state is excluded.

The last confirmed digest is stored under `nte.team.confirmed-digest.v1`. Existing calculation storage remains unchanged:

- `nte.team.v2`
- `nte.team.duration.v2`
- `nte.team.enemy.v2`

Any formula-relevant edit changes the digest and automatically returns the status to Unchecked. No event listener or destructive migration is required.

## Required inputs

Per character:

- Effective ATK greater than zero;
- total multiplier per use greater than zero;
- uses per rotation greater than zero;
- finite CRIT Rate between 0% and 100%;
- non-negative finite CRIT DMG.

Global:

- exactly four unique characters;
- positive duration;
- positive enemy level;
- finite resistance, DEF reduction and resistance reduction.

The validator deliberately does not invent skill multipliers or enforce unsourced combat caps.

## Empty input action

“Start with my own data” clears player-specific combat inputs while preserving:

- selected character identities;
- character levels;
- the existing TeamMemberInput/storage shape;
- the current enemy profile.

This produces an intentionally incomplete draft and tells the player exactly what must be entered.

## Compatibility and scope

No calculation formula, API payload, share format or existing localStorage schema changes. The readiness layer labels input state and never modifies calculation-core semantics.
