import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const JobInput = memo<JobInputProps>(({ value, onChange, disabled = false }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label htmlFor="job-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.trim().length} {t('characters')}
      </p>
    </div>
  );
});

JobInput.displayName = 'JobInput';
