import { createContext, ReactNode, useEffect, useState } from 'react';
import { Language, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

/**
 * LanguageContext - Global language state
 * Provides current language and setter to all components
 */
export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * LanguageProvider - Wraps the app to provide language context
 * Persists language selection to localStorage
 * Default language from localStorage or DEFAULT_LANGUAGE
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
      setLanguageState(saved as Language);
    }
    setIsLoaded(true);
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    if (SUPPORTED_LANGUAGES.includes(newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  // Don't render children until language is loaded to avoid hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
