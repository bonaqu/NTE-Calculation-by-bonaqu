import type { GameVisibleTeamState } from '../game-visible-build';
import { ManualTeamCombatScenarioEditor } from './ManualTeamCombatScenarioEditor';
import { RotationGapAuditPanel } from './RotationGapAuditPanel';
import { VerifiedScenarioRecipePanel } from './VerifiedScenarioRecipePanel';

interface TeamCombatScenarioPanelProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
}

/**
 * Canonical Scenario-tab composition. Evidence-gated recipes and their audit
 * appear before the mature manual and Rotation Lab editor.
 */
export function TeamCombatScenarioPanel(props: TeamCombatScenarioPanelProps) {
  return <>
    <VerifiedScenarioRecipePanel {...props} />
    <RotationGapAuditPanel {...props} />
    <ManualTeamCombatScenarioEditor {...props} />
  </>;
}
