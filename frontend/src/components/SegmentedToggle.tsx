import { ReactNode } from 'react';

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
  size?: 'default' | 'compact';
  ariaLabel: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
  ariaLabel,
}: SegmentedToggleProps<T>) {
  const isCompact = size === 'compact';

  return (
    <div
      className={[
        'inline-flex items-center rounded-full border border-white/10 dark:border-white/10',
        'bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-[0_1px_8px_rgba(0,0,0,0.08)]',
        'p-1',
      ].join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-label={option.ariaLabel}
            aria-pressed={isActive}
            className={[
              'relative inline-flex items-center justify-center gap-1.5 rounded-full',
              'min-h-[44px] min-w-[44px] px-3 text-xs font-medium tracking-wide',
              'transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              isCompact ? 'px-2.5 text-[11px]' : 'px-3.5 text-xs',
              isActive
                ? 'text-gray-900 dark:text-white bg-white/90 dark:bg-white/10 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
            ].join(' ')}
          >
            {option.icon && (
              <span className={isCompact ? 'text-[13px]' : 'text-sm'} aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
