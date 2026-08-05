import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CircleAlert,
  ListChecks,
  UserRoundCheck,
  UsersRound,
  WandSparkles,
} from 'lucide-react';
import {
  BUILD_PROFILE_LIBRARY_STORAGE_KEY,
  initialBuildProfileLibrary,
  normalizeBuildProfileLibrary,
  type BuildProfileLibrary,
} from '../build-profiles';
import type { CombatScenarioState } from '../combat-scenario';
import {
  GAME_VISIBLE_TEAM_STORAGE_KEY,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  type GameVisibleTeamState,
} from '../game-visible-build';
import { localizedCharacterName } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  applySelectedScenarioProfiles,
  evaluateScenarioBuildReadiness,
  uniqueReadyScenarioProfileSelections,
  type ScenarioProfileReadiness,
  type ScenarioSlotBuildReadiness,
} from '../scenario-build-readiness';

interface ScenarioBuildReadinessPanelProps {
  team: GameVisibleTeamState;
  scenario: CombatScenarioState;
  locale: 'ru' | 'en';
}

type Notice = { kind: 'ok' | 'error'; text: string } | null;

function statusLabel(slot: ScenarioSlotBuildReadiness, ru: boolean): string {
  if (slot.status === 'ready') return ru ? 'текущая сборка готова' : 'current build ready';
  if (slot.status === 'blocked-by-target') return ru ? 'есть условие цели или сценария' : 'target or scenario condition';
  if (slot.status === 'needs-build') return ru ? 'нужны данные сборки' : 'build data required';
  return ru ? 'в расчёте не участвует' : 'not used by scenario';
}

function candidateLabel(candidate: ScenarioProfileReadiness, ru: boolean): string {
  return candidate.ready
    ? `${candidate.profile.name} · ${ru ? 'готов' : 'ready'}`
    : `${candidate.profile.name} · ${candidate.issues.length} ${ru ? 'проблем' : 'issues'}`;
}

function applyError(error: string, ru: boolean): string {
  const labels: Record<string, { ru: string; en: string }> = {
    'profile-not-found': { ru: 'Один из выбранных профилей больше не существует.', en: 'One selected profile no longer exists.' },
    'character-mismatch': { ru: 'Профиль не совпадает с персонажем своего слота.', en: 'A profile does not match its slot character.' },
    'duplicate-selection': { ru: 'Один профиль нельзя применить к нескольким слотам.', en: 'One profile cannot be applied to multiple slots.' },
    'apply-failed': { ru: 'Не удалось атомарно применить выбранный набор.', en: 'The selected set could not be applied atomically.' },
  };
  return labels[error]?.[ru ? 'ru' : 'en'] ?? (ru ? 'Не удалось применить профили.' : 'Profiles could not be applied.');
}

export function ScenarioBuildReadinessPanel({
  team,
  scenario,
  locale,
}: ScenarioBuildReadinessPanelProps) {
  const ru = locale === 'ru';
  const [, setStoredTeam] = useLocalStorage<GameVisibleTeamState>(
    GAME_VISIBLE_TEAM_STORAGE_KEY,
    initialGameVisibleTeamState(),
    { normalize: normalizeGameVisibleTeamState },
  );
  const [library] = useLocalStorage<BuildProfileLibrary>(
    BUILD_PROFILE_LIBRARY_STORAGE_KEY,
    initialBuildProfileLibrary(),
    { normalize: normalizeBuildProfileLibrary },
  );
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState<Notice>(null);
  const report = useMemo(
    () => evaluateScenarioBuildReadiness(team, scenario, library),
    [library, scenario, team],
  );
  const requiredSlots = report.slots.filter((slot) => slot.status !== 'not-used');
  const validSelections = useMemo(() => Object.fromEntries(
    Object.entries(selections).filter(([slotText, profileId]) => {
      const slot = report.slots[Number(slotText)];
      return slot?.matchingProfiles.some((candidate) => candidate.profile.id === profileId);
    }),
  ) as Record<number, string>, [report.slots, selections]);
  const selectedCount = Object.keys(validSelections).length;

  const fillUnambiguous = () => {
    const next = uniqueReadyScenarioProfileSelections(report);
    setSelections(next);
    const count = Object.keys(next).length;
    setNotice(count
      ? {
          kind: 'ok',
          text: ru
            ? `Подставлено однозначных профилей: ${count}. Проверь выбор перед применением.`
            : `${count} unambiguous profiles selected. Review before applying.`,
        }
      : {
          kind: 'error',
          text: ru
            ? 'Нет слотов ровно с одним готовым профилем.'
            : 'No slot has exactly one ready profile.',
        });
  };

  const applySelected = () => {
    if (!selectedCount) {
      setNotice({
        kind: 'error',
        text: ru ? 'Сначала выбери хотя бы один профиль.' : 'Select at least one profile first.',
      });
      return;
    }
    const result = applySelectedScenarioProfiles(team, library, validSelections);
    if (!result.ok) {
      setNotice({ kind: 'error', text: applyError(result.error, ru) });
      return;
    }
    setStoredTeam(result.team);
    setSelections({});
    setNotice({
      kind: 'ok',
      text: ru
        ? `Профили применены к слотам: ${result.appliedSlots.map((slot) => slot + 1).join(', ')}. Временные условия не переносились.`
        : `Profiles applied to slots ${result.appliedSlots.map((slot) => slot + 1).join(', ')}. Timed conditions were not transferred.`,
    });
  };

  return <section className="scenario-build-readiness" aria-label={ru ? 'Готовность сборок сценария' : 'Scenario build readiness'}>
    <div className="scenario-build-readiness-heading">
      <ListChecks size={21} />
      <div>
        <h3>{ru ? 'Готовность сборок к сценарию' : 'Scenario build readiness'}</h3>
        <p>{ru
          ? 'Проверяет только требования точных действий и эффектов. Профили не ранжируются по силе и не применяются без подтверждения.'
          : 'Checks only exact action and effect requirements. Profiles are not power-ranked or applied without confirmation.'}</p>
      </div>
      <span>{report.readySlotCount}/{report.requiredSlotCount}</span>
    </div>

    <div className="scenario-build-readiness-summary">
      <div><span>{ru ? 'Нужны сценарию' : 'Required slots'}</span><b>{report.requiredSlotCount}</b></div>
      <div><span>{ru ? 'Готовы сейчас' : 'Ready now'}</span><b>{report.readySlotCount}</b></div>
      <div><span>{ru ? 'Есть готовый профиль' : 'Ready profile exists'}</span><b>{report.slotsWithReadyProfile}</b></div>
      <div><span>{ru ? 'Совпавших профилей' : 'Matching profiles'}</span><b>{report.totalMatchingProfiles}</b></div>
    </div>

    {report.globalIssues.length ? <div className="scenario-build-global-issues">
      <CircleAlert size={17} />
      <div><b>{ru ? 'Условия всей команды' : 'Team-wide conditions'}</b>{report.globalIssues.map((issue) => <p key={`${issue.code}-${issue.stepId}`}>{issue.label[locale]}</p>)}</div>
    </div> : null}

    {requiredSlots.length ? <div className="scenario-build-slot-list">{requiredSlots.map((slot) => {
      const selectedId = validSelections[slot.slot] ?? '';
      const selected = slot.matchingProfiles.find((candidate) => candidate.profile.id === selectedId);
      const ready = slot.status === 'ready';
      return <article className={`status-${slot.status}`} key={`${slot.slot}-${slot.characterName}`}>
        <header>
          <span>{slot.slot + 1}</span>
          <div><h4>{localizedCharacterName(slot.characterName, locale)}</h4><small>{slot.requiredActionIds.length} {ru ? 'действ.' : 'actions'} · {slot.requiredEffectIds.length} {ru ? 'эффект.' : 'effects'}</small></div>
          <b>{ready ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}{statusLabel(slot, ru)}</b>
        </header>

        {slot.currentIssues.length ? <ul>{slot.currentIssues.map((issue) => <li key={`${issue.code}-${issue.field ?? ''}-${issue.required ?? ''}`}>{issue.label[locale]}</li>)}</ul> : <p className="scenario-build-current-ready"><UserRoundCheck size={16} />{ru ? 'Текущая сборка проходит требования импортированных строк.' : 'The current build passes imported-row requirements.'}</p>}

        <label>
          <span>{ru ? 'Сохранённый профиль этого персонажа' : 'Saved profile for this character'}</span>
          <select value={selectedId} onChange={(event) => setSelections((current) => ({
            ...current,
            [slot.slot]: event.target.value,
          }))}>
            <option value="">{slot.matchingProfiles.length
              ? (ru ? 'Не применять профиль' : 'Do not apply a profile')
              : (ru ? 'Нет сохранённых профилей' : 'No saved profiles')}</option>
            {slot.matchingProfiles.map((candidate) => <option value={candidate.profile.id} key={candidate.profile.id}>{candidateLabel(candidate, ru)}</option>)}
          </select>
        </label>

        {selected ? <div className={`scenario-build-profile-preview ${selected.ready ? 'ready' : 'incomplete'}`}>
          <b>{selected.ready
            ? (ru ? 'Профиль закрывает требования этого слота' : 'Profile satisfies this slot')
            : (ru ? `После применения останется проблем: ${selected.issues.length}` : `${selected.issues.length} issues remain after applying`)}</b>
          {selected.issues.map((issue) => <small key={`${issue.code}-${issue.field ?? ''}-${issue.required ?? ''}`}>{issue.label[locale]}</small>)}
        </div> : null}
      </article>;
    })}</div> : <div className="scenario-build-readiness-empty"><UsersRound size={21} /><span>{ru ? 'Добавь или импортируй точные действия и эффекты — тогда появится проверка сборок.' : 'Add or import exact actions and effects to see build readiness.'}</span></div>}

    <div className="scenario-build-readiness-actions">
      <button type="button" onClick={fillUnambiguous}><WandSparkles size={16} />{ru ? 'Подставить однозначные' : 'Select unambiguous'}</button>
      <button type="button" className="primary" disabled={!selectedCount} onClick={applySelected}><CheckCircle2 size={16} />{ru ? `Применить выбранные (${selectedCount})` : `Apply selected (${selectedCount})`}</button>
    </div>

    {notice ? <div className={`scenario-build-readiness-notice ${notice.kind}`}>{notice.kind === 'ok' ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}<span>{notice.text}</span></div> : null}
  </section>;
}
