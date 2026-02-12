import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { LogoDarkTheme } from './LogoDarkTheme';
import { ControlHub } from './ControlHub';
import { SegmentedOption, SegmentedToggle } from './SegmentedToggle';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../i18n';
import { Theme } from '../contexts/ThemeContext';

/**
 * Header - Application header with Viora branding
 * Displays logo and tagline, with responsive design
 * Accessibility: Uses semantic banner role for screen readers
 */
export function Header() {
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  const languageOptions = useMemo<SegmentedOption<Language>[]>(
    () => [
      { value: 'en', label: 'EN', ariaLabel: 'Switch language to English' },
      { value: 'pt', label: 'PT', ariaLabel: 'Mudar idioma para Portugues' },
    ],
    []
  );

  const themeOptions = useMemo<SegmentedOption<Theme>[]>(
    () => [
      { value: 'light', label: 'Light', ariaLabel: 'Switch to light theme' },
      { value: 'dark', label: 'Dark', ariaLabel: 'Switch to dark theme' },
    ],
    []
  );

  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const drawer = (
    <div
      className={[
        'fixed inset-0 z-[12000] sm:hidden transition-opacity duration-200',
        isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      aria-hidden={!isDrawerOpen}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm z-[12000]"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div
        id="control-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={[
          'absolute top-0 right-0 h-full w-[82%] max-w-xs z-[12010]',
          'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl',
          'shadow-[0_20px_60px_rgba(0,0,0,0.25)]',
          'transition-transform duration-200 ease-in-out',
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('language')} & {t('theme')}</span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-white/70 dark:bg-gray-900/70 text-gray-700 dark:text-gray-200"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3">
              {t('language')}
            </h3>
            <SegmentedToggle
              options={languageOptions}
              value={language}
              onChange={setLanguage}
              ariaLabel="Language selection"
            />
          </section>

          <div className="h-px bg-gray-200/70 dark:bg-gray-700/70" />

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3">
              {t('theme')}
            </h3>
            <SegmentedToggle
              options={themeOptions}
              value={theme}
              onChange={setTheme}
              ariaLabel="Theme selection"
            />
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b border-gray-200/80 dark:border-gray-700/80 backdrop-blur" role="banner">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1" role="img" aria-label="Viora">
            <div className="sm:hidden">
              {theme === 'dark' ? (
                <LogoDarkTheme width={120} height={32} />
              ) : (
                <Logo width={120} height={32} />
              )}
            </div>
            <div className="hidden sm:block">
              {theme === 'dark' ? (
                <LogoDarkTheme width={180} height={48} />
              ) : (
                <Logo width={180} height={48} />
              )}
            </div>
            <p className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('appTagline')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="sm:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-white/10 bg-white/70 dark:bg-gray-900/70 text-gray-700 dark:text-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            aria-controls="control-drawer"
          >
            <Menu size={22} />
          </button>

          <div className="hidden sm:flex items-center gap-6">
            <ControlHub position="inline" />
          </div>
        </div>
      </div>

      {portalTarget ? createPortal(drawer, portalTarget) : null}
    </header>
  );
}
