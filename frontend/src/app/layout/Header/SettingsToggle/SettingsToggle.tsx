import { useLanguage } from '../../../../hooks/useLanguage';
import { useTheme } from '../../../../hooks/useTheme';
import './SettingsToggle.css';

export function SettingsToggle() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const getThemeLabel = (t: typeof theme) => {
    return t === 'light' ? '☀️' : '🌙';
  };

  return (
    <div className="settings-toggle" role="toolbar" aria-label="Application settings">
      <div className="settings-toggle__group" role="group" aria-label="Language selection">
        <button
          onClick={() => setLanguage('en')}
          className={[
            'settings-toggle__button',
            language === 'en' ? 'settings-toggle__button--active' : 'settings-toggle__button--inactive'
          ].join(' ')}
          title="English"
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('pt')}
          className={[
            'settings-toggle__button',
            language === 'pt' ? 'settings-toggle__button--active' : 'settings-toggle__button--inactive'
          ].join(' ')}
          title="Português"
        >
          PT
        </button>
      </div>

      <div className="settings-toggle__theme-group" role="group" aria-label="Theme selection">
        {(['light', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={[
              'settings-toggle__theme-button',
              theme === t ? 'settings-toggle__theme-button--active' : 'settings-toggle__theme-button--inactive'
            ].join(' ')}
            title={`Switch to ${t} theme`}
            aria-label={`${t} theme`}
            aria-pressed={theme === t}
          >
            {getThemeLabel(t)}
          </button>
        ))}
      </div>
    </div>
  );
}
