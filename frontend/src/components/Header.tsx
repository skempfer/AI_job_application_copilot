import { Logo } from './Logo';
import { LogoDarkTheme } from './LogoDarkTheme';
import { useTheme } from '../hooks/useTheme';

/**
 * Header - Application header with Viora branding
 * Displays logo and tagline, with responsive design
 * Accessibility: Uses semantic banner role for screen readers
 */
export function Header() {
  const { theme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="banner">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4" role="img" aria-label="Viora - AI Job Application Copilot">
          {theme === 'dark' ? (
            <LogoDarkTheme width={180} height={48} />
          ) : (
            <Logo width={180} height={48} />
          )}
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm font-medium">
          Clarity for smarter career decisions
        </p>
      </div>
    </header>
  );
}
