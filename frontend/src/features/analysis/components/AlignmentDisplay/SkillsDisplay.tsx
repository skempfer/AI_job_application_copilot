import { memo } from 'react';

interface SkillsDisplayProps {
  hardSkills: string[];
  softSkills: string[];
  yearsExperience: number | null;
  yearsConfidence: 'high' | 'medium' | 'low';
}

/**
 * Displays detected skills and experience summary
 *
 * Shows:
 * - Hard skills (technical)
 * - Soft skills (interpersonal)
 * - Years of experience with confidence level
 */
export const SkillsDisplay = memo<SkillsDisplayProps>(
  ({ hardSkills, softSkills, yearsExperience, yearsConfidence }) => {
    const hasSkills = (hardSkills?.length ?? 0) > 0 || (softSkills?.length ?? 0) > 0;

    if (!hasSkills && yearsExperience === null) {
      return null;
    }

    const confidenceLabel = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    }[yearsConfidence];

    const confidenceBadgeClass = {
      high: 'badge-success',
      medium: 'badge-warning',
      low: 'badge-gray',
    }[yearsConfidence];

    return (
      <div className="skills-display">
        <h3 className="skills-display__title">🛠️ Detected Profile</h3>

        {yearsExperience !== null && (
          <div className="skills-display__experience">
            <div className="skills-display__experience-value">
              {yearsExperience}
              <span className="skills-display__experience-unit">
                {yearsExperience === 1 ? 'year' : 'years'}
              </span>
            </div>
            <span className={`badge ${confidenceBadgeClass}`}>
              {confidenceLabel} confidence
            </span>
          </div>
        )}

        {(hardSkills?.length ?? 0) > 0 && (
          <div className="skills-display__category">
            <h4 className="skills-display__category-title">Technical Skills</h4>
            <div className="skills-display__tags">
              {hardSkills.map((skill, idx) => (
                <span key={`hard-${idx}`} className="tag tag--skill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {(softSkills?.length ?? 0) > 0 && (
          <div className="skills-display__category">
            <h4 className="skills-display__category-title">Soft Skills</h4>
            <div className="skills-display__tags">
              {softSkills.map((skill, idx) => (
                <span key={`soft-${idx}`} className="tag tag--soft">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SkillsDisplay.displayName = 'SkillsDisplay';
