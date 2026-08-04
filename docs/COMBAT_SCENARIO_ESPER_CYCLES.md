# Numerical Esper Cycle windows in Combat Scenario

Combat Scenario treats Esper Cycles as target states, not character support skills or permanent build stats.

## Current numerical coverage

The canonical database contains eight Esper Cycles. Only one currently has a deterministic numerical model that can be applied to a standalone action without inventing missing mechanics.

### Stain / След

- required attributes: Lakshana + Psyche;
- target window: 12 seconds;
- affected damage: Psyche and Lakshana only;
- modifier: +20 percentage points of damage bonus;
- interval: `[activation, activation + 12)`.

An activation at `0.0s` applies to an eligible action at `11.9s` and is expired for an action at `12.0s`.

The window remains visible in the timeline for every action against the shared target, but the numerical modifier is added only when the acting character's attribute is Psyche or Lakshana. Cosmos, Chaos, Anima and Incantation actions are unaffected.

## Scenario schema

Step kind:

`activate-cycle`

The step stores a canonical `cycleId`. Existing `nte.team.scenario.v1` payloads without `cycleId` remain valid: the TypeScript input field is optional for legacy objects, while the normalizer always returns a string and uses an empty string when the field is absent. The storage key and scenario version are unchanged.

Cycle activation validates:

1. the canonical cycle exists;
2. a numerical model exists;
3. the selected team contains all attributes required to form the cycle.

## Formula integration

For an eligible action only:

`temporary damage bonus = displayed damage bonus + active cycle damage bonus`

The engine creates an immutable action snapshot and does not modify saved character Attributes.

## Unsupported numerical cycles

The following cycles remain available in the database and Rotation Lab but cannot yet be activated as calculated Scenario windows:

- Blossom;
- Remora;
- Hexed;
- Nova;
- Scorch;
- Charge;
- Discord.

They are deliberately blocked because their useful numerical result depends on one or more currently unresolved inputs such as projectile count, stored damage, tick count, energy conversion, Break-gauge math, refresh rules or target behavior.

The project must not turn their prose descriptions into guessed damage.

## API metadata

`GET /api/v1/data/combat-models` exposes:

- `combatScenarioStepKinds`, including `activate-cycle`;
- `verifiedCombatCycleModelCount`;
- `verifiedCombatCycleModels`.

`POST /api/v1/calculate/combat-scenario` returns active cycle snapshots and uses policy:

`verified-actions-timed-effects-and-supported-cycles-only`
