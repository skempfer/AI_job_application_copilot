import { useContext } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetToSystem: () => void;
}

/**
 * useTheme hook - Access theme context in any component
 * Provides:
 * - theme: current theme ('light' or 'dark')
 * - setTheme: function to change theme
 * - toggleTheme: convenience function to toggle between light and dark
 * - resetToSystem: reset to system preference
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * const { theme, setTheme, toggleTheme } = useTheme();
 * return (
 *   <button onClick={toggleTheme}>
 *     Current theme: {theme}
 *   </button>
 * );
 */
export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  const toggleTheme = () => {
    // Toggle: light <-> dark
    const newTheme = context.theme === 'light' ? 'dark' : 'light';
    context.setTheme(newTheme);
  };

  const resetToSystem = () => {
    localStorage.removeItem('theme');
    window.location.reload();
  };

  return {
    theme: context.theme,
    setTheme: context.setTheme,
    toggleTheme,
    resetToSystem,
  };
}
