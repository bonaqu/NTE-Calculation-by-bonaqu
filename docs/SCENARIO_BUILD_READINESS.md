# Combat Scenario build readiness

This layer connects imported or manually authored Combat Scenario rows with the player's saved Build Profiles.

It answers a narrow question:

> Can the current visible build calculate the exact actions and activate the verified effects already present in this scenario?

It does not rank builds, estimate full rotation DPS or recommend the strongest profile.

## Checked build requirements

For every action row assigned to a team slot:

- final in-client ATK must be positive;
- an exact published Skill level must match exactly;
- minimum Awakening must be met;
- lower-level-target requirements are checked against the current target and character levels;
- the action must still belong to the character in that slot.

For every character-effect row:

- the effect must belong to the slot character;
- Base ATK is required only when the verified effect scales from Base ATK;
- minimum Awakening must be met.

For supported Esper Cycle rows, the report separately checks the numerical model and required team attributes.

## Profile comparison

Only profiles with the exact same character identity are shown for a slot.

Each candidate is evaluated with the same requirements as the current build. Library order is preserved; candidates are not sorted by ATK, CRIT, expected damage or an invented score.

A candidate marked `ready` means it satisfies the exact rows currently assigned to that slot. It does not mean the build is optimal.

## Unambiguous selection

`Select unambiguous` fills the selection only when all of the following are true:

- the slot participates in the scenario;
- its current build is not already ready;
- exactly one matching saved profile passes every requirement.

This action only fills dropdowns. It never changes the team.

## Atomic apply

The player explicitly presses `Apply selected`.

Before changing any slot, the domain layer validates the complete selection:

- every profile still exists;
- every profile matches its slot character;
- one profile is not reused for multiple slots.

The profiles are then applied to an isolated next-team value. Any failure returns an error and no partial team value.

Existing Build Profile safety remains in force:

- active team effects are cleared;
- Arc post-Ultimate state is cleared;
- target state and scenario timing are unchanged;
- no selected standalone test is imported from the profile.

## Storage compatibility

No new persistent schema is introduced.

The readiness report is derived at runtime from:

- `nte.team.visible.v1`;
- `nte.team.scenario.v1`;
- `nte.build-profiles.v1`.

Selections and notices are temporary interface state.
