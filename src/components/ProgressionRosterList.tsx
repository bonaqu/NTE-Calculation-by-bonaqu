import { CheckCircle2, ExternalLink, Trash2 } from 'lucide-react';
import { characterByName } from '../characters';
import { localizedAttribute, localizedCharacterName, localizedRole } from '../gameTerms';
import { useI18n } from '../i18n';
import {
  ascensionMaterials,
  ascensionSteps,
  characterAscensionByName,
} from '../progression-data';
import { nextAscensionTarget } from '../progression-next';
import {
  requirementsForCharacter,
  totalForCategory,
  type RosterProgressionEntry,
} from '../progression-engine';
import { ResilientImage } from './ResilientImage';
import { formatNumber, SelectField } from './UI';

interface ProgressionRosterListProps {
  entries: readonly RosterProgressionEntry[];
  onUpdateCompleted: (characterName: string, completedSteps: number) => void;
  onRemove: (characterName: string) => void;
}

export function ProgressionRosterList({ entries, onUpdateCompleted, onRemove }: ProgressionRosterListProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';

  return <section className="progression-roster-list" aria-labelledby="progression-roster-title">
    <header><div><span>{ru ? 'ПЕРСОНАЖИ В ПЛАНЕ' : 'PLANNED CHARACTERS'}</span><h2 id="progression-roster-title">{ru ? 'Текущий предел и следующий прорыв' : 'Current cap and next ascension'}</h2><p>{ru ? 'Измени последний полностью оплаченный этап — ближайшая цель и общий список ресурсов пересчитаются автоматически.' : 'Change the last fully paid ascension and the next target plus shared requirements update automatically.'}</p></div><strong>{entries.length}</strong></header>

    <div className="progression-roster-head"><span>{ru ? 'Персонаж' : 'Character'}</span><span>{ru ? 'Текущий → следующий предел' : 'Current → next cap'}</span><span>{ru ? 'Последний оплаченный этап' : 'Last paid ascension'}</span><span>{ru ? 'Следующий платёж' : 'Next payment'}</span><span /></div>
    {entries.map((entry) => {
      const profile = characterAscensionByName.get(entry.characterName);
      if (!profile) return null;
      const character = characterByName.get(entry.characterName);
      const target = nextAscensionTarget(entry);
      const remaining = requirementsForCharacter(profile, entry.completedSteps);
      const displayName = localizedCharacterName(entry.characterName, locale);
      const currentCap = entry.completedSteps === 0 ? 20 : ascensionSteps[entry.completedSteps - 1]?.unlocksLevel ?? 80;

      return <article className={`progression-roster-row ${target ? '' : 'is-complete'}`} key={entry.characterName}>
        <span className="progression-roster-character"><ResilientImage src={character?.image} alt={displayName} wrapperClassName="progression-roster-art" loading="lazy" /><span><b>{displayName}</b>{ru ? <small>{entry.characterName}</small> : null}<em>{localizedAttribute(character?.attribute, locale)} · {localizedRole(character?.role, locale)}</em></span></span>
        <span className="progression-roster-cap"><b>{ru ? `ур. ${currentCap}` : `Lv. ${currentCap}`}</b>{target ? <><span>→</span><strong>{ru ? `ур. ${target.step.unlocksLevel}` : `Lv. ${target.step.unlocksLevel}`}</strong></> : <><CheckCircle2 size={17} /><strong>{ru ? 'MAX' : 'MAX'}</strong></>}</span>
        <span className="progression-roster-select"><SelectField label={ru ? 'Оплачено' : 'Paid'} value={entry.completedSteps} onChange={(event) => onUpdateCompleted(entry.characterName, Number(event.target.value))}><option value={0}>{ru ? 'Нет · предел ур. 20' : 'None · Lv. 20 cap'}</option>{ascensionSteps.map((step, index) => <option key={step.atLevel} value={index + 1}>{ru ? `На ур. ${step.atLevel} · открыт ${step.unlocksLevel}` : `At Lv. ${step.atLevel} · unlocked ${step.unlocksLevel}`}</option>)}</SelectField></span>
        <span className="progression-next-payment">{target ? <><b>{formatNumber(target.step.beetleCoin)} {ru ? 'монет' : 'coins'}</b>{target.step.bossCount > 0 ? <small>{target.step.bossCount} × {ascensionMaterials[target.bossMaterial].name[locale]}</small> : null}<small>{target.step.commonCount} × {ascensionMaterials[target.commonMaterial].name[locale]}</small></> : <><b>{ru ? 'Все этапы оплачены' : 'All ascensions paid'}</b><small>{ru ? 'Предел уровня 80 открыт' : 'Level 80 cap unlocked'}</small></>}</span>
        <button className="icon-button progression-roster-remove" type="button" onClick={() => onRemove(entry.characterName)} aria-label={ru ? `Убрать ${displayName} из плана` : `Remove ${displayName} from plan`}><Trash2 size={16} /></button>
        <details className="progression-roster-details"><summary>{ru ? 'Остаток до 80 и источник' : 'Remaining to 80 and source'}</summary><div><span><small>{ru ? 'Монеты' : 'Coins'}</small><b>{formatNumber(remaining.beetleCoin)}</b></span><span><small>{ascensionMaterials[profile.bossMaterial].name[locale]}</small><b>{formatNumber(remaining[profile.bossMaterial])}</b></span><span><small>{ru ? 'Обычные материалы' : 'Common materials'}</small><b>{formatNumber(totalForCategory(remaining, 'common'))}</b></span><a href={profile.sourceUrl} target="_blank" rel="noreferrer">{profile.sourcePublisher} · {ru ? 'обновлено' : 'updated'} {profile.sourceUpdatedAt} <ExternalLink size={13} /></a></div><small>{ru ? 'Проверено для проекта' : 'Verified for project'}: {profile.verifiedAt}</small></details>
      </article>;
    })}
  </section>;
}
