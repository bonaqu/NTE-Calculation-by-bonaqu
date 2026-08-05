import type { GameVisibleTeamState } from '../game-visible-build';
import { TeamCombatScenarioPanel as ManualTeamCombatScenarioEditor } from './ManualTeamCombatScenarioEditor';
import { VerifiedScenarioRecipePanel } from './VerifiedScenarioRecipePanel';

interface TeamCombatScenarioPanelProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
}

/**
 * Canonical Scenario-tab composition. Evidence-gated recipes appear first;
 * the mature manual and Rotation Lab editor remains the second workspace.
 */
export function TeamCombatScenarioPanel(props: TeamCombatScenarioPanelProps) {
  return <>
    <VerifiedScenarioRecipePanel {...props} />
    <ManualTeamCombatScenarioEditor {...props} />
  </>;
}
