import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useLanguage } from './hooks/useLanguage';
import { useJobAnalysis } from './hooks/useJobAnalysis';
import { useAlignmentUIModel } from './hooks/useAlignmentUIModel';
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
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { trackEvent } from './lib/analytics';
import { AlignmentDisplayWithState } from './features/analysis/components/AlignmentDisplay/AlignmentDisplayWithState';
import './App.css';

const ResultsDisplay = lazy(() => import('./components/ResultsDisplay').then(m => ({ default: m.ResultsDisplay })));
const GapAnalysisDisplay = lazy(() => import('./components/GapAnalysisDisplay').then(m => ({ default: m.GapAnalysisDisplay })));
const ConsolidatedAnalysis = lazy(() => import('./components/ConsolidatedAnalysis').then(m => ({ default: m.ConsolidatedAnalysis })));
const CoverLetterDisplay = lazy(() => import('./components/CoverLetterDisplay').then(m => ({ default: m.CoverLetterDisplay })));

/**
 * AppContent - Main application content
 * Separated from root App to be wrapped with context providers
 */
function AppContent() {
  console.log('[AppContent] Function started');
  const { t } = useLanguage();
  console.log('[AppContent] useLanguage OK');
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const jobDescriptionTracked = useRef(false);

  console.log('[AppContent] States initialized');
  const { loading, analysisResult, result, gapResult, error, analyze, clearError } = useJobAnalysis();
  console.log('[AppContent] useJobAnalysis OK');
  const alignmentSource = analysisResult ?? result ?? null;
  console.log('[AppContent] alignmentSource computed:', alignmentSource ? 'HAS DATA' : 'NULL');
  const alignmentUIModel = useAlignmentUIModel(alignmentSource);
  console.log('[AppContent] useAlignmentUIModel OK:', alignmentUIModel ? 'HAS MODEL' : 'NULL');
  const analysisError = useMemo(() => (error ? new Error(error) : null), [error]);
  console.log('[AppContent] Rendering complete setup...');

  const handleAnalyze = () => {
    if (!canAnalyze || loading) return;

    trackEvent('analyze_clicked', {
      has_resume_url: Boolean(resumeUrl),
      job_length: jobDescription.trim().length,
      cv_length: cv.trim().length,
    });

    analyze(cv, jobDescription, resumeUrl);
  };

  const canAnalyze = useMemo(
    () => (cv.trim().length >= 50 || resumeUrl !== null) && jobDescription.trim().length >= 50 && !loading,
    [cv, jobDescription, resumeUrl, loading]
  );

  useEffect(() => {
    trackEvent('page_view', {
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }, []);

  useEffect(() => {
    const trimmed = jobDescription.trim();
    if (!jobDescriptionTracked.current && trimmed.length >= 50) {
      trackEvent('job_description_filled', { length: trimmed.length });
      jobDescriptionTracked.current = true;
    }
  }, [jobDescription]);

  return (
    <div className="app-shell">
      <Header />

      <LoadingSpinner show={loading} overlay message={t('analyzingButton')} />

      <main className="app-main">
        <div className="app-content">
          <ResumeUpload onUploadComplete={setResumeUrl} disabled={loading} />

          <div className="app-input-grid">
            <CVInput value={cv} onChange={setCv} disabled={loading} />
            <JobInput value={jobDescription} onChange={setJobDescription} disabled={loading} />
          </div>

          <AnalyzeButton onClick={handleAnalyze} disabled={!canAnalyze} loading={loading} />

          {error && <ErrorDisplay message={error} onDismiss={clearError} />}

          {/* {showAlignment && ( */}
          <div style={{ border: "2px solid red", width: "200px", height: "100px"}}>
            <AlignmentDisplayWithState
              uiModel={alignmentUIModel}
              isLoading={loading}
              error={analysisError}
              loadingMessage={t('analyzingButton')}
            />
            </div>
          {/* )} */}

          <Suspense fallback={<ResultsLoadingFallback />}>
            {result && gapResult && (
              <div className="app-results-grid">
                <div>
                  <ResultsDisplay result={result} />
                </div>
                <div className="app-results-side">
                  <GapAnalysisDisplay result={gapResult} />
                </div>
              </div>
            )}
            {result && !gapResult && <ResultsDisplay result={result} />}
            {gapResult && !result && <GapAnalysisDisplay result={gapResult} />}
            
            {result && gapResult && <ConsolidatedAnalysis result={result} gapResult={gapResult} />}

            {result && <CoverLetterDisplay coverLetter={result.coverLetter} detectedLanguage={result.detectedLanguage} />}
          </Suspense>

          {!result && !error && !loading && (
            <div className="card app-empty-state">
              <span className="app-empty-icon">📋</span>
              <h2 className="app-empty-title">
                {t('readyToStart')}
              </h2>
              <p className="app-empty-text">
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
 * Shows splash screen only on first load (per session)
 */
function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });
  const { t } = useLanguage();

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasSeenSplash', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <>
      <SplashScreen
        show={showSplash}
        message="Viora"
        subtitle={t('appTagline')}
        duration={4000}
      />
      {!showSplash && <AppContent />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppWithSplash />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
