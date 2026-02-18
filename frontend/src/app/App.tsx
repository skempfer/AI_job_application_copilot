import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useJobAnalysis } from '../features/analysis/hooks/useJobAnalysis';
import { CVInput } from '../features/input/components/CVInput';
import { JobInput } from '../features/input/components/JobInput';
import { ResumeUpload } from '../features/input/components/ResumeUpload';
import { AnalyzeButton } from '../features/analysis/components/AnalyzeButton';
import { RateLimitMessage } from '../features/analysis/components/RateLimitMessage';
import { ErrorDisplay } from '../features/error/components/ErrorDisplay';
import { ResultsLoadingFallback } from '../features/display/components/ResultsLoadingFallback';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { SplashScreen } from '../components/SplashScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { Terms } from '../pages/TermsPage/Terms';
import { Privacy } from '../pages/PrivacyPage/Privacy';
import { trackEvent } from '../lib/analytics';
import { isRateLimited } from '../utils/rateLimiter';
import '../styles/App.css';

const ResultsDisplay = lazy(() => import('../features/analysis/components/ResultsDisplay').then(m => ({ default: m.ResultsDisplay })));
const GapAnalysisDisplay = lazy(() => import('../features/analysis/components/GapAnalysisDisplay').then(m => ({ default: m.GapAnalysisDisplay })));
const ConsolidatedAnalysis = lazy(() => import('../features/analysis/components/ConsolidatedAnalysis').then(m => ({ default: m.ConsolidatedAnalysis })));
const CoverLetterDisplay = lazy(() => import('../features/display/components/CoverLetterDisplay').then(m => ({ default: m.CoverLetterDisplay })));

function AppContent() {
  const { t } = useLanguage();
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const jobDescriptionTracked = useRef(false);

  const { loading, result, gapResult, error, analyze, clearError } = useJobAnalysis();

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
    () => (cv.trim().length >= 50 || resumeUrl !== null) && jobDescription.trim().length >= 50 && !loading && !rateLimited,
    [cv, jobDescription, resumeUrl, loading, rateLimited]
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

  useEffect(() => {
    const checkRateLimit = () => {
      setRateLimited(isRateLimited());
    };

    checkRateLimit();

    const interval = setInterval(checkRateLimit, 1000);

    return () => clearInterval(interval);
  }, []);

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

          <RateLimitMessage />

          {error && <ErrorDisplay message={error} onDismiss={clearError} />}

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
