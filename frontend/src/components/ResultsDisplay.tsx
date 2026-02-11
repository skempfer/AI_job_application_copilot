import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { FormattedAnalysisResult } from '../types/analysis';
import { ExplanationDisplay } from './ExplanationDisplay';
import { clampScore } from '../utils/scoreHelpers';

interface ResultsDisplayProps {
  result: FormattedAnalysisResult;
}

export const ResultsDisplay = memo<ResultsDisplayProps>(({ result }) => {
  const { t } = useLanguage();
  const clampedScore = clampScore(result.fitScore);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">📊 Overall Alignment</span>
            <span className="text-xs px-2 py-1 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 font-semibold">
              Holistic view
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-purple-300">
            Analyzes your complete profile, experience, seniority, and overall alignment with the job.
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-3 pt-2 border-t border-purple-200 dark:border-purple-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Overall Alignment</h3>
          <div className={`px-4 py-2 rounded-full border-2 font-bold text-lg ${result.scoreBadgeClass}`}>
            {clampedScore}%
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>
      
      {result.explanation && (
        <div className="card">
          <ExplanationDisplay 
            explanation={result.explanation} 
            promptVersion={result.promptVersion}
          />
        </div>
      )}

      {result.strengths.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            {t('strengths')}
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 dark:text-green-400 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.gaps.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-orange-600 dark:text-orange-400">⚠</span>
            {t('gaps')}
          </h3>
          <ul className="space-y-2">
            {result.gaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-orange-500 dark:text-orange-400 mt-1">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


    </div>
  );
});

ResultsDisplay.displayName = 'ResultsDisplay';
