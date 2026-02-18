import { useMemo } from 'react';
import type { AlignmentUIModel } from '../../../../types/analysis';

export type AnalysisDisplayState = 'loading' | 'empty' | 'display' | 'error';

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

    const hasContent =
      (uiModel.hardSkills?.length ?? 0) > 0 ||
      (uiModel.softSkills?.length ?? 0) > 0 ||
      (uiModel.detectedDomains?.length ?? 0) > 0 ||
      uiModel.yearsExperience !== null ||
      (uiModel.recruiterMessage?.length ?? 0) > 0 ||
      (uiModel.coverLetter?.length ?? 0) > 0;

    console.log('[useAnalysisDisplayState] Content check:', {
      hardSkillsCount: uiModel.hardSkills?.length ?? 0,
      softSkillsCount: uiModel.softSkills?.length ?? 0,
      detectedDomainsCount: uiModel.detectedDomains?.length ?? 0,
      yearsExperience: uiModel.yearsExperience,
      recruiterMessageLen: uiModel.recruiterMessage?.length ?? 0,
      coverLetterLen: uiModel.coverLetter?.length ?? 0,
      hasContent,
    });

    if (!hasContent) {
      console.log('[useAnalysisDisplayState] -> EMPTY state');
      return {
        state: 'empty',
        isLoading: false,
        isEmpty: true,
        isDisplay: false,
        isError: false,
        loadingStage: 3,
      };
    }

    console.log('[useAnalysisDisplayState] -> DISPLAY state');
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

export const useLoadingStages = (isLoading: boolean): number => {
  return useMemo(() => {
    if (!isLoading) return 3;
    return 0;
  }, [isLoading]);
};
