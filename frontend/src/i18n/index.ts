import { en } from './en';
import { pt } from './pt';

export type Language = 'en' | 'pt';
export type TranslationKey = keyof typeof en;

export const translations = {
  en,
  pt,
};

export const t = (language: Language, key: TranslationKey): string => {
  return translations[language][key] || key;
};

export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'pt'];
