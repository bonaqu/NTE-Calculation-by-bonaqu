# Data health contract

The project stores game data from sources with different update rhythms and authority levels. A date is not a claim that a source is official or correct. The data-health contract answers a narrower question: **when was this record last updated and re-verified, and is its provenance still structurally usable?**

## Covered runtime datasets

The registry is derived from the actual modules used by the product:

- Russian localization evidence;
- character catalog;
- complete Arc catalog;
- character Arc recommendations;
- Rotation Lab presets;
- Esper Cycle definitions;
- character ascension profiles and progression source registries;
- benchmark and custom-model source registries.

No parallel hand-written list of source dates is maintained.

## States

- `fresh` — source and project verification are inside the normal review window;
- `review-due` — the record remains available, but a maintainer should open the source and verify it again;
- `expired` — the hard deadline has passed and CI must fail;
- `invalid` — publisher or required date metadata is missing, malformed or in the future.

Warnings never silently remove data. Expired or invalid records block the contract so a stale dataset cannot continue looking authoritative without an explicit maintenance decision.

## Domain-specific windows

| Domain | Review after | Hard expiry | Source update date required |
|---|---:|---:|:---:|
| Localization evidence | 120 days | 240 days | No |
| Character catalog | 60 days | 120 days | No |
| Arc catalog | 60 days | 120 days | No |
| Character Arc guides | 45 days | 120 days | Yes |
| Rotation presets | 45 days | 120 days | Yes |
| Esper Cycles | 90 days | 180 days | Yes |
| Progression | 60 days | 150 days | Yes |
| Benchmarks and model sources | 60 days | 150 days | No |

The warning window is deliberately shorter than the hard deadline. Older but still potentially valid references can be marked for review without immediately breaking production.

## Determinism

`buildDataHealthReport(asOf, records)` accepts an explicit date. Unit tests use `2026-08-04` to prove current classifications. A second test uses the actual CI date so the repository eventually fails after hard deadlines even when no code changes are made.

## Scheduled enforcement

`.github/workflows/data-freshness.yml` runs every day and can also be started manually. It performs TypeScript validation and executes the same `data-health.test.ts` contract used by normal pull-request quality checks.

## Maintenance workflow

When a record becomes review due:

1. Open the direct source shown in Methodology.
2. Verify that the relevant game name, value, ranking, material mapping or action order still matches.
3. Update source data when it changed.
4. Update `sourceUpdatedAt` only when the source itself shows a newer update date.
5. Update `verifiedAt` when the project review is complete.
6. Keep evidence authority separate from freshness. A fresh community source must not silently overwrite an older official or current-client label.

## Compatibility

The contract is read-only with respect to product data. It does not change formulas, canonical IDs, localStorage schemas, share payloads, Pages behavior or Worker API contracts.
