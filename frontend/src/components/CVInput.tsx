import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface CVInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CVInput = memo<CVInputProps>(({ value, onChange, disabled = false }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label htmlFor="cv-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.trim().length} {t('characters')}
      </p>
    </div>
  );
});

CVInput.displayName = 'CVInput';
