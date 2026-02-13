import { memo } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import type { GapAnalysisResult } from '../../../../types/analysis';
import { clampScore, getScoreBadgeClass } from '../../../../utils/scoreHelpers';
import './GapAnalysisDisplay.css';

interface GapAnalysisDisplayProps {
  result: GapAnalysisResult;
}

export const GapAnalysisDisplay = memo<GapAnalysisDisplayProps>(({ result }) => {
  const { t, translateFreeform } = useLanguage();
  const clampedScore = clampScore(result.matchScore);

  return (
    <div className="gap-analysis">
      <div className="gap-analysis__header-card">
        <div className="mb-4">
          <div className="gap-analysis__header-title">
            <span className="gap-analysis__header-title-text">🔧 {t('technicalAnalysis')}</span>
            <span className="gap-analysis__header-badge">
              {t('skillsMatch')}
            </span>
          </div>
          <p className="gap-analysis__header-desc">
            {t('technicalMatchDesc')}
          </p>
        </div>
        
        <div className="gap-analysis__score-section">
          <h3 className="gap-analysis__score-label">{t('technicalMatch')}</h3>
          <div className={`gap-analysis__score-badge ${getScoreBadgeClass(clampedScore)}`}>
            {clampedScore}%
          </div>
        </div>
        <div className="gap-analysis__progress-bar">
          <div
            className="gap-analysis__progress-fill"
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>

      {result.strongMatches.length > 0 && (
        <div className="gap-analysis__section">
          <h3 className="gap-analysis__section-title">
            <span className="gap-analysis__section-icon gap-analysis__section-icon--positive">✓</span>
            {t('skillsYouHave')}
          </h3>
          <ul className="gap-analysis__skills-list">
            {result.strongMatches.map((match) => (
              <li
                key={match}
                className="gap-analysis__skill-tag"
              >
                {translateFreeform(match)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.missingCriticalSkills.length > 0 && (
        <div className="gap-analysis__section">
          <h3 className="gap-analysis__section-title">
            <span className="gap-analysis__section-icon gap-analysis__section-icon--critical">✕</span>
            {t('criticalSkillsMissing')}
          </h3>
          <ul className="gap-analysis__items-list">
            {result.missingCriticalSkills.map((skill) => (
              <li key={skill} className="gap-analysis__list-item">
                <span className="gap-analysis__list-icon gap-analysis__list-icon--critical">•</span>
                <span>{translateFreeform(skill)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestedFocusAreas.length > 0 && (
        <div className="gap-analysis__section">
          <h3 className="gap-analysis__section-title">
            <span className="gap-analysis__section-icon gap-analysis__section-icon--focus">→</span>
            {t('nextTechnologies')}
          </h3>
          <ul className="gap-analysis__items-list">
            {result.suggestedFocusAreas.map((area) => (
              <li key={area} className="gap-analysis__list-item">
                <span className="gap-analysis__list-icon gap-analysis__list-icon--focus">•</span>
                <span>{translateFreeform(area)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

GapAnalysisDisplay.displayName = 'GapAnalysisDisplay';
