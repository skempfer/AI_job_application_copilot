import { ReactNode } from 'react';

type SectionSentiment = 'positive' | 'negative';

interface ExplanationSectionProps {
  title: string;
  icon: ReactNode;
  items: string[];
  noItemsLabel?: string;
  sentiment: SectionSentiment;
  itemSymbol: string;
  formatListItem: (item: string) => string;
}

export function ExplanationSection({
  title,
  icon,
  items,
  noItemsLabel,
  sentiment,
  itemSymbol,
  formatListItem,
}: ExplanationSectionProps) {
  const hasItems = items.length > 0;

  return (
    <div className="explanation-section">
      <h4 className={`explanation-section-title explanation-section-title--${sentiment}`}>
        {icon}
        {title}
      </h4>
      <ul className="explanation-list">
        {hasItems ? (
          items.map((item) => (
            <li key={item} className="explanation-item explanation-item__text">
              <span className={`explanation-item__icon explanation-item__icon--${sentiment}`}>
                {itemSymbol}
              </span>
              <span>{formatListItem(item)}</span>
            </li>
          ))
        ) : (
          <li className="explanation-item explanation-item--empty">
            <span className="explanation-item__icon">✓</span>
            <span>{noItemsLabel}</span>
          </li>
        )}
      </ul>
    </div>
  );
}