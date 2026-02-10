import { createContext, ReactNode, useEffect, useState } from 'react';

export type Theme = 'neutral' | 'cross';

const DEFAULT_THEME: Theme = 'neutral';
const SUPPORTED_THEMES: Theme[] = ['neutral', 'cross'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * ThemeContext - Global theme state
 * Provides current theme and setter to all components
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider - Wraps the app to provide theme context
 * Persists theme selection to localStorage
 * Applies theme via data-theme attribute on root element
 * CSS variables are updated based on theme selection
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage and apply on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && SUPPORTED_THEMES.includes(saved as Theme)) {
      setThemeState(saved as Theme);
      applyTheme(saved as Theme);
    } else {
      applyTheme(DEFAULT_THEME);
    }
    setIsLoaded(true);
  }, []);

  // Apply theme to DOM
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Change theme and persist
  const setTheme = (newTheme: Theme) => {
    if (SUPPORTED_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
      applyTheme(newTheme);
    }
  };

  // Don't render children until theme is loaded to avoid hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
