import { AlertTriangle, ExternalLink, Languages } from 'lucide-react';
import { characterTermCoverage, characterTermKindLabel } from '../character-terms';
import { localizedCharacterName } from '../gameTerms';
import { useI18n } from '../i18n';
import { termsForBoundRotationStep } from '../rotation-step-terms';
import type { RotationStep } from '../types';

interface RotationStepTermsProps {
  presetId: string;
  step: RotationStep;
  compact?: boolean;
}

export function RotationStepTerms({ presetId, step, compact = false }: RotationStepTermsProps) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const terms = termsForBoundRotationStep(presetId, step);
  const unresolved = characterTermCoverage.get(step.actor) === 'unresolved';

  if (!terms.length && !unresolved) return null;

  if (!terms.length) {
    return <span className={`rotation-step-terms unresolved ${compact ? 'compact' : ''}`}>
      <AlertTriangle size={13} />
      <span>{ru
        ? `Точное русское название действия ${localizedCharacterName(step.actor, locale)} пока не подтверждено — показано понятное описание.`
        : `The exact Russian label for this ${step.actor} action remains unresolved; a clear descriptive instruction is shown.`}</span>
    </span>;
  }

  return <span className={`rotation-step-terms ${compact ? 'compact' : ''}`}>
    <span className="rotation-step-terms-title"><Languages size={13} />{ru ? 'Названия из игровых данных' : 'Game-data labels'}</span>
    <span className="rotation-step-term-list">{terms.map((term) => <span className={`rotation-step-term resolution-${term.resolution}`} key={term.id}>
      <span><b>{term[locale === 'ru' ? 'russian' : 'english']}</b>{ru ? <small>{term.english}</small> : <small>{term.russian}</small>}</span>
      <em>{characterTermKindLabel(term.kind, locale)}</em>
      {term.sourceUrl ? <a href={term.sourceUrl} target="_blank" rel="noreferrer" aria-label={ru ? `Источник термина ${term.russian}` : `Source for ${term.english}`}><ExternalLink size={11} /></a> : null}
    </span>)}</span>
  </span>;
}
