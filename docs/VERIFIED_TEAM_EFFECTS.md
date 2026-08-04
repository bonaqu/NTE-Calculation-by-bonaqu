# Verified conditional team effects

## Purpose

The Team Calculator stores final out-of-combat Attributes exactly as shown by the game. Temporary support effects are derived separately for one selected combat moment and never overwrite those saved values.

This prevents both common errors:

1. adding permanent Arc, Console or progression stats a second time;
2. permanently baking a temporary support window into a character build.

## Conditional support input

A support source stores only:

- `baseAtk` when an enabled effect explicitly scales from Base ATK;
- `activeTeamEffectIds` for combat windows the player confirms are active.

Old `nte.team.visible.v1` saves remain valid. Missing support fields normalize to `0` and `[]`.

## Initial effect registry

### Haniel — Победила дружба!

Trigger: Nova ends.

- Each selected team slot gains flat ATK equal to 8% of Haniel's Base ATK.
- The source also describes outgoing ATK loss on the target.
- Enemy outgoing damage is outside the current calculator scope, so that portion is retained in the effect description but not inserted into our damage formula.
- The buff is restored/reset when leaving combat according to the source.

### Sakiri A4 — Жажда уверенности

Trigger: Feast of Gluttony is cast.

- Requires Sakiri A4.
- Team members other than Sakiri gain flat ATK equal to 30% of Sakiri's Base ATK.
- Duration: 20 seconds.
- Sakiri is excluded by the source and by the recipient engine.

### Sakiri — Озорной трюк

Trigger: Airborne or Suppress is inflicted.

- Enemy DEF is reduced by 10%.
- Duration: 20 seconds.
- The condition must be enabled explicitly. Merely placing Sakiri in the team does not apply it.

## Calculation flow

For each source slot:

1. Read enabled effect IDs.
2. Reject unknown effects or effects owned by another character.
3. Validate required Base ATK and Awakening.
4. Derive recipient slots.
5. Build temporary per-slot modifiers.
6. Call the normal visible-build calculation with those modifiers.
7. Attach provenance to each affected result.

A flat support buff enters calculation-core as `flatAtk`. Final displayed ATK remains `baseAtk` in the flattened damage input:

```text
baseAtk = final displayed ATK
flatAtk = temporary verified support contribution
arcAtk = 0
atkPercent = 0
```

The source build object and every recipient's saved `stats.atk` remain unchanged.

## Provenance

Every affected result records:

- effect ID;
- source slot and source character;
- derived amount;
- modifier kind;
- localized explanation.

Blocked effects are returned in `VisibleTeamCalculation.teamEffects` with a localized reason instead of silently doing nothing.

## API

Worker API 0.8.0 exposes the definitions in `GET /api/v1/data/combat-models` and returns evaluations from `POST /api/v1/calculate/visible-team`.

Production checks cover:

- Haniel Base ATK 500 → +40 ATK to all four slots;
- Sakiri Base ATK 600 at A4 → +180 ATK to the three other slots;
- Sakiri receives no A4 ATK bonus;
- Sakiri Impish Trick adds 10% target DEF reduction provenance;
- Shinku final ATK remains 2026 and Arc ATK is not added again.

## Adding another effect

A new effect must define:

- source character;
- exact trigger;
- duration;
- recipient policy;
- Base ATK ratio or target modifier;
- Awakening requirement when applicable;
- source and supporting source URLs;
- source update and project verification dates;
- unit, UI and production-contract tests.

Do not add a team effect from a recommendation summary when the exact in-game effect wording is unavailable.
