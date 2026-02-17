import { memo } from 'react';
import type { DetectedDomainUIItem } from '../../../../types/analysis';

interface DomainBadgesProps {
  domains: DetectedDomainUIItem[];
}

export const DomainBadges = memo<DomainBadgesProps>(({ domains }) => {
  if (domains.length === 0) {
    return null;
  }

  return (
    <div className="domain-badges">
      <h4 className="domain-badges__title">🎯 Detected Roles</h4>
      <div className="domain-badges__container">
        {domains.map((domain) => (
          <span key={domain.domain} className={`badge ${domain.badgeClass}`}>
            {domain.label}
          </span>
        ))}
      </div>
    </div>
  );
});

DomainBadges.displayName = 'DomainBadges';
