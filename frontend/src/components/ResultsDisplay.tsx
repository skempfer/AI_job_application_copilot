import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { FormattedAnalysisResult } from '../types/analysis';
import { ExplanationDisplay } from './ExplanationDisplay';
import { clampScore } from '../utils/scoreHelpers';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  result: FormattedAnalysisResult;
}

/**
 * Map category keys to i18n translation keys
 */
function getCategoryTranslationKey(categoryKey: string): string {
  const lower = categoryKey.toLowerCase();
  
  if (lower.includes('hard skill')) return 'hardSkills';
  if (lower.includes('requirement met') || lower.includes('requisito atendido')) return 'requirementsMet';
  if (lower.includes('bonus qualification') || lower.includes('qualificação bonus')) return 'bonusQualifications';
  if (lower.includes('missing requirement') || lower.includes('requisito faltando')) return 'missingRequirements';
  if (lower.includes('missing bonus')) return 'missingBonuses';
  if (lower.includes('red flag')) return 'redFlags';
  
  return 'other';
}

function groupAndExtractItems(items: string[], tFunction: (key: string) => string): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  items.forEach(item => {
    const match = item.match(/^(.+?):\s*(.+)$/);
    if (match) {
      const [, category, value] = match;
      const categoryKey = category.trim();
      const translationKey = getCategoryTranslationKey(categoryKey);
      const displayKey = tFunction(translationKey as any);

      if (!grouped[displayKey]) {
        grouped[displayKey] = [];
      }
      grouped[displayKey].push(value.trim());
    } else {
      const category = tFunction('other' as any);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    }
  });

  return grouped;
}

export const ResultsDisplay = memo<ResultsDisplayProps>(({ result }) => {
  const { t, translateFreeform } = useLanguage();
  const clampedScore = clampScore(result.fitScore);

  const groupedStrengths = groupAndExtractItems(result.strengths, t as (key: string) => string);
  const groupedGaps = groupAndExtractItems(result.gaps, t as (key: string) => string);

  return (
    <div className="results-display">
      <div className="results-display__header-card">
        <div className="mb-4">
          <div className="results-display__header-title">
            <span className="results-display__header-title-text">📊 {t('overallAlignment')}</span>
            <span className="results-display__header-badge">
              {t('holisticView')}
            </span>
          </div>
          <p className="results-display__header-desc">
            {t('overallAlignmentDesc')}
          </p>
        </div>
        
        <div className="results-display__score-section">
          <h3 className="results-display__score-label">{t('overallAlignment')}</h3>
          <div className={`results-display__score-badge ${result.scoreBadgeClass}`}>
            {clampedScore}%
          </div>
        </div>
        <div className="results-display__progress-bar">
          <div
            className="results-display__progress-fill"
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>
      
      {result.explanation && (
        <div className="results-display__explanation-wrapper">
          <ExplanationDisplay 
            explanation={result.explanation}
          />
        </div>
      )}

      {result.strengths.length > 0 && (
        <div className="results-display__section">
          <h3 className="results-display__section-title">
            <span className="results-display__section-icon--positive">✓</span>
            {t('strengths')}
          </h3>
          <ul className="results-display__items-list">
            {Object.entries(groupedStrengths).map(([category, values]) => (
              <li key={category} className="results-display__list-item">
                <span className="results-display__list-icon results-display__list-icon--positive">•</span>
                <div className="results-display__list-content">
                  <span className="results-display__category-label">{category}:</span>
                  <span>
                    {values
                      .map(v => translateFreeform(v))
                      .join(', ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.gaps.length > 0 && (
        <div className="results-display__section">
          <h3 className="results-display__section-title">
            <span className="results-display__section-icon--warning">⚠</span>
            {t('gaps')}
          </h3>
          <ul className="results-display__items-list">
            {Object.entries(groupedGaps).map(([category, values]) => (
              <li key={category} className="results-display__list-item">
                <span className="results-display__list-icon results-display__list-icon--warning">•</span>
                <div className="results-display__list-content">
                  <span className="results-display__category-label">{category}:</span>
                  <span>
                    {values
                      .map(v => translateFreeform(v))
                      .join(', ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}


    </div>
  );
});

ResultsDisplay.displayName = 'ResultsDisplay';
