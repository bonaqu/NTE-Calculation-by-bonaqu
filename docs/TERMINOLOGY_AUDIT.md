# NTE terminology audit

Verified: 2026-08-04

## Purpose

The application must not present every Russian string as equally official. This audit separates canonical game identities, primary display labels, compatibility aliases and project translations.

Canonical English IDs used by storage, share payloads, calculations and Worker contracts do not change during localization work.

## Evidence priority

1. Current Russian game client text captured or transcribed by the project owner.
2. Official Russian NTE publications.
3. Official English game publications.
4. Current guide/database transcription.
5. Explicit project translation.

The UI and documentation must not describe tiers 3–5 as official Russian client localization.

## Confidence

- `confirmed`: direct evidence is sufficient for the selected primary label.
- `strong`: multiple current signals agree, but the best direct public evidence is incomplete.
- `provisional`: selected for current usability while a material naming conflict remains.
- `project-translation`: written by the project because no verified Russian term is available.

## Confirmed high-risk terms

| Canonical ID | English | Russian primary | Compatibility aliases | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `character:Shinku` | Shinku | Шинку | Синку | Official Russian Version 1.2 publication | confirmed |
| `arc-type:Plasma` | Plasma | Плазменный | Плазма | Owner-confirmed current client label | confirmed |
| `combat:break-gauge` | Break Gauge | Шкала разрушения | — | Current client terminology | strong |
| `combat:break-intensity` | Break Intensity | Интенсивность разрушения | — | Current client terminology | strong |
| `combat:broken-target` | Broken target | Сломленная цель | Сломленный враг | Current client terminology | strong |

Official Shinku source:
https://nte.perfectworld.com/ru/article/news/gamenews/20260706/263024.html

## Current unresolved terms

### Zero / Оценщик

The project currently renders `Zero` as **Оценщик** and keeps **Зеро**, **Зеро эспер** and **Нулевой эспер** as search aliases. The distinction between the character's proper name and evaluator title still lacks complete public Russian evidence, so the registry marks it provisional rather than silently calling it official.

### Esper Cycle / Цикл эспера

**Цикл эспера** remains a project translation until a current official Russian client or publication label is independently captured. It is deliberately marked `project-translation`.

## Rules

- Search may match aliases, but visible output uses the primary label.
- An obsolete or disputed alias must not become a primary label through saved state.
- Russian labels never replace canonical IDs.
- Every disputed or translated game term must carry evidence tier, confidence and verification date.
- Unsupported terms remain visibly provisional instead of being upgraded through repetition.

## Next audit batches

1. Complete character identity and alias coverage.
2. Complete 47-Arc name provenance.
3. Arc types, attributes, roles and stats.
4. Rotation actions, skills and Esper Cycles.
5. Progression currencies, materials and bosses.
6. Calculator vocabulary and Methodology definitions.
