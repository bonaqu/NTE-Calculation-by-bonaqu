# Shinku direct-action reconciliation

Verified: 2026-08-06.

This document separates Shinku's direct level-10 action ratios, temporary state modifiers, passive triggers and Rotation Lab repetition counts.

## Sources

Primary ratio table:

- Icy Veins, `Shinku Profile, Skills & Ultimates`, updated 2026-07-31.
- URL: `https://www.icy-veins.com/neverness-to-everness/shinku-profile-skills`

Rotation order and count cross-check:

- Prydwen Institute, `Shinku`, updated 2026-07-13.
- URL: `https://www.prydwen.gg/neverness-to-everness/characters/shinku`

The Icy Veins table is used for the published level-10 hit components. Prydwen is used to confirm that one Surging Crimson window aims for five Scarlet Descent casts, followed by up to three Crimson Judgment instances and Dragonflame Verdict.

## Exact standalone actions

| Stable action ID | Published composition | Stored ratio | Scope |
| --- | --- | ---: | --- |
| `shinku.high-speed-breach.level-10` | 34.6% + 46.2% + 159.1% | **239.9% ATK** | one normal Redirect Skill |
| `shinku.scarlet-descent.level-10` | 44.8% + 435% | **479.8% ATK** | one enhanced Redirect Skill |
| `shinku.crimson-fury.level-10` | 37% + 239.9% + 109.9% × 5 + 287.9% + 85% | **1199.3% ATK** | direct Ultimate entry damage only |
| `shinku.crimson-judgment.one-dash.level-10` | 119.9% × 4 | **479.6% ATK** | one dash instance only |
| `shinku.dragonflame-verdict.level-10` | 40% × 10 + 799.6% | **1199.6% ATK** | separate Ultimate finisher |

All five records retain English ability names in Russian copy because direct Russian-client names have not been verified.

## Surging Crimson is not part of the action ratio

Crimson Fury creates a 13-second Surging Crimson state with +30% DMG.

The implementation stores this as the temporary source-only effect:

- `shinku.surging-crimson.damage`;
- duration: 13 seconds;
- recipient: Shinku only;
- modifier: +30% DMG.

It is not multiplied into Scarlet Descent, Crimson Judgment or Dragonflame Verdict records. This prevents the same state bonus from being embedded in the ratio and applied again by the scenario effect system.

## Excluded conditional modifiers

The baseline records do not include:

- Awakening 6's 30% ratio increase to Scarlet Descent, Crimson Judgment and Dragonflame Verdict;
- Resonance 1's additional Surging Crimson damage bonus;
- Menacing Gaze Instant Strike;
- Charge Enhancement passive damage;
- target or Cycle effects from other characters.

Existing passive records remain standalone:

- `shinku.charge-enhancement.level-11`;
- `shinku.menacing-gaze-eight.level-11`.

They are not attached automatically to every direct Skill or Ultimate action.

## Rotation Lab binding decisions

### Preparation

`shinku-prep` receives one High-Speed Breach action but stays partial. The source combines:

- building eight stacks;
- using one Skill;
- building four more stacks;
- choosing either another Skill or a dodge counter.

Only the guaranteed first Skill is deterministic. Stack generation, Instant Strike and the second alternative remain in the partial remainder.

### Ultimate entry

`shinku-ultimate` receives:

1. `shinku.crimson-fury.level-10`;
2. pending `shinku.surging-crimson.damage`.

The effect remains inert in an order-only import until activation seconds are explicitly confirmed.

### Five enhanced Skills

`shinku-enhanced-skills` receives five explicit instances of `shinku.scarlet-descent.level-10`.

The source count is fixed, but the Basic Attacks between casts are described as one or two depending on resource state. They remain an unsupported remainder rather than receiving an invented count.

### Three dashes and finisher

`shinku-dashes` receives:

1. Crimson Judgment instance 1;
2. Crimson Judgment instance 2;
3. Crimson Judgment instance 3;
4. Dragonflame Verdict.

This source step is fully bound because the count and finisher order are explicit. No seconds are assigned.

### Recovery

`shinku-recovery` receives one High-Speed Breach action but stays partial. The source also requires rebuilding eight stacks, triggering the associated Instant Strike condition and swapping to Zero; those operations are not represented by the direct Skill record.

## Coverage change

| Metric | Before Shinku research | After Shinku research |
| --- | ---: | ---: |
| verified action catalog | 86 | **91** |
| exact Rotation Lab binding entries | 17 | **22** |
| full source-step bindings | 3 | **4** |
| partial source-step bindings | 14 | **18** |
| unsupported source steps | 41 | **36** |
| bound action steps | 23 | **35** |
| promoted recipes | 5 | **5** |
| promoted recipe action steps | 22 | **34** |
| confirmed-second recipes | 0 | **0** |

The Shinku recipe now contains 14 exact action steps and 9 visible gaps. It remains a partial action order rather than a complete DPS rotation.

## Remaining Shinku-preset gaps

The only fully unsupported source steps in `shinku-charge` are now:

- `zero-fill` — direct Zero Ultimate and Redirect Skill records are still missing;
- `nanally-charge` — direct Nanally Ultimate and Redirect Skill records are still missing.

Five other source steps remain partial because their operations, temporary effects or variable Basic Attack counts are deliberately not synthesized.
