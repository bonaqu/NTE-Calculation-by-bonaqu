import { useMemo } from 'react';
import { Gauge, RotateCcw, Users } from 'lucide-react';
import { calculateTeam, type EnemyProfile, type TeamMemberInput } from '../../packages/calculation-core/src';
import { canonicalCharacterName, characterByName, characterCatalog } from '../characters';
import { useI18n } from '../i18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Field, formatNumber, Metric, Panel } from '../components/UI';
import { FieldHelp, QuickStart } from '../components/GuidedHelp';
import { localizedArcType, localizedAttribute, localizedCharacterName, localizedRole } from '../gameTerms';

type NumericMemberKey = 'baseAtk' | 'arcAtk' | 'flatAtk' | 'atkPercent' | 'teamAtkPercent' | 'skillMultiplier' | 'hits' | 'actionsPerRotation' | 'damageBonus' | 'teamDamageBonus' | 'critRate' | 'critDamage';
type EnemyKey = keyof EnemyProfile;

const makeMember = (id: string, name: string, baseAtk: number, multiplier: number, actions: number): TeamMemberInput => ({
  id, name, characterLevel: 80, baseAtk, arcAtk: 500, flatAtk: 250, atkPercent: 65, teamAtkPercent: 15,
  skillMultiplier: multiplier, hits: 1, damageBonus: 30, teamDamageBonus: 15, critRate: 60, critDamage: 120,
  actionsPerRotation: actions, enemy: { level: 82, resistance: 20, defenceReduction: 10, resistanceReduction: 0 },
});

const defaultMembers: TeamMemberInput[] = [
  makeMember('shinku', 'Shinku', 1550, 900, 3), makeMember('iroi', 'Iroi', 1450, 420, 2),
  makeMember('hathor', 'Hathor', 1400, 520, 2), makeMember('zero', 'Zero', 1300, 300, 2),
];
const defaultEnemy: EnemyProfile = { level: 82, resistance: 20, defenceReduction: 10, resistanceReduction: 0 };

const labels: Record<'ru' | 'en', Record<NumericMemberKey | EnemyKey, string>> = {
  ru: {
    baseAtk: 'Базовая ATK персонажа', arcAtk: 'Базовая ATK дуги', flatAtk: 'Дополнительная ATK числом', atkPercent: 'Личная ATK, %', teamAtkPercent: 'ATK от команды, %',
    skillMultiplier: 'Множитель выбранного окна, %', hits: 'Попаданий в окне', actionsPerRotation: 'Повторов окна за ротацию', damageBonus: 'Личный бонус урона, %',
    teamDamageBonus: 'Бонус урона от команды, %', critRate: 'Крит. шанс, %', critDamage: 'Крит. урон, %',
    level: 'Уровень врага', resistance: 'Сопротивление врага, %', defenceReduction: 'Снижение DEF врага, %', resistanceReduction: 'Снижение сопротивления, %',
  },
  en: {
    baseAtk: 'Base ATK', arcAtk: 'Arc ATK', flatAtk: 'Flat ATK', atkPercent: 'ATK, %', teamAtkPercent: 'Team ATK, %',
    skillMultiplier: 'Window multiplier, %', hits: 'Hits', actionsPerRotation: 'Windows per rotation', damageBonus: 'DMG Bonus, %',
    teamDamageBonus: 'Team DMG Bonus, %', critRate: 'CRIT Rate, %', critDamage: 'CRIT DMG, %',
    level: 'Enemy level', resistance: 'Resistance, %', defenceReduction: 'DEF reduction, %', resistanceReduction: 'RES reduction, %',
  },
};

const memberFields: NumericMemberKey[] = ['baseAtk', 'arcAtk', 'flatAtk', 'atkPercent', 'teamAtkPercent', 'skillMultiplier', 'hits', 'actionsPerRotation', 'damageBonus', 'teamDamageBonus', 'critRate', 'critDamage'];
const enemyFields: EnemyKey[] = ['level', 'resistance', 'defenceReduction', 'resistanceReduction'];

export function TeamCalculatorPage() {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const [members, setMembers] = useLocalStorage<TeamMemberInput[]>('nte.team.v2', defaultMembers);
  const [duration, setDuration] = useLocalStorage<number>('nte.team.duration.v2', 35);
  const [enemy, setEnemy] = useLocalStorage<EnemyProfile>('nte.team.enemy.v2', defaultEnemy);
  const normalizedMembers = useMemo(() => members.slice(0, 4).map((member, index) => {
    const canonicalName = canonicalCharacterName(member.name) ?? defaultMembers[index]?.name ?? 'Zero';
    const character = characterByName.get(canonicalName);
    return { ...member, id: character?.id ?? member.id, name: canonicalName, enemy };
  }), [enemy, members]);
  const selectedNames = useMemo(() => new Set(normalizedMembers.map((member) => member.name)), [normalizedMembers]);
  const result = useMemo(() => calculateTeam(normalizedMembers, duration), [normalizedMembers, duration]);
  const updateCharacter = (index: number, name: string) => {
    const character = characterByName.get(name);
    if (!character) return;
    setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, id: character.id, name: character.name } : item));
  };
  const updateMember = (index: number, key: NumericMemberKey, value: number) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateEnemy = (key: EnemyKey, value: number) => setEnemy((current) => ({ ...current, [key]: value }));
  const reset = () => { setMembers(defaultMembers); setDuration(35); setEnemy(defaultEnemy); };

  return <div className="page calc-page">
    <header className="page-heading"><div><span>{ru ? 'РАСЧЁТ КОМАНДЫ' : 'TEAM CALCULATION'}</span><h1>{ru ? 'Калькулятор урона команды' : 'Team rotation calculator'}</h1><p>{ru ? 'Выбери четырёх персонажей и введи характеристики одного основного окна урона для каждого. Калькулятор покажет общий урон, DPS и вклад участников.' : 'Choose four characters and describe one main damage window for each. The calculator shows total damage, DPS and individual contribution.'}</p></div><button className="button ghost" onClick={reset}><RotateCcw size={17} /> {ru ? 'Сбросить пример' : 'Reset'}</button></header>

    <QuickStart title={ru ? 'Быстрый старт' : 'Quick start'} steps={ru ? [
      'Выбери персонажа в каждом слоте — повторно выбрать уже занятого персонажа нельзя.',
      'Введи реальные характеристики, множитель одного важного окна и число его повторов.',
      'Справа настрой врага и длительность ротации — итог пересчитается автоматически.',
    ] : [
      'Choose a character in every slot; already selected characters are disabled.',
      'Enter real stats, one important window multiplier and its repeat count.',
      'Set enemy values and rotation duration; totals update automatically.',
    ]} />

    <div className="disclaimer top-note"><Users size={18} /><span>{ru ? 'Выбор персонажа подставляет только имя, роль, атрибут и тип дуги. Числа остаются редактируемым примером и не выдаются за официальные характеристики.' : 'Character selection fills identity metadata only. Numeric values remain an editable example and are not official stats.'}</span></div>
    <div className="summary-strip"><Metric label={ru ? 'Урон за ротацию' : 'Team damage'} value={formatNumber(result.totalDamage)} /><Metric label="DPS" value={formatNumber(result.dps)} /><Metric label={ru ? 'Длительность' : 'Duration'} value={`${duration} ${ru ? 'сек' : 's'}`} /><Metric label={ru ? 'Версия формулы' : 'Formula'} value="v0.1" note={ru ? 'Оценочная модель' : 'Estimate model'} /></div>
    <div className="team-layout"><div className="member-stack">{normalizedMembers.map((member, index) => {
      const character = characterByName.get(member.name);
      return <Panel key={`${member.id}-${index}`} className="member-panel"><div className="member-title"><span>{index + 1}</span><div className="member-character-block"><select className="member-character-select" aria-label={ru ? `Персонаж в слоте ${index + 1}` : `Character in slot ${index + 1}`} value={member.name} onChange={(event) => updateCharacter(index, event.target.value)}>{characterCatalog.map((option) => <option key={option.id} value={option.name} disabled={option.name !== member.name && selectedNames.has(option.name)}>{localizedCharacterName(option.name, locale)}{option.releaseStatus === 'upcoming' ? ` · ${ru ? 'ожидается' : 'upcoming'}` : ''}</option>)}</select><div className="member-character-meta"><span>{character?.rarity ?? '?'}</span><span>{localizedAttribute(character?.attribute, locale) || (ru ? 'Атрибут неизвестен' : 'Unknown attribute')}</span><span>{character?.role ? localizedRole(character.role, locale) : (ru ? 'Роль не объявлена' : 'Role unannounced')}</span><span>{character?.arcType ? localizedArcType(character.arcType, locale) : (ru ? 'Тип дуги не объявлен' : 'Arc type unannounced')}</span></div></div><b className="member-share">{(result.members[index]?.share ?? 0).toLocaleString(locale, { style: 'percent', maximumFractionDigits: 1 })}</b></div><div className="field-grid compact">
        {memberFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={member[key]} onChange={(event) => updateMember(index, key, Number(event.target.value))} />)}
      </div></Panel>;
    })}</div>
      <aside><Panel className="sticky-results"><div className="panel-title"><Gauge size={20} /><div><h2>{ru ? 'Кто сколько урона вносит' : 'Rotation contribution'}</h2><p>{ru ? 'Урон уже учитывает среднее значение критических попаданий.' : 'Expected damage with averaged crit.'}</p></div></div><div className="contribution-list">{result.members.map((member) => <div key={member.id}><span><b>{localizedCharacterName(member.name, locale)}</b><small>{formatNumber(member.rotationDamage)}</small></span><strong>{(member.share * 100).toFixed(1)}%</strong><i><u style={{ width: `${member.share * 100}%` }} /></i></div>)}</div><Field label={ru ? 'Длительность всей ротации, сек' : 'Rotation duration, sec'} type="number" min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /><h3 className="subsection-label">{ru ? 'Характеристики врага' : 'Enemy profile'}</h3><div className="enemy-grid">{enemyFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={enemy[key]} onChange={(event) => updateEnemy(key, Number(event.target.value))} />)}</div><FieldHelp title={ru ? 'Что означают основные поля?' : 'What do the main fields mean?'} terms={ru ? [
        { term: 'Окно урона', description: 'Один выбранный фрагмент ротации: навык, ультимейт или связка атак.' },
        { term: 'Множитель окна', description: 'Сумма процентов урона всех попаданий внутри выбранного окна.' },
        { term: 'Повторы окна', description: 'Сколько раз это окно успевает произойти за одну полную ротацию.' },
        { term: 'DPS', description: 'Средний урон в секунду: общий урон делится на длительность ротации.' },
      ] : [
        { term: 'Damage window', description: 'One selected part of a rotation: a skill, ultimate or attack chain.' },
        { term: 'Window multiplier', description: 'The combined damage percentage of all hits in that window.' },
        { term: 'Window repeats', description: 'How many times the window occurs during one rotation.' },
        { term: 'DPS', description: 'Average damage per second: total damage divided by duration.' },
      ]} /><div className="model-note"><Users size={18} />{ru ? 'Пассивы, реакции и точный таймлайн пока задаются общими бонусами, поэтому результат остаётся оценкой.' : 'Passives, reactions and timeline are represented through explicit aggregate bonuses.'}</div></Panel></aside>
    </div>
  </div>;
}
