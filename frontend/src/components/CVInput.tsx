import { useLanguage } from '../hooks/useLanguage';

interface CVInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CVInput({ value, onChange, disabled = false }: CVInputProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label htmlFor="cv-input" className="block text-sm font-semibold text-gray-700">
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
      />
      <p className="text-xs text-gray-500">
        {value.trim().length} {t('characters')}
      </p>
    </div>
  );
}
