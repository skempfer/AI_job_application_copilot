import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { Language } from '../i18n';
import { Theme } from '../contexts/ThemeContext';
import { SegmentedOption, SegmentedToggle } from './SegmentedToggle';
import './ControlHub.css';

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
        'control-hub',
        isCompact ? 'control-hub--compact' : 'control-hub--regular',
        position === 'fixed' ? 'control-hub--fixed' : 'control-hub--inline',
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

      <span className="control-hub__divider" aria-hidden="true" />

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
