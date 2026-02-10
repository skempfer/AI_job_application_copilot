import { en } from './en';
import { pt } from './pt';

export type Language = 'en' | 'pt';
export type TranslationKey = keyof typeof en;

export const translations = {
  en,
  pt,
};

/**
 * Get translation for a key in a specific language
 * Returns the key itself if translation not found (fallback to key)
 */
export const t = (language: Language, key: TranslationKey): string => {
  return translations[language][key] || key;
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'pt'];
