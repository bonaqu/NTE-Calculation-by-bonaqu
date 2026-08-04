# Russian client terminology policy

The Russian UI is not a literal machine translation of English data. Its primary labels follow the best current evidence for the terminology that a player actually sees in NTE.

## Source priority

1. A current Russian-client screenshot with readable context.
2. A current official Russian NTE publication or patch note.
3. An owner-confirmed current in-client spelling without a retained screenshot.
4. Current Russian client data mirrored by a searchable reference.
5. Current Russian guides used only to resolve gaps.
6. A careful project translation, clearly treated as a fallback rather than an official name.

Canonical English identifiers remain unchanged in code, storage, share links and API responses. They are shown as secondary lookup text in the Russian interface.

A lower-priority report must not silently override a higher-priority source. When public and in-client evidence cannot both be retained, the project records the disagreement instead of pretending certainty.

## Character names

| Canonical ID | Primary Russian label | Search-only aliases |
|---|---|---|
| Adler | Адлер | — |
| Aurelia | Аурелия | — |
| Baicang | Байканг | — |
| Chaos | Хаос | — |
| Chiz | Чиз | — |
| Daffodill | Даффодил | Нарцисс |
| Edgar | Эдгар | — |
| Fadia | Фадия | — |
| Haniel | Ханиэль | — |
| Hathor | Хатор | — |
| Hotori | Хотори | — |
| Iroi | Ирой | — |
| Jiuyuan | Цзююань | — |
| Lacrimosa | Лакримоза | — |
| Linko | Линко | — |
| Mint | Минт | — |
| Nanally | Наналли | — |
| Sakiri | Сакири | — |
| Shinku | **Шинку** | Синку |
| Skia | Ския | — |
| Zankou | Занкоу | — |
| Zero | **Оценщик** | Зеро, Зеро эспер, Нулевой эспер |

`Шинку` is used repeatedly by the official Russian Version 1.2 patch notes, including the character announcement, board description, costumes, story and training entries:

- https://nte.perfectworld.com/ru/article/news/gamenews/20260706/263024.html

`Синку` remains accepted as a compatibility and search alias because it was previously exposed by the project and may already exist in saved notes.

The official Russian patch notes use `Нулевой эспер` for the protagonist in item and costume names, while the site greeting addresses the player as an `оценщик(-ца)`. The project currently preserves the owner-preferred primary label `Оценщик` for continuity, while `Зеро`, `Зеро эспер` and `Нулевой эспер` remain searchable. This distinction is documented explicitly rather than silently treating a role title and character identity as identical evidence.

## Arc types, attributes and roles

| English data value | Russian UI | Evidence status |
|---|---|---|
| Solid | Твёрдый | Current client/reference terminology |
| Gas | Газ | Current client/reference terminology |
| Liquid | Жидкий | Current client/reference terminology |
| Plasma | Плазменный | Owner-confirmed current client label; no public official Russian type list was found in the 2026-08-04 audit |
| Synthesis | Гибридный | Current client/reference terminology |
| Incantation | Чары | Current client/reference terminology |
| Psyche | Психика | Current client/reference terminology |
| Survival | Выживание | Current client/reference terminology |
| Buff | Бафф | Current client/reference terminology |
| Damage | Урон | Current client/reference terminology |

The canonical code and API value remains `Plasma`. Only the Russian display label is changed, so saved filters and data contracts remain compatible.

## Combat vocabulary

| Canonical concept | Russian UI |
|---|---|
| Esper Cycle | цикл эспера / циклы эсперов |
| Ultimate | сверхспособность |
| Redirect Skill | навык перенаправления |
| Ascension / breakthrough stage | прорыв / этап прорыва |
| Break mechanic | разрушение |
| Break gauge | шкала разрушения |
| Break Intensity | интенсивность разрушения |
| Broken enemy | сломленный враг / сломленная цель |
| Break damage | урон разрушения |
| Stacks | уровни эффекта / накопление, according to context |

The mechanic and its numeric properties use `Разрушение`, while the target state after the gauge is emptied uses `сломленный` / `сломленная`. The project deliberately avoids the ambiguous words `пробой` and `пробитие`, the old phase-one noun `сломление`, untranslated `Esper Cycle`, guide slang such as `стак`, `босс-дроп`, `сигнатурка`, and the old Arc-type label `Синтез` in Russian-visible text.

## Verified rotation skill names

- Хатор: `Воздушное командование`, `Быстрый скакун`, `Срочная доставка`, `Удар циклона`.
- Цзююань: `Расплата`.
- Оценщик: `Оценка и гравировка`, `Деление на ноль`.

## Progression materials

The planner uses current client-facing names including:

- Жук-монета;
- Потерянный / Неясный / Парадоксальный шёпот;
- Исчезающий / Размытый / Хаотичный силуэт;
- Размытая / Неразгаданная / Искажённая цифра;
- Приостановленный / Страстный / Необыкновенный бред;
- Свеча зажигания атакующего рыцаря;
- Страница с Брегов Заблуждений;
- Пик Водяной Луны;
- Фрагмент стража гнезда;
- Красочный обрывок билета;
- Слеза моря;
- Семя исповедального цветка.

## Regression protection

`src/gameTerms.test.ts` locks exact primary labels, compatibility aliases, source priority and combat vocabulary. `src/russian-localization.test.ts` scans public runtime datasets and every Russian string literal in the application source. Together they reject outdated terminology and avoidable guide jargon before a pull request can pass CI.
