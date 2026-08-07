import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ListFilter, ShieldQuestion } from 'lucide-react';
import type { GameVisibleTeamState } from '../game-visible-build';
import { localizedCharacterName } from '../gameTerms';
import {
  currentRotationGapAudit,
  currentRotationGapAuditSummary,
  currentRotationMissingActionPriorities,
  rotationGapClassificationLabels,
} from '../rotation-gap-audit-current';
import type { RotationGapClassification } from '../rotation-gap-audit';
import { rotationPresetById, rotationPresets } from '../rotation-presets';
import { rotationScenarioVariantRequirements } from '../rotation-scenario-import';
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
  const entries = currentRotationGapAudit.filter((item) => item.presetId === selectedPreset?.id);
  const variantRequirements = rotationScenarioVariantRequirements.filter((item) => item.presetId === selectedPreset?.id);
  const audit = selectedPreset ? rotationPresetRecipeAuditById.get(selectedPreset.id) : undefined;
  const recipe = selectedPreset ? verifiedRotationRecipeById.get(recipeId(selectedPreset.id)) : undefined;

  return <section className="rotation-gap-audit" aria-label={ru ? 'Аудит пробелов Rotation Lab' : 'Rotation Lab gap audit'}>
    <header className="rotation-gap-audit__heading">
      <ShieldQuestion size={22} />
      <div>
        <span>{ru
          ? `${currentRotationGapAuditSummary.total} НЕПОДДЕРЖИВАЕМЫХ ПРОБЕЛОВ · ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} ВАРИАНТОВ С ВЫБОРОМ`
          : `${currentRotationGapAuditSummary.total} UNSUPPORTED GAPS · ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} USER-SELECTED VARIANTS`}</span>
        <h3>{ru ? 'Почему части ротации не рассчитываются' : 'Why rotation parts remain uncalculated'}</h3>
        <p>{ru
          ? 'Baseline из 41 шага сохранён для истории. Текущий список автоматически исключает шаги, которые получили точные bindings.'
          : 'The 41-step baseline remains available for history. The current list automatically excludes steps that gained exact bindings.'}</p>
      </div>
    </header>

    <div className="rotation-gap-audit__summary" aria-label={ru ? 'Текущие итоги аудита' : 'Current audit totals'}>
      <div><b>{currentRotationGapAuditSummary.total}</b><span>{ru ? 'осталось' : 'remaining'}</span></div>
      <div><b>{currentRotationGapAuditSummary.missingActionRecord}</b><span>{ru ? 'нет action-записи' : 'missing actions'}</span></div>
      <div><b>{currentRotationGapAuditSummary.effectOrCycleCondition}</b><span>{ru ? 'эффекты / циклы' : 'effects / Cycles'}</span></div>
      <div><b>{currentRotationGapAuditSummary.nonDamageOperation}</b><span>{ru ? 'небоевые операции' : 'non-damage operations'}</span></div>
      <div><b>{currentRotationGapAuditSummary.ambiguousSourceStep}</b><span>{ru ? 'неоднозначно' : 'ambiguous'}</span></div>
      <div><b>{currentRotationGapAuditSummary.parameterizedVariantSourceSteps}</b><span>{ru ? 'нужен выбор' : 'user-selected'}</span></div>
      <div><b>{currentRotationGapAuditSummary.resolvedSinceBaseline}</b><span>{ru ? 'смоделировано' : 'modeled'}</span></div>
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
          {entries.length ? entries.map((item) => {
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
          }) : null}
          {variantRequirements.map((item) => {
            const step = selectedPreset?.steps.find((candidate) => candidate.id === item.sourceStepId);
            return <details key={`variant:${item.presetId}:${item.sourceStepId}`}>
              <summary>
                <span className="rotation-gap-audit__badge ambiguous">{ru ? 'Выбор пользователя' : 'User selection'}</span>
                <b>{localizedCharacterName(step?.actor ?? '', locale)}</b>
                <span>{step?.instruction[locale] ?? item.sourceStepId}</span>
              </summary>
              <p>{item.rationale[locale]}</p>
            </details>;
          })}
          {!entries.length && !variantRequirements.length ? <div className="rotation-gap-audit__safe-result"><CheckCircle2 size={18} /><span>{ru
            ? 'Для этого пресета не осталось полностью неподдерживаемых исходных шагов.'
            : 'This preset has no unsupported or parameterized source steps left.'}</span></div> : null}
        </div>
      </article>

      <aside>
        <div className="rotation-gap-audit__priority-title"><AlertTriangle size={18} /><b>{ru ? 'Какие записи исследовать дальше' : 'Next action records to research'}</b></div>
        <ol>{currentRotationMissingActionPriorities.map((priority) => <li key={priority.rank}>
          <div><b>#{priority.rank} · {localizedCharacterName(priority.characterName, locale)}</b><span>{priority.capability[locale]}</span></div>
          <p>{priority.reason[locale]}</p>
          <small>{priority.sourceSteps.length} {ru ? 'затронутых шагов' : 'affected steps'}</small>
        </li>)}</ol>
        <div className="rotation-gap-audit__safe-result"><CheckCircle2 size={18} /><span>{ru
          ? `Каталог из ${currentRotationGapAuditSummary.verifiedActionCatalogCount} действий проверяется без fuzzy matching: неподдерживаемых пробелов нет, а ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} вариантов требуют явного выбора.`
          : `The ${currentRotationGapAuditSummary.verifiedActionCatalogCount}-action catalog is checked without fuzzy matching: no unsupported gaps remain, while ${currentRotationGapAuditSummary.parameterizedVariantSourceSteps} variants require explicit selection.`}</span></div>
      </aside>
    </div>
  </section>;
}
