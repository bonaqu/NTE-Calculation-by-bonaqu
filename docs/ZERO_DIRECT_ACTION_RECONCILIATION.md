# Zero direct-action reconciliation

Verified 2026-08-06.

## Level-10 direct records

- Appraise and Engrave main four-hit sequence: `40% + 40% + 251.1% + 268.7% = 599.8% ATK`.
- Conditional extra shot against the first lower-level target: `200% ATK`. It is not bound into boss rotations. A6 replaces this ratio with the already separate 300% record; the two do not stack.
- Divide by Zero raw composition: `265.3% + 10.6% × 4 + 354.8% + 337% = 999.5% ATK`.
- Anomaly Perception is stored as an action-specific additive `+25% DMG` modifier rather than being baked into the raw coefficient.

Primary values: Icy Veins Zero profile, updated 2026-07-07. Rotation and Cycle-rate cross-check: Prydwen Zero profile, updated 2026-05-31.

## Exclusions

- A1 Blooming Gaze remains a separate 200% lower-level-target hit with 75% DEF Ignore.
- A3 +50% Ultimate CRIT Rate and A4 Base-ATK-dependent Ultimate increase remain unmodeled by the direct action.
- A6 uses the existing standalone 300% lower-level-target record and is never added to the 200% base record.
- No animation seconds are inferred.

## Rotation bindings

Exact source order is stored in six partial bindings:

- Shinku Zero setup: Ultimate → Redirect Skill;
- Shinku Nanally setup: Ultimate → Redirect Skill;
- Hathor Blossom setup: Ultimate;
- Hathor third-strike swap: Redirect Skill;
- Chaos Remora setup: Ultimate;
- Nanally Blossom setup: Redirect Skill → Ultimate.

The lower-level conditional shots and Awakening records are not inserted.

Only the direct character actions above are bound. Blossom and Remora remain visible partial remainders because the current verified Combat Scenario cycle catalog provides a calculable model only for Stain. The importer does not create unsupported Blossom or Remora activation atoms.

## Coverage

- action catalog: 107 → 110;
- bindings: 33 → 39;
- partial source steps: 21 → 27;
- unsupported source steps: 25 → 19;
- bound/promoted action steps: 49 → 58;
- current missing-action gaps: 9 → 3.

The immutable 41-step baseline remains unchanged. Jiuyuan becomes the next direct-action priority, followed by the unresolved full-hold composition of Hathor Aerial Command.
