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
- full, partial or unsupported source-step coverage;
- pending verified character effects and Esper Cycle windows;
- whether seconds have been confirmed by the player.

Older v1 provenance without a coverage field is recovered from the current exact binding registry.

## Exact composite binding policy

Bindings use only an exact pair:

`rotation preset ID + source step ID`

The importer does not inspect Russian or English prose for similar words and does not guess skill identity from action type.

One source step may now contain several validated atoms:

- an ordered sequence of verified standalone actions;
- one or more verified character-effect windows;
- a numerically supported Esper Cycle window.

Every atom is validated against the current canonical registries:

- standalone action ownership must match the source-step actor;
- team-effect ownership must match the source-step actor;
- a Cycle atom must match the exact Cycle ID on the source step and have a numerical model;
- duplicate atoms invalidate the binding.

A missing or stale atom invalidates the whole binding and safely falls back to one visible `wait` row.

## Full, partial and unsupported source steps

A binding declares one of two supported states:

- `full`: the published step is represented by its verified rows;
- `partial`: useful exact rows are generated, but at least one published action, repeat, state or conditional result is still outside the model.

A partial binding always creates an additional `wait` row containing the original source instruction and outcome. The unsupported remainder therefore cannot disappear behind the calculated rows.

A step without a valid binding remains `unsupported` and produces one source-note `wait` row.

## Weighted import coverage

The interface reports the three source-step counts separately and also shows a compact weighted indicator:

- full step = `1` point;
- partial step = `0.5` point;
- unsupported step = `0` points.

`(full + partial × 0.5) / total source steps`

This is a navigation aid, not a confidence score and not full-rotation DPS coverage.

Action calculation coverage remains a different metric:

`calculated action rows / action rows`

It depends on the player's entered Attributes, Skill levels, Awakening and target requirements.

## Order-only safety

A newly imported scenario starts in `order-only`.

Ordinal markers preserve source order but are displayed with `#`, not seconds. Verified standalone action rows may be identified immediately because they do not depend on a timed window. Character effects and Esper Cycles remain pending `wait` rows and cannot affect damage.

After reviewing and editing markers, the player explicitly confirms seconds. Only then are pending rows converted into `activate-effect` and `activate-cycle` steps.

Changing a confirmed timestamp returns the imported scenario to `order-only` and removes every timed modifier until seconds are confirmed again.

## Current conservative bindings

### Shinku · Charge team

- Hathor Rider Express;
- Hathor Remora CRIT window;
- the held Redirect Skill and unsupported Cycle behavior remain visible as the partial remainder.

### Hathor · Hypercarry

- Haniel direct Redirect Skill hit, direct Ultimate hit and post-Nova ATK effect;
- Stain target window;
- Hathor Remora CRIT window;
- the exact Rider Express + three Cyclone Strike source step is fully mapped.

### Chaos · Remora Bomb

- Haniel direct Redirect Skill hit, direct Ultimate hit and post-Nova ATK effect;
- Stain target window;
- one exact Rider Express cast on the return to Hathor;
- Chaos Ultimate and enhanced Heavy Attacks remain unsupported.

### Nanally · Dual DPS Hexed

- Sakiri direct Ultimate hit;
- Sakiri A4 team ATK window;
- Sakiri DEF-reduction window;
- the importer does not choose the press or hold Redirect Skill damage variant when the rotation source does not specify one.

### Lacrimosa · DoT Discord

- Haniel setup actions and effect;
- Sakiri Ultimate and verified windows;
- Daffodill Finale initial composition and Echoes Redirect sequence;
- Discord damage, Lacrimosa strings and Phantom Step repeats remain unsupported.

### Baicang · Firefly Hyper

- Sakiri Ultimate and verified windows;
- Daffodill Finale and Echoes setup;
- Baicang Judgment of Autumn initial expansion;
- the supported Skill portion of the mixed three-Basic-plus-Skill step;
- one explicit Dodge Charged Attack through Silenced Thought.

The open-ended Dodge Charged Attack spam step remains unsupported because the source deliberately gives no fixed count.

## Explicit non-inferences

The importer does not:

- multiply one Baicang DoT tick by duration;
- repeat a Daffodill Parry or Phantom Step by an assumed count;
- choose Sakiri press versus hold from generic `Redirect Skill` prose;
- turn unsupported Blossom, Remora, Charge, Hexed, Nova, Scorch or Discord into numerical Cycle damage;
- convert source order into seconds;
- claim full rotation DPS.

## Team import policy

The preset must contain four unique characters.

A saved character build is preserved only when the same character already occupies the same slot. A changed slot receives a clean build so another character's Attributes, Arc, skills or Awakening cannot leak into the imported lineup.

## Shared local-storage synchronization

Team Calculator and the importer use the same team storage key. `useLocalStorage` broadcasts same-tab updates through a namespaced custom event while preserving native cross-tab `storage` events. A serialized equality guard prevents event loops.
