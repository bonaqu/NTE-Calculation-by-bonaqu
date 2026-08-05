import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clipboard,
  FileJson2,
  PackageCheck,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import {
  COMBAT_SCENARIO_STORAGE_KEY,
  initialCombatScenarioState,
  normalizeCombatScenarioState,
  type CombatScenarioState,
} from '../combat-scenario';
import {
  GAME_VISIBLE_TEAM_STORAGE_KEY,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  type GameVisibleTeamState,
} from '../game-visible-build';
import { localizedCharacterName } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { rotationPresetById } from '../rotation-presets';
import {
  initialRotationScenarioImportMetadata,
  normalizeRotationScenarioImportMetadata,
  ROTATION_SCENARIO_IMPORT_STORAGE_KEY,
  type RotationScenarioImportMetadata,
} from '../rotation-scenario-import';
import {
  applyScenarioPortablePackage,
  exportScenarioPortablePackage,
  parseScenarioPortablePackage,
  type ParseScenarioPortablePackageResult,
} from '../scenario-portable-package';

interface ScenarioPortablePackagePanelProps {
  team: GameVisibleTeamState;
  scenario: CombatScenarioState;
  locale: 'ru' | 'en';
}

type Notice = { kind: 'ok' | 'error'; text: string } | null;

function parseError(result: ParseScenarioPortablePackageResult, ru: boolean): string {
  if (result.ok) return '';
  const labels: Record<string, { ru: string; en: string }> = {
    'invalid-json': { ru: 'Текст пуст, слишком велик или не является корректным JSON.', en: 'The text is empty, too large or not valid JSON.' },
    'invalid-envelope': { ru: 'Это не пакет боевого сценария NTE.', en: 'This is not an NTE Combat Scenario package.' },
    'unsupported-version': { ru: 'Версия пакета пока не поддерживается.', en: 'This package version is not supported.' },
    'checksum-mismatch': { ru: 'Контрольная сумма не совпала: пакет изменён или повреждён.', en: 'Checksum mismatch: the package was changed or corrupted.' },
    'invalid-lineup': { ru: 'В пакете должен быть состав из четырёх разных выпущенных персонажей.', en: 'The package must contain four unique released characters.' },
    'invalid-team': { ru: 'Состав, цель или снимки сборок не прошли проверку.', en: 'The lineup, target or build snapshots failed validation.' },
    'invalid-scenario': { ru: 'Шаги боевого сценария повреждены или имеют неподдерживаемую версию.', en: 'Combat Scenario steps are invalid or use an unsupported version.' },
    'invalid-rotation': { ru: 'Данные происхождения Rotation Lab повреждены.', en: 'Rotation Lab provenance is invalid.' },
  };
  return labels[result.error]?.[ru ? 'ru' : 'en'] ?? (ru ? 'Пакет не прошёл проверку.' : 'The package failed validation.');
}

function timingLabel(status: RotationScenarioImportMetadata['timingStatus'], ru: boolean): string {
  if (status === 'confirmed-seconds') return ru ? 'секунды подтверждены' : 'seconds confirmed';
  if (status === 'order-only') return ru ? 'только порядок' : 'order only';
  return ru ? 'без Rotation Lab' : 'no Rotation Lab provenance';
}

export function ScenarioPortablePackagePanel({
  team,
  scenario,
  locale,
}: ScenarioPortablePackagePanelProps) {
  const ru = locale === 'ru';
  const [, setStoredTeam] = useLocalStorage<GameVisibleTeamState>(
    GAME_VISIBLE_TEAM_STORAGE_KEY,
    initialGameVisibleTeamState(),
    { normalize: normalizeGameVisibleTeamState },
  );
  const [, setStoredScenario] = useLocalStorage<CombatScenarioState>(
    COMBAT_SCENARIO_STORAGE_KEY,
    initialCombatScenarioState(),
    { normalize: normalizeCombatScenarioState },
  );
  const [rotation, setRotation] = useLocalStorage<RotationScenarioImportMetadata>(
    ROTATION_SCENARIO_IMPORT_STORAGE_KEY,
    initialRotationScenarioImportMetadata(),
    { normalize: normalizeRotationScenarioImportMetadata },
  );
  const [includeBuilds, setIncludeBuilds] = useState(true);
  const [transferText, setTransferText] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const parsed = useMemo(
    () => transferText.trim() ? parseScenarioPortablePackage(transferText) : null,
    [transferText],
  );

  const prepareExport = () => {
    try {
      const text = exportScenarioPortablePackage(team, scenario, rotation, {
        includeBuilds,
        now: new Date().toISOString(),
      });
      setTransferText(text);
      const write = navigator.clipboard?.writeText(text);
      if (!write) {
        setNotice({ kind: 'ok', text: ru ? 'Пакет подготовлен в поле ниже.' : 'The package is ready below.' });
        return;
      }
      void write.then(
        () => setNotice({ kind: 'ok', text: ru ? 'Пакет подготовлен и скопирован.' : 'The package is ready and copied.' }),
        () => setNotice({ kind: 'ok', text: ru ? 'Пакет подготовлен в поле ниже.' : 'The package is ready below.' }),
      );
    } catch {
      setNotice({
        kind: 'error',
        text: ru
          ? 'Текущий состав нельзя упаковать: проверь четыре уникальных выпущенных персонажа.'
          : 'The current workspace cannot be packaged. Check the four unique released characters.',
      });
    }
  };

  const applyImport = () => {
    if (!parsed?.ok) {
      setNotice({ kind: 'error', text: parsed ? parseError(parsed, ru) : (ru ? 'Сначала вставь пакет.' : 'Paste a package first.') });
      return;
    }
    const applied = applyScenarioPortablePackage(team, parsed.value);
    if (!applied.ok) {
      setNotice({ kind: 'error', text: ru ? 'Пакет проверен, но рабочее пространство не удалось применить целиком.' : 'The package is valid, but the workspace could not be applied as one set.' });
      return;
    }
    setStoredTeam(applied.team);
    setStoredScenario(applied.scenario);
    setRotation(applied.rotation);
    setNotice({
      kind: 'ok',
      text: ru
        ? 'Состав, цель, сценарий и происхождение применены. Временные боевые состояния очищены.'
        : 'Lineup, target, scenario and provenance were applied. Temporary combat state was cleared.',
    });
  };

  const preview = parsed?.ok ? parsed.value.preview : null;
  const sourcePreset = preview?.sourceRotationId ? rotationPresetById.get(preview.sourceRotationId) : undefined;

  return <section className="scenario-portable-package" aria-label={ru ? 'Перенос пакета сценария' : 'Scenario package transfer'}>
    <div className="scenario-portable-heading">
      <PackageCheck size={21} />
      <div><h3>{ru ? 'Пакет боевого сценария' : 'Combat Scenario package'}</h3><p>{ru
        ? 'Переноси состав, цель, шаги и источник Rotation Lab одним проверяемым JSON. Импорт не применяет пакет частями.'
        : 'Move lineup, target, steps and Rotation Lab provenance in one verifiable JSON package. Import does not apply partial data.'}</p></div>
    </div>

    <div className="scenario-portable-export">
      <label><input type="checkbox" checked={includeBuilds} onChange={(event) => setIncludeBuilds(event.target.checked)} /><span><b>{ru ? 'Включить очищенные сборки' : 'Include sanitized builds'}</b><small>{ru
        ? 'Передаются характеристики и развитие, но не активные эффекты, временное окно дуги и выбранный тест.'
        : 'Transfers stats and progression, but not active effects, the temporary Arc window or selected test.'}</small></span></label>
      <button type="button" onClick={prepareExport}><Clipboard size={16} />{ru ? 'Подготовить и скопировать' : 'Prepare and copy'}</button>
    </div>

    <textarea value={transferText} onChange={(event) => { setTransferText(event.target.value); setNotice(null); }} spellCheck={false} placeholder={ru ? 'Здесь появится экспорт или сюда можно вставить чужой пакет…' : 'An export appears here, or paste another package…'} />

    {parsed && !parsed.ok ? <div className="scenario-portable-invalid"><ShieldAlert size={17} /><span>{parseError(parsed, ru)}</span></div> : null}

    {preview ? <div className="scenario-portable-preview">
      <header><FileJson2 size={18} /><div><b>{preview.name}</b><small>{new Date(preview.exportedAt).toLocaleString(locale)}</small></div><span>{preview.buildMode === 'sanitized-builds' ? (ru ? 'со сборками' : 'with builds') : (ru ? 'только состав' : 'lineup only')}</span></header>
      <p>{preview.lineup.map((name) => localizedCharacterName(name, locale)).join(' · ')}</p>
      <div>
        <span>{ru ? 'Всего строк' : 'Total rows'} <b>{preview.totalSteps}</b></span>
        <span>{ru ? 'Действий' : 'Actions'} <b>{preview.actionSteps}</b></span>
        <span>{ru ? 'Эффектов' : 'Effects'} <b>{preview.effectSteps}</b></span>
        <span>{ru ? 'Циклов' : 'Cycles'} <b>{preview.cycleSteps}</b></span>
        <span>{ru ? 'Ожиданий' : 'Wait rows'} <b>{preview.waitSteps}</b></span>
      </div>
      <small>{sourcePreset ? `${sourcePreset.title[locale]} · ${timingLabel(preview.timingStatus, ru)}` : timingLabel(preview.timingStatus, ru)}</small>
      {preview.blockedModelRows ? <div className="scenario-portable-warning"><ShieldAlert size={15} /><span>{ru
        ? `Строк, которые текущая модель сразу не распознаёт: ${preview.blockedModelRows}. Они сохранятся видимыми и заблокированными.`
        : `${preview.blockedModelRows} rows are not recognized by the current model. They remain visible and blocked.`}</span></div> : null}
      <button type="button" className="primary" onClick={applyImport}><Upload size={16} />{ru ? 'Применить проверенный пакет' : 'Apply validated package'}</button>
    </div> : null}

    {notice ? <div className={`scenario-portable-notice ${notice.kind}`}>{notice.kind === 'ok' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}<span>{notice.text}</span></div> : null}
  </section>;
}
