import type { InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes } from 'react';

export function Panel({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function Metric({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</div>;
}

export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="field"><span>{label}</span><input {...props} />{hint ? <small>{hint}</small> : null}</label>;
}

export function SelectField({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>;
}

export const formatNumber = (value: number, digits = 0) => new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);
