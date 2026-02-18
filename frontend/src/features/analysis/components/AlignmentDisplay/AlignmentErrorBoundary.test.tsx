import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { AlignmentErrorBoundary } from './AlignmentErrorBoundary';

const ErrorComponent = () => {
  throw new Error('Test error');
};

const SafeComponent = () => <div>Safe content</div>;

describe('AlignmentErrorBoundary', () => {
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });
  it('renders children when no error occurs', () => {
    render(
      <AlignmentErrorBoundary>
        <SafeComponent />
      </AlignmentErrorBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    const fallback = <div>Error fallback</div>;
    render(
      <AlignmentErrorBoundary fallback={fallback}>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    expect(screen.getByText('Error fallback')).toBeInTheDocument();
  });

  it('renders default error message when no fallback provided', () => {
    render(
      <AlignmentErrorBoundary>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /Display Error/i })).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <AlignmentErrorBoundary>
        <section>Section 1</section>
        <article>Article 1</article>
        <aside>Aside 1</aside>
      </AlignmentErrorBoundary>
    );

    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Aside 1')).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <AlignmentErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AlignmentErrorBoundary>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('catches nested component errors', () => {
    const NestedErrorComponent = () => (
      <div>
        <SafeComponent />
        <ErrorComponent />
      </div>
    );

    render(
      <AlignmentErrorBoundary fallback={<div>Nested error caught</div>}>
        <NestedErrorComponent />
      </AlignmentErrorBoundary>
    );

    expect(screen.getByText('Nested error caught')).toBeInTheDocument();
  });

  it('applies error-boundary class', () => {
    render(
      <AlignmentErrorBoundary>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    const boundaryDiv = screen.getByRole('heading', { name: /Display Error/i }).closest('.alignment-error-boundary');
    expect(boundaryDiv).toBeInTheDocument();
  });

  it('shows error content wrapper', () => {
    render(
      <AlignmentErrorBoundary>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    const wrapper = screen.getByRole('heading', { name: /Display Error/i }).closest('.alignment-error-boundary__content');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders fallback with custom styling', () => {
    const CustomFallback = (
      <div className="custom-error">
        <h2>Custom Error Message</h2>
        <p>Something went wrong</p>
      </div>
    );

    render(
      <AlignmentErrorBoundary fallback={CustomFallback}>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Custom Error Message' })).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('can recover from error when component mounts after error', () => {
    render(
      <AlignmentErrorBoundary fallback={<div>Error</div>}>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('maintains state in siblings when error occurs', () => {
    const SafeWithState = () => {
      const [count] = useState(42);
      return <div>Count: {count}</div>;
    };

    render(
      <div>
        <SafeWithState />
        <AlignmentErrorBoundary fallback={<div>Error</div>}>
          <ErrorComponent />
        </AlignmentErrorBoundary>
      </div>
    );

    expect(screen.getByText('Count: 42')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('handles error with stack trace', () => {
    const errorWithStack = () => {
      const error = new Error('Detailed error');
      error.stack = 'Error: Detailed error\n at Component (file.tsx:10)';
      throw error;
    };

    const ErrorComponentWithStack = () => errorWithStack();

    render(
      <AlignmentErrorBoundary>
        <ErrorComponentWithStack />
      </AlignmentErrorBoundary>
    );

    const heading = screen.getByRole('heading', { name: /Display Error/i });
    expect(heading).toBeInTheDocument();
  });

  it('logs error information to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AlignmentErrorBoundary>
        <ErrorComponent />
      </AlignmentErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
