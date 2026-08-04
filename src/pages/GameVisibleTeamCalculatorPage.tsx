import { useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, CircleDot, Shield, Sparkles, Swords, Target, Users } from 'lucide-react';
import { arcDirectory } from '../arc-directory';
import { awakeningNodesByCharacter } from '../awakening-data';
import { characterByName, characterCatalog } from '../characters';
import {
  actionsForCharacter,
  calculateGameVisibleTeam,
  type VerifiedVisibleAction,
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
} from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';

const tabs = ['overview', 'damage', 'conditions', 'test'] as const;
type CalculatorTab = typeof tabs[number];
type DamageStatKey = 'atk' | 'critRate' | 'critDamage' | 'damageBonus' | 'attributeDamageBonus';

const tabLabels: Record<CalculatorTab, { ru: string; en: string }> = {
  overview: { ru: 'Обзор', en: 'Overview' },
  damage: { ru: 'Урон', en: 'Damage' },
  conditions: { ru: 'Условия', en: 'Conditions' },
  test: { ru: 'Тест', en: 'Test' },
};

const modeLabels: Record<VisibleTestModeId, { ru: string; en: string }> = {
  'neutral-reference': { ru: 'Сравнение сборки', en: 'Build comparison' },
  'burst-reference': { ru: 'Окно после сверхспособности', en: 'Post-Ultimate window' },
  'training-target': { ru: 'Тренировочная цель', en: 'Training target' },
  'verified-action': { ru: 'Проверенное действие', en: 'Verified action' },
};

const coverageLabels = {
  verified: { ru: 'Модель проверена', en: 'Verified model' },
  partial: { ru: 'Модель частичная', en: 'Partial model' },
  'relative-only': { ru: 'Только сравнение сборки', en: 'Build comparison only' },
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

function actionNeedsSkill(action: VerifiedVisibleAction | undefined): action is VerifiedVisibleAction & { requiredLevel: number } {
  return Boolean(action && action.requiredLevel !== '—');
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
  const verifiedActions = useMemo(() => actionsForCharacter(activeBuild.characterName), [activeBuild.characterName]);
  const selectedAction = verifiedActions.find((action) => action.id === activeBuild.verifiedActionId);
  const awakeningNodes = awakeningNodesByCharacter.get(activeBuild.characterName) ?? [];
  const showArcCondition = activeBuild.characterName === 'Shinku' && activeBuild.testMode === 'burst-reference';
  const showTarget = activeBuild.testMode === 'training-target'
    || (activeBuild.testMode === 'verified-action' && Boolean(selectedAction));
  const compatibleArcs = useMemo(
    () => arcDirectory.filter((arc) => !character?.arcType || arc.type === character.arcType),
    [character?.arcType],
  );

  const updateState = (updater: (current: GameVisibleTeamState) => GameVisibleTeamState) => setState(updater);
  const updateBuild = (updater: (build: GameVisibleCharacterBuild) => GameVisibleCharacterBuild) => updateState((current) => ({
    ...current,
    builds: current.builds.map((build, index) => index === current.activeSlot ? updater(build) : build),
  }));
  const updateStat = (key: DamageStatKey, value: number) => updateBuild((build) => ({
    ...build,
    stats: { ...build.stats, [key]: value },
  }));
  const selectCharacter = (name: string) => updateBuild(() => createEmptyGameVisibleBuild(name));
  const selectArc = (arcName: string) => updateBuild((build) => ({
    ...build,
    arc: {
      ...build.arc,
      arcName,
      mixingRank: 1,
      afterUltimateActive: false,
    },
  }));

  const damageFields: Array<{ key: DamageStatKey; ru: string; en: string; suffix?: string; hint?: string }> = [
    {
      key: 'atk',
      ru: screenshotConfirmedRussianLabels.atk,
      en: 'ATK',
      hint: ru
        ? 'Итоговое число из «Атрибутов»: для Шинку на скриншоте это 1126 + 900 = 2026. Дугу и консоль отдельно не прибавляй.'
        : 'Final Attributes value. Arc and Console contributions are already included and must not be added again.',
    },
    { key: 'critRate', ru: screenshotConfirmedRussianLabels.critRate, en: 'CRIT Rate', suffix: '%' },
    { key: 'critDamage', ru: screenshotConfirmedRussianLabels.critDamage, en: 'CRIT DMG', suffix: '%' },
    { key: 'damageBonus', ru: screenshotConfirmedRussianLabels.damageBonus, en: 'DMG Bonus', suffix: '%' },
    {
      key: 'attributeDamageBonus',
      ru: character ? `Бонус к урону ${localizedAttribute(character.attribute, locale).toLocaleLowerCase(locale)}` : 'Бонус атрибута',
      en: 'Attribute DMG Bonus',
      suffix: '%',
    },
  ];

  return <div className="page nte-visible-calculator">
    <header className="nte-calc-hero">
      <div><span>{ru ? 'ТОЛЬКО НУЖНЫЕ ДАННЫЕ ИЗ ИГРЫ' : 'ONLY FORMULA-RELEVANT GAME DATA'}</span><h1>{ru ? 'Калькулятор команды' : 'Team Calculator'}</h1><p>{ru
        ? 'Сайт запрашивает поле только тогда, когда оно влияет на выбранный тест. Постоянные бонусы дуги, консоли и развития уже находятся в итоговых атрибутах.'
        : 'A field appears only when it affects the selected test. Permanent Arc, Console and progression bonuses are already included in final Attributes.'}</p></div>
      <div className="nte-calc-rule"><Shield size={20} /><b>{ru ? 'Никакого повторного учёта' : 'No double counting'}</b><small>{ru ? 'Итоговая Атака используется напрямую' : 'Final ATK is used directly'}</small></div>
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
        <nav className="nte-editor-tabs" aria-label={ru ? 'Разделы расчёта' : 'Calculation sections'}>{tabs.map((key) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{tabLabels[key][locale]}</button>)}</nav>

        {tab === 'overview' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Users size={21} /><div><h2>{ru ? 'Основа расчёта' : 'Calculation base'}</h2><p>{ru ? 'Для коэффициента защиты противника нужен уровень персонажа. Текущий предел уровня, ОЗ и Защита для выбранных тестов не требуются.' : 'Character level is used by the enemy defence formula. Level cap, HP and DEF are not required by the selected tests.'}</p></div></div>
          <div className="nte-field-grid two">
            <StatInput label={ru ? 'Уровень персонажа' : 'Character level'} value={activeBuild.level} onChange={(value) => updateBuild((build) => ({ ...build, level: value }))} step="1" min={1} />
            <div className="nte-input-policy"><Shield size={19} /><b>{ru ? 'Убрано из ввода' : 'Removed from input'}</b><span>{ru ? 'ОЗ, Защита, Скорость зарядки, интенсивности, статы дуги и схема консоли.' : 'HP, DEF, Charge Speed, intensities, Arc stats and Console layout.'}</span></div>
          </div>
          <div className="nte-visible-summary compact">
            <div><Swords size={19} /><span>{screenshotConfirmedRussianLabels.atk}</span><b>{activeBuild.stats.atk.toLocaleString(locale)}</b></div>
            <div><CircleDot size={19} /><span>{screenshotConfirmedRussianLabels.critRate}</span><b>{activeBuild.stats.critRate}%</b></div>
            <div><Sparkles size={19} /><span>{screenshotConfirmedRussianLabels.critDamage}</span><b>{activeBuild.stats.critDamage}%</b></div>
          </div>
        </section> : null}

        {tab === 'damage' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><BarChart3 size={21} /><div><h2>{ru ? 'Показатели, участвующие в уроне' : 'Damage-relevant attributes'}</h2><p>{ru ? 'Вводятся готовые значения с экрана «Атрибуты». Постоянные бонусы снаряжения уже входят в них.' : 'Enter final values from Attributes. Permanent equipment bonuses are already included.'}</p></div></div>
          <div className="nte-field-grid two">{damageFields.map((field) => <StatInput key={field.key} label={ru ? field.ru : field.en} value={activeBuild.stats[field.key]} suffix={field.suffix} hint={field.hint} onChange={(value) => updateStat(field.key, value)} />)}</div>
        </section> : null}

        {tab === 'conditions' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Activity size={21} /><div><h2>{ru ? 'Только условия выбранного теста' : 'Selected-test conditions only'}</h2><p>{ru ? 'Здесь нет общей анкеты сборки: показываются лишь данные, которые способны изменить текущий результат.' : 'This is not a full build form. Only fields capable of changing the current result are shown.'}</p></div></div>

          {actionNeedsSkill(selectedAction) ? <div className="nte-condition-section">
            <h3>{ru ? 'Требуемый уровень способности' : 'Required ability level'}</h3>
            <StatInput
              label={selectedAction.requiredSkill === 'basic' ? (ru ? 'Базовая атака' : 'Basic Attack') : selectedAction.requiredSkill === 'skill' ? (ru ? 'Навык' : 'Skill') : selectedAction.requiredSkill === 'ultimate' ? (ru ? 'Сверхспособность' : 'Ultimate') : (ru ? 'Навык поддержки' : 'Support Skill')}
              value={activeBuild.skills[selectedAction.requiredSkill]}
              onChange={(value) => updateBuild((build) => ({ ...build, skills: { ...build.skills, [selectedAction.requiredSkill]: value } }))}
              step="1"
              min={1}
              hint={ru ? `Источник подтверждает коэффициент только для уровня ${selectedAction.requiredLevel}.` : `The coefficient is sourced only for level ${selectedAction.requiredLevel}.`}
            />
          </div> : null}

          {awakeningNodes.length ? <div className="nte-condition-section">
            <h3>{ru ? 'Открытые пробуждения' : 'Unlocked Awakenings'}</h3>
            <p className="nte-condition-copy">{ru ? 'Выбери максимальный открытый узел. Все предыдущие считаются открытыми автоматически; сам номер не является скрытым множителем урона.' : 'Select the highest unlocked node. Previous nodes are unlocked automatically; the number itself is not a hidden damage multiplier.'}</p>
            <div className="nte-awakening-picker" role="group" aria-label={ru ? 'Уровень пробуждения' : 'Awakening level'}>
              {Array.from({ length: 7 }, (_, level) => <button key={level} className={activeBuild.awakeningLevel === level ? 'active' : ''} onClick={() => updateBuild((build) => ({ ...build, awakeningLevel: level }))}>{level === 0 ? 'A0' : `A${level}`}</button>)}
            </div>
            <div className="nte-awakening-list">{awakeningNodes.map((node) => {
              const unlocked = node.level <= activeBuild.awakeningLevel;
              const used = Boolean(selectedAction && node.relatedActionIds?.includes(selectedAction.id));
              return <article key={`${node.characterName}-${node.level}`} className={`${unlocked ? 'unlocked' : 'locked'} ${used ? 'used' : ''}`}>
                <b>A{node.level}</b>
                <div><strong>{node.title[locale]}</strong><p>{node.description[locale]}</p><small>{node.evidence === 'current-russian-reference' ? (ru ? 'текущая русская карточка' : 'current Russian record') : (ru ? 'русское название не подтверждено — показано английское' : 'English current reference')}</small></div>
                <span>{used ? (ru ? 'участвует в тесте' : 'used by test') : unlocked ? (ru ? 'открыто' : 'unlocked') : (ru ? 'закрыто' : 'locked')}</span>
              </article>;
            })}</div>
          </div> : null}

          {showArcCondition ? <div className="nte-condition-section">
            <h3>{ru ? 'Условный эффект дуги' : 'Conditional Arc effect'}</h3>
            <p className="nte-condition-copy">{ru ? 'Название и смешивание нужны только потому, что эффект после сверхспособности не входит в постоянные атрибуты. Атака дуги и её вторичный стат не вводятся.' : 'Arc identity and Mixing are needed only because the post-Ultimate effect is not a permanent attribute. Arc ATK and secondary stat are not entered.'}</p>
            <label className="nte-select-field"><span>{ru ? 'Экипированная дуга' : 'Equipped Arc'}</span><select value={activeBuild.arc.arcName} onChange={(event) => selectArc(event.target.value)}><option value="">{ru ? 'Эффект не применяется' : 'No Arc effect'}</option>{compatibleArcs.map((arc) => <option key={arc.id} value={arc.name}>{localizedArcName(arc.name, locale)}</option>)}</select></label>
            {activeBuild.arc.arcName === 'Blushing Mirage' ? <>
              <StatInput label={ru ? 'Смешивание P' : 'Mixing M'} value={activeBuild.arc.mixingRank} onChange={(value) => updateBuild((build) => ({ ...build, arc: { ...build.arc, mixingRank: value } }))} step="1" min={1} />
              <label className="nte-condition-toggle"><input type="checkbox" checked={activeBuild.arc.afterUltimateActive} onChange={(event) => updateBuild((build) => ({ ...build, arc: { ...build.arc, afterUltimateActive: event.target.checked } }))} /><span><b>{ru ? 'Окно эффекта после сверхспособности активно' : 'Post-Ultimate effect window is active'}</b><small>{ru ? 'Только этот переключатель включает временный эффект дуги.' : 'Only this switch enables the temporary Arc effect.'}</small></span></label>
            </> : null}
          </div> : null}

          {!actionNeedsSkill(selectedAction) && !awakeningNodes.length && !showArcCondition ? <div className="nte-input-policy"><CheckCircle2 size={19} /><b>{ru ? 'Дополнительные поля не нужны' : 'No extra inputs needed'}</b><span>{ru ? 'Выбранный тест считается только по итоговым атрибутам и заданной цели.' : 'The selected test uses only final attributes and the target preset.'}</span></div> : null}
        </section> : null}

        {tab === 'test' ? <section className="nte-editor-section">
          <div className="nte-section-heading"><Target size={21} /><div><h2>{ru ? 'Что именно считать' : 'What to calculate'}</h2><p>{ru ? 'Сначала выбирается тест — после этого сайт показывает только связанные с ним условия.' : 'Choose a test first; the site then reveals only its relevant conditions.'}</p></div></div>
          <div className="nte-test-modes">{coverage?.supportedModes.map((mode) => <button key={mode} className={activeBuild.testMode === mode ? 'active' : ''} onClick={() => updateBuild((build) => ({ ...build, testMode: mode, verifiedActionId: mode === 'verified-action' ? build.verifiedActionId : '' }))}><span>{modeLabels[mode][locale]}</span><small>{mode === 'verified-action' ? (ru ? 'точный коэффициент из источника' : 'exact sourced coefficient') : (ru ? 'контрольный тест 100% АТК' : '100% ATK reference')}</small></button>)}</div>

          {activeBuild.testMode === 'verified-action' ? <label className="nte-select-field"><span>{ru ? 'Подтверждённое действие' : 'Verified action'}</span><select value={activeBuild.verifiedActionId} onChange={(event) => updateBuild((build) => ({ ...build, verifiedActionId: event.target.value }))}><option value="">{ru ? 'Выбери действие' : 'Select an action'}</option>{verifiedActions.map((action) => <option key={action.id} value={action.id}>{action.title[locale]}{action.requiredLevel === '—' ? '' : ` · ур. ${action.requiredLevel}`}</option>)}</select></label> : null}

          {showTarget ? <div className="nte-condition-section">
            <h3>{ru ? 'Параметры цели' : 'Target parameters'}</h3>
            <div className="nte-field-grid two">
              <StatInput label={ru ? 'Уровень цели' : 'Target level'} value={state.target.level} onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, level: value } }))} step="1" min={1} />
              <StatInput label={ru ? 'Сопротивление цели' : 'Target resistance'} value={state.target.resistance} suffix="%" onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, resistance: value } }))} min={-100} />
              <StatInput label={ru ? 'Снижение защиты' : 'DEF reduction'} value={state.target.defenceReduction} suffix="%" onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, defenceReduction: value } }))} />
              <StatInput label={ru ? 'Снижение сопротивления' : 'RES reduction'} value={state.target.resistanceReduction} suffix="%" onChange={(value) => updateState((current) => ({ ...current, target: { ...current.target, resistanceReduction: value } }))} />
            </div>
          </div> : null}

          <div className="nte-model-note"><Shield size={18} /><span>{ru ? 'Контрольный удар нужен для сравнения сборок. Он не объявляется уроном конкретного навыка или полной ротации.' : 'The reference hit compares builds. It is not presented as a skill or full-rotation result.'}</span></div>
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
        <div className="nte-trust-footer"><Shield size={17} /><span>{ru ? 'Сайт применяет только подтверждённые эффекты выбранного теста. Скрытые бонусы дуги, консоли и пробуждения не добавляются автоматически.' : 'Only verified effects for the selected test are applied. Hidden Arc, Console or Awakening bonuses are never added automatically.'}</span></div>
      </aside>
    </div>
  </div>;
}
