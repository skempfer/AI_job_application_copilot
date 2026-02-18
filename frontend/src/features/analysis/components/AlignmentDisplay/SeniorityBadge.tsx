import { memo } from 'react';
import type { SeniorityUIInfo } from '../../../../types/analysis';

interface SeniorityBadgeProps {
  info: SeniorityUIInfo;
}

export const SeniorityBadge = memo<SeniorityBadgeProps>(({ info }) => {
  return (
    <div className="seniority-badge">
      <div className="seniority-badge__header">
        <span className={`badge ${info.badgeClass}`}>{info.label}</span>
        {info.detectedYears !== null && (
          <span className="seniority-badge__years">
            {info.detectedYears} {info.detectedYears === 1 ? 'year' : 'years'} detected
          </span>
        )}
      </div>
      <p className="seniority-badge__explanation">{info.explanation}</p>
    </div>
  );
});

SeniorityBadge.displayName = 'SeniorityBadge';
