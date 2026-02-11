import { createContext, ReactNode, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const DEFAULT_THEME: Theme = 'light';
const SUPPORTED_THEMES: Theme[] = ['light', 'dark'];

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
 * Detect system dark mode preference
 * Returns 'dark' if user prefers dark mode, otherwise 'light'
 */
function getSystemThemePreference(): Theme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return DEFAULT_THEME;
}

/**
 * ThemeProvider - Wraps the app to provide theme context
 * Persists theme selection to localStorage
 * Auto-detects system dark mode preference on first load
 * Applies theme via data-theme attribute on root element
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage and apply on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    
    let themeToUse: Theme;
    
    if (saved && SUPPORTED_THEMES.includes(saved as Theme)) {
      // Use saved preference
      themeToUse = saved as Theme;
    } else {
      // Auto-detect system preference
      themeToUse = getSystemThemePreference();
      localStorage.setItem('theme', themeToUse);
    }
    
    setThemeState(themeToUse);
    applyTheme(themeToUse);
    setIsLoaded(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only update if user hasn't manually set a theme
      const saved = localStorage.getItem('theme');
      if (!saved) {
        const newTheme = darkModeQuery.matches ? 'dark' : DEFAULT_THEME;
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    // Modern API: addEventListener
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleChange);
      return () => {
        darkModeQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  // Apply theme to DOM
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Add/remove 'dark' class for Tailwind CSS
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Also set data-theme attribute for CSS variables
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
