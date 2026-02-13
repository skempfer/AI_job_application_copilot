import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import './AnalyzeButton.css';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export const AnalyzeButton = memo<AnalyzeButtonProps>(({ onClick, disabled, loading }) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="analyze-button"
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <span className="analyze-button__content">
          <svg className="analyze-button__spinner" viewBox="0 0 24 24">
            <circle
              className="analyze-button__spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="analyze-button__spinner-head"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {t('analyzingButton')}
        </span>
      ) : (
        t('analyzeButton')
      )}
    </button>
  );
});

AnalyzeButton.displayName = 'AnalyzeButton';
