import { memo } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import './JobInput.css';

interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const JobInput = memo<JobInputProps>(({ value, onChange, disabled = false }) => {
  const { t } = useLanguage();

  return (
    <div className="job-input">
      <label htmlFor="job-input" className="job-input__label">
        {t('jobLabel')}
      </label>
      <textarea
        id="job-input"
        className="textarea-input"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={t('jobPlaceholder')}
        aria-label={t('jobLabel')}
        aria-required="true"
      />
      <p className="job-input__char-count">
        {value.trim().length} {t('characters')}
      </p>
    </div>
  );
});

JobInput.displayName = 'JobInput';
