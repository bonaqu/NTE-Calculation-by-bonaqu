# NTE Calculation by bonaqu

Bilingual RU/EN theorycrafting toolkit for **Neverness to Everness** with transparent formulas, source metadata and explicit model limitations.

> Status: public release with production-verified GitHub Pages and Cloudflare Worker deployments. Formula and data revisions are tracked through issues and pull requests.

## Included tools

- **Team Calculation** — guided four-character selection, simplified quick inputs, exact advanced breakdown and a shared enemy DEF/RES profile.
- **Rotation Lab** — source-backed Shinku Charge and Hathor Hypercarry action order, persistent training checklists, team transfer and an attribute-driven Esper Cycle explorer.
- **Arcs Calculation** — separate sourced Prydwen and Rivyn Elowen Iroi benchmarks plus a custom team model with static and conditional effects separated.
- **Roster Progression** — multi-character ascension plan for all 20 released characters with separate paid breakpoints, one shared inventory pool, aggregate shortages, boss-farming routes, compact share links and JSON backup/import.
- **Character Database** — 22 sourced profiles with rarity, attribute, role, compatible Arc type, release status and direct provenance. Twenty released profiles are complete; Linko and Zankou keep unannounced role/Arc fields explicitly unknown.
- **Arc Database & Methodology** — complete 47-Arc searchable catalog, formula version and source registry.
- **Cloudflare API** — versioned JSON datasets and deterministic calculation endpoints.

## Russian-first interface

When RU is selected, Russian labels and project/community translations are primary. Canonical English character, Arc and material names remain visible as secondary reference text. Common abbreviations such as `ATK`, `DEF`, `HP`, `CRIT`, `DPS`, `MAX` and `MIN` stay unchanged.

The database searches both Russian and English names. Character cards can open the compatible Arc type directly, while the team calculator prevents accidental duplicate character selection and keeps canonical names stable across language changes.

## Roster progression data policy

The progression planner models the six character ascensions paid at levels 20, 30, 40, 50, 60 and 70. Those payments unlock the level-80 cap.

- All 20 released characters have an exact common-material family, Anomaly Hunt drop and direct Icy Veins profile source.
- The universal cost curve is cross-checked across current character profile pages.
- Shared materials are aggregated across the full plan before one shared inventory is subtracted.
- Linko and Zankou are excluded until released progression data is public.
- Character EXP, abilities, passives, Life Skills and Arc costs are intentionally excluded instead of being approximated.
- The previous Iroi-only local planner state migrates into the new roster model.
- Share links omit inventory by default. Inventory is included only through an explicit opt-in.
- Opening a shared URL shows an Apply/Dismiss preview instead of silently overwriting local state.
- JSON export is a full local backup. Imported files are size-limited, versioned and normalized before they can replace saved state.

## Rotation data policy

Rotation presets describe **sourced action order and conditions**, not invented frame data. The current release includes:

- Shinku Charge — Shinku / Hathor / Zero / Nanally;
- Hathor Hypercarry — Hathor / Jiuyuan / Zero / Haniel.

Every preset stores its direct guide URL, guide update date and project verification date. Exact animation durations, swap delays and DPS are not presented when the source does not publish a reproducible second-by-second model. The Cycle explorer derives reactions only from verified character attributes and the sourced six pair plus two triple Esper Cycle definitions.

## Arc model v0.2

The custom Arc comparison ranks by modeled **total team damage**:

```text
Team DMG = Iroi DMG + Base Ally DMG × (1 + Ally Bonus × Conditional Uptime)
```

- Arc substats and always-on passives apply at 100%.
- The uptime control scales explicitly conditional effects only.
- Ally-only damage bonuses modify ally damage, not the wearer.
- Effects that cannot be reproduced from the current public sources are omitted and labeled instead of guessed.

## Production

- Site: `https://bonaqu.github.io/NTE-Calculation-by-bonaqu/`
- Progression planner: `https://bonaqu.github.io/NTE-Calculation-by-bonaqu/#/progression`
- Rotation Lab: `https://bonaqu.github.io/NTE-Calculation-by-bonaqu/#/rotations`
- Worker: `https://nte-calculation-api.bonaqu.workers.dev`
- Health: `https://nte-calculation-api.bonaqu.workers.dev/api/v1/health`

## Local development

Requires Node.js 24+.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm test
npm run build
npm run worker:check
```

Worker development:

```bash
npm run worker:dev
```

## API routes

- `GET /api/v1`
- `GET /api/v1/health`
- `GET /api/v1/data/arcs` — complete 47-Arc catalog with per-entry source IDs
- `GET /api/v1/data/arc-presets` — calculator-specific modeled Arc presets
- `GET /api/v1/data/characters` — 22 sourced character profiles with released/upcoming counts
- `GET /api/v1/data/esper-cycles` — six sourced pair reactions and two sourced triple reactions
- `GET /api/v1/data/rotation-presets` — source-backed ordered rotation presets with bilingual steps and timing limitations
- `GET /api/v1/data/progression/characters` — 20 released-character ascension profiles, six-step curve, 20 materials, seven boss drops and source metadata
- `GET /api/v1/data/progression/iroi` — compatibility endpoint for the previous Iroi-only dataset
- `POST /api/v1/calculate/damage`
- `POST /api/v1/calculate/team`

## Deployments

- GitHub Pages deploys from `bonaqu_projects` through `.github/workflows/pages.yml`.
- Cloudflare Worker `nte-calculation-api` deploys through `.github/workflows/worker.yml` using repository secrets.
- A release is considered deployed only after the workflow verifies the public Pages URL and the current API contracts for Arcs, characters, Esper Cycles, rotations and roster progression.
- Deployment evidence is posted automatically to release-tracking issue #5.

## Data policy

Verified source data is kept separate from editable assumptions. General Arc catalog entries are not reused as calculator presets unless their behavior is modeled and tested. The Wrong Gate uses a current independent source because the public Prydwen Arc index still exposes that entry as incomplete. Released character profiles require direct provenance. Upcoming characters preserve unknown fields instead of filling them with guesses. Rotation steps preserve sourced order while unsupported timing and damage values stay explicitly unknown. Progression totals include only the exact ascension scope documented in-product. Formula and dataset changes must include source metadata and a verification date.

## Disclaimer

Fan-made project. Not affiliated with Hotta Studio or Perfect World Games. Game names and artwork belong to their respective owners. Reference artwork, character cards and Arc icons are used for identification with attribution in the in-app source registry.
