# Restrained interface foundation

This foundation is a compatibility layer loaded after existing feature styles. It changes the highest-reach shared presentation without replacing the project's plain-CSS architecture or forcing every feature stylesheet into one risky pull request.

## Product direction

The interface should read as a purpose-built NTE tool rather than a generic dark dashboard.

The foundation therefore favors:

- open page composition over one giant rounded container;
- reading order and negative space before decorative surfaces;
- structural separators over fake depth;
- calm solid surfaces over decorative gradients;
- task labels over category tiles;
- source-derived facts over hard-coded marketing counts;
- stable hover states over repeated lift motion;
- one restrained press response for buttons;
- explicit focus and reduced-motion behavior;
- tabular numbers wherever values are compared.

## External review principles

The direction was informed by the public `jakubkrehel/skills` interface-review material:

- `better-interface`: review the interface as one system, require evidence and mark unavailable runtime checks as not verified;
- `better-layout`: order by importance, group with space and keep controls distinct from content;
- `better-writing`: use plain, consistent, task-oriented copy;
- `better-ui`: preserve project conventions, use structure instead of decorative depth, name transition properties and restrain repeated motion.

Reference: https://github.com/jakubkrehel/skills

The project does not copy those skills' audit output format and does not claim to have performed browser-only checks that are unavailable in the current environment.

## Home page

The former Home hero vocabulary was removed:

- rounded hero card;
- decorative grid overlay;
- radial orbs;
- floating benchmark card;
- lifted tool-card grid.

The replacement uses:

- one clear product statement;
- direct actions;
- trust statements;
- current dataset counts derived from `characterArcGuides`, `arcDirectory` and `arcBenchmarkScenarios`;
- an open character figure with a factual caption;
- an ordered task index.

## Shared controls

The final stylesheet overrides high-reach shared components:

- logo;
- top navigation;
- language and icon controls;
- buttons;
- panels;
- metrics;
- segmented controls;
- form fields;
- image outlines;
- focus-visible states;
- reduced-motion behavior.

Feature component APIs and state contracts remain unchanged.

## Static regression contract

`src/interface-foundation.test.ts` rejects:

- gradients in the new foundation;
- broad `transition:` shorthand or `transition-property: all`;
- hover translations;
- removal of shared focus or reduced-motion rules;
- reintroduction of decorative Home orb, hero-card or tool-card markup;
- hard-coded Home counts in place of current datasets.

## Verification boundary

TypeScript, source tests, production build and Worker dry run can be verified in GitHub Actions.

Rendered visual judgment, browser animation inspection and screenshot comparison remain **not verified** until an environment with a browser runtime can open the production artifact. A successful build must not be described as successful visual QA.
