import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { ScoreExplanation } from '../types/analysis';

interface ExplanationDisplayProps {
  explanation: ScoreExplanation;
  promptVersion?: string;
}

export const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({ 
  explanation,
  promptVersion 
}) => {
  const { t } = useLanguage();

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('scoreExplanation')}
        </h3>
        {promptVersion && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {promptVersion}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
        <p className="text-sm text-gray-700 dark:text-gray-300">{explanation.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Positives */}
        <div>
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('positivePoints')}
          </h4>
          <ul className="space-y-1">
            {explanation.positives.map((positive, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">+</span>
                <span>{positive}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Negatives */}
        <div>
          <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {t('negativePoints')}
          </h4>
          <ul className="space-y-1">
            {explanation.negatives.length > 0 ? (
              explanation.negatives.map((negative, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-orange-500 dark:text-orange-400 mr-2">-</span>
                  <span>{negative}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 dark:text-gray-400 italic flex items-start">
                <span className="mr-2">✓</span>
                <span>Nenhum ponto crítico identificado</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 <strong>Scoring híbrido:</strong> A IA extrai sinais do seu CV, e nosso algoritmo 
          calcula o score de forma determinística e transparente.
        </p>
      </div>
    </div>
  );
};
