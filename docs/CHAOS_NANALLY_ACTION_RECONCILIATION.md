# Chaos and Nanally exact-action reconciliation

Verified 2026-08-06.

## Chaos

- Doubtmark level 10: `164.9 + 434.8 = 599.7% ATK`.
- Retribution level 10: `254.5 × 4 + 581.5 = 1599.5% ATK`.
- Enhanced Final Verdict at 1000 Crime: `114.9 × 2 + 799.6 × 2 = 1829% ATK`.
- The sourced rotation uses two separate instances of the same enhanced Final Verdict record.
- Dread Echo is a Crime-generation state, not an extra damage ratio.
- Warrant, Remora Enhancement, A2, A3 and A6 remain separate.

Primary ratio source: Icy Veins Chaos profile, updated 2026-07-28. Rotation cross-check: Prydwen Chaos profile, updated 2026-07-08.

## Nanally corrective integration

PR #127 added six exact Batch H records but did not include its described effect, bindings, tests or audit updates. This change completes that missing integration.

- Ichi-daime’s Authority is a source-only 12-second `+30% CRIT DMG` modifier.
- It ends on swap according to the source description; the current scenario remains order-only until seconds are explicitly confirmed by the user.
- Nanally own Basic/Heavy strings and Underboss responses stay separate.
- Fair Duel and Awakening 3 are never substituted for direct strings.

## Audit result

The immutable 41-step baseline remains unchanged. Exact bindings resolve five Shinku, four Nanally and three Chaos source steps, leaving 29 current gaps.
