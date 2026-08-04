# Game-visible Team Calculator

The primary Team Calculator no longer asks a normal player for hidden model inputs.

## Input rule

The normal path accepts only values or states visible in the NTE client:

- character and level;
- final displayed HP, ATK and DEF;
- CRIT Rate and CRIT DMG;
- generic and attribute-specific DMG Bonus;
- Charge Speed, Cycle Intensity and Break Intensity;
- equipped Arc, Arc level, secondary stat and Mixing rank;
- explicit Arc condition switches shown by the Arc description;
- visible Basic Attack, Skill, Ultimate and Support Skill levels;
- visible Awakening and Console information;
- a supported test mode.

The normal page contains no skill multiplier or hit-count input.

## Final ATK rule

The final ATK displayed on the Attributes screen is used directly:

```text
calculation base ATK = displayed final ATK
calculation Arc ATK = 0
calculation flat ATK = 0
calculation ATK% = 0
```

Arc ATK and static Arc bonuses are retained as visible build metadata. They are not added a second time because they are already reflected by the displayed final ATK.

## Test modes

### Neutral reference

Uses one normalized `100% ATK` reference hit against zero resistance. It compares visible builds but is not labelled as a specific skill or full rotation.

### Post-Ultimate reference

Uses the same normalized reference hit and applies only separately verified conditional effects. For Shinku with Blushing Mirage, the explicit toggle applies the current Mixing-rank Cosmos DMG and DEF Ignore values after Ultimate.

### Training target

Uses the normalized hit against player-entered target level, resistance and reductions.

### Verified action

Uses an exact coefficient only when the character, action and exact skill level match a sourced record. Unsupported levels are blocked; the system does not interpolate values.

The initial verified Shinku actions are:

- one Charge Enhancement passive trigger at Basic Attack level 11: `863.6% ATK`;
- Instant Strike at eight special-state stacks and Basic Attack level 11: `215.9% ATK × 8`.

Neither is presented as Shinku's complete rotation.

## Character coverage

Every released character has an explicit combat-model coverage record:

- `verified` — concrete supported actions are fully verified;
- `partial` — only listed scenarios are verified;
- `relative-only` — visible-stat reference tests are available, but exact actions are not;
- `unavailable` — no calculation path is available.

The foundation release marks Shinku as `partial` and all other released characters as `relative-only`. This is intentional: complete UI coverage must not be confused with complete numerical evidence.

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

The primary route uses the new state. Legacy manual data remains available for an explicit later migration and is never silently relabelled as verified client data.

## First-party Shinku evidence

The repository owner's current Russian-client screenshots confirm:

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
- Basic Attack / Skill / Ultimate 9/11 and Support Skill 8/10;
- Console Grid Type 2 and four Type III modules in the shown recommendation;
- current Russian labels used by the new interface.

The screenshots are evidence for visible values and labels, not for hidden coefficients.

## Worker API

```text
GET  /api/v1/data/combat-models
POST /api/v1/calculate/visible-team
```

The data endpoint exposes coverage and verified actions. The calculation endpoint normalizes the versioned visible-build payload before calculation.

## Visual policy

The interface is an original implementation inspired by NTE's high-level visual language:

- charcoal layered panels;
- magenta active tabs;
- yellow secondary emphasis;
- strong borders and large numeric hierarchy;
- compact stat rows and an asymmetric three-column workspace.

No game UI textures, screenshots or proprietary interface assets are copied into the site.
