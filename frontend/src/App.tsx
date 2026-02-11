import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { useJobAnalysis } from './hooks/useJobAnalysis';
import { CVInput } from './components/CVInput';
import { JobInput } from './components/JobInput';
import { ResumeUpload } from './components/ResumeUpload';
import { AnalyzeButton } from './components/AnalyzeButton';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ResultsLoadingFallback } from './components/ResultsLoadingFallback';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SettingsToggle } from './components/SettingsToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

const ResultsDisplay = lazy(() => import('./components/ResultsDisplay').then(m => ({ default: m.ResultsDisplay })));
const GapAnalysisDisplay = lazy(() => import('./components/GapAnalysisDisplay').then(m => ({ default: m.GapAnalysisDisplay })));
const ConsolidatedAnalysis = lazy(() => import('./components/ConsolidatedAnalysis').then(m => ({ default: m.ConsolidatedAnalysis })));
const CoverLetterDisplay = lazy(() => import('./components/CoverLetterDisplay').then(m => ({ default: m.CoverLetterDisplay })));

/**
 * AppContent - Main application content
 * Separated from root App to be wrapped with context providers
 */
function AppContent() {
  const { t } = useLanguage();
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const { loading, result, gapResult, error, analyze, clearError } = useJobAnalysis();

  const handleAnalyze = () => analyze(cv, jobDescription, resumeUrl);

  const canAnalyze = useMemo(
    () => (cv.trim().length >= 50 || resumeUrl !== null) && jobDescription.trim().length >= 50 && !loading,
    [cv, jobDescription, resumeUrl, loading]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <SettingsToggle />
      <Header />

      <LoadingSpinner show={loading} overlay message={t('analyzingButton')} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <ResumeUpload onUploadComplete={setResumeUrl} disabled={loading} />

          <div className="grid md:grid-cols-2 gap-6">
            <CVInput value={cv} onChange={setCv} disabled={loading} />
            <JobInput value={jobDescription} onChange={setJobDescription} disabled={loading} />
          </div>

          <AnalyzeButton onClick={handleAnalyze} disabled={!canAnalyze} loading={loading} />

          {error && <ErrorDisplay message={error} onDismiss={clearError} />}

          <Suspense fallback={<ResultsLoadingFallback />}>
            {result && gapResult && (
              <div className="grid md:grid-cols-2 gap-6 divide-x divide-gray-300 dark:divide-gray-600">
                <div>
                  <ResultsDisplay result={result} />
                </div>
                <div>
                  <GapAnalysisDisplay result={gapResult} />
                </div>
              </div>
            )}
            {result && !gapResult && <ResultsDisplay result={result} />}
            {gapResult && !result && <GapAnalysisDisplay result={gapResult} />}
            
            {result && gapResult && <ConsolidatedAnalysis result={result} gapResult={gapResult} />}

            {result && <CoverLetterDisplay coverLetter={result.coverLetter} />}
          </Suspense>

          {!result && !error && !loading && (
            <div className="card text-center py-12">
              <span className="text-6xl mb-4 block">📋</span>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('readyToStart')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('emptyStateText')}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * App - Root component with providers
 * Wraps AppContent with ThemeProvider and LanguageProvider
 * Shows splash screen on first load
 */
function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SplashScreen
          show={showSplash}
          message="Viora"
          subtitle="Clarity for smarter career decisions"
          duration={4000}
        />
        {!showSplash && <AppContent />}
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
