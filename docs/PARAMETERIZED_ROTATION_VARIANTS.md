# Parameterized Rotation Lab variants

Verified 2026-08-07.

## Principle

The final five baseline gaps were not missing records. Each source step allowed mutually exclusive forms, target modes or an open-ended repeat count. A default binding would therefore be a guess. Rotation import now requires explicit selections and keeps the static action-only recipes parameter-free.

## Controls

- Lacrimosa form: Tomato Metal or Tomato Percussion. One value drives both the full Basic string and the fifth attack.
- Lacrimosa Redirect Skill: Morning Tomato or Devilish Gift. Morning Tomato uses its exact native action; Devilish Gift creates a visible marker because copied external damage is not deterministic.
- Adler Ultimate mode: five target hits or ten hits against one enemy. Both options preserve Ultimate → Evils Bane order.
- Baicang Dodge Charged count: integer 1–20. The selected number creates exactly that many Silenced Thought actions. Counter and Skill count/order remain a visible marker.

## Import semantics

- Missing selections are `variant-required`, not unsupported.
- The UI disables import until every preset control is complete.
- Metadata schema v1 stores normalized `variantSelections` additively.
- Variant markers are zero-damage wait rows with explicit provenance text; they never create hidden actions or seconds.
- Preview and import reports separately count variant-required source steps and generated variant markers.
- A selected exact branch may increase the preset's fully mapped source-step count, such as Adler's selected Ultimate mode.
- For a partial branch, a generated variant marker replaces the generic partial-remainder row. Coverage accounting therefore uses `partial remainder + variant markers`, preventing the same unresolved consequence from appearing twice.

## Audit semantics

The immutable 41-step baseline remains unchanged. Current unsupported gaps become zero because every source step now has a fixed binding, typed semantic model, operation marker or parameterized variant model. Five variant requirements remain visible in the audit panel and import controls.

Action-only recipes intentionally keep five `variant-choice-required` gaps because they cannot select a user-specific branch.
