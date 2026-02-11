import { useLanguage } from '../hooks/useLanguage';

interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobInput({ value, onChange, disabled = false }: JobInputProps) {
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
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.trim().length} caracteres
      </p>
    </div>
  );
}
