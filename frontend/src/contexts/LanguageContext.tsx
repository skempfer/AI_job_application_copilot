import { createContext, ReactNode, useEffect, useState } from 'react';
import { Language, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith('pt')) {
    return 'pt';
  }

  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
      setLanguageState(saved as Language);
    } else {
      const detected = getBrowserLanguage();
      setLanguageState(detected);
      localStorage.setItem('language', detected);
    }
    
    setIsLoaded(true);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    if (SUPPORTED_LANGUAGES.includes(newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
