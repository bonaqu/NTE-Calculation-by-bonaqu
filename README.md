# NTE Calculation by bonaqu

Bilingual RU/EN theorycrafting toolkit for **Neverness to Everness** with transparent formulas, source metadata and explicit model limitations.

> Status: public release with production-verified GitHub Pages and Cloudflare Worker deployments. Formula and data revisions are tracked through issues and pull requests.

## Included tools

- **Team Calculator** — four-character, game-visible build editor. The normal path asks only for values shown by the NTE client: final ATK/HP/DEF, CRIT stats, damage bonuses, Charge Speed, Cycle/Break Intensity, Arc, skill levels, Awakening, Console and a supported test mode.
- **Rotation Lab** — six sourced four-character rotations, persistent practice checklists, confirmed RU/EN character terms, team transfer and an attribute-driven Esper Cycle explorer.
- **Arcs Calculation** — complete 47-Arc catalog, sourced comparison scenarios and per-character recommendations with static and conditional effects kept separate.
- **Roster Progression** — multi-character ascension plan for all 20 released characters with one shared inventory, aggregate shortages, farming routes, bulk import and atomic ready-stage payment.
- **Character Database** — 22 sourced profiles with rarity, attribute, role, compatible Arc type, release status and direct provenance.
- **Methodology and data health** — searchable terminology evidence plus automatic source freshness and metadata checks.
- **Cloudflare API** — versioned JSON datasets and deterministic legacy and game-visible calculation endpoints.

## Game-visible Team Calculator

The primary calculator follows one rule:

> A normal player enters only values or switches visible in the current game client. Hidden coefficients are sourced by the project or remain unavailable.

### Final ATK is not double-counted

The value labelled **Атака / ATK** on the Attributes screen already represents the current equipped build. It is used directly:

```text
calculation base ATK = displayed final ATK
calculation Arc ATK = 0
calculation flat ATK = 0
calculation ATK% = 0
```

Arc ATK and its static effects remain visible build metadata. They are not added to final ATK a second time.

### Test modes

- **Current build / reference hit** — normalized `100% ATK` comparison at neutral resistance.
- **Post-Ultimate window** — the same reference with separately verified conditional effects.
- **Training target** — normalized comparison against player-entered target level and resistance.
- **Verified action** — an exact sourced coefficient at one exact supported skill level. Unsupported levels are blocked rather than interpolated.

A normalized result is labelled as a comparison test. It is never presented as the damage of an unnamed skill or as full-rotation DPS.

### Character coverage

Every released character has an explicit combat-model state:

- `verified` — concrete actions are fully verified;
- `partial` — only listed actions or windows are verified;
- `relative-only` — visible-stat comparisons are available, exact actions are not;
- `unavailable` — no supported calculation path.

The foundation model uses owner-supplied current Russian-client screenshots for Shinku's visible build and labels. Shinku starts as `partial`; the other released characters start as `relative-only` until exact action tables are audited.

### Storage compatibility

The new calculator uses:

```text
nte.team.visible.v1
```

Legacy manual state remains untouched for rollback and explicit future migration:

```text
nte.team.v2
nte.team.duration.v2
nte.team.enemy.v2
nte.team.confirmed-digest.v1
nte.team.sequence-builder.v1
```

Legacy user-entered multipliers are never silently relabelled as verified game data.

## Russian-first interface

Current Russian-client labels are primary when confirmed. The Shinku screenshots establish, among others:

- `Атака`, `Защита`, `ОЗ`;
- `Шанс крит. удара`, `Крит. урон`;
- `Скорость зарядки`;
- `Интенсивность цикла`;
- `Интенсивность разрушения`;
- `Бонус к урону` and attribute-specific damage bonuses;
- `Базовая атака`, `Навык`, `Сверхспособность`, `Навык поддержки`;
- `Дуга`, `Смешивание`, `Пробуждение`, `Способность эспера`, `Консоль`, `Восхождение`.

`АТК`, `ЗАЩ` and `ОЗ` remain available as compact abbreviations where the UI needs shortened labels. Canonical English names remain searchable and visible as secondary references.

## Roster progression data policy

The progression planner models the six character ascensions paid at levels 20, 30, 40, 50, 60 and 70. Those payments unlock the level-80 cap.

- All 20 released characters have an exact common-material family, Anomaly Hunt drop and direct Icy Veins profile source.
- Shared materials are aggregated across the full plan before one shared inventory is subtracted.
- Bulk inventory import accepts Russian names, English names and internal IDs with all-or-nothing validation.
- Atomic payment spends only complete ready stages and never consumes one shared resource twice.
- Linko and Zankou are excluded until released progression data is public.
- Character EXP, abilities, passives, Life Skills and Arc costs remain excluded instead of being approximated.

## Rotation data policy

Rotation presets describe **sourced action order and conditions**, not invented frame data. The current catalog includes:

- Shinku Charge;
- Hathor Hypercarry;
- Chaos Remora Bomb;
- Nanally Hexed Dual;
- Lacrimosa Discord damage-over-time loop;
- Baicang Firefly Hypercarry.

Every preset stores its direct guide source, guide update date and project verification date. Exact animation durations, swap delays and DPS are not presented when the source does not publish a reproducible second-by-second model.

## Arc model

General Arc catalog entries are kept separate from calculator models. A conditional effect enters a calculation only through an explicit condition or uptime input. Effects that cannot be reproduced from current sources remain omitted and labelled instead of guessed.

## Production

- Site: `https://bonaqu.github.io/NTE-Calculation-by-bonaqu/`
- Team Calculator: `https://bonaqu.github.io/NTE-Calculation-by-bonaqu/#/team`
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

### Data

- `GET /api/v1`
- `GET /api/v1/health`
- `GET /api/v1/data/arcs`
- `GET /api/v1/data/arc-presets`
- `GET /api/v1/data/characters`
- `GET /api/v1/data/combat-models` — all released-character coverage states and verified visible actions
- `GET /api/v1/data/esper-cycles`
- `GET /api/v1/data/rotation-presets`
- `GET /api/v1/data/progression/characters`
- `GET /api/v1/data/progression/iroi` — compatibility endpoint

### Calculation

- `POST /api/v1/calculate/damage` — legacy low-level deterministic model
- `POST /api/v1/calculate/team` — legacy low-level team model
- `POST /api/v1/calculate/visible-team` — normalized `nte.team.visible.v1` payload

The visible endpoint rejects malformed versions, normalizes ranges and preserves the no-double-counting ATK rule.

## Deployments

- GitHub Pages deploys from `bonaqu_projects` through `.github/workflows/pages.yml`.
- Cloudflare Worker `nte-calculation-api` deploys through `.github/workflows/worker.yml` using repository secrets.
- The production Worker workflow validates API `0.7.0`, all six rotations, the 20-profile progression fixture, combat-model coverage and an actual Shinku visible-input POST where final ATK must remain `2026`, not `2026 + 570`.
- Deployment evidence is posted automatically to release-tracking issue #5.

## Data policy

Verified source data is kept separate from editable assumptions. UI coverage is not treated as numerical evidence. A character can be selectable while exact skill damage remains unsupported. Formula and dataset changes require source metadata and verification dates. Conflicts and incomplete data stay visible instead of being silently normalized into confident-looking values.

## Disclaimer

Fan-made project. Not affiliated with Hotta Studio or Perfect World Games. Game names and artwork belong to their respective owners. Reference artwork, character cards and Arc icons are used for identification with attribution in the in-app source registry.
