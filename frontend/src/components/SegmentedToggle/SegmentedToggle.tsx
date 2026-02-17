import { ReactNode } from 'react';
import './SegmentedToggle.css';

type ToggleSize = 'default' | 'compact';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  ariaLabel: string;
  icon?: ReactNode;
};

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: ToggleSize;
  ariaLabel: string;
}


export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
  ariaLabel,
}: SegmentedToggleProps<T>) {
  const sizeClass = size === 'compact' ? 'segmented-toggle__button--compact' : '';
  const iconSizeClass = size === 'compact' ? 'segmented-toggle__icon--compact' : 'segmented-toggle__icon--default';

  return (
    <div
      className="segmented-toggle"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const statusClass = isActive ? 'segmented-toggle__button--active' : 'segmented-toggle__button--inactive';

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-label={option.ariaLabel}
            aria-pressed={isActive}
            className={[
              'segmented-toggle__button',
              sizeClass,
              statusClass,
            ].join(' ')}
          >
            {option.icon && (
              <span className={iconSizeClass} aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span className="segmented-toggle__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
