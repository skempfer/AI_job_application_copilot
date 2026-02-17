import { memo } from 'react';
import type { RequirementsUIModel, RequirementUIItem } from '../../../../types/analysis';

interface RequirementItemProps {
  item: RequirementUIItem;
}

const RequirementItem = memo<RequirementItemProps>(({ item }) => {
  const statusIcon = item.status === 'met' ? '✓' : '✗';
  const statusClass = item.status === 'met' ? 'requirement-item--met' : 'requirement-item--missing';

  return (
    <li className={`requirement-item ${statusClass}`}>
      <span className="requirement-item__status">{statusIcon}</span>
      <span className="requirement-item__text">{item.text}</span>
    </li>
  );
});

RequirementItem.displayName = 'RequirementItem';

interface RequirementCategoryProps {
  title: string;
  items: RequirementUIItem[];
  variant: 'met' | 'missing';
}

const RequirementCategory = memo<RequirementCategoryProps>(
  ({ title, items, variant }) => {
    if (items.length === 0) {
      return null;
    }

    const categoryClass = variant === 'met' ? 'requirement-category--met' : 'requirement-category--missing';

    return (
      <div className={`requirement-category ${categoryClass}`}>
        <h4 className="requirement-category__title">{title}</h4>
        <ul className="requirement-category__list">
          {items.map((item, idx) => (
            <RequirementItem key={`${item.text}-${idx}`} item={item} />
          ))}
        </ul>
      </div>
    );
  }
);

RequirementCategory.displayName = 'RequirementCategory';

interface RequirementsSectionProps {
  requirements: RequirementsUIModel;
}

export const RequirementsSection = memo<RequirementsSectionProps>(({ requirements }) => {
  const hasMandatory =
    (requirements.mandatory.met?.length ?? 0) > 0 ||
    (requirements.mandatory.missing?.length ?? 0) > 0;

  const hasDesirable =
    (requirements.desirable.met?.length ?? 0) > 0 ||
    (requirements.desirable.missing?.length ?? 0) > 0;

  if (!hasMandatory && !hasDesirable) {
    return null;
  }

  return (
    <div className="requirements-section">
      <h3 className="requirements-section__title">📋 Requirements Analysis</h3>

      {hasMandatory && (
        <div className="requirements-group">
          <h4 className="requirements-group__subtitle">Mandatory Requirements</h4>
          <RequirementCategory
            title="Met"
            items={requirements.mandatory.met ?? []}
            variant="met"
          />
          <RequirementCategory
            title="Missing"
            items={requirements.mandatory.missing ?? []}
            variant="missing"
          />
        </div>
      )}

      {hasDesirable && (
        <div className="requirements-group">
          <h4 className="requirements-group__subtitle">Desirable Requirements</h4>
          <RequirementCategory
            title="Met"
            items={requirements.desirable.met ?? []}
            variant="met"
          />
          <RequirementCategory
            title="Missing"
            items={requirements.desirable.missing ?? []}
            variant="missing"
          />
        </div>
      )}
    </div>
  );
});

RequirementsSection.displayName = 'RequirementsSection';
