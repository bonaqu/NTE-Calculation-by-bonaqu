# Russian client terminology policy

The Russian UI is not a literal machine translation of English data. Its primary labels follow the terminology that a player actually sees in the current Russian NTE client.

## Source priority

1. A current Russian-client screenshot or an owner-confirmed in-client spelling.
2. Current Russian client data mirrored by a searchable database.
3. Official Russian NTE announcements and patch notes.
4. Current Russian guides used only to resolve gaps.
5. A careful project translation, clearly treated as a fallback rather than an official name.

Canonical English identifiers remain unchanged in code, storage, share links and API responses. They are shown as secondary lookup text in the Russian interface.

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
| Shinku | **Синку** | Шинку |
| Skia | Ския | — |
| Zankou | Занкоу | — |
| Zero | **Оценщик** | Зеро, Зеро эспер, Нулевой эспер |

`Синку` is owner-confirmed from the Russian client and therefore takes precedence over the `Шинку` form used by some official web publications. Old forms remain searchable so existing saved notes and guides are still useful.

The official Russian character page uses `Зеро` as the character name and uses `оценщик` as the protagonist's title. The project currently preserves the owner-preferred primary label `Оценщик` for continuity, while `Зеро`, `Зеро эспер` and `Нулевой эспер` remain searchable. This distinction is documented explicitly rather than silently pretending that every public Russian source agrees.

## Arc types, attributes and roles

| English data value | Russian UI |
|---|---|
| Solid | Твёрдый |
| Gas | Газ |
| Liquid | Жидкий |
| Plasma | Плазма |
| Synthesis | Гибридный |
| Incantation | Чары |
| Psyche | Психика |
| Survival | Выживание |
| Buff | Бафф |
| Damage | Урон |

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

`src/gameTerms.test.ts` locks the exact Arc-type, role, attribute and combat labels. `src/russian-localization.test.ts` scans public runtime datasets and every Russian string literal in the application source. Together they reject outdated terminology and avoidable guide jargon before a pull request can pass CI.
