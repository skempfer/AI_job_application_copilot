import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

/**
 * SettingsToggle - Simple UI controls for language and theme
 * Provides explicit buttons for language selection and theme toggle
 */
export function SettingsToggle() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 flex gap-3 z-50">
      {/* Language selector */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            language === 'en'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="English"
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('pt')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            language === 'pt'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Português"
        >
          PT
        </button>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        title={`Switch to ${theme === 'neutral' ? 'cross' : 'neutral'} theme`}
        aria-label={`Current theme: ${theme}`}
      >
        {theme === 'neutral' ? (
          // Neutral theme icon (sun)
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-6.5 6.5a1 1 0 101.414 1.414L9 5.414V12a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-6.5-6.5z" />
          </svg>
        ) : (
          // Cross theme icon (star)
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </button>
    </div>
  );
}
