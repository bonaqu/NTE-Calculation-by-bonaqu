import { CircleHelp, ListChecks } from 'lucide-react';

export type HelpTerm = { term: string; description: string };

export function QuickStart({ title, steps }: { title: string; steps: string[] }) {
  return <section className="quick-start" aria-label={title}>
    <div className="quick-start-title"><ListChecks size={19} /><h2>{title}</h2></div>
    <ol>{steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
  </section>;
}

export function FieldHelp({ title, terms }: { title: string; terms: HelpTerm[] }) {
  return <details className="field-help">
    <summary><CircleHelp size={18} /><span>{title}</span></summary>
    <div>{terms.map((item) => <p key={item.term}><b>{item.term}</b><span>{item.description}</span></p>)}</div>
  </details>;
}
