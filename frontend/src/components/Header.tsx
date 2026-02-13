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
import './Header.css';

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
        'header-drawer',
        isDrawerOpen ? 'header-drawer--open' : 'header-drawer--closed',
      ].join(' ')}
      aria-hidden={!isDrawerOpen}
    >
      <div
        className="header-drawer-backdrop"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div
        id="control-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={[
          'header-drawer-panel',
          isDrawerOpen ? 'header-drawer-panel--open' : 'header-drawer-panel--closed',
        ].join(' ')}
      >
        <div className="header-drawer-header">
          <span className="header-drawer-title">{t('language')} & {t('theme')}</span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="header-drawer-close-button"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="header-drawer-content">
          <section className="header-drawer-section">
            <h3 className="header-drawer-section-title">
              {t('language')}
            </h3>
            <SegmentedToggle
              options={languageOptions}
              value={language}
              onChange={setLanguage}
              ariaLabel="Language selection"
            />
          </section>

          <div className="header-drawer-divider" />

          <section className="header-drawer-section">
            <h3 className="header-drawer-section-title">
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
    <header className="header" role="banner">
      <div className="header-wrapper">
        <div className="header-content">
          <div className="header-brand" role="img" aria-label="Viora">
            <div className="header-logo-mobile">
              {theme === 'dark' ? (
                <LogoDarkTheme width={120} height={32} />
              ) : (
                <Logo width={120} height={32} />
              )}
            </div>
            <div className="header-logo-desktop">
              {theme === 'dark' ? (
                <LogoDarkTheme width={180} height={48} />
              ) : (
                <Logo width={180} height={48} />
              )}
            </div>
            <p className="header-tagline">
              {t('appTagline')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="header-menu-button"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            aria-controls="control-drawer"
          >
            <Menu size={22} />
          </button>

          <div className="header-control-hub">
            <ControlHub position="inline" />
          </div>
        </div>
      </div>

      {portalTarget ? createPortal(drawer, portalTarget) : null}
    </header>
  );
}
