# Jiuyuan direct-action reconciliation

Verified 2026-08-06.

## Level-10 direct records

- Intel Hunter: `72% + 76.4% × 4 + 222.7% = 600.3% ATK`.
- Final Reckoning: `123.5% + 156.7% × 3 + 48.8% × 7 + 264.1% = 1199.3% ATK`.

Primary ratios: Icy Veins Jiuyuan profile, updated 2026-07-07. Rotation order and sub-DPS guidance: Prydwen Jiuyuan/Nanally profiles, updated 2026-05-26.

## Exclusions

- Intel Hunter's four Rose Pact Bullets and Lethal Rose Pact establishment are state/resource mechanics, not fixed extra direct damage.
- Final Reckoning's simultaneous Pact Settlements, their published 400% ratio, Ultimate Energy and A2–A6 remain separate.
- `jiuyuan.know-every-secret.awakening-six` stays a standalone conditional 200% trigger with a five-second internal cooldown.
- Blossom and Hexed are not converted into direct Jiuyuan damage.

## Rotation bindings

Both `hathor-hyper:jiuyuan-open` and `nanally-hexed-dual:nanally-jiuyuan-hexed` store the sourced order:

1. Final Reckoning;
2. Intel Hunter.

They remain partial because Pact/Settlement and Hexed consequences are not synthesized.

## Coverage

- action catalog: 110 → 112;
- bindings: 39 → 41;
- partial source steps: 27 → 29;
- unsupported source steps: 19 → 17;
- bound/promoted action steps: 58 → 62;
- current missing-action gaps: 3 → 1.

The immutable 41-step baseline remains unchanged. Fully held Hathor Aerial Command becomes the only missing-action priority.
