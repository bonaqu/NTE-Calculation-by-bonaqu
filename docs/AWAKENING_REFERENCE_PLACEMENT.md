# Awakening reference placement

## Product boundary

The Character Database is the home of complete character information. The Team Calculator is the home of inputs and conditions required by one selected formula.

A full A1–A6 list therefore belongs in Character Database cards, not in every Calculator session.

## Shared source of truth

`src/awakening-reference.ts` combines:

- the first five partial-model references;
- Haniel and Sakiri support references;
- action dependencies already stored on Awakening nodes;
- verified team-effect dependencies.

Current coverage is 42 nodes across:

- Shinku;
- Nanally;
- Chaos;
- Lacrimosa;
- Zero;
- Haniel;
- Sakiri.

Every covered character has exactly six ordered nodes.

## Character Database

The character card exposes a collapsible A1–A6 reference with:

- localized title and description;
- current Russian-reference or disclosed English-fallback status;
- source publisher;
- source update date;
- project verification date;
- direct source link;
- calculation-linked action/effect when available;
- explicit informational status when a node is not part of a verified formula.

Awakening titles and descriptions are included in character search.

## Team Calculator

The Calculator calls `relevantAwakeningNodes` with:

- selected verified action ID;
- enabled verified team-effect IDs.

It shows no Awakening section when the current formula has no dependency.

Current dependencies:

- Nanally A3 → Awakening 3 follow-up;
- Zero A1 → Blooming Gaze additional hit;
- Zero A6 → Appraise and Engrave extra damage;
- Sakiri A4 → 30% Base ATK team buff.

When a dependency exists, the Calculator displays:

- A0–A6 highest-unlocked selector;
- only the exact required node;
- requirement met/blocked state;
- evidence note.

The saved `awakeningLevel` and calculation semantics are unchanged.

## Localization policy

Current Russian-reference titles are primary. When a sufficiently reliable current Russian title is unavailable, the current English title remains visible with an explicit fallback label. No silent invented translation is introduced.
