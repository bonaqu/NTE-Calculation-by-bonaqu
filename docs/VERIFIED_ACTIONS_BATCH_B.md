# Verified action batch B: Hathor and Jiuyuan

This batch expands the public standalone-action catalog from 9 to 14 records and partial combat coverage from 5 to 7 characters.

## Hathor

Current level-10 values are stored as four separate records:

| Record | Source composition | Stored multiplier |
|---|---:|---:|
| Cyclone Strike first use | `85.8 × 7` | `600.6` |
| Cyclone Strike second use | `286.3 + 227.1 + 286.3` | `799.7` |
| Cyclone Strike third use | `393.6 + 705.8` | `1099.4` |
| Rider Express | `192.3 × 2 + 1014.7` | `1399.3` |

All four require the exact sourced Skill or Ultimate level 10.

The records do not silently apply:

- Emergency Delivery stack ATK;
- Awakening 4 CRIT Rate;
- Awakening 5 damage bonus;
- Awakening 6 CRIT DMG;
- Resonance modifiers.

Those mechanics need separate condition/modifier models before they may change a calculation.

### Why held Aerial Command is excluded

The current source publishes a per-instance damage-over-time ratio but does not publish a deterministic number of ticks for one real held cast against one target. Multiplying that ratio by an assumed tick count would create an unsupported total, so no exact action record is shipped.

## Jiuyuan

`Know Every Secret` is stored as one A6 retaliation trigger:

- `200%` DMG Ratio;
- target is bound by Lethal Rose Pact;
- the bound target casts a skill;
- five-second internal cooldown;
- no automatic repetition over a scenario or rotation.

## Localization

Hathor and Jiuyuan unique English titles remain visible as disclosed current-English-reference fallback where current Russian-client evidence is unavailable. Functional Russian descriptions explain the calculation without asserting an invented official translation.

## Awakening reference

Jiuyuan A1–A6 are added to Character Database reference coverage. A6 alone links to the current calculation record; A1–A5 remain informational.

## Product status

The new characters are marked `partial`, not verified or complete. Exact-action selection and Combat Scenario can use these records, but full skill strings, conditional modifiers, animation timing and complete rotations remain unsupported.
