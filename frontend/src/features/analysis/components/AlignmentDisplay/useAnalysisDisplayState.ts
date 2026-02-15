import { useMemo } from 'react';
import type { AlignmentUIModel } from '../../../../types/analysis';

/**
 * State representing different phases of analysis display
 */
export type AnalysisDisplayState = 'loading' | 'empty' | 'display' | 'error';

/**
 * Hook managing analysis display state lifecycle
 *
 * Handles transitions between:
 * - loading: Data being fetched/processed
 * - empty: No meaningful content to display
 * - display: Ready to show full analysis
 * - error: Error occurred during analysis
 */
export const useAnalysisDisplayState = (
  uiModel: AlignmentUIModel | null | undefined,
  isLoading: boolean,
  error?: Error | null
): {
  state: AnalysisDisplayState;
  isLoading: boolean;
  isEmpty: boolean;
  isDisplay: boolean;
  isError: boolean;
  loadingStage: number;
} => {
  return useMemo(() => {
    // Error state takes priority
    if (error) {
      return {
        state: 'error',
        isLoading: false,
        isEmpty: false,
        isDisplay: false,
        isError: true,
        loadingStage: 3,
      };
    }

    // Loading state
    if (isLoading || !uiModel) {
      return {
        state: 'loading',
        isLoading: true,
        isEmpty: false,
        isDisplay: false,
        isError: false,
        loadingStage: 0,
      };
    }

    // Determine if model has meaningful content
    const hasContent =
      (uiModel.hardSkills?.length ?? 0) > 0 ||
      (uiModel.softSkills?.length ?? 0) > 0 ||
      (uiModel.detectedDomains?.length ?? 0) > 0 ||
      uiModel.yearsExperience !== null ||
      (uiModel.recruiterMessage?.length ?? 0) > 0 ||
      (uiModel.coverLetter?.length ?? 0) > 0;

    // Empty state
    if (!hasContent) {
      return {
        state: 'empty',
        isLoading: false,
        isEmpty: true,
        isDisplay: false,
        isError: false,
        loadingStage: 3,
      };
    }

    // Display state
    return {
      state: 'display',
      isLoading: false,
      isEmpty: false,
      isDisplay: true,
      isError: false,
      loadingStage: 3,
    };
  }, [uiModel, isLoading, error]);
};

/**
 * Hook managing loading stage progression during analysis
 *
 * Stages:
 * 0 - Parsing CV (0-1 seconds)
 * 1 - Analyzing requirements (1-2 seconds)
 * 2 - Generating insights (2-3 seconds)
 * 3 - Complete
 */
export const useLoadingStages = (isLoading: boolean): number => {
  return useMemo(() => {
    if (!isLoading) return 3; // Complete

    // In real implementation, this would be driven by actual API progress
    // For now, frontend stages are handled by LoadingState component
    return 0; // Default to first stage
  }, [isLoading]);
};
