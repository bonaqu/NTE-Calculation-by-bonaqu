# Verified standalone actions — Batch C

Batch C adds 21 exact level-10 records for four characters already used in sourced Rotation Lab teams.

The public verified-action catalog grows from 14 to 35 records. Partial character models grow from 7 to 11.

## Evidence policy

Each record represents one published cast, one listed hit composition or one explicitly scoped trigger.

The model does not derive:

- animation duration;
- casts per rotation;
- cooldown usage;
- total DoT ticks from duration and interval;
- the number of possible Parry, Power Word or Ensemble triggers;
- hidden Awakening, Resonance or stack modifiers.

All records require the exact source skill category at level 10. The calculator blocks another level instead of interpolating a coefficient.

Unique skill names remain in current English source wording when Russian-client wording has not been confirmed. Russian copy describes the action type and arithmetic without inventing a localized title.

## Haniel — four records

- `Genesse Technique` full five-stage Basic Attack sequence — 475.2% ATK;
- `Silent Moonlit Forest Guardian` direct Skill hit — 399.8% ATK;
- `A Melody Named Haniel` initial Ultimate hit — 599.7% ATK;
- `Easter Egg Time` one Support Skill hit — 399.8% ATK.

Ensemble, Symphony and enhanced active-character follow-ups are excluded until they have their own deterministic standalone records.

## Sakiri — four records

- `Devour Whole` press — 799.6% ATK;
- `Devour Whole` hold — 799.6% ATK;
- `Feast of Gluttony` six listed hits — 1799.2% ATK;
- `Squash!` one Support Skill hit — 399.8% ATK.

A2 target-mass scaling, A3 defeated-enemy stacks and other conditional Awakening modifiers are not silently applied. The A4 team ATK window remains a separate verified timed effect.

## Baicang — eight records

- `Heart of Heaven and Earth` one hit — 239.9% ATK;
- `Silenced Thought` three missiles plus explosion — 839.6% ATK;
- `Such Crime` one Skill cast — 559.7% ATK;
- `Judgment of Autumn` initial domain expansion — 799.6% ATK;
- one domain DoT tick — 80% ATK;
- one Silence trigger — 599.7% ATK;
- one Objurgate trigger — 399.8% ATK;
- one Bless composition — 120% ATK.

The one-tick record remains one tick even though the source also describes duration and interval. Power Word records remain independent one-trigger actions. Healing from Bless is outside the damage formula.

## Daffodill — five records

- `Still Waters` full listed normal sequence — 600.2% ATK;
- `Echoes` enhanced sequence — 599.7% ATK;
- `Finale` initial direct composition — 1598.7% ATK;
- one successful Parry Attack extra hit — 599.7% ATK;
- `Crossed Blades` one Support Skill hit — 399.8% ATK.

The Parry record is not multiplied by available Phantom Step charges. The Ultimate's separate 10% increase and the Phantom Step +80% passive are not applied to unrelated records.

## Coverage derivation

Partial combat coverage is now derived from the verified-action catalog. A released character receives `verified-action` mode only when the current catalog contains at least one record for that character.

This removes the previous manually maintained partial-character list and keeps these contracts aligned:

- Character Database coverage;
- Team Calculator action selector;
- Combat Scenario action selector;
- evidence freshness tests;
- Worker combat-model metadata.

A `partial` model still means that only selected standalone triggers are verified. It never means the full character rotation is complete.

## Production contract

The deployed Worker contract requires:

- 35 verified actions;
- 11 partial character models;
- metadata presence for representative Batch C records;
- successful exact-action POST calculations for Haniel, Sakiri, Baicang and Daffodill.
