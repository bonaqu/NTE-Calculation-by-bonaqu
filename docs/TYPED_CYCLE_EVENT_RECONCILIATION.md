# Typed Esper Cycle event reconciliation

Verified 2026-08-06.

## Why the model changed

The previous Combat Scenario cycle type assumed every supported Cycle was a timed `+% DMG` window. That contract is valid for Stain but cannot represent Scorch, Charge or Discord without inventing damage. The registry is now a tagged union.

## Verified variants

- `damage-window` — Stain: 12 seconds, +20% Psyche/Lakshana damage. This is the only variant that modifies action damage.
- `timed-state` — Scorch: a 15-second DoT state. No total damage is calculated because the source does not publish a deterministic tick ratio/count pair.
- `resource-trigger` — Charge: +10 Ultimate Energy to the active character per Blossom-pistil hit on a Remora target. No total Energy is claimed because the number of qualifying hits is not fixed by the Rotation Lab step.
- `break-trigger` — Discord: reduces Break by a percentage while Nova and Scorch overlap. The percentage is stored as unknown because the source does not publish a number.

Primary source: Prydwen Esper Cycles guide, updated 2026-04-23. Cross-check: Icy Veins Esper Cycles/Incantation guides, updated 2026-06-24.

## Runtime semantics

- Stain and Scorch are timed active windows.
- Charge and Discord are instantaneous activation results and are not retained in `activeCycles`.
- Only `kind: damage-window` participates in `cycleModifierForAction`.
- Imported order markers remain inert until the user confirms real seconds.
- The action-only verified-recipe audit still lists Cycle atoms as omitted conditions because those recipes deliberately contain actions only; this is separate from the current source-step gap audit.
- Existing Combat Scenario schema v1 remains valid; no storage migration is required.

## Rotation bindings

Three source steps receive partial semantic bindings:

- `hathor-hyper:jiuyuan-second-charge` → Charge; Blossom setup and swapping remain the visible remainder.
- `lacrimosa-discord-dot:lacrimosa-scorch` → Scorch; the swap sequence remains the visible remainder.
- `lacrimosa-discord-dot:lacrimosa-discord` → Discord; continued attacks and unknown Break percentage remain the visible remainder.

## Coverage

- bindings: 42 → 45;
- partial source steps: 30 → 33;
- unsupported/current gaps: 16 → 13;
- effect/Cycle gaps: 3 → 0;
- bound/promoted direct action steps remain 63.

The immutable 41-step baseline remains unchanged. The remaining gaps are eight non-damage operations and five ambiguous source variants.
