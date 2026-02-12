import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { Language } from '../i18n';
import { Theme } from '../contexts/ThemeContext';
import { SegmentedOption, SegmentedToggle } from './SegmentedToggle';

interface ControlHubProps {
  position?: 'fixed' | 'inline';
}

export function ControlHub({ position = 'fixed' }: ControlHubProps) {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (position !== 'fixed') {
      setIsCompact(false);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const shouldCompact = window.scrollY > 48;
        setIsCompact((prev) => (prev !== shouldCompact ? shouldCompact : prev));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [position]);

  const languageOptions = useMemo<SegmentedOption<Language>[]>(
    () => [
      { value: 'en', label: 'EN', ariaLabel: 'Switch language to English' },
      { value: 'pt', label: 'PT', ariaLabel: 'Mudar idioma para Portugues' },
    ],
    []
  );

  const themeOptions = useMemo<SegmentedOption<Theme>[]>(
    () => [
      { value: 'light', label: 'Light', ariaLabel: 'Switch to light theme', icon: <Sun size={16} /> },
      { value: 'dark', label: 'Dark', ariaLabel: 'Switch to dark theme', icon: <Moon size={16} /> },
    ],
    []
  );

  return (
    <div
      className={[
        'flex items-center gap-2 rounded-full border border-white/10',
        'bg-white/60 dark:bg-gray-900/60 backdrop-blur-md',
        'shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
        'px-3 py-2 transition-all duration-200 ease-in-out',
        isCompact ? 'px-2.5 py-1.5' : 'px-4 py-2.5',
        position === 'fixed'
          ? 'fixed top-4 left-1/2 -translate-x-1/2 z-[10000] max-w-[calc(100vw-2rem)] sm:left-auto sm:translate-x-0 sm:right-6 sm:top-6'
          : 'relative',
      ].join(' ')}
      role="toolbar"
      aria-label="Control hub"
    >
      <SegmentedToggle
        options={languageOptions}
        value={language}
        onChange={setLanguage}
        size={isCompact ? 'compact' : 'default'}
        ariaLabel="Language selection"
      />

      <span className="h-6 w-px bg-white/10 dark:bg-white/10" aria-hidden="true" />

      <SegmentedToggle
        options={themeOptions}
        value={theme}
        onChange={setTheme}
        size={isCompact ? 'compact' : 'default'}
        ariaLabel="Theme selection"
      />
    </div>
  );
}
