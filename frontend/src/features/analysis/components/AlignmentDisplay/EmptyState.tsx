import { memo } from 'react';

interface EmptyStateProps {
  message?: string;
  icon?: string;
  show: boolean;
  children?: React.ReactNode;
}

/**
 * Generic empty state component
 *
 * Used when:
 * - No data to display
 * - All required fields are empty
 * - User hasn't completed analysis yet
 *
 * Props:
 * - message: Main message to show
 * - icon: Emoji or icon
 * - show: Whether to render (allows conditional hiding)
 * - children: Custom content (optional)
 */
export const EmptyState = memo<EmptyStateProps>(
  ({ message, icon, show, children }) => {
    if (!show) {
      return null;
    }

    return (
      <div className="empty-state">
        {icon && <div className="empty-state__icon">{icon}</div>}
        {message && <p className="empty-state__message">{message}</p>}
        {children && <div className="empty-state__content">{children}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
