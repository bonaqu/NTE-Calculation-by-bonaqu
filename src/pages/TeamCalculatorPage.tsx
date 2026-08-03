import { useMemo } from 'react';
import { Gauge, RotateCcw, Users } from 'lucide-react';
import { calculateTeam, type EnemyProfile, type TeamMemberInput } from '../../packages/calculation-core/src';
import { useI18n } from '../i18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Field, formatNumber, Metric, Panel } from '../components/UI';

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
    baseAtk: 'Базовая ATK', arcAtk: 'ATK дуги', flatAtk: 'Плоская ATK', atkPercent: 'ATK, %', teamAtkPercent: 'Командный ATK, %',
    skillMultiplier: 'Множитель окна, %', hits: 'Попаданий', actionsPerRotation: 'Окон за ротацию', damageBonus: 'Бонус урона, %',
    teamDamageBonus: 'Командный бонус урона, %', critRate: 'Крит. шанс, %', critDamage: 'Крит. урон, %',
    level: 'Уровень врага', resistance: 'Сопротивление, %', defenceReduction: 'Снижение DEF, %', resistanceReduction: 'Снижение RES, %',
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
  const normalizedMembers = useMemo(() => members.slice(0, 4).map((member) => ({ ...member, enemy })), [enemy, members]);
  const result = useMemo(() => calculateTeam(normalizedMembers, duration), [normalizedMembers, duration]);
  const updateName = (index: number, value: string) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: value } : item));
  const updateMember = (index: number, key: NumericMemberKey, value: number) => setMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateEnemy = (key: EnemyKey, value: number) => setEnemy((current) => ({ ...current, [key]: value }));
  const reset = () => { setMembers(defaultMembers); setDuration(35); setEnemy(defaultEnemy); };

  return <div className="page calc-page">
    <header className="page-heading"><div><span>TEAM CALCULATION</span><h1>{ru ? 'Калькулятор ротации команды' : 'Team rotation calculator'}</h1><p>{ru ? 'Агрегированная модель: каждый слот задаёт одно окно урона и число его повторений за ротацию.' : 'Aggregated model: each slot defines one damage window and how many times it occurs per rotation.'}</p></div><button className="button ghost" onClick={reset}><RotateCcw size={17} /> {ru ? 'Сбросить' : 'Reset'}</button></header>
    <div className="disclaimer top-note"><Users size={18} /><span>{ru ? 'Стартовые числа — редактируемый пример, а не заявленные официальные статы готовой команды.' : 'Starter values are an editable example, not claimed official stats for a finished team.'}</span></div>
    <div className="summary-strip"><Metric label={ru ? 'Урон команды' : 'Team damage'} value={formatNumber(result.totalDamage)} /><Metric label="DPS" value={formatNumber(result.dps)} /><Metric label={ru ? 'Длительность' : 'Duration'} value={`${duration}s`} /><Metric label={ru ? 'Формула' : 'Formula'} value="v0.1" note={ru ? 'Оценочная модель' : 'Estimate model'} /></div>
    <div className="team-layout"><div className="member-stack">{normalizedMembers.map((member, index) => <Panel key={member.id} className="member-panel"><div className="member-title"><span>{index + 1}</span><input aria-label={ru ? `Имя персонажа ${index + 1}` : `Character ${index + 1} name`} value={member.name} onChange={(event) => updateName(index, event.target.value)} /><b>{(result.members[index]?.share ?? 0).toLocaleString(locale, { style: 'percent', maximumFractionDigits: 1 })}</b></div><div className="field-grid compact">
      {memberFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={member[key]} onChange={(event) => updateMember(index, key, Number(event.target.value))} />)}
    </div></Panel>)}</div>
      <aside><Panel className="sticky-results"><div className="panel-title"><Gauge size={20} /><div><h2>{ru ? 'Вклад в ротацию' : 'Rotation contribution'}</h2><p>{ru ? 'Ожидаемый урон с усреднённым критом.' : 'Expected damage with averaged crit.'}</p></div></div><div className="contribution-list">{result.members.map((member) => <div key={member.id}><span><b>{member.name}</b><small>{formatNumber(member.rotationDamage)}</small></span><strong>{(member.share * 100).toFixed(1)}%</strong><i><u style={{ width: `${member.share * 100}%` }} /></i></div>)}</div><Field label={ru ? 'Длительность ротации, сек' : 'Rotation duration, sec'} type="number" min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /><h3 className="subsection-label">{ru ? 'Профиль врага' : 'Enemy profile'}</h3><div className="enemy-grid">{enemyFields.map((key) => <Field key={key} label={labels[locale][key]} type="number" value={enemy[key]} onChange={(event) => updateEnemy(key, Number(event.target.value))} />)}</div><div className="model-note"><Users size={18} />{ru ? 'Пассивы, реакции и таймлайн задаются агрегированными бонусами. Ограничение показано явно.' : 'Passives, reactions and timeline are represented through explicit aggregate bonuses.'}</div></Panel></aside>
    </div>
  </div>;
}
