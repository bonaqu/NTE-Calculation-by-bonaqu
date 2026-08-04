import { BadgeCheck, CheckCircle2, CircleAlert, FlaskConical, RotateCcw, ShieldQuestion, XCircle } from 'lucide-react';
import type { TeamMemberInput } from '../../packages/calculation-core/src';
import { localizedCharacterName } from '../gameTerms';
import { useI18n } from '../i18n';
import type {
  TeamGlobalCheckField,
  TeamMemberCheckField,
  TeamReadinessReport,
  TeamReadinessStatus,
} from '../team-readiness';

const memberLabels: Record<'ru' | 'en', Record<TeamMemberCheckField, string>> = {
  ru: {
    effectiveAtk: 'Итоговая АТК',
    totalMultiplier: 'Множитель за применение',
    uses: 'Применений за ротацию',
    critRate: 'Шанс критического удара',
    critDamage: 'Критический урон',
  },
  en: {
    effectiveAtk: 'Effective ATK',
    totalMultiplier: 'Multiplier per use',
    uses: 'Uses per rotation',
    critRate: 'CRIT Rate',
    critDamage: 'CRIT DMG',
  },
};

const globalLabels: Record<'ru' | 'en', Record<TeamGlobalCheckField, string>> = {
  ru: {
    memberCount: 'В команде должно быть четыре персонажа',
    uniqueCharacters: 'Персонажи в команде не должны повторяться',
    duration: 'Укажи длительность ротации больше нуля',
    enemyLevel: 'Укажи уровень врага больше нуля',
    enemyNumbers: 'Параметры сопротивления и снижения защиты должны быть числами',
  },
  en: {
    memberCount: 'The team must contain four characters',
    uniqueCharacters: 'Team characters must be unique',
    duration: 'Enter a rotation duration greater than zero',
    enemyLevel: 'Enter an enemy level greater than zero',
    enemyNumbers: 'Resistance and defence inputs must be numeric',
  },
};

const statusText: Record<'ru' | 'en', Record<TeamReadinessStatus, { title: string; body: string; action?: string }>> = {
  ru: {
    sample: {
      title: 'Сейчас показан демонстрационный расчёт',
      body: 'Персонажи и цифры заполнены только для примера интерфейса. Это не готовые характеристики этих персонажей и не рекомендация по урону.',
      action: 'Начать со своих данных',
    },
    incomplete: {
      title: 'Для расчёта не хватает данных',
      body: 'Результат остаётся видимым как черновик, но отмеченные поля нужно заполнить или исправить. Сайт не подставляет неизвестные множители самостоятельно.',
    },
    unchecked: {
      title: 'Все обязательные поля заполнены, но ещё не сверены',
      body: 'Проверь характеристики в игре, множители в описаниях навыков и количество применений в своей ротации. После подтверждения отметка будет действовать только для текущего набора значений.',
      action: 'Я сверил текущие значения',
    },
    checked: {
      title: 'Значения сверены для текущего расчёта',
      body: 'Отметка означает только то, что ты проверил введённые цифры. Это по-прежнему оценочная модель; любое изменение автоматически снимет подтверждение.',
    },
  },
  en: {
    sample: {
      title: 'This is a demonstration calculation',
      body: 'Characters and numbers are populated only to demonstrate the interface. They are not sourced builds or damage recommendations.',
      action: 'Start with my own data',
    },
    incomplete: {
      title: 'Required calculation data is missing',
      body: 'The draft result remains visible, but highlighted inputs must be completed or corrected. The site never invents unknown multipliers.',
    },
    unchecked: {
      title: 'Required inputs are complete but not checked yet',
      body: 'Check stats in game, multipliers in skill descriptions and uses in your rotation. Confirmation applies only to this exact input snapshot.',
      action: 'I checked these values',
    },
    checked: {
      title: 'Values checked for this calculation',
      body: 'This means only that you reviewed the entered values. The model remains an estimate, and any relevant edit removes confirmation automatically.',
    },
  },
};

const statusIcons = {
  sample: FlaskConical,
  incomplete: CircleAlert,
  unchecked: ShieldQuestion,
  checked: BadgeCheck,
} as const;

export function TeamReadinessPanel({
  report,
  members,
  onConfirm,
  onStartEmpty,
  onResetSample,
}: {
  report: TeamReadinessReport;
  members: readonly TeamMemberInput[];
  onConfirm: () => void;
  onStartEmpty: () => void;
  onResetSample: () => void;
}) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const text = statusText[locale][report.status];
  const StatusIcon = statusIcons[report.status];
  const invalidGlobals = report.globalChecks.filter((check) => !check.valid);

  return <section className={`team-readiness status-${report.status}`} aria-live="polite">
    <header className="team-readiness-status">
      <StatusIcon size={21} />
      <div><span>{ru ? 'СОСТОЯНИЕ РАСЧЁТА' : 'CALCULATION STATUS'}</span><h2>{text.title}</h2><p>{text.body}</p></div>
      <div className="team-readiness-actions">
        {report.status === 'sample' ? <button className="button" type="button" onClick={onStartEmpty}>{text.action}</button> : null}
        {report.status === 'unchecked' ? <button className="button" type="button" onClick={onConfirm}>{text.action}</button> : null}
        {report.status !== 'sample' ? <button className="button ghost compact-button" type="button" onClick={onResetSample}><RotateCcw size={14} /> {ru ? 'Вернуть пример' : 'Restore sample'}</button> : null}
      </div>
    </header>

    <div className="team-readiness-grid">
      {report.memberChecks.map((memberReport) => <article key={`${memberReport.name}-${memberReport.index}`}>
        <div><b>{localizedCharacterName(members[memberReport.index]?.name ?? memberReport.name, locale)}</b><small>{ru ? `Слот ${memberReport.index + 1}` : `Slot ${memberReport.index + 1}`}</small></div>
        <ul>{memberReport.checks.map((check) => <li className={check.valid ? 'valid' : 'invalid'} key={check.field}>{check.valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}<span>{memberLabels[locale][check.field]}</span></li>)}</ul>
      </article>)}
    </div>

    {invalidGlobals.length ? <div className="team-readiness-global"><b>{ru ? 'Общие параметры' : 'Global inputs'}</b>{invalidGlobals.map((check) => <span key={check.field}><XCircle size={14} /> {globalLabels[locale][check.field]}</span>)}</div> : null}

    <details className="team-input-source-help">
      <summary>{ru ? 'Где взять обязательные значения' : 'Where to find required values'}</summary>
      <div>
        <p><b>{ru ? 'Итоговая АТК и критические характеристики' : 'Effective ATK and CRIT stats'}</b><span>{ru ? 'Скопируй из экрана характеристик персонажа в том состоянии команды, которое хочешь посчитать.' : 'Copy them from the character stat screen in the team state you want to model.'}</span></p>
        <p><b>{ru ? 'Множитель за применение' : 'Multiplier per use'}</b><span>{ru ? 'Возьми проценты из описания навыка. Разные части серии сложи один раз; одинаковые попадания можно разложить в подробном вводе.' : 'Use percentages from the skill description. Add different sequence parts once; identical hits can be broken down in Detailed input.'}</span></p>
        <p><b>{ru ? 'Применений и длительность' : 'Uses and duration'}</b><span>{ru ? 'Посчитай по своей фактической ротации или используй Лабораторию ротаций как последовательность действий. Сайт не придумывает время анимаций.' : 'Count them from your actual rotation or use Rotation Lab as an action sequence. The site does not invent animation timings.'}</span></p>
      </div>
    </details>
  </section>;
}
