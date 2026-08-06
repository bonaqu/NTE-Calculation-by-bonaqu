import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ListFilter, ShieldQuestion } from 'lucide-react';
import type { GameVisibleTeamState } from '../game-visible-build';
import { localizedCharacterName } from '../gameTerms';
import {
  rotationGapAudit,
  rotationGapAuditSummary,
  rotationGapClassificationLabels,
  rotationMissingActionPriorities,
  type RotationGapClassification,
} from '../rotation-gap-audit';
import { rotationPresetById, rotationPresets } from '../rotation-presets';
import { rotationPresetRecipeAuditById, verifiedRotationRecipeById } from '../verified-rotation-recipes';
import '../rotation-gap-audit.css';

interface RotationGapAuditPanelProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
}

const recipeId = (presetId: string): string => `rotation-lab.${presetId}.verified-actions`;

function classificationClass(value: RotationGapClassification): string {
  if (value === 'missing-action-record') return 'missing';
  if (value === 'effect-or-cycle-condition') return 'condition';
  if (value === 'non-damage-operation') return 'operation';
  if (value === 'ambiguous-source-step') return 'ambiguous';
  return 'matched';
}

export function RotationGapAuditPanel({ team, locale }: RotationGapAuditPanelProps) {
  const ru = locale === 'ru';
  const teamNames = useMemo(() => new Set(team.builds.map((build) => build.characterName)), [team.builds]);
  const matchingPreset = rotationPresets.find((preset) => preset.team.every((name) => teamNames.has(name)));
  const [selectedPresetId, setSelectedPresetId] = useState(matchingPreset?.id ?? rotationPresets[0]?.id ?? '');
  const selectedPreset = rotationPresetById.get(selectedPresetId) ?? rotationPresets[0];
  const entries = rotationGapAudit.filter((item) => item.presetId === selectedPreset?.id);
  const audit = selectedPreset ? rotationPresetRecipeAuditById.get(selectedPreset.id) : undefined;
  const recipe = selectedPreset ? verifiedRotationRecipeById.get(recipeId(selectedPreset.id)) : undefined;

  return <section className="rotation-gap-audit" aria-label={ru ? 'Аудит пробелов Rotation Lab' : 'Rotation Lab gap audit'}>
    <header className="rotation-gap-audit__heading">
      <ShieldQuestion size={22} />
      <div>
        <span>{ru ? '41 ШАГ · КАТАЛОГ ИСЧЕРПАН БЕЗ ПОДМЕН' : '41 STEPS · CATALOG EXHAUSTED WITHOUT SUBSTITUTION'}</span>
        <h3>{ru ? 'Почему части ротации не рассчитываются' : 'Why rotation parts remain uncalculated'}</h3>
        <p>{ru
          ? 'Каждый неподдерживаемый шаг получил одну проверяемую категорию. Похожие пассивы и другие варианты навыка намеренно не используются как замена.'
          : 'Every unsupported step has one auditable category. Similar passives and different Skill variants are deliberately not used as substitutes.'}</p>
      </div>
    </header>

    <div className="rotation-gap-audit__summary" aria-label={ru ? 'Итоги аудита' : 'Audit totals'}>
      <div><b>{rotationGapAuditSummary.total}</b><span>{ru ? 'классифицировано' : 'classified'}</span></div>
      <div><b>{rotationGapAuditSummary.missingActionRecord}</b><span>{ru ? 'нет action-записи' : 'missing actions'}</span></div>
      <div><b>{rotationGapAuditSummary.effectOrCycleCondition}</b><span>{ru ? 'эффекты / циклы' : 'effects / Cycles'}</span></div>
      <div><b>{rotationGapAuditSummary.nonDamageOperation}</b><span>{ru ? 'небоевые операции' : 'non-damage operations'}</span></div>
      <div><b>{rotationGapAuditSummary.ambiguousSourceStep}</b><span>{ru ? 'неоднозначно' : 'ambiguous'}</span></div>
      <div><b>{rotationGapAuditSummary.safelyBindableUnsupportedSteps}</b><span>{ru ? 'безопасных подмен' : 'safe substitutions'}</span></div>
    </div>

    <div className="rotation-gap-audit__body">
      <article>
        <label>
          <span><ListFilter size={15} />{ru ? 'Исходный пресет' : 'Source preset'}</span>
          <select value={selectedPreset?.id ?? ''} onChange={(event) => setSelectedPresetId(event.target.value)}>
            {rotationPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title[locale]}</option>)}
          </select>
        </label>

        {selectedPreset && audit ? <div className="rotation-gap-audit__preset-facts">
          <span>{audit.totalSourceSteps} {ru ? 'исходных шагов' : 'source steps'}</span>
          <span>{audit.verifiedActionSteps} {ru ? 'точных action-шагов' : 'exact action steps'}</span>
          <span>{audit.unsupportedSourceSteps} {ru ? 'неподдерживаемых' : 'unsupported'}</span>
          <span className={recipe ? 'promoted' : 'blocked'}>{recipe
            ? (ru ? `Частичный рецепт: ${recipe.steps.length} действий` : `Partial recipe: ${recipe.steps.length} actions`)
            : (ru ? 'Остаётся только аудитом' : 'Remains audit-only')}</span>
        </div> : null}

        <div className="rotation-gap-audit__entries">
          {entries.map((item) => {
            const step = selectedPreset?.steps.find((candidate) => candidate.id === item.sourceStepId);
            const label = rotationGapClassificationLabels[item.classification][locale];
            return <details key={`${item.presetId}:${item.sourceStepId}`}>
              <summary>
                <span className={`rotation-gap-audit__badge ${classificationClass(item.classification)}`}>{label}</span>
                <b>{localizedCharacterName(step?.actor ?? '', locale)}</b>
                <span>{step?.instruction[locale] ?? item.sourceStepId}</span>
              </summary>
              <p>{item.rationale[locale]}</p>
              {item.rejectedActionIds?.length ? <small>{ru
                ? `Отклонённые похожие ID: ${item.rejectedActionIds.join(', ')}`
                : `Rejected look-alike IDs: ${item.rejectedActionIds.join(', ')}`}</small> : null}
            </details>;
          })}
        </div>
      </article>

      <aside>
        <div className="rotation-gap-audit__priority-title"><AlertTriangle size={18} /><b>{ru ? 'Какие записи исследовать дальше' : 'Next action records to research'}</b></div>
        <ol>{rotationMissingActionPriorities.map((priority) => <li key={priority.rank}>
          <div><b>#{priority.rank} · {localizedCharacterName(priority.characterName, locale)}</b><span>{priority.capability[locale]}</span></div>
          <p>{priority.reason[locale]}</p>
          <small>{priority.sourceSteps.length} {ru ? 'затронутых шагов' : 'affected steps'}</small>
        </li>)}</ol>
        <div className="rotation-gap-audit__safe-result"><CheckCircle2 size={18} /><span>{ru
          ? 'Каталог из 86 действий проверен полностью: ни один из 41 шага не был связан ценой семантической подмены.'
          : 'The 86-action catalog was exhausted: none of the 41 steps was bound through semantic substitution.'}</span></div>
      </aside>
    </div>
  </section>;
}
