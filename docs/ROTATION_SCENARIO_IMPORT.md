# Rotation Lab → Combat Scenario import

The importer moves a sourced Rotation Lab order into Team Calculator without claiming that list order is a verified animation timeline.

## Two independent saved records

The stable Combat Scenario record remains:

`nte.team.scenario.v1`

Import provenance and timing confirmation are stored separately:

`nte.team.scenario.rotation-import.v1`

This keeps existing scenario payloads and the Worker API compatible while allowing the browser interface to remember:

- source rotation ID;
- source-step origin for each generated row;
- pending verified character effects and Esper Cycle windows;
- import coverage;
- whether seconds have been confirmed by the player.

## Exact binding policy

Bindings use only an exact pair:

`rotation preset ID + source step ID`

The importer does not inspect Russian or English prose for similar words and does not guess skill identity from action type.

Every binding is validated against the current canonical registries:

- standalone action ownership;
- team effect ownership;
- supported numerical Esper Cycle models.

A missing or stale binding becomes a visible `wait` step.

## Order-only safety

A newly imported scenario starts in `order-only`.

Ordinal markers preserve source order but are displayed with `#`, not seconds. Verified standalone action rows may be identified immediately because they do not depend on a timed window. Character effects and Esper Cycles remain pending `wait` rows and cannot affect damage.

After reviewing and editing markers, the player explicitly confirms seconds. Only then are pending rows converted into `activate-effect` and `activate-cycle` steps.

Changing a confirmed timestamp returns the imported scenario to `order-only` and removes every timed modifier until seconds are confirmed again.

## Current stable bindings

### Chaos · Remora Bomb

- Haniel post-Nova ATK effect;
- Stain target window.

### Hathor · Hypercarry

- Haniel post-Nova ATK effect;
- Stain target window;
- the sourced Hathor burst step expands into four verified standalone actions:
  - Rider Express;
  - first Cyclone Strike;
  - second Cyclone Strike;
  - third Cyclone Strike.

Every other source step remains visible as unsupported until an exact numerical action or condition is verified.

## Coverage definitions

### Import binding coverage

`mapped source steps / total source steps`

This measures how many published Rotation Lab steps have an exact safe binding. One source step expanded into several actions still counts as one mapped source step.

### Action calculation coverage

`calculated action rows / action rows`

This is the existing Combat Scenario metric. It depends on the player's entered Attributes, Skill levels, Awakening and target requirements.

### Full rotation coverage

Not currently claimed.

Animation duration, cooldown behavior, energy flow, unsupported hits, cycle damage and boss behavior remain outside the model unless separately verified.

## Team import policy

The preset must contain four unique characters.

A saved character build is preserved only when the same character already occupies the same slot. A changed slot receives a clean build so another character's Attributes, Arc, skills or Awakening cannot leak into the imported lineup.

## Shared local-storage synchronization

Team Calculator and the importer use the same team storage key. `useLocalStorage` now broadcasts same-tab updates through a namespaced custom event while preserving native cross-tab `storage` events. A serialized equality guard prevents event loops.
