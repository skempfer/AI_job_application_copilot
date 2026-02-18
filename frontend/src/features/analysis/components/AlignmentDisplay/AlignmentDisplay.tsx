import { memo } from 'react';
import type { AlignmentUIModel } from '../../../../types/analysis';
import { SeniorityBadge } from './SeniorityBadge';
import { DomainBadges } from './DomainBadges';
import { RequirementsSection } from './RequirementsSection';
import { RedFlagsSection } from './RedFlagsSection';
import { SkillsDisplay } from './SkillsDisplay';
import { EmptyState } from './EmptyState';
import { AlignmentErrorBoundary } from './AlignmentErrorBoundary';
import {
  hasContent,
  hasItems,
  isInCriticalState,
  getPriorityLevel,
  safeString,
} from './alignmentDefensive';
import './AlignmentDisplay.css';

interface AlignmentDisplayProps {
  uiModel: AlignmentUIModel;
}

const AlignmentDisplayContent = memo<AlignmentDisplayProps>(({ uiModel }) => {
  console.log('[AlignmentDisplayContent] Received model:', {
    hardSkillsCount: uiModel.hardSkills.length,
    softSkillsCount: uiModel.softSkills.length,
    detectedDomainsCount: uiModel.detectedDomains.length,
    hasRedFlags: uiModel.hasRedFlags,
    redFlagsCount: uiModel.redFlags.length,
    yearsExperience: uiModel.yearsExperience,
    recruiterMessageLen: uiModel.recruiterMessage.length,
    coverLetterLen: uiModel.coverLetter.length,
    cvSuggestionsCount: uiModel.cvSuggestions.length,
  });

  const priority = getPriorityLevel(uiModel);
  const contentExists = hasContent(uiModel);

  console.log('[AlignmentDisplayContent] Content exists:', contentExists);

  if (!contentExists) {
    return (
      <EmptyState
        show={true}
        icon="📊"
        message="No analysis data available. Try analyzing a role that matches your profile."
      />
    );
  }

  return (
    <div className={`alignment-display alignment-display--${priority}`}>
      <section className="alignment-display__section alignment-display__section--seniority">
        <SeniorityBadge info={uiModel.seniority} />
      </section>

      {uiModel.hasDetectedDomains && hasItems(uiModel.detectedDomains) && (
        <section className="alignment-display__section">
          <DomainBadges domains={uiModel.detectedDomains} />
        </section>
      )}

      {(hasItems(uiModel.hardSkills) ||
        hasItems(uiModel.softSkills) ||
        uiModel.yearsExperience !== null) && (
        <section className="alignment-display__section">
          <SkillsDisplay
            hardSkills={uiModel.hardSkills ?? []}
            softSkills={uiModel.softSkills ?? []}
            yearsExperience={uiModel.yearsExperience}
            yearsConfidence={uiModel.yearsConfidence}
          />
        </section>
      )}

      {isInCriticalState(uiModel) && (
        <section className="alignment-display__section alignment-display__section--requirements">
          <RequirementsSection requirements={uiModel.requirements} />
        </section>
      )}

      {uiModel.hasRedFlags && hasItems(uiModel.redFlags) && (
        <section className="alignment-display__section alignment-display__section--warnings">
          <RedFlagsSection redFlags={uiModel.redFlags} />
        </section>
      )}

      {(hasItems(uiModel.cvSuggestions) ||
        safeString(uiModel.recruiterMessage).length > 0 ||
        safeString(uiModel.coverLetter).length > 0) && (
        <section className="alignment-display__section alignment-display__section--messages">
          {safeString(uiModel.recruiterMessage).length > 0 && (
            <div className="alignment-display__message">
              <h3 className="alignment-display__message-title">💬 Recruiter Message</h3>
              <p className="alignment-display__message-text">
                {safeString(uiModel.recruiterMessage)}
              </p>
            </div>
          )}

          {safeString(uiModel.coverLetter).length > 0 && (
            <div className="alignment-display__message">
              <h3 className="alignment-display__message-title">📝 Generated Cover Letter</h3>
              <p className="alignment-display__message-text">
                {safeString(uiModel.coverLetter)}
              </p>
            </div>
          )}

          {hasItems(uiModel.cvSuggestions) && (
            <div className="alignment-display__message">
              <h3 className="alignment-display__message-title">✨ CV Improvement Suggestions</h3>
              <ul className="alignment-display__suggestions">
                {uiModel.cvSuggestions.map((suggestion, idx) => (
                  <li key={`suggestion-${idx}`} className="alignment-display__suggestion-item">
                    {safeString(suggestion)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
});

AlignmentDisplayContent.displayName = 'AlignmentDisplayContent';

export const AlignmentDisplay = memo<AlignmentDisplayProps>(({ uiModel }) => (
  <AlignmentErrorBoundary
    fallback={
      <EmptyState
        show={true}
        icon="⚠️"
        message="Unable to display analysis. Please try analyzing again."
      />
    }
  >
    <AlignmentDisplayContent uiModel={uiModel} />
  </AlignmentErrorBoundary>
));

AlignmentDisplay.displayName = 'AlignmentDisplay';
