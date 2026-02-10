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
 * - theme: current theme ('neutral', 'cross', or 'dark')
 * - setTheme: function to change theme
 * - toggleTheme: convenience function to cycle through themes
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
    // Cycle: neutral -> cross -> dark -> neutral
    const themes: Theme[] = ['neutral', 'cross', 'dark'];
    const currentIndex = themes.indexOf(context.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    context.setTheme(themes[nextIndex]);
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
