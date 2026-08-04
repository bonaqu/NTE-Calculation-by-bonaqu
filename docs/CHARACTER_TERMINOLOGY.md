# Character-specific terminology

Verified: 2026-08-04

## Why this registry exists

Character names and generic actions are not enough for Rotation Lab. A guide may say “use Ultimate”, while the current Russian client gives that action a unique name. Mixing generic descriptions, English guide names and guessed Russian translations makes the interface look plausible while obscuring which wording is actually supported.

`src/character-terms.ts` is the source of truth for character-specific labels used by the project.

## What a record means

Each `CharacterTermRecord` contains:

- a stable project ID;
- the canonical character identity;
- term kind;
- Russian and English labels;
- resolution state;
- evidence level;
- source publisher;
- direct Russian and English record URLs;
- verification date;
- aliases or conflicting variants;
- a bilingual evidence note.

The registry covers skills, passives, states, resources, marks, companions, QTE/support actions and named sub-actions.

## Evidence level

The primary source used in this delivery is **NTE Neverness to Everness Database**. Its footer explicitly identifies it as a fan project not affiliated with or endorsed by the publisher. Therefore its entries are classified as `current-russian-reference`, not `official-russian`.

The source is useful because its Russian and English pages expose parallel game-data records. It does not outrank:

1. wording directly confirmed in the current client;
2. official Russian publications;
3. owner-confirmed current-client screenshots.

If stronger evidence later conflicts with this registry, the stronger evidence should replace the primary label while the previous form remains recorded as an alternative when useful for search or migration.

## Resolution states

### `exact`

The Russian and English labels can be mapped to the same skill slot, state, resource or effect in parallel records.

### `conflicted`

The current source is internally inconsistent. The project retains one primary pair and exposes all observed alternatives. It must not silently normalize the conflict.

Current example: Jiuyuan's Rose Pact mark appears as both:

- `Смертоносный договор розы` / `Fatal Rose Pact`;
- `Фатальный договор розы` / `Lethal Rose Pact`.

### `unresolved`

A current reproducible rotation exists, but a sufficiently reliable Russian record for the character's unique skill names was not found. The interface keeps understandable action descriptions instead of inventing exact labels.

Current unresolved Rotation Lab actors:

- Shinku;
- Chaos;
- Baicang.

## Rotation binding

`src/rotation-step-terms.ts` maps stable `presetId:stepId` keys to term IDs.

This is intentionally separate from the rotation datasets:

- existing preset IDs do not change;
- existing step IDs do not change;
- stored progress remains compatible;
- terminology can be corrected without rewriting action order;
- a term can be shown in both plan and practice views;
- unresolved characters remain descriptive.

The validator rejects:

- an unknown preset/step key;
- an unknown term ID;
- a term belonging to another character;
- an unresolved coverage record used as though it were an exact skill.

## Special identity rule: Zero

`Зеро` remains the primary character name.

`Оценщик` is recorded as:

- a passive skill name;
- a contextual title/address;
- a search term where appropriate.

It must not replace the character name in selectors, team cards or rotation actors.

## Freshness

Every record stores `verifiedAt`. The character-term test suite uses a real-date-compatible hard horizon so the daily freshness workflow eventually fails when the registry is no longer reviewed.

Freshness describes review age only. It does not convert a fan transcription into an official source.

## Out of scope

This delivery does not:

- change skill numbers or damage formulas;
- infer animation duration;
- add exact labels for unresolved actors;
- replace current rotation order;
- modify localStorage, sharing or Worker contracts;
- claim rendered browser screenshot QA.
