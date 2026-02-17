import { memo } from 'react';

interface EmptyStateProps {
  message?: string;
  icon?: string;
  show: boolean;
  children?: React.ReactNode;
}

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
