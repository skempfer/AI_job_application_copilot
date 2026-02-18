import { createContext, ReactNode, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const DEFAULT_THEME: Theme = 'light';
const SUPPORTED_THEMES: Theme[] = ['light', 'dark'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

function getSystemThemePreference(): Theme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    
    let themeToUse: Theme;
    
    if (saved && SUPPORTED_THEMES.includes(saved as Theme)) {
      themeToUse = saved as Theme;
    } else {
      themeToUse = getSystemThemePreference();
      localStorage.setItem('theme', themeToUse);
    }
    
    setThemeState(themeToUse);
    applyTheme(themeToUse);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        const newTheme = darkModeQuery.matches ? 'dark' : DEFAULT_THEME;
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    darkModeQuery.addEventListener('change', handleChange);
    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    if (SUPPORTED_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
      applyTheme(newTheme);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
