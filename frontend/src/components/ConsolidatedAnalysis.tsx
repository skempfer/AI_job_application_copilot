import { memo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getLanguageLabel } from '../utils/languageDetection';
import type { FormattedAnalysisResult } from '../types/analysis';
import type { GapAnalysisResult } from '../types/analysis';
import './ConsolidatedAnalysis.css';

interface ConsolidatedAnalysisProps {
  result: FormattedAnalysisResult;
  gapResult: GapAnalysisResult;
}

export const ConsolidatedAnalysis = memo<ConsolidatedAnalysisProps>(({ result, gapResult }) => {
  const { t, language, translateFreeform } = useLanguage();
  const technicalScore = gapResult.matchScore;
  const overallScore = result.fitScore;
  return (
    <div className="consolidated-analysis">
      <div className="consolidated-analysis__header">
        <h2 className="consolidated-analysis__title">
          📋 {t('analysisSummary')}
        </h2>
        <p className="consolidated-analysis__subtitle">
          {t('synthesisAnalyses')}
        </p>
      </div>

      <div className="card consolidated-analysis__card">
        <h3 className="consolidated-analysis__card-title">
          📋 {t('recommendation')} 
        </h3>
        
        {overallScore >= 70 && technicalScore >= 70 ? (
          <div className="consolidated-analysis__recommendation consolidated-analysis__recommendation--positive">
            <p className="consolidated-analysis__recommendation-title">✅ {t('excellentCandidate')}</p>
            <p className="consolidated-analysis__recommendation-text">
              {t('excellentCandidateDesc')}
            </p>
          </div>
        ) : overallScore >= 50 && technicalScore >= 50 ? (
          <div className="consolidated-analysis__recommendation consolidated-analysis__recommendation--warning">
            <p className="consolidated-analysis__recommendation-title">⚠️ {t('goodFitCaveats')}</p>
            <p className="consolidated-analysis__recommendation-text">
              {technicalScore < overallScore 
                ? t('goodFitTechDesc')
                : t('goodFitExperienceDesc')}
            </p>
          </div>
        ) : (
          <div className="consolidated-analysis__recommendation consolidated-analysis__recommendation--caution">
            <p className="consolidated-analysis__recommendation-title">🤔 {t('significantChallenge')}</p>
            <p className="consolidated-analysis__recommendation-text">
              {t('significantChallengeDesc')}
            </p>
          </div>
        )}
      </div>

      {result.cvSuggestions.length > 0 && (
        <div className="card consolidated-analysis__card consolidated-analysis__card--blue">
          <h3 className="consolidated-analysis__card-title consolidated-analysis__card-title--with-icon">
            <span className="consolidated-analysis__icon consolidated-analysis__icon--blue">📝</span>
            {t('suggestions')}
          </h3>
          <ul className="consolidated-analysis__list">
            {result.cvSuggestions.map((suggestion, idx) => (
              <li key={idx} className="consolidated-analysis__list-item">
                <span className="consolidated-analysis__list-index consolidated-analysis__list-index--blue">{idx + 1}.</span>
                <span>{translateFreeform(suggestion)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card consolidated-analysis__card consolidated-analysis__card--green">
        <h3 className="consolidated-analysis__card-title consolidated-analysis__card-title--with-icon">
          <span className="consolidated-analysis__icon consolidated-analysis__icon--green">💬</span>
          {t('recruiterMessage')}
        </h3>
        {result.detectedLanguage && (
          <p
            className="consolidated-analysis__language"
            aria-live="polite"
            role="doc-subtitle"
          >
            {getLanguageLabel(result.detectedLanguage, language as 'pt' | 'en')}
          </p>
        )}
        <div className="consolidated-analysis__message-box">
          <p className="consolidated-analysis__message-text">
            "{translateFreeform(result.recruiterMessage)}"
          </p>
        </div>
        <p className="consolidated-analysis__message-hint">
          {t('personalizeMessage')}
        </p>
      </div>

      <div className="card consolidated-analysis__card">
        <h3 className="consolidated-analysis__card-title">
          🎯 {t('nextSteps')}
        </h3>
        <ul className="consolidated-analysis__list">
          {technicalScore < overallScore && (
            <li className="consolidated-analysis__list-item consolidated-analysis__list-item--spaced">
              <span className="consolidated-analysis__list-index consolidated-analysis__list-index--blue">1</span>
              <span className="consolidated-analysis__list-text">
                <strong>{t('learnMissingSkills')}</strong>{' '}
                {gapResult.missingCriticalSkills
                  .slice(0, 2)
                  .map((skill) => translateFreeform(skill))
                  .join(', ')}
              </span>
            </li>
          )}
          {overallScore < 70 && (
            <li className="consolidated-analysis__list-item consolidated-analysis__list-item--spaced">
              <span className="consolidated-analysis__list-index consolidated-analysis__list-index--blue">{technicalScore < overallScore ? '2' : '1'}</span>
              <span className="consolidated-analysis__list-text">
                <strong>{t('gainRelevantExperience')}</strong> {t('orLookJunior')}
              </span>
            </li>
          )}
          <li className="consolidated-analysis__list-item consolidated-analysis__list-item--spaced">
            <span className="consolidated-analysis__list-index consolidated-analysis__list-index--blue">{overallScore >= 70 && technicalScore >= 70 ? '1' : overallScore < 70 ? '2' : '2'}</span>
            <span className="consolidated-analysis__list-text">
              <strong>{t('customizeApplication')}</strong> {t('mentioningSkills')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
});

ConsolidatedAnalysis.displayName = 'ConsolidatedAnalysis';
