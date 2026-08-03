import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Locale } from './types';

type Translation = {
  nav: Record<'home' | 'team' | 'rotations' | 'arcs' | 'progression' | 'database' | 'methodology', string>;
  common: Record<'calculate' | 'reset' | 'source' | 'verified' | 'estimate' | 'openSource', string>;
};

const dictionary: Record<Locale, Translation> = {
  ru: {
    nav: { home: 'Главная', team: 'Команда', rotations: 'Ротации', arcs: 'Дуги', progression: 'Прокачка', database: 'База', methodology: 'Методика' },
    common: { calculate: 'Рассчитать', reset: 'Сбросить', source: 'Источник', verified: 'Проверено', estimate: 'Модельная оценка', openSource: 'Открыть источник' },
  },
  en: {
    nav: { home: 'Home', team: 'Team', rotations: 'Rotations', arcs: 'Arcs', progression: 'Progression', database: 'Database', methodology: 'Methodology' },
    common: { calculate: 'Calculate', reset: 'Reset', source: 'Source', verified: 'Verified', estimate: 'Model estimate', openSource: 'Open source' },
  },
};

type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: Translation };
const I18nContext = createContext<I18nValue | null>(null);

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem('nte.locale');
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {
    // Private browsing and hardened browsers may deny storage access.
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const setLocale = (next: Locale) => {
    try { localStorage.setItem('nte.locale', next); } catch { /* Language still changes for this session. */ }
    setLocaleState(next);
  };
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: dictionary[locale] }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
