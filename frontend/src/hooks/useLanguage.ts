import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t as translateKey, Language, TranslationKey } from '../i18n';
import { translateFreeformText } from '../utils/translateFreeformText';

interface UseLanguageReturn {
  language: Language;
  setLanguage: (language: Language) => void;
  /**
   * Translate known i18n keys only (static UI copy).
   */
  t: (key: TranslationKey) => string;
  /**
   * Translate freeform backend/AI text when possible (heuristic, best-effort).
   */
  translateFreeform: (text: string) => string;
}

/**
 * useLanguage hook - Access language context in any component
 * Provides:
 * - language: current language code
 * - setLanguage: function to change language
 * - t: translation for known i18n keys (static UI copy)
 * - translateFreeform: best-effort translation for backend/AI freeform text
 *
 * @throws Error if used outside LanguageProvider
 *
 * @example
 * const { language, setLanguage, t } = useLanguage();
 * setLanguage('pt'); // Switch to Portuguese
 */
export function useLanguage(): UseLanguageReturn {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return {
    language: context.language,
    setLanguage: context.setLanguage,
    t: (key: TranslationKey) => translateKey(context.language, key),
    translateFreeform: (text: string) => translateFreeformText(text, context.language),
  };
}
