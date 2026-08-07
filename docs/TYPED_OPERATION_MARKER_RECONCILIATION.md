# Typed non-damage operation reconciliation

Verified 2026-08-06.

## Why operations are first-class steps

Eight Rotation Lab source steps are fully sourced instructions but intentionally contain no deterministic damage action: swaps, Energy routing/rebuild, starting position, cooldown checks and conditional recovery loops. Treating them as unsupported `wait` rows incorrectly implied missing evidence. Treating them as attacks would invent damage.

Combat Scenario therefore adds `kind: operation` and an additive schema-v1 `operationId`. Old saves normalize to an empty operation ID without a version migration.

## Runtime contract

- A valid operation returns status `operation`.
- Its damage contribution is exactly zero by design.
- It does not change effects, Cycle windows, action coverage or timeline duration.
- Unknown IDs or a source-character mismatch are blocked.
- Manual UI and imported scenarios display the operation title and source instruction.
- Russian operation labels use normalized Cyrillic text without mixed-script characters.

## Verified registry

The eight stable IDs map one-to-one to their source preset and source step. Their localized summary and provenance are derived from the Rotation Lab source record, preventing text drift.

## Rotation bindings

All eight non-damage source steps receive full `operation-marker` bindings. Action-only verified recipes intentionally exclude these markers and report them through `omittedOperationMarkers` rather than treating them as unknown source gaps.

A source step may therefore be fully bound for Rotation Lab import while its operation marker remains intentionally omitted from the action-only recipe. These are separate coverage dimensions rather than contradictory states.

## Coverage

- bindings: 45 → 53;
- fully bound source steps: 12 → 20;
- unsupported/current gaps: 13 → 5;
- current non-damage gaps: 8 → 0;
- bound/promoted direct action steps remain 63.

The immutable 41-step baseline remains unchanged. The five remaining current gaps are genuine variant choices rather than missing records or unmodeled operations.
