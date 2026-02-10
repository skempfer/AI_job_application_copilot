import { useState } from 'react';
import { CVInput } from './components/CVInput';
import { JobInput } from './components/JobInput';
import { AnalyzeButton } from './components/AnalyzeButton';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Header } from './components/Header';
import { analyzeJobFit } from './domain/apiClient';
import { validateInputs, formatAnalysisResult } from './domain/analyzer';
import type { AnalysisResult, FormattedAnalysisResult } from './types/analysis';

function App() {
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // Limpar estado anterior
    setResult(null);
    setError(null);

    // Validar inputs usando lógica de domínio
    const validation = validateInputs(cv, jobDescription);
    if (!validation.valid) {
      setError(validation.error || 'Erro de validação');
      return;
    }

    setLoading(true);

    try {
      const analysisResult: AnalysisResult = await analyzeJobFit(cv, jobDescription);
      const formatted = formatAnalysisResult(analysisResult);
      setResult(formatted);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao analisar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = cv.trim().length >= 50 && jobDescription.trim().length >= 50 && !loading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            <CVInput value={cv} onChange={setCv} disabled={loading} />
            <JobInput value={jobDescription} onChange={setJobDescription} disabled={loading} />
          </div>

          {/* Botão Analyze */}
          <AnalyzeButton onClick={handleAnalyze} disabled={!canAnalyze} loading={loading} />

          {/* Error Display */}
          {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

          {/* Results */}
          {result && <ResultsDisplay result={result} />}

          {/* Empty State */}
          {!result && !error && !loading && (
            <div className="card text-center py-12">
              <span className="text-6xl mb-4 block">📋</span>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Pronto para começar?
              </h2>
              <p className="text-gray-600">
                Cole seu CV e a descrição da vaga acima, depois clique em "Analyze Job Fit"
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          🔒 Seus dados não são armazenados. Análise feita via Groq API (gratuita, ultra-rápida).
        </p>
      </footer>
    </div>
  );
}

export default App;
