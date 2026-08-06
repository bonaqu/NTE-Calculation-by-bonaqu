# Verified Rotation Lab recipes

This layer promotes only exact action bindings from Rotation Lab into reusable `nte.team.scenario.v1` recipes.

It does not convert the full prose rotation into a damage timeline.

## Current audit

| Preset | Source steps | Full bindings | Partial bindings | Unsupported | Verified action steps | Promoted |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Shinku · Charge team | 8 | 1 | 5 | 2 | 14 | partial action order |
| Hathor · Hypercarry | 11 | 1 | 3 | 7 | 6 | partial action order |
| Chaos · Remora Bomb | 9 | 0 | 3 | 6 | 3 | partial action order |
| Nanally · Dual DPS Hexed | 9 | 0 | 1 | 8 | 1 | no — only one exact action |
| Lacrimosa · DoT Discord | 11 | 0 | 3 | 8 | 5 | partial action order |
| Baicang · Firefly Hyper | 10 | 2 | 3 | 5 | 6 | partial action order |
| **Total** | **58** | **4** | **18** | **36** | **35** | **5 recipes / 34 actions** |

Shinku now has a source-ordered 14-action partial recipe:

1. one High-Speed Breach from the preparation step;
2. Rider Express and first Cyclone Strike from Hathor setup;
3. Crimson Fury;
4. five Scarlet Descent casts;
5. three Crimson Judgment instances;
6. Dragonflame Verdict;
7. one recovery High-Speed Breach.

Its nine gaps remain visible: two completely unsupported support steps, five partial remainders and two unconfirmed temporary effects.

Nanally remains audit-only because its preset still exposes only one exact bound action.

## Promotion rules

A recipe step requires all of the following:

1. a stable Rotation Lab preset ID;
2. a stable source-step ID;
3. an exact binding entry;
4. a current verified action ID;
5. matching source-step actor and action owner.

The recipe preserves source-step order and binding-array order. No title similarity or fuzzy matching is used.

## Gap classification

The immutable PR #123 baseline keeps all original 41 unsupported source steps in `src/rotation-gap-audit.ts`.

`src/rotation-gap-audit-current.ts` filters that baseline through current exact bindings. Five Shinku steps were resolved, leaving:

| Classification | Current count | Baseline count |
| --- | ---: | ---: |
| `missing-action-record` | 23 | 26 |
| `effect-or-cycle-condition` | 3 | 3 |
| `non-damage-operation` | 8 | 8 |
| `ambiguous-source-step` | 2 | 4 |
| `exact-existing-action` | 0 | 0 |
| `compound-existing-actions` | 0 | 0 |
| **Total** | **36** | **41** |

The current 91-action catalog is exhausted against the remaining unsupported steps. Similar passives, different Skill variants and conditional extra hits remain rejected look-alikes rather than substitutions.

## Gaps

The recipe stores gaps rather than inventing replacements for:

- source steps without exact action bindings;
- the unsupported remainder of a partial binding;
- team effects without confirmed activation seconds;
- Esper Cycles without confirmed activation seconds.

A partial recipe therefore means “these actions are verified in this relative order”, not “this is the complete rotation”.

## Timing

All current promoted recipes are `order-only`.

Every generated action receives the same local `0s` marker. Array order is meaningful; elapsed seconds are unknown.

Rotation Lab currently contains no direct per-step second evidence. A recipe cannot become `confirmed-seconds` unless a separate evidence record identifies the source step, numeric time and timing relation.

Shinku's Surging Crimson is a verified 13-second +30% DMG state, but the Rotation Lab source does not provide a confirmed activation timestamp for the imported timeline. The effect therefore stays pending until the user confirms scenario timing.

## Repetition audit

Fixed counts are recorded only when the source explicitly states or enumerates them. Current examples include:

- five Shinku Scarlet Descent casts — promoted as five explicit instances;
- three Shinku Crimson Judgment instances — promoted as three explicit instances;
- three Hathor Cyclone Strikes — promoted with first/second/third action IDs;
- two Chaos enhanced Heavy Attacks — still missing action records;
- five Nanally Basic Attacks and three Charged Attacks — still missing;
- five Lacrimosa Basic Attacks — still missing;
- two Daffodill enhanced attacks in the Lacrimosa and Baicang plans — still missing;
- three Baicang Basic Attacks — the existing partial binding covers only the following Redirect Skill.

The Shinku finisher is not folded into the third dash. Dragonflame Verdict remains a separate action after three Crimson Judgment instances.

Condition-bound repetition remains count-free:

- Lacrimosa ↔ Daffodill repeats until support Energy is restored;
- Baicang Dodge Charged Attacks repeat until Ultimate ends.

## Compilation policy

A promoted recipe requires the complete four-character source lineup already to be present in the current team. The compiler:

- never changes the lineup;
- never creates or replaces builds;
- writes only the existing Combat Scenario v1 shape;
- preserves Rotation Lab source-step provenance in the existing import metadata shape;
- emits action steps only;
- leaves effect and Cycle conditions as gaps.

## Missing-action research priority

The current gap registry ranks the next exact records by how much real recipe coverage they unlock:

1. Nanally Redirect Skill, Ultimate, five Basics and three Charged Attacks;
2. Chaos Ultimate and two enhanced Heavy Attacks;
3. Lacrimosa transformation and Basic sequence;
4. Daffodill first and second enhanced Basic Attacks;
5. Zero direct Ultimate and Redirect Skill.

Shinku direct-action research is complete for the currently sourced Rotation Lab window. This does not imply that every possible Shinku action or passive combination is modeled.

## Non-goals

This layer does not infer:

- animation duration;
- swap delay;
- cooldown recovery;
- energy generation;
- number of DoT ticks;
- variable Basic Attack count between Scarlet Descent casts;
- attacks performed “until the window ends”;
- full-rotation DPS coverage.
