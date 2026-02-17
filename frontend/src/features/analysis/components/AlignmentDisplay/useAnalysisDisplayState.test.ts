import { renderHook } from '@testing-library/react';
import {
  useAnalysisDisplayState,
  useLoadingStages,
} from './useAnalysisDisplayState';
import type { AlignmentUIModel } from '../../../../types/analysis';

const createMockModel = (
  overrides?: Partial<AlignmentUIModel>
): AlignmentUIModel => ({
  fitScore: 75,
  decision: 'apply',
  detectedLanguage: 'en',
  seniority: {
    match: 'match',
    label: 'Match',
    badgeClass: 'badge-success',
    priority: 'success',
    explanation: 'Match',
    detectedYears: 5,
    expectedSeniority: 'mid',
  },
  requirements: {
    mandatory: { met: [], missing: [] },
    desirable: { met: [], missing: [] },
  },
  hardSkills: ['React', 'TypeScript'],
  softSkills: ['Communication'],
  detectedDomains: [],
  redFlags: [],
  recruiterMessage: 'Great candidate',
  coverLetter: '',
  yearsExperience: 5,
  yearsConfidence: 'high',
  cvSuggestions: [],
  hasAnyMissingMandatory: false,
  hasRedFlags: false,
  hasDetectedDomains: false,
  ...overrides,
});

describe('useAnalysisDisplayState', () => {
  describe('Loading State', () => {
    it('returns loading state when isLoading is true', () => {
      const { result } = renderHook(() =>
        useAnalysisDisplayState(null, true, undefined)
      );

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isDisplay).toBe(false);
    });

    it('returns loading state when uiModel is null', () => {
      const { result } = renderHook(() =>
        useAnalysisDisplayState(null, false, undefined)
      );

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
    });

    it('returns loading state when uiModel is undefined', () => {
      const { result } = renderHook(() =>
        useAnalysisDisplayState(undefined, false, undefined)
      );

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Error State', () => {
    it('returns error state when error is provided', () => {
      const error = new Error('Analysis failed');
      const model = createMockModel();
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, error)
      );

      expect(result.current.state).toBe('error');
      expect(result.current.isError).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('error state takes priority over loading', () => {
      const error = new Error('Analysis failed');
      const { result } = renderHook(() =>
        useAnalysisDisplayState(null, true, error)
      );

      expect(result.current.state).toBe('error');
      expect(result.current.isError).toBe(true);
    });
  });

  describe('Empty State', () => {
    it('returns empty state when model has no content', () => {
      const emptyModel = createMockModel({
        hardSkills: [],
        softSkills: [],
        detectedDomains: [],
        yearsExperience: null,
        recruiterMessage: '',
        coverLetter: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(emptyModel, false, undefined)
      );

      expect(result.current.state).toBe('empty');
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.isDisplay).toBe(false);
    });

    it('returns empty state when all content fields are empty', () => {
      const emptyModel = createMockModel({
        hardSkills: [],
        softSkills: [],
        detectedDomains: [],
        yearsExperience: null,
        recruiterMessage: '',
        coverLetter: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(emptyModel, false, undefined)
      );

      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('Display State', () => {
    it('returns display state when model has content', () => {
      const model = createMockModel();
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.state).toBe('display');
      expect(result.current.isDisplay).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isEmpty).toBe(false);
    });

    it('returns display state when hardSkills present', () => {
      const model = createMockModel({ hardSkills: ['React'] });
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.state).toBe('display');
    });

    it('returns display state when softSkills present', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: ['Leadership'],
      });
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.state).toBe('display');
    });

    it('returns display state when yearsExperience present', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: [],
        yearsExperience: 5,
      });
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.state).toBe('display');
    });

    it('returns display state when recruiterMessage present', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: [],
        yearsExperience: null,
        recruiterMessage: 'Good fit',
      });
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.state).toBe('display');
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to display', () => {
      const model = createMockModel();
      const { result, rerender } = renderHook(
        ({ isLoading }) => useAnalysisDisplayState(model, isLoading, undefined),
        { initialProps: { isLoading: true } }
      );

      expect(result.current.state).toBe('loading');

      rerender({ isLoading: false });

      expect(result.current.state).toBe('display');
    });

    it('transitions from loading to empty', () => {
      const emptyModel = createMockModel({
        hardSkills: [],
        softSkills: [],
        yearsExperience: null,
        recruiterMessage: '',
      });

      const { result, rerender } = renderHook(
        ({ isLoading }) =>
          useAnalysisDisplayState(emptyModel, isLoading, undefined),
        { initialProps: { isLoading: true } }
      );

      expect(result.current.state).toBe('loading');

      rerender({ isLoading: false });

      expect(result.current.state).toBe('empty');
    });

    it('transitions to error when error occurs', () => {
      const model = createMockModel();
      const { result, rerender } = renderHook(
        ({ error }: { error?: Error | null }) => useAnalysisDisplayState(model, false, error),
        { initialProps: { error: undefined as Error | undefined } }
      );

      expect(result.current.state).toBe('display');

      rerender({ error: new Error('Failed') });

      expect(result.current.state).toBe('error');
    });
  });

  describe('Loading Stage', () => {
    it('returns complete stage (3) when not loading', () => {
      const { result } = renderHook(() => useLoadingStages(false));

      expect(result.current).toBe(3);
    });

    it('returns first stage (0) when loading', () => {
      const { result } = renderHook(() => useLoadingStages(true));

      expect(result.current).toBe(0);
    });
  });

  describe('Content Detection', () => {
    it('detects hardSkills as content', () => {
      const model = createMockModel({
        hardSkills: ['React'],
        softSkills: [],
        detectedDomains: [],
        yearsExperience: null,
        recruiterMessage: '',
        coverLetter: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.isDisplay).toBe(true);
    });

    it('detects softSkills as content', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: ['Communication'],
        detectedDomains: [],
        yearsExperience: null,
        recruiterMessage: '',
        coverLetter: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.isDisplay).toBe(true);
    });

    it('detects detectedDomains as content', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: [],
        detectedDomains: [
          { domain: 'frontend', label: 'Frontend', badgeClass: 'badge-info' },
        ],
        yearsExperience: null,
        recruiterMessage: '',
        coverLetter: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.isDisplay).toBe(true);
    });

    it('detects coverLetter as content', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: [],
        detectedDomains: [],
        yearsExperience: null,
        recruiterMessage: '',
        coverLetter: 'Generated cover letter',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.isDisplay).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles model with zero years experience as empty', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: [],
        yearsExperience: 0,
        recruiterMessage: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.isEmpty).toBe(false);
    });

    it('handles model with empty string message', () => {
      const model = createMockModel({
        hardSkills: [],
        softSkills: [],
        yearsExperience: null,
        recruiterMessage: '',
      });

      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      expect(result.current.isEmpty).toBe(true);
    });

    it('handles null error gracefully', () => {
      const model = createMockModel();
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, null)
      );

      expect(result.current.isError).toBe(false);
      expect(result.current.state).toBe('display');
    });
  });

  describe('Return Value Consistency', () => {
    it('always returns all expected properties', () => {
      const { result } = renderHook(() =>
        useAnalysisDisplayState(null, true, undefined)
      );

      expect(result.current).toHaveProperty('state');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isEmpty');
      expect(result.current).toHaveProperty('isDisplay');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('loadingStage');
    });

    it('always returns exactly one true state flag', () => {
      const model = createMockModel();
      const { result } = renderHook(() =>
        useAnalysisDisplayState(model, false, undefined)
      );

      const trueStates = [
        result.current.isLoading,
        result.current.isEmpty,
        result.current.isDisplay,
        result.current.isError,
      ].filter(Boolean).length;

      expect(trueStates).toBe(1);
    });
  });
});
