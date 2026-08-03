# NTE Calculation by bonaqu

Bilingual RU/EN theorycrafting toolkit for **Neverness to Everness** with transparent formulas, source metadata and explicit model limitations.

> Status: public release with production-verified GitHub Pages and Cloudflare Worker deployments. Formula and data revisions are tracked through issues and pull requests.

## Included tools

- **Team Calculation** — guided four-character selection, editable aggregate rotation values and a shared enemy DEF/RES profile.
- **Arcs Calculation** — separate sourced Prydwen and Rivyn Elowen Iroi benchmarks plus a custom team model with static and conditional effects separated.
- **Character Progression** — Iroi ascension inventory planner through the level-80 unlock.
- **Character Database** — 22 sourced profiles with rarity, attribute, role, compatible Arc type, release status and direct provenance. Twenty released profiles are complete; Linko and Zankou keep unannounced role/Arc fields explicitly unknown.
- **Arc Database & Methodology** — complete 47-Arc searchable catalog, formula version and source registry.
- **Cloudflare API** — versioned JSON datasets and deterministic calculation endpoints.

## Russian-first interface

When RU is selected, Russian labels and project/community translations are primary. Canonical English character, Arc and material names remain visible as secondary reference text. Common abbreviations such as `ATK`, `DEF`, `HP`, `CRIT`, `DPS`, `MAX` and `MIN` stay unchanged.

The database searches both Russian and English names. Character cards can open the compatible Arc type directly, while the team calculator prevents accidental duplicate character selection and keeps canonical names stable across language changes.

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
- `GET /api/v1/data/progression/iroi`
- `POST /api/v1/calculate/damage`
- `POST /api/v1/calculate/team`

## Deployments

- GitHub Pages deploys from `bonaqu_projects` through `.github/workflows/pages.yml`.
- Cloudflare Worker `nte-calculation-api` deploys through `.github/workflows/worker.yml` using `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` repository secrets.
- A release is considered deployed only after the workflow verifies the public Pages URL, API version, Arc provenance, calculator preset values and the 22-character data contract.
- Deployment evidence is posted automatically to release-tracking issue #5.

## Data policy

Verified source data is kept separate from editable assumptions. General Arc catalog entries are not reused as calculator presets unless their behavior is modeled and tested. The Wrong Gate uses a current independent source because the public Prydwen Arc index still exposes that entry as incomplete. Released character profiles require a direct source and verified rarity, attribute, role and Arc compatibility. Upcoming characters preserve unknown fields instead of filling them with guesses. Formula and dataset changes must include source metadata and a verification date.

## Disclaimer

Fan-made project. Not affiliated with Hotta Studio or Perfect World Games. Game names and artwork belong to their respective owners. Reference artwork, character cards and Arc icons are used for identification with attribution in the in-app source registry.
