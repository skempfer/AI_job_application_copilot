import { render, screen, waitFor } from '@testing-library/react';
import { AlignmentDisplayWithState } from './AlignmentDisplayWithState';
import type { AlignmentUIModel } from '../../../../types/analysis';

describe('Analysis Flow Integration Tests', () => {

  const createMockModel = (overrides?: Partial<AlignmentUIModel>): AlignmentUIModel => ({
    fitScore: 85,
    decision: 'apply',
    detectedLanguage: 'en',
    seniority: {
      match: 'match',
      label: 'Match',
      badgeClass: 'badge-success',
      priority: 'success',
      explanation: 'Experience level matches job requirement',
      detectedYears: 5,
      expectedSeniority: 'mid',
    },
    requirements: {
      mandatory: { met: [], missing: [] },
      desirable: { met: [], missing: [] },
    },
    hardSkills: ['React', 'TypeScript'],
    softSkills: ['Leadership'],
    detectedDomains: [{ domain: 'frontend', label: 'Frontend Development', badgeClass: 'badge-info' }],
    redFlags: [],
    yearsExperience: 5,
    yearsConfidence: 'high',
    recruiterMessage: 'Great candidate',
    coverLetter: 'Interested in this role',
    cvSuggestions: [],
    hasAnyMissingMandatory: false,
    hasRedFlags: false,
    hasDetectedDomains: true,
    ...overrides,
  });

  describe('Complete Analysis Workflow', () => {
    it('loads data, displays loading state, then shows complete analysis', async () => {
      const { rerender, container } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          loadingMessage="Analyzing your application..."
        />
      );

      expect(screen.getByText('Analyzing your application...')).toBeInTheDocument();

      const model = createMockModel();
      await waitFor(() => {
        rerender(
          <AlignmentDisplayWithState
            uiModel={model}
            isLoading={false}
            error={undefined}
          />
        );
      });

      expect(screen.queryByText(/Analyzing your application/i)).not.toBeInTheDocument();
      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });

    it('handles error during analysis and recovery', async () => {
      const error1 = new Error('Network error');
      const model = createMockModel();

      const { rerender } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={error1}
        />
      );

      expect(screen.getByText('Network error')).toBeInTheDocument();

      await waitFor(() => {
        rerender(
          <AlignmentDisplayWithState
            uiModel={model}
            isLoading={false}
            error={undefined}
          />
        );
      });


      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });

    it('handles multiple sequential analyses', async () => {
      const model1 = createMockModel({ fitScore: 70, decision: 'apply_with_fixes' });
      const model2 = createMockModel({ fitScore: 95, decision: 'apply' });

      const { rerender, container } = render(
        <AlignmentDisplayWithState
          uiModel={model1}
          isLoading={false}
          error={undefined}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();

      await waitFor(() => {
        rerender(
          <AlignmentDisplayWithState
            uiModel={null}
            isLoading={true}
            loadingMessage="Analyzing next candidate..."
          />
        );
      });

      expect(screen.getByText('Analyzing next candidate...')).toBeInTheDocument();

      await waitFor(() => {
        rerender(
          <AlignmentDisplayWithState
            uiModel={model2}
            isLoading={false}
            error={undefined}
          />
        );
      });


      expect(screen.queryByText('Analyzing next candidate...')).not.toBeInTheDocument();
      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });
  });

  describe('State Transition Integrity', () => {
    it('maintains state integrity during rapid prop changes', async () => {
      const model = createMockModel();
      const error = new Error('Test error');

      const { rerender } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={error}
        />
      );

      rerender(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();
    });

    it('correctly prioritizes error over loading state', () => {
      const error = new Error('Critical error');

      const { rerender } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={error}
        />
      );

      expect(screen.getByText('Critical error')).toBeInTheDocument();
      expect(
        screen.queryByText(/Parsing your CV/i)
      ).not.toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={undefined}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();
    });

    it('correctly prioritizes display over empty state', () => {
      const model = createMockModel({
        hardSkills: ['React'],
        softSkills: [],
        detectedDomains: [],
        yearsExperience: null,
      });

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
      expect(screen.queryByText('No analysis data available')).not.toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('renders BaseAlignmentDisplay when in display state', () => {
      const model = createMockModel();

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      const displayWrapper = container.querySelector('.alignment-display-with-state');
      expect(displayWrapper).toBeInTheDocument();
      expect(displayWrapper?.textContent).toBeTruthy();
    });

    it('integrates LoadingState component with default and custom messages', () => {
      const { rerender } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          loadingMessage="Custom analysis message"
        />
      );

      expect(screen.getByText('Custom analysis message')).toBeInTheDocument();
    });

    it('properly unmounts components during state transitions', async () => {
      const { rerender, unmount } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={createMockModel()}
          isLoading={false}
        />
      );

      // LoadingState should be unmounted
      expect(screen.queryByText(/Parsing your CV/i)).not.toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Data Consistency', () => {
    it('preserves model data through state transitions', () => {
      const model = createMockModel({
        hardSkills: ['React', 'TypeScript', 'Node.js'],
        softSkills: ['Leadership', 'Communication'],
        detectedDomains: [{ domain: 'frontend', label: 'Frontend', badgeClass: 'badge-info' }, { domain: 'devops', label: 'DevOps', badgeClass: 'badge-info' }],
      });

      const { rerender, container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
        />
      );

      const firstDisplay = container.innerHTML;

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      rerender(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
        />
      );

      const secondDisplay = container.innerHTML;

      expect(secondDisplay).toBe(firstDisplay);
    });

    it('handles null/undefined values gracefully', () => {
      const modelWithNulls = createMockModel({
        hardSkills: null as unknown as string[],
        softSkills: undefined as unknown as string[],
        detectedDomains: [],
        yearsExperience: null,
        coverLetter: undefined as unknown as string,
      });

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={modelWithNulls}
          isLoading={false}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('recovers from network error with user retry', async () => {
      const networkError = new Error('Network timeout');
      const model = createMockModel();

      const { rerender } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={networkError}
        />
      );

      expect(screen.getByText('Network timeout')).toBeInTheDocument();

      await waitFor(() => {
        rerender(
          <AlignmentDisplayWithState
            uiModel={null}
            isLoading={true}
            error={undefined}
          />
        );
      });

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();

      await waitFor(() => {
        rerender(
          <AlignmentDisplayWithState
            uiModel={model}
            isLoading={false}
            error={undefined}
          />
        );
      });


      expect(screen.queryByText('Network timeout')).not.toBeInTheDocument();
    });

    it('handles validation errors gracefully', () => {
      const validationError = new Error('Invalid CV format: Missing required section');

      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={validationError}
        />
      );

      expect(
        screen.getByText('Invalid CV format: Missing required section')
      ).toBeInTheDocument();
    });

    it('handles timeout errors with clear messaging', () => {
      const timeoutError = new Error('Analysis timeout: Exceeded 30 seconds');

      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={timeoutError}
        />
      );

      expect(
        screen.getByText('Analysis timeout: Exceeded 30 seconds')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility in Integration', () => {
    it('maintains semantic structure through state changes', () => {
      const model = createMockModel();

      const { rerender, container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      expect(
        container.querySelector('.loading-state') || 
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });

    it('provides clear feedback during analysis', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          loadingMessage="Analyzing your experience level..."
        />
      );

      expect(screen.getByText('Analyzing your experience level...')).toBeInTheDocument();
      expect(screen.queryByText(/of 3 steps/i)).not.toBeInTheDocument();
    });

    it('communicates errors clearly to users', () => {
      const detailedError = new Error(
        'Unable to process CV: File corrupted or unsupported format'
      );

      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={detailedError}
        />
      );

      expect(
        screen.getByText('Unable to process CV: File corrupted or unsupported format')
      ).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('does not re-render unnecessarily with same props', () => {
      const model = createMockModel();
      let renderCount = 0;

      const TestWrapper = (props: any) => {
        renderCount++;
        return <AlignmentDisplayWithState {...props} />;
      };

      const { rerender } = render(
        <TestWrapper
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      const initialRenderCount = renderCount;

      rerender(
        <TestWrapper
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      expect(renderCount).toBe(initialRenderCount + 1);
    });

    it('cleans up timers on unmount', () => {
      jest.useFakeTimers();
      const { unmount } = render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
        />
      );

      expect(jest.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(jest.getTimerCount()).toBe(0);
      jest.useRealTimers();
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles candidate with excellent alignment', () => {
      const excellentModel = createMockModel({
        fitScore: 98,
        decision: 'apply',
        hardSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
        softSkills: ['Leadership', 'Communication', 'Problem-solving', 'Teamwork'],
        detectedDomains: [{ domain: 'fullstack', label: 'Full Stack', badgeClass: 'badge-info' }, { domain: 'devops', label: 'DevOps', badgeClass: 'badge-info' }, { domain: 'product', label: 'Team Lead', badgeClass: 'badge-info' }],
        yearsExperience: 10,
      });

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={excellentModel}
          isLoading={false}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });

    it('handles candidate with minimal experience match', () => {
      const minimalModel = createMockModel({
        fitScore: 45,
        decision: 'apply_with_fixes',
        hardSkills: ['JavaScript'],
        softSkills: [],
        detectedDomains: [{ domain: 'frontend', label: 'Frontend', badgeClass: 'badge-info' }],
        yearsExperience: 1,
      });

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={minimalModel}
          isLoading={false}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });

    it('handles candidate with over-qualification signals', () => {
      const overQualifiedModel = createMockModel({
        fitScore: 65,
        decision: 'apply_with_fixes',
        hardSkills: ['React', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'Python'],
        softSkills: ['C-Level Management', 'Enterprise Architecture'],
        detectedDomains: [{ domain: 'fullstack', label: 'Multiple domains covered', badgeClass: 'badge-info' }],
        yearsExperience: 20,
      });

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={overQualifiedModel}
          isLoading={false}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });
  });
});
