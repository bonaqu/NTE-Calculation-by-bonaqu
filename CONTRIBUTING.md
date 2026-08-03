# Contributing

1. Open an issue describing the data, calculator or UX change.
2. Link every factual data change to a public source and add a verification date.
3. Keep uncertain mechanics behind explicit inputs or an `estimate` label.
4. Add or update deterministic tests for formula changes.
5. Run `npm run typecheck && npm test && npm run build && npm run worker:check` before opening a pull request.

Pull requests should explain what changed, why, source provenance and any calculation assumptions.
