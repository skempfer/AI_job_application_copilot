import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t as translateKey, Language, TranslationKey } from '../i18n';

interface UseLanguageReturn {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

/**
 * useLanguage hook - Access language context in any component
 * Provides:
 * - language: current language code
 * - setLanguage: function to change language
 * - t: translation function for current language
 *
 * @throws Error if used outside LanguageProvider
 *
 * @example
 * const { language, setLanguage, t } = useLanguage();
 * console.log(t('appTitle')); // Prints translated title
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
  };
}
