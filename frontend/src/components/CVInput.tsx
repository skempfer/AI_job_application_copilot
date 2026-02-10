interface CVInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CVInput({ value, onChange, disabled = false }: CVInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="cv-input" className="block text-sm font-semibold text-gray-700">
        Seu CV
      </label>
      <textarea
        id="cv-input"
        className="textarea-input"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Cole aqui seu CV completo...&#10;&#10;Inclua:&#10;- Experiências profissionais&#10;- Skills técnicas&#10;- Projetos relevantes&#10;- Formação acadêmica"
      />
      <p className="text-xs text-gray-500">
        {value.trim().length} caracteres
      </p>
    </div>
  );
}
