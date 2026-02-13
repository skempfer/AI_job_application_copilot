import { memo } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import './CVInput.css';

interface CVInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CVInput = memo<CVInputProps>(({ value, onChange, disabled = false }) => {
  const { t } = useLanguage();

  return (
    <div className="cv-input">
      <label htmlFor="cv-input" className="cv-input__label">
        {t('cvLabel')}
      </label>
      <textarea
        id="cv-input"
        className="textarea-input"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={t('cvPlaceholder')}
        aria-label={t('cvLabel')}
        aria-required="true"
      />
      <p className="cv-input__char-count">
        {value.trim().length} {t('characters')}
      </p>
    </div>
  );
});

CVInput.displayName = 'CVInput';
