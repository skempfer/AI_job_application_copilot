import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(
      <EmptyState
        show={false}
        icon="📋"
        message="Test message"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders empty state when show is true', () => {
    render(
      <EmptyState
        show={true}
        icon="📋"
        message="No data available"
      />
    );

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies empty-state class', () => {
    const { container } = render(
      <EmptyState
        show={true}
        icon="⚠️"
        message="Error"
      />
    );

    const emptyStateDiv = container.querySelector('.empty-state');
    expect(emptyStateDiv).toBeInTheDocument();
  });

  it('renders icon with correct styling', () => {
    const { container } = render(
      <EmptyState
        show={true}
        icon="🔍"
        message="Search"
      />
    );

    const iconDiv = container.querySelector('.empty-state__icon');
    expect(iconDiv).toBeInTheDocument();
    expect(iconDiv?.textContent).toBe('🔍');
  });

  it('renders message with correct styling', () => {
    const { container } = render(
      <EmptyState
        show={true}
        icon="📝"
        message="Custom message"
      />
    );

    const messageDiv = container.querySelector('.empty-state__message');
    expect(messageDiv).toBeInTheDocument();
    expect(messageDiv?.textContent).toBe('Custom message');
  });

  it('renders children when provided', () => {
    render(
      <EmptyState
        show={true}
        icon="❓"
        message="Need help?"
      >
        <button>Try again</button>
      </EmptyState>
    );

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('children are hidden when show is false', () => {
    const { container } = render(
      <EmptyState
        show={false}
        icon="❓"
        message="Need help?"
      >
        <button>Try again</button>
      </EmptyState>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders multiple children', () => {
    render(
      <EmptyState
        show={true}
        icon="ℹ️"
        message="Information"
      >
        <p>More details here</p>
        <a href="#help">Get help</a>
      </EmptyState>
    );

    expect(screen.getByText('More details here')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get help' })).toBeInTheDocument();
  });

  it('handles long messages', () => {
    const longMessage = 'a'.repeat(500);
    render(
      <EmptyState
        show={true}
        icon="📄"
        message={longMessage}
      />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles special emoji icons', () => {
    const icons = ['✅', '❌', '⚠️', '🎯', '🔧'];

    icons.forEach((icon) => {
      const { container } = render(
        <EmptyState
          show={true}
          icon={icon}
          message="Test"
        />
      );

      const rendered = container.querySelector('.empty-state__icon');
      expect(rendered?.textContent).toBe(icon);
    });
  });

  it('maintains layout structure', () => {
    const { container } = render(
      <EmptyState
        show={true}
        icon="🎨"
        message="Design"
      />
    );

    const emptyState = container.querySelector('.empty-state');
    const icon = emptyState?.querySelector('.empty-state__icon');
    const message = emptyState?.querySelector('.empty-state__message');

    expect(icon?.parentElement).toBe(emptyState);
    expect(message?.parentElement).toBe(emptyState);
  });
});
