import { useContext } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetToSystem: () => void;
}

export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  const toggleTheme = () => {
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
