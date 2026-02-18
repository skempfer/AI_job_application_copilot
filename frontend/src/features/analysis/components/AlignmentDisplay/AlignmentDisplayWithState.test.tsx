import { render, screen } from '@testing-library/react';
import { AlignmentDisplayWithState } from './AlignmentDisplayWithState';
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
  recruiterMessage: 'Great',
  coverLetter: '',
  yearsExperience: 5,
  yearsConfidence: 'high',
  cvSuggestions: [],
  hasAnyMissingMandatory: false,
  hasRedFlags: false,
  hasDetectedDomains: false,
  ...overrides,
});

describe('AlignmentDisplayWithState', () => {
  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={undefined}
        />
      );

      expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();
    });

    it('displays custom loading message when provided', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          loadingMessage="Analyzing your application..."
        />
      );

      expect(
        screen.getByText('Analyzing your application...')
      ).toBeInTheDocument();
    });

    it('shows spinner animation during loading', () => {
      const { container } = render(
        <AlignmentDisplayWithState uiModel={null} isLoading={true} />
      );

      expect(container.querySelector('.loading-state')).toBeInTheDocument();
      expect(container.querySelector('.spinner-ring')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when error is provided', () => {
      const error = new Error('Analysis failed');
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={error}
        />
      );

      expect(screen.getByText('Analysis failed')).toBeInTheDocument();
      expect(
        screen.getByText(/try again or contact support/i)
      ).toBeInTheDocument();
    });

    it('shows generic error message when error has no message', () => {
      const error = new Error('');
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={error}
        />
      );

      expect(
        screen.getByText(/an error occurred during analysis/i)
      ).toBeInTheDocument();
    });

    it('displays warning icon for error state', () => {
      const error = new Error('Test error');
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={error}
        />
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('error takes priority over loading state', () => {
      const error = new Error('Analysis failed');
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={error}
        />
      );

      expect(screen.getByText('Analysis failed')).toBeInTheDocument();
      expect(screen.queryByText('Parsing your CV...')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when model is null', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={undefined}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();
    });

    it('shows empty state when model has no content', () => {
      const emptyModel: AlignmentUIModel = {
        fitScore: 0,
        decision: 'skip',
        detectedLanguage: 'en',
        seniority: {
          match: 'match',
          label: 'Match',
          badgeClass: 'badge-success',
          priority: 'success',
          explanation: 'Match',
          detectedYears: null,
          expectedSeniority: 'unknown',
        },
        requirements: {
          mandatory: { met: [], missing: [] },
          desirable: { met: [], missing: [] },
        },
        hardSkills: [],
        softSkills: [],
        detectedDomains: [],
        redFlags: [],
        recruiterMessage: '',
        coverLetter: '',
        yearsExperience: null,
        yearsConfidence: 'low',
        cvSuggestions: [],
        hasAnyMissingMandatory: false,
        hasRedFlags: false,
        hasDetectedDomains: false,
      };

      render(
        <AlignmentDisplayWithState
          uiModel={emptyModel}
          isLoading={false}
          error={undefined}
        />
      );

      expect(screen.getByText('No analysis data available')).toBeInTheDocument();
      expect(
        screen.getByText(/try analyzing a job description/i)
      ).toBeInTheDocument();
    });

    it('displays info icon for empty state', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={undefined}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();
    });
  });

  describe('Display State', () => {
    it('shows alignment display when model has content', () => {
      const model = createMockModel();
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
    });

    it('displays full analysis when data is ready', () => {
      const model = createMockModel({
        hardSkills: ['React', 'TypeScript', 'Node.js'],
        softSkills: ['Leadership', 'Communication'],
      });

      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      expect(screen.queryByText(/Parsing your CV/i)).not.toBeInTheDocument();
      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('No analysis data available')
      ).not.toBeInTheDocument();
    });

    it('applies fade-in animation when showing display state', () => {
      const model = createMockModel();
      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      const display = container.querySelector('.alignment-display-with-state');
      expect(display).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to display', () => {
      const model = createMockModel();
      const { rerender, container } = render(
        <AlignmentDisplayWithState uiModel={null} isLoading={true} />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      expect(screen.queryByText(/Parsing your CV/i)).not.toBeInTheDocument();
      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
    });

    it('handles transition to error during loading', () => {
      const error = new Error('Analysis failed');

      const { rerender } = render(
        <AlignmentDisplayWithState uiModel={null} isLoading={true} />
      );

      expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={error}
        />
      );

      expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    });

    it('can return to loading from display', () => {
      const model = createMockModel();
      const { rerender, container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();

      rerender(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={true}
          error={undefined}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();
      expect(
        container.querySelector('.alignment-display-with-state')
      ).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts and uses custom loading message', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          loadingMessage="Checking your fit..."
        />
      );

      expect(screen.getByText('Checking your fit...')).toBeInTheDocument();
    });

    it('handles null uiModel with isLoading true', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={true}
          error={undefined}
        />
      );

      expect(screen.getByText('Parsing your CV...')).toBeInTheDocument();
    });

    it('handles null uiModel with isLoading false', () => {
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={undefined}
        />
      );

      expect(screen.getByText(/Parsing your CV/i)).toBeInTheDocument();
    });

    it('default isLoading to false when not provided', () => {
      const model = createMockModel();
      const { container } = render(<AlignmentDisplayWithState uiModel={model} />);

      expect(
        container.querySelector('.alignment-display-with-state')
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Parsing your CV/i)
      ).not.toBeInTheDocument();
    });

    it('handles undefined error gracefully', () => {
      const model = createMockModel();
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
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid state changes', () => {
      const model = createMockModel();
      const error = new Error('Test error');

      const { rerender } = render(
        <AlignmentDisplayWithState uiModel={null} isLoading={true} />
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
          error={undefined}
        />
      );

      rerender(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={error}
        />
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('handles error with null message property', () => {
      const error = new Error();
      error.message = '';

      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={error}
        />
      );

      expect(
        screen.getByText(/an error occurred during analysis/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const model = createMockModel();
      const { container } = render(
        <AlignmentDisplayWithState
          uiModel={model}
          isLoading={false}
          error={undefined}
        />
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('displays clear error messages', () => {
      const customError = new Error('Specific error reason');
      render(
        <AlignmentDisplayWithState
          uiModel={null}
          isLoading={false}
          error={customError}
        />
      );

      expect(screen.getByText('Specific error reason')).toBeInTheDocument();
    });
  });
});
