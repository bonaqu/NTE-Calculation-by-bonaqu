# Portable Combat Scenario package

The package transfers one Team Calculator Scenario workspace between browsers or players without creating a new persistent application schema.

## Envelope

```text
kind: nte-combat-scenario-package
version: 1
payload: ...
checksum: FNV-1a over canonical payload JSON
```

The checksum detects accidental or manual payload changes. It is an integrity check, not a digital signature and not proof that the sender is trusted.

The parser rejects:

- malformed or oversized JSON;
- another package kind;
- unsupported versions;
- checksum mismatch;
- anything other than four unique released characters;
- invalid target or build snapshots;
- unsupported Scenario or Rotation-import schema versions.

## Payload

The payload contains:

- export timestamp and display name;
- active slot and team duration;
- four-character lineup;
- target level, resistance, reductions and boss state;
- Combat Scenario v1 rows;
- Rotation Lab source, timing state, source-step origins and pending timed conditions;
- optional sanitized visible-build snapshots.

Only provenance entries whose generated row still exists are retained.

Unknown action, effect or Cycle rows are not deleted. The preview counts them as currently blocked, and the imported Scenario keeps them visible so a future data update can restore support.

## Build modes

### `lineup-only`

No build snapshot is transferred.

During import, a local build is preserved only when the same character already occupies the same slot. The preserved local build is sanitized. A changed slot receives a clean build for the imported character.

This prevents Attributes, Arc, Skill levels or Awakening from leaking across characters.

### `sanitized-builds`

Four exact-character snapshots are included and replace the local slot builds.

Transferred fields include visible stats, levels, Awakening, Base ATK, Arc, Skills and Console.

The sanitizer always clears:

- active team-effect IDs;
- temporary post-Ultimate Arc state;
- standalone test mode;
- selected verified action.

Target and Scenario timing are explicit package data rather than temporary build state.

## Preview before apply

After pasted JSON passes validation, the interface shows:

- package name and timestamp;
- localized lineup;
- build mode;
- total, action, effect, Cycle and wait-row counts;
- Rotation Lab source and timing status;
- rows not recognized by the current numerical model.

The apply action is unavailable before this preview exists.

## Atomic domain application

Parsing and workspace construction complete before any UI setter is called. The domain function returns either:

- one complete `{ team, scenario, rotation }` result; or
- an error with no partially modified team object.

The UI then writes the result to the existing records:

- `nte.team.visible.v1`;
- `nte.team.scenario.v1`;
- `nte.team.scenario.rotation-import.v1`.

The package itself is not stored automatically.

## Non-goals

The package does not:

- prove sender identity;
- rank or recommend builds;
- restore temporary combat conditions;
- convert ordinal Rotation Lab markers into seconds;
- make unsupported rows calculable;
- claim full-rotation DPS coverage.
