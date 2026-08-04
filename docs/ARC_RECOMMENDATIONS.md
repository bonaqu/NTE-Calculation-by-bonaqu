# Character Arc recommendation policy

The Arc page contains two deliberately separate products:

1. **Character recommendations** transcribed and summarized from current Prydwen character guides.
2. **Iroi calculation tools** consisting of source-specific benchmark tables and the project's transparent partial model.

A recommendation must never be presented as a result of the project's calculation unless it was actually produced by that model.

## Coverage

The dataset verified on 2026-08-04 covers all 20 characters marked as released in `src/characters.ts`:

Adler, Aurelia, Baicang, Chaos, Chiz, Daffodill, Edgar, Fadia, Haniel, Hathor, Hotori, Iroi, Jiuyuan, Lacrimosa, Mint, Nanally, Sakiri, Shinku, Skia and Zero.

Linko and Zankou are intentionally excluded while their project status is `upcoming` and no equivalent current guide dataset is available.

## Source

Each character entry points directly to its Prydwen guide:

`https://www.prydwen.gg/neverness-to-everness/characters/<character>`

The dataset stores both:

- `sourceUpdatedAt`: the update date shown by that character guide;
- `verifiedAt`: the date the project checked and transcribed the recommendation.

The project should re-check a character when its source update date changes or when a game update materially changes the character or Arc pool.

## Quantitative and qualitative recommendations

Prydwen does not publish one uniform data format for every character.

### Quantitative

Some guides publish relative calculations. The project stores those values exactly as `relativePercent`. A displayed `100%` is only the baseline of that one source comparison. It is not a universal Arc power score and must not be compared across characters or unrelated scenarios.

### Qualitative

Some guides publish a recommended order and comments but no comparable percentage. Those entries keep `relativePercent` absent. The UI displays rank/order and explicitly says that no percentage was published.

### Mixed

Zero has a quantified standard comparison plus a separate specialist pseudo-healer option. The specialist recommendation is marked separately and receives no fabricated percentage.

## Integrity contract

`src/arc-recommendations.test.ts` requires that:

- every released character has exactly one guide;
- upcoming characters are excluded;
- every recommendation references an Arc in the 47-Arc directory;
- the Arc type matches the character's compatible Arc type;
- Mixing level is explicit and valid;
- duplicate `Arc + Mixing` identities are rejected within a guide;
- optional percentages are finite and positive;
- source and verification metadata are valid;
- specialist recommendations remain visibly separate.

## UI contract

The character browser shows:

- localized character and Arc names with canonical English lookup names in Russian mode;
- character rarity, attribute, role and compatible Arc type;
- source publisher, guide update date and project verification date;
- exact Mixing level;
- a relative percentage only when the source published one;
- the Arc effect for interpretation;
- compatible but unranked Arcs in a separate collapsed list.

Type compatibility alone is never described as a recommendation.
