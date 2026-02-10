import { useLanguage } from '../hooks/useLanguage';
import type { FormattedAnalysisResult } from '../types/analysis';
import { ExplanationDisplay } from './ExplanationDisplay';

interface ResultsDisplayProps {
  result: FormattedAnalysisResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score e Decisão */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('completeAnalysis')}</h2>
          <div className={`px-4 py-2 rounded-full border-2 font-bold text-2xl ${result.scoreBadgeClass}`}>
            {result.fitScore}/100
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <span className="text-3xl">{result.decisionIcon}</span>
          <div>
            <p className="font-semibold text-lg text-gray-800">{result.decisionText}</p>
            <p className="text-sm text-gray-600">
              {result.decision === 'apply' && t('applyText')}
              {result.decision === 'apply_with_fixes' && t('applyWithFixesText')}
              {result.decision === 'skip' && t('skipText')}
            </p>
          </div>
        </div>

        {/* Explicação do Score (se disponível) */}
        {result.explanation && (
          <ExplanationDisplay 
            explanation={result.explanation} 
            promptVersion={result.promptVersion}
          />
        )}
      </div>

      {/* Pontos Fortes */}
      {result.strengths.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {t('strengths')}
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-orange-600">⚠</span>
            {t('gaps')}
          </h3>
          <ul className="space-y-2">
            {result.gaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-orange-500 mt-1">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sugestões de CV */}
      {result.cvSuggestions.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-blue-600">📝</span>
            {t('suggestions')}
          </h3>
          <ul className="space-y-3">
            {result.cvSuggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 font-bold mt-1">{idx + 1}.</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensagem ao Recrutador */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-green-600">💬</span>
          {t('recruiterMessage')}
        </h3>
        <div className="bg-white p-4 rounded-lg border border-green-300">
          <p className="text-gray-800 italic leading-relaxed">
            "{result.recruiterMessage}"
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 Personalize esta mensagem antes de enviar
        </p>
      </div>
    </div>
  );
}
