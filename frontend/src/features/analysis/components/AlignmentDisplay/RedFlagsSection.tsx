import { memo } from 'react';

interface RedFlagsSectionProps {
  redFlags: string[];
}

export const RedFlagsSection = memo<RedFlagsSectionProps>(({ redFlags }) => {
  if (!redFlags || redFlags.length === 0) {
    return null;
  }

  return (
    <div className="red-flags-section">
      <h3 className="red-flags-section__title">⚠️ Points of Attention</h3>
      <ul className="red-flags-section__list">
        {redFlags.map((flag, idx) => (
          <li key={`${flag}-${idx}`} className="red-flags-section__item">
            {flag}
          </li>
        ))}
      </ul>
      <p className="red-flags-section__note">
        These items may require discussion during the interview process.
      </p>
    </div>
  );
});

RedFlagsSection.displayName = 'RedFlagsSection';
