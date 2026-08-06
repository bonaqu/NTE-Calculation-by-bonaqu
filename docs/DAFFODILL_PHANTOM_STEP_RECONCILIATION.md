# Daffodill Phantom Step reconciliation

Verified 2026-08-06.

## Exact action

Icy Veins publishes the level-10 Phantom Step ratio as:

`136.1% + 110.5% × 4 + 220.9% = 799% ATK`.

The raw action is stored as `daffodill.phantom-step.level-10`. The following remain separate:

- Finale's state-wide +10% damage increase;
- Cicada Shell's +80% Phantom Step damage;
- `daffodill.finale.one-parry-extra.level-10` at 599.7% ATK, which requires a successful parry;
- Awakening and Resonance modifiers.

Sources: Icy Veins Daffodill profile, updated 2026-07-28; Prydwen Daffodill profile, updated 2026-05-26.

## Rotation mapping

Finale unlocks Phantom Step for up to two uses and resets its charges. Prydwen describes Phantom Step as activating when switching to Daffodill. Both `lacrimosa-discord-dot` and `baicang-firefly-hyper` explicitly contain first and second enhanced Daffodill attacks after Finale and require quick swaps during their animations.

Each source step therefore maps to one standalone instance of the same action ID. The two uses are not aggregated into one 1598% action.

## Coverage result

- action catalog: 106 → 107;
- exact bindings: 29 → 33;
- full source-step bindings: 8 → 12;
- current unsupported steps: 29 → 25;
- bound/promoted action steps: 45 → 49;
- current missing-action gaps: 13 → 9.

The immutable 41-step baseline remains unchanged. Zero becomes the only remaining missing-action research priority.
