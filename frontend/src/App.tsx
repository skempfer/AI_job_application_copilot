import { useState, useEffect } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { CVInput } from './components/CVInput';
import { JobInput } from './components/JobInput';
import { ResumeUpload } from './components/ResumeUpload';
import { AnalyzeButton } from './components/AnalyzeButton';
import { ResultsDisplay } from './components/ResultsDisplay';
import { GapAnalysisDisplay } from './components/GapAnalysisDisplay';
import { ConsolidatedAnalysis } from './components/ConsolidatedAnalysis';
import { CoverLetterDisplay } from './components/CoverLetterDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SettingsToggle } from './components/SettingsToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { analyzeJobFit, analyzeWithGap } from './domain/apiClient';
import { validateInputs, formatAnalysisResult } from './domain/analyzer';
import type { AnalysisResult, FormattedAnalysisResult, GapAnalysisResult } from './types/analysis';

const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  fitScore: 72,
  decision: 'apply_with_fixes',
  strengths: [
    'Hard skill: TypeScript',
    'Hard skill: React',
    'Requisito atendido: Node.js',
    'Diferencial: AWS'
  ],
  gaps: [
    'Requisito faltando: GraphQL',
    'Diferencial ausente: Kubernetes'
  ],
  cvSuggestions: [
    'Destaque projetos com React e TypeScript no topo do CV.',
    'Inclua exemplos de APIs Node.js em producao.'
  ],
  recruiterMessage: 'Seu perfil esta proximo do que buscamos. Ajuste alguns pontos tecnicos e sua aplicacao ficara ainda mais forte.',
  coverLetter: 'Prezados, tenho experiencia em desenvolvimento full-stack com foco em React e Node.js. Estou animado para contribuir com o time.',
  explanation: {
    positives: ['Experiencia relevante em front-end moderno.', 'Stack alinhada com a vaga.'],
    negatives: ['Faltam mencoes a GraphQL e Kubernetes.'],
    summary: 'Bom alinhamento geral com alguns gaps tecnicos especificos.'
  },
  promptVersion: 'mock-ui'
};

const MOCK_GAP_RESULT: GapAnalysisResult = {
  matchScore: 68,
  missingCriticalSkills: ['GraphQL', 'Kubernetes'],
  strongMatches: ['React', 'TypeScript', 'Node.js', 'AWS'],
  suggestedFocusAreas: ['GraphQL', 'Kubernetes', 'Observability'],
  structuredCV: {
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
    seniorityLevel: 'mid',
    yearsOfExperience: 4,
    languages: ['Portuguese', 'English'],
    education: ['BSc Computer Science'],
    certifications: ['AWS Cloud Practitioner'],
    strengths: ['Front-end architecture', 'API development']
  }
};

/**
 * AppContent - Main application content
 * Separated from root App to be wrapped with context providers
 */
function AppContent() {
  const { t } = useLanguage();
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const handleResumeUrlChange = (url: string) => {
    console.log('🎯 Resume URL recebida no App:', url);
    setResumeUrl(url);
  };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedAnalysisResult | null>(null);
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setResult(null);
    setGapResult(null);
    setError(null);

    const validation = validateInputs(cv, jobDescription, resumeUrl);
    if (!validation.valid) {
      setError(validation.error || 'Erro de validação');
      return;
    }

    const useMockAnalysis = import.meta.env.VITE_MOCK_ANALYSIS === 'true';

    setLoading(true);

    if (useMockAnalysis) {
      const formatted = formatAnalysisResult(MOCK_ANALYSIS_RESULT);
      setResult(formatted);
      setGapResult(MOCK_GAP_RESULT);
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Iniciando análise com:', { 
        cvLength: cv.length, 
        cvPreview: cv.substring(0, 100),
        jobDescriptionLength: jobDescription.length,
        jobPreview: jobDescription.substring(0, 100),
        resumeUrl 
      });
      
      const analysisResult: AnalysisResult = await analyzeJobFit(cv, jobDescription, resumeUrl);
      console.log('✅ Análise concluída. Resposta da IA:', analysisResult);
      const formatted = formatAnalysisResult(analysisResult);
      setResult(formatted);
      
      if (resumeUrl) {
        try {
          console.log('📊 Executando gap analysis complementar...');
          const gapAnalysis: GapAnalysisResult = await analyzeWithGap(jobDescription, resumeUrl);
          setGapResult(gapAnalysis);
        } catch (gapError) {
          console.warn('⚠️ Gap analysis falhou (não crítico):', gapError);
        }
      } else if (cv.trim().length >= 50) {
        try {
          console.log('📊 Executando gap analysis complementar com CV de texto...');
          const gapAnalysis: GapAnalysisResult = await analyzeWithGap(jobDescription, undefined, cv);
          setGapResult(gapAnalysis);
        } catch (gapError) {
          console.warn('⚠️ Gap analysis com CV falhou (não crítico):', gapError);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao analisar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = (cv.trim().length >= 50 || resumeUrl !== null) && jobDescription.trim().length >= 50 && !loading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <SettingsToggle />
      <Header />

      <LoadingSpinner show={loading} overlay message={t('analyzingButton')} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <ResumeUpload onUploadComplete={handleResumeUrlChange} disabled={loading} />

          <div className="grid md:grid-cols-2 gap-6">
            <CVInput value={cv} onChange={setCv} disabled={loading} />
            <JobInput value={jobDescription} onChange={setJobDescription} disabled={loading} />
          </div>

          <AnalyzeButton onClick={handleAnalyze} disabled={!canAnalyze} loading={loading} />

          {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

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
