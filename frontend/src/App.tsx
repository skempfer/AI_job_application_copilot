import { useState } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { CVInput } from './components/CVInput';
import { JobInput } from './components/JobInput';
import { AnalyzeButton } from './components/AnalyzeButton';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Header } from './components/Header';
import { SettingsToggle } from './components/SettingsToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { analyzeJobFit } from './domain/apiClient';
import { validateInputs, formatAnalysisResult } from './domain/analyzer';
import type { AnalysisResult, FormattedAnalysisResult } from './types/analysis';

/**
 * AppContent - Main application content
 * Separated from root App to be wrapped with context providers
 */
function AppContent() {
  const { t } = useLanguage();
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
      <SettingsToggle />
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
                {t('readyToStart')}
              </h2>
              <p className="text-gray-600">
                {t('emptyStateText')}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          {t('dataPrivacy')}
        </p>
      </footer>
    </div>
  );
}

/**
 * App - Root component with providers
 * Wraps AppContent with ThemeProvider and LanguageProvider
 * Providers are at the root level to ensure context is available everywhere
 */
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
