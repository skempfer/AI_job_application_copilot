import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AlignmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[AlignmentErrorBoundary] Error caught:', error, info);

    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div className="alignment-error-boundary">
          <div className="alignment-error-boundary__content">
            <h3 className="alignment-error-boundary__title">⚠️ Display Error</h3>
            <p className="alignment-error-boundary__message">
              We encountered an issue displaying the analysis results. Please try again or contact support.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="alignment-error-boundary__details">
                <summary>Error details (development only)</summary>
                <pre className="alignment-error-boundary__error">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
