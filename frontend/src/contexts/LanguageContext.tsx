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
 * Get browser language
 * Detects if browser language is Portuguese or English
 * Falls back to DEFAULT_LANGUAGE
 */
function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  
  // Check if browser language starts with 'pt' (Portuguese)
  if (browserLang.startsWith('pt')) {
    return 'pt';
  }
  
  // Default to English
  return DEFAULT_LANGUAGE;
}

/**
 * LanguageProvider - Wraps the app to provide language context
 * Persists language selection to localStorage
 * Auto-detects browser language on first load
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount, or detect from browser
  useEffect(() => {
    const saved = localStorage.getItem('language');
    
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
      // Use saved preference
      setLanguageState(saved as Language);
    } else {
      // Auto-detect browser language
      const detected = getBrowserLanguage();
      setLanguageState(detected);
      localStorage.setItem('language', detected);
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
