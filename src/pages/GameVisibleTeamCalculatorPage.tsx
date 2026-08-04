import { useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Gauge, Shield, Sparkles, Swords, Target, Users, Zap } from 'lucide-react';
import { arcDirectory } from '../arc-directory';
import { characterByName, characterCatalog } from '../characters';
import {
  actionsForCharacter,
  calculateGameVisibleTeam,
  type VisibleBuildCalculation,
} from '../game-visible-calculation';
import {
  combatCoverageByCharacter,
  createEmptyGameVisibleBuild,
  GAME_VISIBLE_TEAM_STORAGE_KEY,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  screenshotConfirmedRussianLabels,
  type GameVisibleCharacterBuild,
  type GameVisibleTeamState,
  type VisibleCombatStats,
  type VisibleTestModeId,
} from '../game-visible-build';
import {
  localizedArcName,
  localizedArcType,
  localizedAttribute,
  localizedCharacterName,
  localizedRole,
  localizedStatLabel,
} from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';

const tabs = ['overview', 'attributes', 'arc', 'ability', 'console', 'test'] as const;
type CalculatorTab = typeof tabs[number];

type NumericStatKey = keyof VisibleCombatStats;

const tabLabels: Record<CalculatorTab, { ru: string; en: string }> = {
  overview: { ru: 'Обзор', en: 'Overview' },
  attributes: { ru: 'Атрибуты', en: 'Attributes' },
  arc: { ru: 'Дуга', en: 'Arc' },
  ability: { ru: 'Способность эспера', en: 'Esper Ability' },
  console: { ru: 'Консоль', en: 'Console' },
  test: { ru: 'Тест', en: 'Test' },
};

const modeLabels: Record<VisibleTestModeId, { ru: string; en: string }> = {
  'neutral-reference': { ru: 'Текущая сборка · контрольный удар', en: 'Current build · reference hit' },
  'burst-reference': { ru: 'Окно после сверхспособности', en: 'Post-Ultimate window' },
  'training-target': { ru: 'Заданная тренировочная цель', en: 'Custom training target' },
  'verified-action': { ru: 'Проверенное действие', en: 'Verified action' },
};

const coverageLabels = {
  verified: { ru: 'Модель проверена', en: 'Verified model' },
  partial: { ru: 'Модель частичная', en: 'Partial model' },
  'relative-only': { ru: 'Только сравнение статов', en: 'Visible-stat comparison only' },
  unavailable: { ru: 'Расчёт недоступен', en: 'Model unavailable' },
} as const;

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ResultNumber({ value, locale }: { value: number; locale: 'ru' | 'en' }) {
  return <>{value.toLocaleString(locale, { maximumFractionDigits: 1 })}</>;
}

function StatInput({
  label,
  value,
  onChange,
  suffix,
  hint,
  step = 'any',
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
  step?: string;
  min?: number;
}) {
  return <label className="nte-stat-input">
    <span>{label}</span>
    <div><input type="number" value={value} min={min} step={step} onChange={(event) => onChange(numberValue(event.target.value))} />{suffix ? <b>{suffix}</b> : null}</div>
    {hint ? <small>{hint}</small> : null}
  </label>;
}

function sourceLabel(source: 'player' | 'verified-data' | 'test-preset', ru: boolean): string {
  if (source === 'player') return ru ? 'из игры' : 'player input';
  if (source === 'verified-data') return ru ? 'проверенные данные' : 'verified data';
  return ru ? 'режим теста' : 'test preset';
}

function CharacterResult({ calculation, ru, locale }: {
  calculation: VisibleBuildCalculation;
  ru: boolean;
  locale: 'ru' | 'en';
}) {
  if (!calculation.supported || !calculation.result) {
    return <div className="nte-result-blocked">
      <Shield size={24} />
      <strong>{ru ? 'Расчёт заблокирован' : 'Calculation blocked'}</strong>
      <p>{calculation.blockedReason?.[locale] ?? (ru ? 'Недостаточно подтверждённых данных.' : 'Not enough verified data.')}</p>
    </div>;
  }

  return <>
    <div className="nte-result-primary">
      <span>{calculation.title[locale]}</span>
      <strong><ResultNumber value={calculation.result.expected} locale={locale} /></strong>
      <small>{calculation.normalizedReference
        ? (ru ? 'Ожидаемый контрольный урон' : 'Expected reference damage')
        : (ru ? 'Ожидаемый урон действия' : 'Expected action damage')}</small>
    </div>
    <div className="nte-result-pair">
      <div><span>{ru ? 'Без крита' : 'Non-CRIT'}</span><b><ResultNumber value={calculation.result.nonCrit} locale={locale} /></b></div>
      <div><span>{ru ? 'Крит' : 'CRIT'}</span><b><ResultNumber value={calculation.result.crit} locale={locale} /></b></div>
    </div>
    <p className="nte-result-explanation">{calculation.explanation[locale]}</p>
    <div className="nte-condition-list">
      {calculation.conditions.map((condition) => <div key={condition.id}>
        <CheckCircle2 size={15} />
        <span>{condition.label[locale]}</span>
        <small>{sourceLabel(condition.source, ru)}</small>
      </div>)}
    </div>
  </>;
}

export function GameVisibleTeamCalculatorPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [state, setState] = useLocalStorage<GameVisibleTeamState>(
    GAME_VISIBLE_TEAM_STORAGE_KEY,
    initialGameVisibleTeamState(),
    { normalize: normalizeGameVisibleTeamState },
  );
  const [tab, setTab] = useState<CalculatorTab>('overview');

  const activeBuild = state.builds[state.activeSlot] ?? state.builds[0]!;
  const character = characterByName.get(activeBuild.characterName);
  const coverage = combatCoverageByCharacter.get(activeBuild.characterName);
  const teamCalculation = useMemo(() => calculateGameVisibleTeam(state), [state]);
  const activeCalculation = teamCalculation.rows[state.activeSlot] ?? teamCalculation.rows[0]!;
  const selectedNames = useMemo(() => new Set(state.builds.map((build) => build.characterName)), [state.builds]);
  const compatibleArcs = useMemo(
    () => arcDirectory.filter((arc) => !character?.arcType || arc.type === character.arcType),
    [character?.arcType],
  );
  const verifiedActions = useMemo(() => actionsForCharacter(activeBuild.characterName), [activeBuild.characterName]);

  const updateState = (updater: (current: GameVisibleTeamState) => GameVisibleTeamState) => setState(updater);
  const updateBuild = (updater: (build: GameVisibleCharacterBuild) => GameVisibleCharacterBuild) => updateState((current) => ({
    ...current,
    builds: current.builds.map((build, index) => index === current.activeSlot ? updater(build) : build),
  }));
  const updateStat = (key: NumericStatKey, value: number) => updateBuild((build) => ({
    ...build,
    stats: { ...build.stats, [key]: value },
  }));
  const selectCharacter = (name: string) => updateBuild(() => createEmptyGameVisibleBuild(name));
  const selectArc = (arcName: string) => {
    const arc = arcDirectory.find((entry) => entry.name === arcName);
    updateBuild((build) => ({
      ...build,
      arc: arc ? {
        arcName: arc.name,
        level: 80,
        maxLevel: 80,
        baseAtk: arc.baseAtk,
        secondaryLabel: arc.secondaryLabel,
        secondaryValue: arc.secondaryValue,
        mixingRank: 1,
        afterUltimateActive: false,
      } : { ...build.arc, arcName: '' },
    }));
  };

  const statFields: Array<{ key: NumericStatKey; ru: string; en: string; suffix?: string; hint?: string }> = [
    { key: 'hp', ru: screenshotConfirmedRussianLabels.hp, en: 'HP' },
    { key: 'atk', ru: screenshotConfirmedRussianLabels.atk, en: 'ATK', hint: ru ? 'Готовое итоговое число из «Атрибутов». Дуга отдельно не прибавляется.' : 'Final number from Attributes. Arc ATK is not added again.' },
    { key: 'def', ru: screenshotConfirmedRussianLabels.def, en: 'DEF' },
    { key: 'critRate', ru: screenshotConfirmedRussianLabels.critRate, en: 'CRIT Rate', suffix: '%' },
    { key: 'critDamage', ru: screenshotConfirmedRussianLabels.critDamage, en: 'CRIT DMG', suffix: '%' },
    { key: 'damageBonus', ru: screenshotConfirmedRussianLabels.damageBonus, en: 'DMG Bonus', suffix: '%' },
    { key: 'attributeDamageBonus', ru: character ? `${ru ? 'Бонус к урону' : 'DMG Bonus'} ${localizedAttribute(character.attribute, locale).toLocaleLowerCase(locale)}` : (ru ? 'Бонус атрибута' : 'Attribute DMG Bonus'), en: 'Attribute DMG Bonus', suffix: '%' },
    { key: 'chargeSpeed', ru: screenshotConfirmedRussianLabels.chargeSpeed, en: 'Charge Speed', suffix: '%' },
    { key: 'cycleIntensity', ru: screenshotConfirmedRussianLabels.cycleIntensity, en: 'Cycle Intensity' },
    { key: 'breakIntensity', ru: screenshotConfirmedRussianLabels.breakIntensity, en: 'Break Intensity' },
  ];

  return <div className="page nte-visible-calculator">
    <header className="nte-calc-hero">
      <div><span>{ru ? 'РАСЧЁТ ПО ДАННЫМ ИЗ ИГРЫ' : 'IN-GAME INPUT CALCULATOR'}</span><h1>{ru ? 'Калькулятор команды' : 'Team Calculator'}</h1><p>{ru
        ? 'Вводи только цифры и переключатели, которые видишь в клиенте. Коэффициенты действий сайт берёт только из проверенной базы.'
        : 'Enter only values and switches shown by the game client. Action coefficients come only from verified records.'}</p></div>
      <div className="nte-calc-rule"><Shield size={20} /><b>{ru ? 'Итоговая Атака используется напрямую' : 'Final ATK is used directly'}</b><small>{ru ? 'АТК дуги не складывается с ней повторно' : 'Arc ATK is never added a second time'}</small></div>
    </header>

    <section className="nte-team-rail" aria-label={ru ? 'Состав команды' : 'Team lineup'}>
      {state.builds.map((build, index) => {
        const profile = characterByName.get(build.characterName);
        const row = teamCalculation.rows[index];
        return <button key={`${build.characterName}-${index}`} className={state.activeSlot === index ? 'active' : ''} onClick={() => updateState((current) => ({ ...current, activeSlot: index }))}>
          <span>{index + 1}</span>
          {profile ? <img src={profile.image} alt="" /> : null}
          <div><b>{localizedCharacterName(build.characterName, locale)}</b><small>{row?.supported ? (ru ? 'готов к тесту' : 'test ready') : (ru ? 'нужно заполнить' : 'needs input')}</small></div>
          {row?.supported ? <CheckCircle2 size={18} /> : <Activity size={18} />}
        </button>;
      })}
    </section>

    <div className="nte-calc-layout">
      <aside className="nte-character-stage">
        <div className="nte-character-art">{character ? <img src={character.image} alt={localizedCharacterName(character.name, locale)} /> : null}</div>
        <div className="nte-character-identity">
          <select value={activeBuild.characterName} aria-label={ru ? 'Персонаж' : 'Character'} onChange={(event) => selectCharacter(event.target.value)}>
            {characterCatalog.filter((option) => option.releaseStatus === 'released').map((option) => <option key={option.id} value={option.name} disabled={option.name !== activeBuild.characterName && selectedNames.has(option.name)}>{localizedCharacterName(option.name, locale)}</option>)}
          </select>
          <div>{character ? <><span>{character.rarity}</span><span>{localizedAttribute(character.attribute, locale)}</span><span>{localizedRole(character.role, locale)}</span><span>{localizedArcType(character.arcType ?? '', locale)}</span></> : null}</div>
        </div>
        <div className={`nte-coverage coverage-${coverage?.coverage ?? 'unavailable'}`}>
          <b>{coverageLabels[coverage?.coverage ?? 'unavailable'][locale]}</b>
          <p>{coverage?.note[locale]}</p>
          <small>{coverage?.sourcePublisher}</small>
        </div>
      </aside>

      <main className="nte-build-editor">
        <nav className="nte-editor-tabs" aria-label={ru ? 'Разделы сборки' : 'Build sections'}>{tabs.map((key) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{tabLabels[key][locale]}</button>)}</nav>

        {tab === 'overview' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Users size={21} /><div><h2>{ru ? 'Данные с экрана «Информация»' : 'Information screen values'}</h2><p>{ru ? 'Уровень, пробуждение и готовые итоговые характеристики.' : 'Level, Awakening and final displayed stats.'}</p></div></div>
          <div className="nte-field-grid three">
            <StatInput label={ru ? 'Уровень персонажа' : 'Character level'} value={activeBuild.level} onChange={(value) => updateBuild((build) => ({ ...build, level: value }))} step="1" min={1} />
            <StatInput label={ru ? 'Текущий максимум уровня' : 'Current level cap'} value={activeBuild.maxLevel} onChange={(value) => updateBuild((build) => ({ ...build, maxLevel: value }))} step="1" min={1} />
            <StatInput label={ru ? 'Уровень пробуждения' : 'Awakening level'} value={activeBuild.awakeningLevel} onChange={(value) => updateBuild((build) => ({ ...build, awakeningLevel: value }))} step="1" />
          </div>
          <div className="nte-visible-summary">
            <div><Shield size={19} /><span>{screenshotConfirmedRussianLabels.hp}</span><b>{activeBuild.stats.hp.toLocaleString(locale)}</b></div>
            <div><Swords size={19} /><span>{screenshotConfirmedRussianLabels.atk}</span><b>{activeBuild.stats.atk.toLocaleString(locale)}</b></div>
            <div><Gauge size={19} /><span>{screenshotConfirmedRussianLabels.def}</span><b>{activeBuild.stats.def.toLocaleString(locale)}</b></div>
            <div><Zap size={19} /><span>{screenshotConfirmedRussianLabels.critRate}</span><b>{activeBuild.stats.critRate}%</b></div>
          </div>
        </section> : null}

        {tab === 'attributes' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><BarChart3 size={21} /><div><h2>{ru ? 'Атрибуты из клиента' : 'In-client attributes'}</h2><p>{ru ? 'Названия повторяют русскую вкладку «Атрибуты» на присланных скриншотах.' : 'Labels follow the current client Attributes screen.'}</p></div></div>
          <div className="nte-field-grid two">{statFields.map((field) => <StatInput key={field.key} label={ru ? field.ru : field.en} value={activeBuild.stats[field.key]} suffix={field.suffix} hint={field.hint} onChange={(value) => updateStat(field.key, value)} />)}</div>
        </section> : null}

        {tab === 'arc' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Sparkles size={21} /><div><h2>{ru ? 'Дуга' : 'Arc'}</h2><p>{ru ? 'Характеристики дуги сохраняются для условий и сравнений, но не прибавляются повторно к итоговой Атаке.' : 'Arc stats are stored for conditions and comparisons but never added to final ATK again.'}</p></div></div>
          <label className="nte-select-field"><span>{ru ? 'Экипированная дуга' : 'Equipped Arc'}</span><select value={activeBuild.arc.arcName} onChange={(event) => selectArc(event.target.value)}><option value="">{ru ? 'Не выбрана' : 'Not selected'}</option>{compatibleArcs.map((arc) => <option key={arc.id} value={arc.name}>{localizedArcName(arc.name, locale)}</option>)}</select></label>
          <div className="nte-field-grid three">
            <StatInput label={ru ? 'Уровень дуги' : 'Arc level'} value={activeBuild.arc.level} onChange={(value) => updateBuild((build) => ({ ...build, arc: { ...build.arc, level: value } }))} step="1" min={1} />
            <StatInput label={ru ? 'Атака дуги' : 'Arc ATK'} value={activeBuild.arc.baseAtk} onChange={(value) => updateBuild((build) => ({ ...build, arc: { ...build.arc, baseAtk: value } }))} hint={ru ? 'Справочное число — уже учтено в итоговой Атаке персонажа.' : 'Informational only — already included in final character ATK.'} />
            <StatInput label={ru ? 'Смешивание P' : 'Mixing M'} value={activeBuild.arc.mixingRank} onChange={(value) => updateBuild((build) => ({ ...build, arc: { ...build.arc, mixingRank: value } }))} step="1" min={1} />
          </div>
          <div className="nte-arc-readout"><span>{localizedStatLabel(activeBuild.arc.secondaryLabel, locale) || (ru ? 'Доп. характеристика' : 'Secondary stat')}</span><b>{activeBuild.arc.secondaryValue}%</b></div>
          {activeBuild.arc.arcName === 'Blushing Mirage' ? <label className="nte-condition-toggle"><input type="checkbox" checked={activeBuild.arc.afterUltimateActive} onChange={(event) => updateBuild((build) => ({ ...build, arc: { ...build.arc, afterUltimateActive: event.target.checked } }))} /><span><b>{ru ? 'Окно после сверхспособности активно' : 'Post-Ultimate window active'}</b><small>{ru ? 'Используется только в соответствующем тестовом режиме.' : 'Used only by the matching test mode.'}</small></span></label> : null}
        </section> : null}

        {tab === 'ability' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Swords size={21} /><div><h2>{ru ? 'Уровни способностей эспера' : 'Esper Ability levels'}</h2><p>{ru ? 'Вводятся уровни, которые игра показывает под четырьмя иконками. Коэффициенты пользователь не вводит.' : 'Enter levels shown below the four ability icons. The player never enters coefficients.'}</p></div></div>
          <div className="nte-ability-row">
            {(['basic', 'skill', 'ultimate', 'support'] as const).map((key) => <label key={key}><span>{key === 'basic' ? (ru ? 'Базовая атака' : 'Basic Attack') : key === 'skill' ? (ru ? 'Навык' : 'Skill') : key === 'ultimate' ? (ru ? 'Сверхспособность' : 'Ultimate') : (ru ? 'Навык поддержки' : 'Support Skill')}</span><input type="number" min="1" max="15" value={activeBuild.skills[key]} onChange={(event) => updateBuild((build) => ({ ...build, skills: { ...build.skills, [key]: numberValue(event.target.value) } }))} /><small>/ 15</small></label>)}
          </div>
          <div className="nte-model-note"><Shield size={18} /><span>{ru ? 'При отсутствии точной таблицы нужного уровня действие будет заблокировано. Интерполяции между уровнями нет.' : 'An action is blocked when its exact level table is unavailable. No level interpolation is used.'}</span></div>
        </section> : null}

        {tab === 'console' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Activity size={21} /><div><h2>{ru ? 'Консоль' : 'Console'}</h2><p>{ru ? 'Пока сохраняются только видимые параметры. Бонус включается в расчёт лишь после отдельной проверки его формулы.' : 'Only visible parameters are stored for now. A bonus enters the model only after its formula is verified.'}</p></div></div>
          <div className="nte-field-grid two">
            <StatInput label={ru ? 'Тип сетки консоли' : 'Console grid type'} value={activeBuild.console.gridType} onChange={(value) => updateBuild((build) => ({ ...build, console: { ...build.console, gridType: value } }))} step="1" />
            <StatInput label={ru ? 'Модулей типа III' : 'Type III modules'} value={activeBuild.console.typeThreeModules} onChange={(value) => updateBuild((build) => ({ ...build, console: { ...build.console, typeThreeModules: value } }))} step="1" />
          </div>
          {activeBuild.characterName === 'Shinku' ? <div className="nte-console-evidence"><b>{ru ? 'Подтверждено для Шинку' : 'Confirmed for Shinku'}</b><span>{ru ? 'Тип сетки 2; рекомендованный шаблон использует четыре модуля типа III.' : 'Grid Type 2; the recommended template uses four Type III modules.'}</span></div> : null}
        </section> : null}

        {tab === 'test' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Target size={21} /><div><h2>{ru ? 'Режим теста' : 'Test mode'}</h2><p>{ru ? 'Режим определяет, какие подтверждённые условия калькулятор применит сам.' : 'The mode determines which verified conditions are applied automatically.'}</p></div></div>
          <div className="nte-test-modes">{coverage?.supportedModes.map((mode) => <button key={mode} className={activeBuild.testMode === mode ? 'active' : ''} onClick={() => updateBuild((build) => ({ ...build, testMode: mode, verifiedActionId: mode === 'verified-action' ? build.verifiedActionId : '' }))}><span>{modeLabels[mode][locale]}</span><small>{mode === 'verified-action' ? (ru ? 'точный коэффициент из источника' : 'exact sourced coefficient') : (ru ? 'нормализованный тест 100% АТК' : 'normalized 100% ATK test')}</small></button>)}</div>
          {activeBuild.testMode === 'verified-action' ? <label className="nte-select-field"><span>{ru ? 'Подтверждённое действие' : 'Verified action'}</span><select value={activeBuild.verifiedActionId} onChange={(event) => updateBuild((build) => ({ ...build, verifiedActionId: event.target.value }))}><option value="">{ru ? 'Выбери действие' : 'Select an action'}</option>{verifiedActions.map((action) => <option key={action.id} value={action.id}>{action.title[locale]} · ур. {action.requiredLevel}</option>)}</select></label> : null}
          {activeBuild.testMode === 'training-target' ? <div className="nte-field-grid two">
            <StatInput label={ru ? 'Уровень цели' : 'Target level'} value={state.target.level} onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, level: value } }))} step="1" min={1} />
            <StatInput label={ru ? 'Сопротивление цели' : 'Target resistance'} value={state.target.resistance} suffix="%" onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, resistance: value } }))} min={-100} />
            <StatInput label={ru ? 'Снижение защиты' : 'DEF reduction'} value={state.target.defenceReduction} suffix="%" onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, defenceReduction: value } }))} />
            <StatInput label={ru ? 'Снижение сопротивления' : 'RES reduction'} value={state.target.resistanceReduction} suffix="%" onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, resistanceReduction: value } }))} />
          </div> : null}
          <div className="nte-model-note"><Shield size={18} /><span>{ru ? 'Контрольный удар не объявляется уроном навыка. Он сравнивает сборки при одинаковом коэффициенте 100% АТК.' : 'A reference hit is not presented as skill damage. It compares builds at the same 100% ATK ratio.'}</span></div>
        </section> : null}
      </main>

      <aside className="nte-results-panel">
        <div className="nte-results-heading"><Target size={21} /><div><span>{ru ? 'РЕЗУЛЬТАТ ТЕСТА' : 'TEST RESULT'}</span><h2>{localizedCharacterName(activeBuild.characterName, locale)}</h2></div></div>
        <CharacterResult calculation={activeCalculation} ru={ru} locale={locale} />
        <div className="nte-team-result">
          <span>{ru ? 'Сумма поддерживаемых тестов команды' : 'Supported team test total'}</span>
          <strong><ResultNumber value={teamCalculation.totalExpected} locale={locale} /></strong>
          <small>{ru ? `${teamCalculation.comparableRows} из 4 слотов рассчитано` : `${teamCalculation.comparableRows} of 4 slots calculated`}</small>
        </div>
        <div className="nte-trust-footer"><Shield size={17} /><span>{ru ? 'Результат показывает выбранные тесты, а не автоматически заявленный DPS полной боевой ротации.' : 'The result represents selected tests, not an automatically claimed full-rotation DPS value.'}</span></div>
      </aside>
    </div>
  </div>;
}
