import { useMemo } from 'react';
import type { AnalysisResult, AlignmentUIModel } from '../types/analysis';
import { mapAlignmentResponseToUIModel } from './mappers/alignmentMapper';

/**
 * Hook to map raw analysis result to UI model
 *
 * Why a separate hook?
 * - Centralizes mapping logic
 * - Memoizes to avoid recalculations
 * - Single responsibility (not mixed with API/state management)
 * - Easy to test and reuse
 *
 * @param analysisResult - Raw API response
 * @returns UI-ready alignment model
 */
export function useAlignmentUIModel(
  analysisResult: AnalysisResult | null
): AlignmentUIModel | null {
  return useMemo(() => {
    if (!analysisResult) {
      return null;
    }

    return mapAlignmentResponseToUIModel(analysisResult);
  }, [analysisResult]);
}
