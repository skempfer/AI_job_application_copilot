import { memo } from 'react';
import type { AlignmentUIModel } from '../../../../types/analysis';
import { AlignmentDisplay as BaseAlignmentDisplay } from './AlignmentDisplay';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { useAnalysisDisplayState } from './useAnalysisDisplayState';
import './AlignmentDisplay.css';

interface AlignmentDisplayWithStateProps {
  uiModel: AlignmentUIModel | null;
  isLoading?: boolean;
  error?: Error | null;
  loadingMessage?: string;
}

export const AlignmentDisplayWithState = memo<
  AlignmentDisplayWithStateProps
>(({ uiModel, isLoading = false, error, loadingMessage }) => {
  console.log('[AlignmentDisplayWithState] Component mounted/rendered');
  const { state, loadingStage } = useAnalysisDisplayState(
    uiModel,
    isLoading,
    error
  );

  console.log('[AlignmentDisplayWithState] Render:', { 
    state, 
    uiModelExists: Boolean(uiModel), 
    isLoading, 
    hasError: Boolean(error),
    loadingStage
  });

  if (state === 'loading') {
    console.log('[AlignmentDisplayWithState] Rendering LoadingState');
    return (
      <LoadingState
        show={true}
        stage={loadingStage}
        message={loadingMessage}
      />
    );
  }

  if (state === 'error') {
    console.log('[AlignmentDisplayWithState] Rendering EmptyState (error)');
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
    console.log('[AlignmentDisplayWithState] Rendering EmptyState (empty)');
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

  console.log('[AlignmentDisplayWithState] Rendering BaseAlignmentDisplay');
  return (
    <div className="alignment-display-with-state">
      <BaseAlignmentDisplay uiModel={uiModel!} />
    </div>
  );
});

AlignmentDisplayWithState.displayName = 'AlignmentDisplayWithState';
