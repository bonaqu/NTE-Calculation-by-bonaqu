# RU/EN terminology audit

Verified: 2026-08-04

This document describes the terminology policy used by NTE Calculation by bonaqu. It does not claim that every Russian label is official. The application exposes the same evidence records as a searchable table on the Methodology page.

## Evidence priority

1. Current Russian client text confirmed directly in the game.
2. Official Russian NTE publications and official character material.
3. Current Russian client-data transcriptions and several independent current databases.
4. Current guide/reference usage.
5. Explicit project translation when no reliable Russian label is available.

Official Russian and owner-confirmed current-client evidence are treated as equal top-tier evidence. A conflict between them requires manual review; neither silently overwrites the other.

Canonical English IDs remain unchanged in calculations, localStorage, share payloads and Worker responses. Russian labels are display and search metadata.

## High-impact corrections in this audit

| Canonical | Russian primary | Previous/problematic form | Decision |
|---|---|---|---|
| Shinku | Шинку | Синку | Official Russian Version 1.2 publications use Шинку. Синку remains search-only. |
| Zero | Зеро | Оценщик | Current Russian character data uses Зеро. Оценщик is retained as a contextual title/address and search alias. Нулевой эспер is retained as an official lore designation. |
| Plasma | Плазменный | Плазма | Confirmed by the project owner in the current client and corroborated by current Russian character records. |
| Gas | Газовый | Газ | Current Russian character records and Arc-type references use the adjective Газовый. |
| Buff | Усиление | Бафф | Current Russian role tags use Усиление. Бафф remains understandable jargon but is not the primary UI role label. |
| Break Intensity | Эффективность разрушения | Интенсивность разрушения / сломления | Current Russian stat and effect text uses эффективность разрушения. |
| Charge Efficiency | Эффективность зарядки | Эффективность заряда | Current Russian stat/effect text uses эффективность зарядки. |
| Tears Beneath the Mask | Слезы за маской | Слезы с маской | Owner-confirmed current-client wording is corroborated by multiple independent current sources. The conflicting article variant remains recorded. |

## Registered categories

The machine-readable registry covers:

- 22 character identities;
- 47 Arc identities;
- five Arc types;
- six Esper types;
- primary character roles and one compatibility-only utility role;
- public stats used by the Arc and team interfaces;
- common combat/action terms;
- all progression materials currently used by the roster planner.

Every record contains canonical and English text, Russian primary text, evidence level, source/publisher, verification date and optional conflicts.

## Imported Russian effect text

The original imported Arc descriptions are retained as source input. Before display, a narrow deterministic normalization layer updates only shared terminology such as АТК, ЗАЩ, ОЗ, эффективность разрушения, эффективность зарядки and critical-action labels. Numeric values, conditions, English text and canonical identities are not changed.

Arc-specific semantic corrections remain explicit in `arc-catalog.ts`; the normalizer is not used to invent missing mechanics.

## Unresolved or deliberately provisional areas

- Upcoming Linko and Zankou keep transparent project transliterations until reliable official Russian spellings are available.
- `Support` remains an internal compatibility category; released character cards use Урон, Усиление or Выживание where the source publishes one of those roles.
- Full official Russian names for every individual skill are not yet available from one reliable public source. Rotation presets keep only names and ordering that can be tied to their direct guide/client-data evidence.
- Cycle names and some unique passive-effect names require a separate source-by-source audit; unknown text must not be promoted to official wording.
- Progression material totals are validated separately from translation confidence. A correct quantity does not make a community translation official.

## Regression policy

CI rejects:

- obsolete primary character labels;
- missing evidence coverage for a registered category;
- duplicate evidence identities;
- empty RU/EN labels or missing publishers;
- lower-confidence automatic replacement of stronger evidence;
- stale hard-coded terminology examples on Methodology;
- legacy Break/charge wording in the public Russian Arc catalog;
- accidental changes to the source numeric values used by regression fixtures.
