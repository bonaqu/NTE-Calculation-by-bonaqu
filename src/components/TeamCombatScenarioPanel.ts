import { createElement, Fragment } from 'react';
import type { GameVisibleTeamState } from '../game-visible-build';
import { VerifiedScenarioRecipePanel } from './VerifiedScenarioRecipePanel';
// The extensionless import used by the calculator resolves to this composition.
// @ts-ignore The explicit TSX extension intentionally targets the existing manual editor implementation.
import { TeamCombatScenarioPanel as ManualTeamCombatScenarioPanel } from './TeamCombatScenarioPanel.tsx';

interface TeamCombatScenarioPanelProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
}

/**
 * Keeps the mature manual/Rotation Lab editor intact while placing the
 * evidence-gated recipe workflow first on the same Scenario tab.
 */
export function TeamCombatScenarioPanel(props: TeamCombatScenarioPanelProps) {
  return createElement(
    Fragment,
    null,
    createElement(VerifiedScenarioRecipePanel, props),
    createElement(ManualTeamCombatScenarioPanel, props),
  );
}
