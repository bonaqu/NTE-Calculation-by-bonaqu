import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import './styles.css';
import './arc-scenarios.css';
import './arc-state.css';
import './resilient-images.css';
import './database.css';
import './imageFallbackRuntime';

createRoot(document.getElementById('root')!).render(<StrictMode><I18nProvider><App /></I18nProvider></StrictMode>);
