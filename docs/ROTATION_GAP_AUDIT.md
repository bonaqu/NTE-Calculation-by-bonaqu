# Rotation Lab gap audit

Verified: 2026-08-06.

This report preserves the original PR #123 audit and derives the current unresolved set after exact Shinku action research.

## Immutable baseline

The initial audit exhausted the then-current 86-action catalog against every source step that had no exact Rotation Lab binding after PR #120.

All 41 baseline unsupported source steps were classified. None could safely receive an existing action ID without changing the actor, ability variant, condition, hit composition or source order.

| Classification | Shinku | Hathor | Chaos | Nanally | Lacrimosa | Baicang | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Missing action record | 5 | 3 | 5 | 6 | 5 | 2 | **26** |
| Effect or Cycle condition | 0 | 1 | 0 | 0 | 2 | 0 | **3** |
| Non-damage operation | 0 | 3 | 1 | 2 | 1 | 1 | **8** |
| Ambiguous source step | 2 | 0 | 0 | 0 | 0 | 2 | **4** |
| Exact existing action | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Compound existing actions | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| **Unsupported source steps** | **7** | **7** | **6** | **8** | **8** | **5** | **41** |

The baseline remains in `src/rotation-gap-audit.ts`. It is intentionally not rewritten when a later research PR closes one of its entries.

## Current unresolved view

`src/rotation-gap-audit-current.ts` filters the baseline through current exact bindings.

Five Shinku source steps are now bound:

- `shinku-prep`;
- `shinku-ultimate`;
- `shinku-enhanced-skills`;
- `shinku-dashes`;
- `shinku-recovery`.

| Current classification | Count |
| --- | ---: |
| Missing action record | **23** |
| Effect or Cycle condition | **3** |
| Non-damage operation | **8** |
| Ambiguous source step | **2** |
| Exact existing action | **0** |
| Compound existing actions | **0** |
| **Current unsupported source steps** | **36** |

The current catalog contains 91 verified actions. It is exhausted against these remaining 36 steps without fuzzy matching or semantic substitution.

## Binding history

### PR #123

One exact omission was found inside the existing partial `shinku-charge:hathor-open` binding:

- old action order: Rider Express;
- new action order: Rider Express → first Cyclone Strike;
- Remora timing and the prose remainder stayed omitted.

This raised Shinku Charge from one to two exact action steps and produced a fifth partial recipe.

### Shinku direct-action research

Five new standalone records were added:

- High-Speed Breach;
- Scarlet Descent;
- Crimson Fury direct entry damage;
- one Crimson Judgment instance;
- Dragonflame Verdict.

They close five baseline gaps while preserving partial remainders for variable operations.

## Before and after Shinku direct-action research

| Preset | Before bound actions | Current bound actions | Before unsupported | Current unsupported | Change |
| --- | ---: | ---: | ---: | ---: | --- |
| Shinku · Charge team | 2 | **14** | 7 | **2** | direct Shinku window added |
| Hathor · Hypercarry | 6 | 6 | 7 | 7 | none |
| Chaos · Remora Bomb | 3 | 3 | 6 | 6 | none |
| Nanally · Dual DPS Hexed | 1 | 1 | 8 | 8 | catalog remains insufficient |
| Lacrimosa · DoT Discord | 5 | 5 | 8 | 8 | none |
| Baicang · Firefly Hyper | 6 | 6 | 5 | 5 | none |
| **Total** | **23** | **35** | **41** | **36** | **+12 bound actions; −5 unsupported steps** |

Promoted recipe count remains five. Promoted action steps increase from 22 to 34.

## Rejected substitutions that remain protected

Examples protected by the registry and regression tests:

- Zero Awakening extra hits are not used as her direct Ultimate or Redirect Skill;
- Nanally Fair Duel and Awakening 3 follow-ups are not used as her five Basic or three Charged Attacks;
- Chaos Remora Enhancement detonation is not used as her Ultimate or enhanced Heavy Attack;
- Lacrimosa Broken-target Discord bonus is not used as her transformation or Basic string;
- Daffodill Echoes Redirect Skill and Finale Parry extra hit are not used as her enhanced Basic Attacks;
- Adler's five-hit and ten-hit Ultimate variants are not chosen without the source condition, and Evil's Bane is not moved ahead of the unresolved Ultimate;
- one Baicang Silenced Thought action is not repeated an unknown number of times for a mixed “until Ultimate ends” step.

Shinku passive records also remain separate from her direct actions. Charge Enhancement and Menacing Gaze are not automatically attached to High-Speed Breach, Scarlet Descent, Crimson Fury, Crimson Judgment or Dragonflame Verdict.

## Classification rules

### Missing action record

The source names a damage action or explicit sequence, but the catalog lacks a record with matching actor, ability variant, condition and hit composition.

### Effect or Cycle condition

The source step creates or maintains an Esper Cycle or another combat condition but does not name one standalone damage action. These conditions require confirmed activation timing before entering a calculation timeline.

### Non-damage operation

Swap-only instructions, Energy routing, cooldown recovery and loop restarts remain operational notes rather than damage.

### Ambiguous source step

The step mixes alternatives, conditional repetition, different variants or unresolved order. It remains blocked until the source is decomposed into deterministic actions.

## Current research order

1. Nanally Redirect Skill, Ultimate, five Basic Attacks and three Charged Attacks;
2. Chaos Ultimate and first/second enhanced Heavy Attacks;
3. Lacrimosa transformation, Basic string and advance-to-fifth action;
4. Daffodill first/second enhanced Basic Attacks;
5. Zero direct Ultimate and Redirect Skill.

Every future record must be researched as an exact standalone action before a source-step binding is added. Coverage percentage is not an acceptance criterion by itself.
