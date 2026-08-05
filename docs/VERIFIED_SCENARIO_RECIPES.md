# Verified action scenario recipes

This layer converts the shared exact-action catalog into reproducible `nte.team.scenario.v1` drafts without upgrading partial evidence into a full rotation model.

## Standalone recipes

Every `VerifiedVisibleAction` produces exactly one `VerifiedActionScenarioRecipe`.

The compiler creates:

- one `action` step;
- the canonical action ID;
- the slot that already contains the action owner;
- no team mutation;
- no automatic repetition;
- no inferred animation timing.

A zero-second standalone step is a local reference origin. It does not claim that the action occurs at combat time zero, that it has zero duration, or that it occupies this position in a real rotation.

Alternative records remain separate. For example:

- Chaos Remora at the base five-second duration;
- Chaos Remora at the maximum twelve-second duration;
- Adler Tranquility with five tested hits;
- Adler Tranquility against one remaining enemy with ten tested hits.

The compiler never adds those alternatives together.

## Timing evidence

Timing is absent unless a dedicated evidence record exists.

Current explicit constraints:

| Action | Constraint | Automatic repetition |
| --- | ---: | --- |
| Chaos Remora Enhancement, base duration | relative offset: 5 seconds after Remora application | no |
| Chaos Remora Enhancement, maximum duration | relative offset: 12 seconds after Remora application | no |
| Jiuyuan Awakening 6 retaliation | minimum 5 seconds after the previous trigger | no |

A minimum-spacing constraint is metadata, not permission to synthesize another trigger. Jiuyuan therefore still compiles into one action step.

## Multi-action fragments

Multi-action fragments are a manually reviewed allow-list. They require stable action IDs and a direct source for order or count.

The first fragment is Hathor's published main burst:

1. Rider Express;
2. Cyclone Strike, first use;
3. Cyclone Strike, second use;
4. Cyclone Strike, third use.

All four steps keep the same zero-second reference timestamp. Their array order is meaningful; elapsed seconds are unknown.

## Validation contract

`validateVerifiedActionScenarioRecipes()` rejects:

- missing or duplicate standalone coverage;
- unknown action IDs;
- character ownership mismatches;
- unsupported occurrence policies;
- invalid timing values;
- timing without complete provenance;
- invalid or single-action “rotation fragments”.

The current aggregate contract is:

- 86 verified actions;
- 86 standalone recipes;
- 20 represented released characters;
- 0 automatic repeats;
- 2 explicit relative offsets;
- 1 explicit minimum-spacing constraint;
- 1 sourced multi-action fragment containing 4 actions.

## Deliberate non-goals

This layer does not estimate:

- animation duration;
- swap delay;
- energy generation or cooldown recovery;
- Cycle gauge timing;
- DoT tick count from duration;
- uses per rotation;
- complete rotation DPS.

Those values can be introduced only through separate source-backed evidence and focused tests.
