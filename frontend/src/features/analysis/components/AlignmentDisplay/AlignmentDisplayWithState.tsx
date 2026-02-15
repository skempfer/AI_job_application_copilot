import { memo } from 'react';
import type { AlignmentUIModel } from '../../../../types/analysis';
import { AlignmentDisplay as BaseAlignmentDisplay } from './AlignmentDisplay';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { useAnalysisDisplayState } from './useAnalysisDisplayState';
import './AlignmentDisplay.css';

interface AlignmentDisplayWithStateProps {
  /**
   * The analyzed alignment data
   */
  uiModel: AlignmentUIModel | null;
  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;
  /**
   * Error that occurred during analysis
   */
  error?: Error | null;
  /**
   * Custom loading message (overrides staged messages)
   */
  loadingMessage?: string;
}

/**
 * Enhanced AlignmentDisplay component with loading and state management
 *
 * Handles four distinct states:
 * 1. Loading - Shows animated loading component with staged messages
 * 2. Empty - Shows helpful empty state message
 * 3. Error - Shows error message
 * 4. Display - Shows full analysis results
 *
 * Example:
 * ```tsx
 * <AlignmentDisplayWithState
 *   uiModel={analysisResult}
 *   isLoading={analyzing}
 *   error={analysisError}
 * />
 * ```
 */
export const AlignmentDisplayWithState = memo<
  AlignmentDisplayWithStateProps
>(({ uiModel, isLoading = false, error, loadingMessage }) => {
  const { state, loadingStage } = useAnalysisDisplayState(
    uiModel,
    isLoading,
    error
  );

  if (state === 'loading') {
    return (
      <LoadingState
        show={true}
        stage={loadingStage}
        message={loadingMessage}
      />
    );
  }

  if (state === 'error') {
    return (
      <EmptyState
        show={true}
        icon="⚠️"
        message={error?.message || 'An error occurred during analysis'}
      >
        <p className="empty-state__details">
          Please try again or contact support if the problem persists.
        </p>
      </EmptyState>
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        show={true}
        icon="📊"
        message="No analysis data available"
      >
        <p className="empty-state__details">
          Try analyzing a job description that matches your profile and CV.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="alignment-display-with-state">
      <BaseAlignmentDisplay uiModel={uiModel!} />
    </div>
  );
});

AlignmentDisplayWithState.displayName = 'AlignmentDisplayWithState';
