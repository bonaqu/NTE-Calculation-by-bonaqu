# Hathor Remora team CRIT Rate effect

## Verified mechanic

Hathor's current passive reference states that:

- Remora is extended to 12 seconds;
- allies attacking a target affected by Remora gain 10% CRIT Rate.

The project models this as an explicit conditional target window rather than a permanent character stat.

## Product behavior

Effect ID:

`hathor.delay-warning.remora-crit-rate`

The player must explicitly confirm that Remora is active on the target being tested. Merely placing Hathor in the team activates nothing.

When enabled:

- source: Hathor;
- recipients: all four team slots;
- modifier: +10 percentage points of CRIT Rate;
- duration: 12 seconds;
- scenario interval: `[activation, activation + 12)`;
- final saved Attributes are not changed.

An activation at `0.0s` applies to an action at `11.9s` and is expired for an action at `12.0s`.

## Formula integration

The modifier is added to the player's final displayed CRIT Rate only in the temporary calculation input:

`effective CRIT Rate = displayed CRIT Rate + active verified team CRIT Rate`

Calculation-core clamps the effective value to 100%. The effect does not change:

- ATK;
- CRIT DMG;
- generic DMG Bonus;
- target DEF;
- the stored player profile.

## Scope restrictions

The implementation does not:

- infer Remora from team composition;
- apply the effect to a different target;
- calculate Charge reaction damage;
- infer reapplication or refresh timing;
- treat +10% as multiplicative chance;
- present `Delay Warning` as a confirmed Russian-client title.

The English title remains visible with a disclosed localization fallback until current Russian-client evidence is available.
