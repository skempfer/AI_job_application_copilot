import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorDisplay = memo<ErrorDisplayProps>(({ message, onDismiss }) => {
  const { t } = useLanguage();

  return (
    <div className="error-container">
      <div className="error-header">
        <div className="error-content">
          <span className="error-icon">❌</span>
          <div>
            <h3 className="error-title">Analysis Error</h3>
            <p className="error-message">{message}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="error-dismiss"
          aria-label={t('dismissError')}
        >
          ×
        </button>
      </div>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';
