# Sourced Rotation Catalog

Verified: 2026-08-04

Rotation Lab contains action-order plans only when a direct current character guide publishes enough information to reproduce the sequence without inventing missing timings.

## Complete presets

| ID | Featured character | Team | Cycles in plan | Guide updated |
|---|---|---|---|---|
| `shinku-charge` | Shinku | Shinku · Hathor · Zero · Nanally | Remora → Blossom → Charge | 2026-07-13 |
| `hathor-hyper` | Hathor | Hathor · Jiuyuan · Zero · Haniel | Blossom → Stain → Remora → Charge | 2026-06-23 |
| `chaos-remora-bomb` | Chaos | Chaos · Zero · Hathor · Haniel | Remora → Stain | 2026-07-08 |
| `nanally-hexed-dual` | Nanally | Nanally · Jiuyuan · Zero · Sakiri | Blossom → Hexed | 2026-06-23 |
| `lacrimosa-discord-dot` | Lacrimosa | Lacrimosa · Haniel · Sakiri · Daffodill | Nova → Scorch → Discord | 2026-06-23 |
| `baicang-firefly-hyper` | Baicang | Baicang · Adler · Sakiri · Daffodill | Scorch | 2026-06-23 |

Every source URL points directly to the featured character guide, not to a generic catalog page.

## Translation policy

Core client-facing terms use the shared evidence-backed terminology registry. Unique skill names are not translated by this dataset unless a reliable current Russian client label is available. Added presets describe the action type and result instead of creating a plausible but unsupported Russian title.

English instructions may retain the canonical guide wording where it helps identify the source action.

## Timing policy

The source guides publish ordered actions, swap-cancel conditions, repeated sub-rotations and energy conditions. They do not publish a complete reproducible animation timeline.

Therefore Rotation Lab does not derive:

- seconds per step;
- total rotation duration;
- action frame counts;
- DPS from the sequence;
- a fixed number of repetitions for conditional recovery loops.

Optional recovery steps are marked optional and do not block practice completion.

## Validation

CI validates all six presets for:

- exactly four unique known released characters;
- at least eight bilingual steps;
- unique step IDs;
- every actor belonging to the preset team;
- every declared Esper Cycle being possible from the team attributes;
- direct Prydwen character-guide URL;
- guide update and project verification dates;
- honest timing-policy text;
- preservation of the original `shinku-charge` and `hathor-hyper` IDs.

The catalog summary is derived at runtime. It reports complete preset count, represented featured characters, guide-date range, verification date and currently released characters that still lack a reproducible sourced preset.
