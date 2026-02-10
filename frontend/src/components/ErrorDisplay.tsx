interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="card bg-red-50 border-red-300 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Erro na Análise</h3>
            <p className="text-red-700">{message}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 font-bold text-xl"
          aria-label="Fechar erro"
        >
          ×
        </button>
      </div>
    </div>
  );
}
