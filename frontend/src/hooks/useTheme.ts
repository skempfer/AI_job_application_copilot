import { useContext } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * useTheme hook - Access theme context in any component
 * Provides:
 * - theme: current theme ('neutral' or 'cross')
 * - setTheme: function to change theme
 * - toggleTheme: convenience function to toggle between themes
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
    const newTheme = context.theme === 'neutral' ? 'cross' : 'neutral';
    context.setTheme(newTheme);
  };

  return {
    theme: context.theme,
    setTheme: context.setTheme,
    toggleTheme,
  };
}
