import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

/**
 * SettingsToggle - Simple UI controls for language and theme
 * Provides explicit buttons for language selection and theme toggle
 */
export function SettingsToggle() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const getThemeLabel = (t: typeof theme) => {
    switch (t) {
      case 'neutral':
        return '☀️';
      case 'cross':
        return '⭐';
      case 'dark':
        return '🌙';
    }
  };

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

      {/* Theme toggles - show all 3 options */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 border border-gray-200 dark:border-gray-700">
        {(['neutral', 'cross', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`p-2 rounded transition-all ${
              theme === t
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={`Switch to ${t} theme`}
            aria-label={`${t} theme`}
          >
            {getThemeLabel(t)}
          </button>
        ))}
      </div>
    </div>
  );
}
