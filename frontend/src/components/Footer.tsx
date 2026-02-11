/**
 * Footer - Application footer
 * Displays data privacy information
 * Accessibility: Uses semantic contentinfo role for screen readers
 */
import { useLanguage } from '../hooks/useLanguage';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700" role="contentinfo">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('dataPrivacy')}
      </p>
    </footer>
  );
}
