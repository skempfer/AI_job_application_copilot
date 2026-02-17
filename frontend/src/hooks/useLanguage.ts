import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t as translateKey, Language, TranslationKey } from '../i18n';
import { translateFreeformText } from '../utils/translateFreeformText';

interface UseLanguageReturn {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  translateFreeform: (text: string) => string;
}

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
