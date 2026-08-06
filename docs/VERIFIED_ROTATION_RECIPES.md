# Verified Rotation Lab recipes

This layer promotes only exact action bindings from Rotation Lab into reusable `nte.team.scenario.v1` recipes.

It does not convert the full prose rotation into a damage timeline.

## Current audit

| Preset | Source steps | Full bindings | Partial bindings | Unsupported | Verified action steps | Promoted |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Shinku · Charge team | 8 | 0 | 1 | 7 | 2 | partial action order — Hathor preparation only |
| Hathor · Hypercarry | 11 | 1 | 3 | 7 | 6 | partial action order |
| Chaos · Remora Bomb | 9 | 0 | 3 | 6 | 3 | partial action order |
| Nanally · Dual DPS Hexed | 9 | 0 | 1 | 8 | 1 | no — only one exact action |
| Lacrimosa · DoT Discord | 11 | 0 | 3 | 8 | 5 | partial action order |
| Baicang · Firefly Hyper | 10 | 2 | 3 | 5 | 6 | partial action order |
| **Total** | **58** | **3** | **14** | **41** | **23** | **5 recipes / 22 actions** |

The Shinku recipe contains only the exact Hathor setup published inside the source step: Rider Express followed by the first Cyclone Strike. It does not claim to model Shinku's Ultimate window.

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

All 41 unsupported source steps are classified in `src/rotation-gap-audit.ts`:

| Classification | Count | Meaning |
| --- | ---: | --- |
| `missing-action-record` | 26 | The source names a damage action or sequence that has no semantically matching catalog record. |
| `effect-or-cycle-condition` | 3 | The source step is an effect or Esper Cycle condition, not a standalone damage action. |
| `non-damage-operation` | 8 | Swap, Energy routing, recovery or restart operation. |
| `ambiguous-source-step` | 4 | The step mixes alternatives, variable repetition or unresolved variants. |
| `exact-existing-action` | 0 | No unsupported step safely maps to one current action. |
| `compound-existing-actions` | 0 | No unsupported step safely maps to a current action combination. |

The existing 86-action catalog was exhausted before producing this result. Similar passives, different Skill variants and conditional extra hits are recorded as rejected look-alikes rather than silently substituted.

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

## Repetition audit

Fixed counts are recorded only when the source explicitly states or enumerates them. Current examples include:

- five Shinku enhanced Skills;
- three Shinku Ultimate dashes;
- three Hathor Cyclone Strikes;
- two Chaos enhanced Heavy Attacks;
- five Nanally Basic Attacks and three Charged Attacks;
- five Lacrimosa Basic Attacks;
- two Daffodill enhanced attacks in the Lacrimosa and Baicang plans;
- three Baicang Basic Attacks.

Only Hathor currently has separate verified action IDs for every published repeated use in its own burst step. Those uses compile as three explicit actions, not a repeat-count field.

The Shinku setup uses only the first Cyclone Strike because that source step names one Redirect Skill after Rider Express; it does not import Hathor's second and third burst variants.

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

The gap registry ranks the next exact records by how much real recipe coverage they unlock:

1. Shinku Ultimate window, five enhanced Skills and three dashes;
2. Nanally Redirect Skill, Ultimate, five Basics and three Charged Attacks;
3. Chaos Ultimate and two enhanced Heavy Attacks;
4. Lacrimosa transformation and Basic sequence;
5. Daffodill first and second enhanced Basic Attacks;
6. Zero direct Ultimate and Redirect Skill.

This is a research backlog, not permission to bind a generic action with a similar name.

## Non-goals

This layer does not infer:

- animation duration;
- swap delay;
- cooldown recovery;
- energy generation;
- number of DoT ticks;
- attacks performed “until the window ends”;
- full-rotation DPS coverage.
