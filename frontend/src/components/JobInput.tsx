interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobInput({ value, onChange, disabled = false }: JobInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="job-input" className="block text-sm font-semibold text-gray-700">
        Descrição da Vaga
      </label>
      <textarea
        id="job-input"
        className="textarea-input"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Cole aqui a descrição completa da vaga...&#10;&#10;Inclua:&#10;- Responsabilidades&#10;- Requisitos técnicos&#10;- Senioridade esperada&#10;- Stack tecnológica"
      />
      <p className="text-xs text-gray-500">
        {value.trim().length} caracteres
      </p>
    </div>
  );
}
