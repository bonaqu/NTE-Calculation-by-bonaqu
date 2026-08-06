# Rotation Lab gap audit

Verified: 2026-08-06.

This report exhausts the existing 86-action catalog against every source step that had no exact Rotation Lab binding after PR #120.

## Result

All 41 baseline unsupported source steps are classified. None can safely receive an existing action ID without changing the actor, ability variant, condition, hit composition or source order.

| Classification | Shinku | Hathor | Chaos | Nanally | Lacrimosa | Baicang | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Missing action record | 5 | 3 | 5 | 6 | 5 | 2 | **26** |
| Effect or Cycle condition | 0 | 1 | 0 | 0 | 2 | 0 | **3** |
| Non-damage operation | 0 | 3 | 1 | 2 | 1 | 1 | **8** |
| Ambiguous source step | 2 | 0 | 0 | 0 | 0 | 2 | **4** |
| Exact existing action | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Compound existing actions | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| **Unsupported source steps** | **7** | **7** | **6** | **8** | **8** | **5** | **41** |

## Binding change outside the 41 unsupported steps

One exact omission was found inside an existing partial binding:

- preset: `shinku-charge`;
- source step: `hathor-open`;
- published order: trigger Remora, use Rider Express, then use one Redirect Skill;
- old action order: Rider Express;
- new action order: Rider Express → first Cyclone Strike;
- still omitted: Remora timing and the unsupported remainder of the source step.

The second and third Cyclone Strike variants are not added. They belong to Hathor's separate three-strike burst sequence and are not stated by the Shinku setup step.

## Before and after

| Preset | Before bound actions | After bound actions | Before promoted | After promoted | Change |
| --- | ---: | ---: | --- | --- | --- |
| Shinku · Charge team | 1 | 2 | no | partial | first Cyclone Strike added after Rider Express |
| Hathor · Hypercarry | 6 | 6 | partial | partial | none |
| Chaos · Remora Bomb | 3 | 3 | partial | partial | none |
| Nanally · Dual DPS Hexed | 1 | 1 | no | no | catalog remains insufficient |
| Lacrimosa · DoT Discord | 5 | 5 | partial | partial | none |
| Baicang · Firefly Hyper | 6 | 6 | partial | partial | none |
| **Total** | **22** | **23** | **4 recipes / 20 actions** | **5 recipes / 22 actions** | **+1 bound action; +1 partial recipe** |

The new Shinku recipe is not a Shinku damage rotation. It contains two verified Hathor setup actions from one source step and keeps all seven unsupported source steps visible.

## Rejected substitutions

Examples protected by the registry and regression tests:

- Shinku passive triggers are not used as her Ultimate, five enhanced Skills, three dashes or recovery Skill;
- Zero Awakening extra hits are not used as her direct Ultimate or Redirect Skill;
- Nanally Fair Duel and Awakening 3 follow-ups are not used as her five Basic or three Charged Attacks;
- Chaos Remora Enhancement detonation is not used as her Ultimate or enhanced Heavy Attack;
- Lacrimosa Broken-target Discord bonus is not used as her transformation or Basic string;
- Daffodill Echoes Redirect Skill and Finale Parry extra hit are not used as her enhanced Basic Attacks;
- Adler's five-hit and ten-hit Ultimate variants are not chosen without the source condition, and Evil's Bane is not moved ahead of the unresolved Ultimate;
- one Baicang Silenced Thought action is not repeated an unknown number of times for a mixed “until Ultimate ends” step.

## Classification rules

### Missing action record

The source names a damage action or explicit sequence, but the catalog lacks a record with matching actor, ability variant, condition and hit composition.

### Effect or Cycle condition

The source step creates or maintains an Esper Cycle or another combat condition but does not name one standalone damage action. These conditions require confirmed activation timing before entering a calculation timeline.

### Non-damage operation

Swap-only instructions, Energy routing, cooldown recovery and loop restarts remain operational notes rather than damage.

### Ambiguous source step

The step mixes alternatives, conditional repetition, different variants or unresolved order. It remains blocked until the source is decomposed into deterministic actions.

## Research order

1. Shinku direct Ultimate window, five enhanced Skills and three dashes;
2. Nanally Redirect Skill, Ultimate, five Basic Attacks and three Charged Attacks;
3. Chaos Ultimate and first/second enhanced Heavy Attacks;
4. Lacrimosa transformation, Basic string and advance-to-fifth action;
5. Daffodill first/second enhanced Basic Attacks;
6. Zero direct Ultimate and Redirect Skill.

Every future record must be researched as an exact standalone action before a source-step binding is added. Coverage percentage is not an acceptance criterion by itself.
