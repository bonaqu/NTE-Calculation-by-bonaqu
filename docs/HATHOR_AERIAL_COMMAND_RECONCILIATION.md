# Hathor Aerial Command reconciliation

Verified 2026-08-06.

## Level-10 maximum hold

Icy Veins publishes the hold composition and periodic-hit ratio:

- Hold Ratio: `20.4% × 4 + 244.9% + 110.3% × 5 = 878% ATK`;
- periodic hit: `111.1% ATK` each.

Prydwen explicitly states that maximum hold produces 20 ticks. Therefore the exact maximum-hold action is:

`878% + 111.1% × 20 = 3100% ATK`.

Sources: Icy Veins Hathor profile, updated 2026-06-27; Prydwen Hathor profile, updated 2026-06-23.

## Exclusions

- Five-Star Tracking is a five-second state and does not add a fixed direct-damage coefficient.
- Express Delivery Power generation is a resource consequence, not direct damage.
- A1, A2 and A5 remain optional Awakening effects.
- Remora and Remora Enhancement are not attached to Aerial Command.
- No seconds are assigned to the Combat Scenario action.

## Rotation binding

`chaos-remora-bomb:chaos-hathor-redirect` receives one partial binding containing `hathor.aerial-command.full-hold.level-10`.

The imported source step contains the exact 3100% direct action followed by one visible partial-remainder marker. That remainder represents resource and Cycle consequences only; it does not add hidden damage, duration, Remora, or Awakening effects.

## Coverage

- action catalog: 112 → 113;
- bindings: 41 → 42;
- partial source steps: 29 → 30;
- unsupported source steps: 17 → 16;
- bound/promoted action steps: 62 → 63;
- current missing-action records: 1 → 0.

The immutable 41-step baseline remains unchanged. The remaining 16 current gaps are effect/Cycle conditions, non-damage operations, or ambiguous source variants rather than absent direct-action records.
