# Verified team combat scenarios

The Team Calculator scenario layer is a deterministic timeline over the project's current verified action and team-effect registries.

## Product status

This is an early combat foundation, not a full NTE rotation simulator. The project currently covers a small set of standalone actions and conditional team effects. Scenario coverage reports how many declared action steps were actually calculated; it does not estimate the missing portion.

## Storage

- key: `nte.team.scenario.v1`
- schema version: `1`
- team builds remain in `nte.team.visible.v1`
- scenario edits never rewrite character Attributes

## Step kinds

### `activate-effect`

Activates one effect from `verifiedTeamEffects` for the selected source slot.

The engine validates:

- effect ownership;
- source character;
- Base ATK requirements;
- Awakening requirements.

A numeric duration is active for the half-open interval `[startedAt, expiresAt)`. A 20-second effect activated at `0` applies at `19.9` and is expired at `20`.

A `combat` duration remains active for every later scenario step.

### `action`

Executes one action from `verifiedVisibleActions` belonging to the selected source slot.

At the action timestamp, the engine:

1. removes expired effect windows;
2. builds an immutable team snapshot containing only currently active scenario effects;
3. reuses `deriveVerifiedTeamEffects`;
4. reuses `calculateGameVisibleBuild` in `verified-action` mode;
5. records result and provenance, or an explicit blocking reason.

### `wait`

Documents timing, an unsupported action, movement, energy recovery or another non-calculated segment. Wait steps contribute no damage and are not counted as verified actions.

## Ordering

Steps are evaluated by ascending absolute timestamp. Equal timestamps preserve the player's row order. This permits an action before an effect and another action after the effect at the same displayed time without hidden reordering.

## Result contract

The engine returns:

- ordered step results;
- per-step status: `calculated`, `activated`, `wait` or `blocked`;
- active effect windows at each step;
- expected, non-CRIT and CRIT totals for calculated actions;
- timeline span;
- calculated and blocked action counts;
- activated effect count;
- verified action coverage percentage.

## Explicit non-goals

The scenario engine does not invent or estimate:

- missing skill coefficients;
- animation duration;
- energy generation or costs;
- Esper Cycle gauge timing;
- Break timing;
- crowd-control uptime;
- complete rotation DPS.

## Worker API

`POST /api/v1/calculate/combat-scenario`

Request:

```json
{
  "team": { "version": 1, "builds": [], "target": {} },
  "scenario": { "version": 1, "name": "", "steps": [] }
}
```

Response includes:

- `result`;
- `visibleBuildVersion`;
- `combatScenarioVersion`;
- policy `verified-actions-and-timed-effects-only`.

The endpoint normalizes both input objects and rejects incompatible versions or invalid top-level shapes.
