# Reusable build profiles

Build Profiles store player-entered character data so a real build can be restored after changing or importing a team.

They are not recommended builds and never generate game values.

## Storage

Local library key:

`nte.build-profiles.v1`

The library is limited to 50 normalized records. Duplicate IDs receive deterministic numeric suffixes. Invalid records are discarded during recovery instead of entering Team Calculator.

## Saved data

A profile contains:

- character identity;
- level and current maximum level;
- Awakening;
- Base ATK when entered for a source-scaling support effect;
- final visible Attributes;
- Arc identity, level, displayed secondary value and Mixing rank;
- four skill levels;
- Console summary.

Every snapshot is passed through the current `game-visible` team normalizer. Profile code does not maintain a second independent set of numeric limits.

## Data deliberately excluded

Profiles always clear:

- active team effect IDs;
- Arc post-Ultimate window state;
- selected reference or verified-action test;
- selected standalone action;
- target settings;
- active team slot;
- Combat Scenario and Rotation Lab timing.

These are momentary combat or workspace conditions, not stable character build data.

## Applying a profile

A profile applies to the active Team Calculator slot.

If the slot already contains the same character, a compatible current test selection may remain active. A verified action remains selected only when it belongs to that character and the current coverage supports verified-action mode.

If the profile changes the character, calculation test context resets to the neutral reference.

Application is blocked when the profile character already occupies another slot. NTE teams on this site remain four unique characters.

Temporary character effects and the Arc post-Ultimate toggle are cleared on every application path.

## Export envelope

A profile export is canonical JSON:

```json
{
  "kind": "nte-build-profile",
  "version": 1,
  "payload": {
    "name": "Player-defined name",
    "build": {}
  },
  "checksum": "00000000"
}
```

Object keys are recursively sorted before serialization. The checksum is deterministic FNV-1a over the canonical payload string. It is intended to detect accidental edits and corruption, not to provide cryptographic authenticity.

Import rejects:

- malformed JSON;
- a different kind or schema version;
- checksum mismatch;
- an unknown character;
- a build that cannot pass the current normalizer;
- a full local library.

A valid imported profile receives a local collision-safe ID. IDs and timestamps from another browser are not trusted as local identity.

## Browser behavior

Export always writes JSON into the visible transfer field. Clipboard copy is attempted when the browser exposes the Clipboard API; failure does not lose the export.

The library and Team Calculator use the shared local-storage synchronization layer, so applying a profile updates the active calculator in the same tab and in other open tabs.

## Scope

This version does not:

- fetch builds from an NTE account;
- read screenshots automatically;
- fill recommended stats;
- infer Arc or Console values;
- sync through a server;
- claim that an imported profile belongs to a specific player.
