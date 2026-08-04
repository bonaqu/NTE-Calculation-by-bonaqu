# Game-visible Team Calculator

The primary Team Calculator asks a normal player only for values or states visible in the NTE client. Hidden coefficients come from dated source records or remain unavailable.

## Input rule

The normal path accepts:

- character, level and Awakening;
- final displayed HP, ATK and DEF;
- CRIT Rate and CRIT DMG;
- generic and attribute-specific DMG Bonus;
- Charge Speed, Cycle Intensity and Break Intensity;
- equipped Arc, Arc level, secondary stat and Mixing rank;
- explicit Arc condition switches shown by the Arc description;
- visible Basic Attack, Skill, Ultimate and Support Skill levels;
- visible Console information;
- a supported test mode.

The normal page contains no skill-multiplier or hit-count input.

## Final ATK rule

The final ATK displayed on the Attributes screen is used directly:

```text
calculation base ATK = displayed final ATK
calculation Arc ATK = 0
calculation flat ATK = 0
calculation ATK% = 0
```

Arc ATK and static Arc bonuses are retained as visible build metadata. They are not added a second time because they are already reflected by displayed final ATK.

## Test modes

### Neutral reference

Uses one normalized `100% ATK` reference hit against zero resistance. It compares visible builds but is not labelled as a specific skill or full rotation.

### Post-Ultimate reference

Uses the same normalized reference and applies only separately verified conditional effects. Shinku with Blushing Mirage can explicitly enable the current Mixing-rank Cosmos DMG and DEF Ignore window after Ultimate.

### Training target

Uses the normalized hit against player-entered target level, resistance and reductions.

### Verified action

Uses an exact standalone coefficient only when every stated requirement matches:

- character;
- exact skill level when the value is level-dependent;
- minimum Awakening when required;
- target-level condition when required;
- separately stated trigger condition.

Unsupported combinations are blocked. The site does not interpolate between skill levels and does not reconstruct missing multi-hit animation data.

## Character coverage

Every released character has an explicit combat-model state:

- `verified` — concrete supported actions are fully verified;
- `partial` — only listed actions or windows are verified;
- `relative-only` — visible-stat comparisons are available, exact actions are not;
- `unavailable` — no supported calculation path exists.

Current partial models:

- Shinku;
- Nanally;
- Chaos;
- Lacrimosa;
- Zero.

The other 15 released characters remain `relative-only`. Complete character selection is not presented as complete numerical coverage.

## Verified standalone actions — batch A

The current registry contains nine actions across five characters.

### Shinku

- one Charge Enhancement passive trigger at Basic Attack level 11: `863.6% ATK`;
- one Instant Strike at eight special-state stacks and Basic Attack level 11: `215.9% ATK × 8`.

Neither record represents Shinku's complete rotation.

### Nanally

- one Fair Duel trigger at Basic Attack level 11: `129.5% ATK`;
- one Awakening 3 follow-up at Basic Attack level 11: `107.9% ATK`.

The latter requires Awakening 3 or higher. Both represent one trigger, not the full Ichi-daime's Authority duration.

### Chaos

- one Remora end at the base five-second duration: `800% ATK`;
- one Remora end at the maximum 12-second duration: `3200% ATK`.

The maximum record applies the source-listed capped `+300%` increase to the base value. It is one passive detonation, not Chaos's Ultimate-window rotation.

### Lacrimosa

- one Discord Enhancement trigger on an already Broken target: `400% ATK`.

This record excludes normal Discord damage and requires the target to already be Broken.

### Zero

- Awakening 1 additional hit against a lower-level target: `200% ATK` with `75% DEF Ignore` for that hit;
- Awakening 6 Appraise and Engrave extra damage against a lower-level target: `300% ATK`.

The first requires Awakening 1 or higher; the second requires Awakening 6. The target level is compared with the visible character level before calculation.

## Condition provenance

Every result lists how each applied value entered the test:

- `player` — visible value entered by the player;
- `verified-data` — exact sourced coefficient or effect;
- `test-preset` — selected standalone trigger condition.

Action-specific DEF Ignore is applied only to the matching action. It does not become a permanent target reduction for other tests.

## Storage and migration

New state:

```text
nte.team.visible.v1
```

Legacy state remains untouched:

```text
nte.team.v2
nte.team.duration.v2
nte.team.enemy.v2
nte.team.confirmed-digest.v1
nte.team.sequence-builder.v1
```

Legacy user-entered multipliers are never silently relabelled as verified client data.

## First-party Shinku evidence

Owner-supplied current Russian-client screenshots confirm:

- Shinku, Cosmos, Hybrid, Damage;
- Level 70/70 and five unlocked Awakening levels;
- HP 21,316;
- ATK 2,026;
- DEF 968;
- CRIT Rate 79.00%;
- CRIT DMG 176.40%;
- DMG Bonus 8.00%;
- Cosmos DMG Bonus 10.00%;
- Charge Speed 100.00%;
- Cycle Intensity 0;
- Break Intensity 48;
- Blushing Mirage Level 80, ATK 570, CRIT Rate 24.00%, Mixing P1;
- Basic Attack / Skill / Ultimate 9 and Support Skill 8;
- Console Grid Type 2 and four Type III modules in the shown recommendation;
- current Russian labels used by the interface.

The screenshots verify visible values and labels, not hidden coefficients.

## Worker API

```text
GET  /api/v1/data/combat-models
POST /api/v1/calculate/visible-team
```

The data endpoint exposes all 20 coverage records and the nine verified actions. The calculation endpoint normalizes the versioned visible-build payload before calculation.

Production verification performs real POST requests for:

- Shinku final ATK `2026`, proving Arc ATK `570` is not added again;
- Nanally Fair Duel at `129.5% ATK`;
- Zero Awakening 1 at `200% ATK` with action-specific DEF Ignore provenance.

## Evidence freshness

Every exact action stores:

- source publisher;
- direct source URL;
- source update date;
- project verification date.

Tests reject duplicate IDs, missing metadata, stale exact-action evidence and mismatch between partial coverage and the characters that actually have exact action records.

## Visual policy

The interface is an original implementation inspired by NTE's high-level visual language:

- charcoal layered panels;
- magenta active tabs;
- yellow secondary emphasis;
- strong borders and large numeric hierarchy;
- compact stat rows and an asymmetric three-column workspace.

No game UI textures, screenshots or proprietary interface assets are copied into the site.
