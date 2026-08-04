import { useMemo } from 'react';
import { ChevronDown, Gauge, RotateCcw, SlidersHorizontal, Users } from 'lucide-react';
import { calculateTeam, type EnemyProfile, type TeamMemberInput } from '../../packages/calculation-core/src';
import { canonicalCharacterName, characterByName, characterCatalog } from '../characters';
import { TeamReadinessPanel } from '../components/TeamReadinessPanel';
import { FieldHelp, QuickStart } from '../components/GuidedHelp';
import { Field, formatNumber, Metric, Panel } from '../components/UI';
import { localizedArcType, localizedAttribute, localizedCharacterName, localizedRole } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';
import {
  combinedDamageBonus,
  effectiveAtk,
  totalMultiplierPerUse,
  withCombinedDamageBonus,
  withEffectiveAtk,
  withTotalMultiplierPerUse,
} from '../state/teamForm';
import {
  emptyTeamInputs,
  evaluateTeamReadiness,
  sampleTeamDuration,
  sampleTeamEnemy,
  sampleTeamMembers,
} from '../team-readiness';

type NumericMemberKey = 'baseAtk' | 'arcAtk' | 'flatAtk' | 'atkPercent' | 'teamAtkPercent' | 'skillMultiplier' | 'hits' | 'actionsPerRotation' | 'damageBonus' | 'teamDamageBonus' | 'critRate' | 'critDamage';
type EnemyKey = keyof EnemyProfile;

const initialMembers = (): TeamMemberInput[] => sampleTeamMembers.map((member) => ({ ...member, enemy: { ...sampleTeamEnemy } }));

const labels: Record<'ru' | 'en', Record<NumericMemberKey | EnemyKey, string>> = {
  ru: {
    baseAtk: 'Базовая АТК персонажа', arcAtk: 'Базовая АТК дуги', flatAtk: 'Дополнительная АТК', atkPercent: 'Личный бонус АТК, %', teamAtkPercent: 'Бонус АТК от команды, %',
    skillMultiplier: 'Множитель одного одинакового попадания, % АТК', hits: 'Одинаковых попаданий за применение', actionsPerRotation: 'Применений за ротацию', damageBonus: 'Личный бонус урона, %',
    teamDamageBonus: 'Бонус урона от команды, %', critRate: 'Шанс критического удара, %', critDamage: 'Критический урон, %',
    level: 'Уровень врага', resistance: 'Сопротивление врага, %', defenceReduction: 'Снижение ЗАЩ врага, %', resistanceReduction: 'Снижение сопротивления, %',
  },
  en: {
    baseAtk: 'Base ATK', arcAtk: 'Arc ATK', flatAtk: 'Flat ATK', atkPercent: 'ATK, %', teamAtkPercent: 'Team ATK, %',
    skillMultiplier: 'Multiplier per identical hit, % ATK', hits: 'Identical hits per use', actionsPerRotation: 'Uses per rotation', damageBonus: 'Personal DMG Bonus, %',
    teamDamageBonus: 'Team DMG Bonus, %', critRate: 'CRIT Rate, %', critDamage: 'CRIT DMG, %',
    level: 'Enemy level', resistance: 'Resistance, %', defenceReduction: 'DEF reduction, %', resistanceReduction: 'RES reduction, %',
  },
};

const coreMemberFields: NumericMemberKey[] = ['critRate', 'critDamage'];
const advancedMemberFields: NumericMemberKey[] = ['skillMultiplier', 'hits', 'baseAtk', 'arcAtk', 'flatAtk', 'atkPercent', 'teamAtkPercent', 'damageBonus', 'teamDamageBonus'];
const enemyFields: EnemyKey[] = ['level', 'resistance', 'defenceReduction', 'resistanceReduction'];

export function TeamCalculatorPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [members, setMembers] = useLocalStorage<TeamMemberInput[]>('nte.team.v2', initialMembers());
  const [duration, setDuration] = useLocalStorage<number>('nte.team.duration.v2', sampleTeamDuration);
  const [enemy, setEnemy] = useLocalStorage<EnemyProfile>('nte.team.enemy.v2', sampleTeamEnemy);
  const [confirmedDigest, setConfirmedDigest] = useLocalStorage<string>('nte.team.confirmed-digest.v1', '');

  const normalizedMembers = useMemo(() => members.slice(0, 4).map((member, index) => {
    const canonicalName = canonicalCharacterName(member.name) ?? sampleTeamMembers[index]?.name ?? 'Zero';
    const character = characterByName.get(canonicalName);
    return { ...member, id: character?.id ?? member.id, name: canonicalName, enemy };
  }), [enemy, members]);
  const selectedNames = useMemo(() => new Set(normalizedMembers.map((member) => member.name)), [normalizedMembers]);
  const result = useMemo(() => calculateTeam(normalizedMembers, duration), [normalizedMembers, duration]);
  const readiness = useMemo(
    () => evaluateTeamReadiness(normalizedMembers, duration, enemy, confirmedDigest),
    [confirmedDigest, duration, enemy, normalizedMembers],
  );

  const updateCharacter = (index: number, name: string) => {
    const character = characterByName.get(name);
    if (!character) return;
    setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, id: character.id, name: character.name } : item));
  };
  const updateMember = (index: number, key: NumericMemberKey, value: number) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateEffectiveAtk = (index: number, value: number) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? withEffectiveAtk(item, value) : item));
  const updateCombinedBonus = (index: number, value: number) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? withCombinedDamageBonus(item, value) : item));
  const updateTotalMultiplier = (index: number, value: number) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? withTotalMultiplierPerUse(item, value) : item));
  const updateEnemy = (key: EnemyKey, value: number) => setEnemy((current) => ({ ...current, [key]: value }));
  const reset = () => {
    setMembers(initialMembers());
    setDuration(sampleTeamDuration);
    setEnemy({ ...sampleTeamEnemy });
    setConfirmedDigest('');
  };
  const startEmpty = () => {
    setMembers(emptyTeamInputs(normalizedMembers, enemy));
    setConfirmedDigest('');
  };
  const confirmCurrent = () => {
    if (readiness.canConfirm) setConfirmedDigest(readiness.digest);
  };

  const resultStateNote = {
    sample: ru ? 'Демонстрационные значения' : 'Sample values',
    incomplete: ru ? 'Черновик: ввод неполный' : 'Draft: incomplete input',
    unchecked: ru ? 'Не сверено пользователем' : 'Not checked by user',
    checked: ru ? 'Сверено для текущих данных' : 'Checked for current inputs',
  }[readiness.status];

  return <div className="page calc-page">
    <header className="page-heading"><div><span>{ru ? 'РАСЧЁТ КОМАНДЫ' : 'TEAM CALCULATION'}</span><h1>{ru ? 'Калькулятор урона команды' : 'Team rotation calculator'}</h1><p>{ru ? 'Выбери четырёх персонажей и задай для каждого одну основную атаку, навык или серию. В быстром режиме нужен общий множитель за одно применение — без отдельного подсчёта попаданий.' : 'Choose four characters and describe one main attack, skill or sequence for each. Quick input needs one total multiplier per use, with no separate hit bookkeeping.'}</p></div><button className="button ghost" onClick={reset}><RotateCcw size={17} /> {ru ? 'Вернуть пример' : 'Restore sample'}</button></header>

    <QuickStart title={ru ? 'Быстрый старт' : 'Quick start'} steps={ru ? [
      'Нажми «Начать со своих данных», чтобы убрать демонстрационные боевые значения, но сохранить выбранных персонажей.',
      'Введи итоговую АТК, общий бонус урона и суммарный множитель одной атаки или серии.',
      'Укажи число применений и длительность ротации, затем сверь значения и подтверди текущий расчёт.',
    ] : [
      'Select “Start with my own data” to clear demo combat values while keeping the selected characters.',
      'Enter effective ATK, combined damage bonus and the total multiplier for one attack or sequence.',
      'Set uses and rotation duration, then review and confirm the current calculation.',
    ]} />

    <div className="disclaimer top-note"><Users size={18} /><span>{ru ? 'Выбор персонажа подставляет только имя, роль, тип эспера и тип дуги. Сайт не выдумывает множители навыков: введи проверенное значение сам. Отметка «сверено» подтверждает только твой текущий набор данных, а не официальную точность результата.' : 'Character selection fills identity metadata only. The site does not invent skill multipliers. “Checked” confirms only your current input snapshot, not official result accuracy.'}</span></div>

    <TeamReadinessPanel
      report={readiness}
      members={normalizedMembers}
      onConfirm={confirmCurrent}
      onStartEmpty={startEmpty}
      onResetSample={reset}
    />

    <div className="summary-strip"><Metric label={ru ? 'Урон за ротацию' : 'Team damage'} value={formatNumber(result.totalDamage)} note={resultStateNote} /><Metric label="DPS" value={formatNumber(result.dps)} note={resultStateNote} /><Metric label={ru ? 'Длительность' : 'Duration'} value={`${duration} ${ru ? 'сек' : 's'}`} /><Metric label={ru ? 'Версия формулы' : 'Formula'} value="v0.1" note={ru ? 'Оценочная модель' : 'Estimate model'} /></div>

    <div className="team-layout"><div className="member-stack">{normalizedMembers.map((member, index) => {
      const character = characterByName.get(member.name);
      const totalAtk = effectiveAtk(member);
      const totalBonus = combinedDamageBonus(member);
      const multiplierPerUse = totalMultiplierPerUse(member);
      const uses = Math.max(0, member.actionsPerRotation);
      const rotationMultiplier = multiplierPerUse * uses;
      const multiplierText = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
      return <Panel key={`${member.id}-${index}`} className="member-panel simplified-member-panel">
        <div className="member-title"><span>{index + 1}</span><div className="member-character-block"><select className="member-character-select" aria-label={ru ? `Персонаж в слоте ${index + 1}` : `Character in slot ${index + 1}`} value={member.name} onChange={(event) => updateCharacter(index, event.target.value)}>{characterCatalog.map((option) => <option key={option.id} value={option.name} disabled={option.name !== member.name && selectedNames.has(option.name)}>{localizedCharacterName(option.name, locale)}{option.releaseStatus === 'upcoming' ? ` · ${ru ? 'ожидается' : 'upcoming'}` : ''}</option>)}</select><div className="member-character-meta"><span>{character?.rarity ?? '?'}</span><span>{localizedAttribute(character?.attribute, locale) || (ru ? 'Тип эспера неизвестен' : 'Unknown attribute')}</span><span>{character?.role ? localizedRole(character.role, locale) : (ru ? 'Роль не объявлена' : 'Role unannounced')}</span><span>{character?.arcType ? localizedArcType(character.arcType, locale) : (ru ? 'Тип дуги не объявлен' : 'Arc type unannounced')}</span></div></div><div className="member-result-meta"><span>{ru ? 'АТК' : 'ATK'} {formatNumber(totalAtk)}</span><b>{(result.members[index]?.share ?? 0).toLocaleString(locale, { style: 'percent', maximumFractionDigits: 1 })}</b></div></div>

        <div className="member-core-heading"><div><b>{ru ? 'Основные параметры' : 'Core inputs'}</b><small>{ru ? 'Одна понятная атака или серия вместо внутренних терминов модели.' : 'One understandable attack or sequence instead of internal model terms.'}</small></div></div>
        <div className="member-core-grid">
          <Field label={ru ? 'Итоговая АТК' : 'Effective ATK'} type="number" min="0" value={Math.round(totalAtk * 100) / 100} onChange={(event) => updateEffectiveAtk(index, Number(event.target.value))} />
          <Field label={ru ? 'Общий бонус урона, %' : 'Combined DMG Bonus, %'} type="number" value={totalBonus} onChange={(event) => updateCombinedBonus(index, Number(event.target.value))} />
          <Field label={ru ? 'Суммарный множитель за применение, % АТК' : 'Total multiplier per use, % ATK'} hint={ru ? 'Сложи разные части серии: 120% + 180% = 300%.' : 'Add different parts of a sequence: 120% + 180% = 300%.'} type="number" min="0" value={Math.round(multiplierPerUse * 100) / 100} onChange={(event) => updateTotalMultiplier(index, Number(event.target.value))} />
          <Field label={labels[locale].actionsPerRotation} hint={ru ? '1 — один раз, 2 — дважды за полную ротацию.' : '1 means once; 2 means twice during the full rotation.'} type="number" min="0" value={member.actionsPerRotation} onChange={(event) => updateMember(index, 'actionsPerRotation', Number(event.target.value))} />
          {coreMemberFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={member[key]} onChange={(event) => updateMember(index, key, Number(event.target.value))} />)}
        </div>
        <div className="sequence-formula" aria-live="polite"><span>{ru ? 'Как это считается' : 'Calculation interpretation'}</span><strong>{member.hits === 1
          ? `${multiplierText(multiplierPerUse)}% × ${multiplierText(uses)} = ${multiplierText(rotationMultiplier)}% ${ru ? 'АТК за ротацию' : 'ATK per rotation'}`
          : `${multiplierText(member.skillMultiplier)}% × ${multiplierText(member.hits)} ${ru ? 'попад. ×' : 'hits ×'} ${multiplierText(uses)} = ${multiplierText(rotationMultiplier)}% ${ru ? 'АТК за ротацию' : 'ATK per rotation'}`}</strong></div>

        <details className="member-advanced-fields"><summary><SlidersHorizontal size={17} /><span><b>{ru ? 'Подробный ввод' : 'Detailed input'}</b><small>{ru ? 'Разбивка одинаковых попаданий, АТК и командных бонусов' : 'Identical-hit, ATK and team-bonus breakdown'}</small></span><ChevronDown size={18} /></summary><div className="field-grid compact">{advancedMemberFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={member[key]} onChange={(event) => updateMember(index, key, Number(event.target.value))} />)}</div><p>{ru ? 'Разные по силе попадания проще сразу сложить в суммарный множитель. Подробная пара нужна только для одинаковых попаданий: например, 150% × 4. Изменение суммарного множителя переносит результат в одно виртуальное попадание; изменение итоговой АТК или общего бонуса аналогично объединяет подробные компоненты.' : 'Different hit values are easiest to add into the total multiplier. The detailed pair is only needed for identical hits, such as 150% × 4. Editing the total multiplier stores it as one virtual hit; editing Effective ATK or Combined DMG Bonus similarly merges their detailed components.'}</p></details>
      </Panel>;
    })}</div>

      <aside><Panel className="sticky-results"><div className="panel-title"><Gauge size={20} /><div><h2>{ru ? 'Вклад персонажей в урон' : 'Rotation contribution'}</h2><p>{ru ? 'Результат уже учитывает среднее значение критических попаданий.' : 'Expected damage with averaged crit.'}</p></div></div><div className="contribution-list">{result.members.map((member) => <div key={member.id}><span><b>{localizedCharacterName(member.name, locale)}</b><small>{formatNumber(member.rotationDamage)}</small></span><strong>{(member.share * 100).toFixed(1)}%</strong><i><u style={{ width: `${member.share * 100}%` }} /></i></div>)}</div><Field label={ru ? 'Длительность всей ротации, сек' : 'Rotation duration, sec'} type="number" min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /><h3 className="subsection-label">{ru ? 'Характеристики врага' : 'Enemy profile'}</h3><div className="enemy-grid">{enemyFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={enemy[key]} onChange={(event) => updateEnemy(key, Number(event.target.value))} />)}</div><FieldHelp title={ru ? 'Что означают основные поля?' : 'What do the main fields mean?'} terms={ru ? [
        { term: 'Итоговая АТК', description: 'Готовое значение атаки после дуги, процентных бонусов и дополнительной АТК. Его можно взять из экрана характеристик.' },
        { term: 'Общий бонус урона', description: 'Сумма личного бонуса урона и бонусов, которые этому персонажу даёт команда.' },
        { term: 'Суммарный множитель за применение', description: 'Общий процент АТК одной выбранной атаки, навыка или серии. Разные части серии складываются один раз.' },
        { term: 'Применений за ротацию', description: 'Сколько раз выбранная атака или серия происходит за одну полную ротацию команды.' },
        { term: 'DPS', description: 'Средний урон в секунду: общий урон делится на длительность ротации.' },
      ] : [
        { term: 'Effective ATK', description: 'The final attack value after Arc, percentage and flat bonuses. It can be copied from the stat screen.' },
        { term: 'Combined DMG Bonus', description: 'Personal damage bonus plus bonuses this character receives from the team.' },
        { term: 'Total multiplier per use', description: 'The total % ATK of one selected attack, skill or sequence. Different sequence parts are added once.' },
        { term: 'Uses per rotation', description: 'How many times the selected attack or sequence occurs during one full team rotation.' },
        { term: 'DPS', description: 'Average damage per second: total damage divided by duration.' },
      ]} /><div className="model-note"><Users size={18} />{ru ? 'Пассивные эффекты, циклы эспера и точный порядок действий пока задаются общими бонусами, поэтому результат остаётся оценкой.' : 'Passives, reactions and exact action order are represented through explicit aggregate bonuses, so the result remains an estimate.'}</div></Panel></aside>
    </div>
  </div>;
}
