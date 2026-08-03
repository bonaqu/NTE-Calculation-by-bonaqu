# NTE Calculation by bonaqu

Bilingual RU/EN theorycrafting toolkit for **Neverness to Everness** with transparent formulas, source metadata and explicit model limitations.

> Status: first public calculator foundation. Formula and data revisions are tracked through issues and pull requests.

## Included tools

- **Team Calculation** — editable four-slot aggregate rotation model with shared enemy DEF/RES profile.
- **Arcs Calculation** — sourced Iroi team benchmark plus a separate custom-stat partial model.
- **Character Progression** — Iroi ascension inventory planner through the level-80 unlock.
- **Database & Methodology** — 22-character catalog, Arc presets, formula version and source registry.
- **Cloudflare API** — versioned JSON data and deterministic calculation endpoints.

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
- `GET /api/v1/data/arcs`
- `GET /api/v1/data/characters`
- `GET /api/v1/data/progression/iroi`
- `POST /api/v1/calculate/damage`
- `POST /api/v1/calculate/team`

## Deployments

- GitHub Pages deploys from `bonaqu_projects` through `.github/workflows/pages.yml`.
- Cloudflare Worker `nte-calculation-api` deploys through `.github/workflows/worker.yml` using `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` repository secrets.

## Data policy

Verified source data is kept separate from editable assumptions. Unknown mechanics are omitted or marked as partial estimates. Formula and dataset changes must include source metadata and a verification date.

## Disclaimer

Fan-made project. Not affiliated with Hotta Studio or Perfect World Games. Game names and artwork belong to their respective owners. Reference artwork and Arc icons are used for identification with attribution in the in-app source registry.
