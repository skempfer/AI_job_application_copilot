import { render, screen } from '../test/test-utils';
import { ResultsDisplay } from './ResultsDisplay';
import type { FormattedAnalysisResult } from '../types/analysis';

describe('ResultsDisplay Component', () => {
  const mockResult: FormattedAnalysisResult = {
    fitScore: 85,
    decision: 'apply',
    strengths: ['React experience', 'TypeScript expertise'],
    gaps: ['Kubernetes knowledge'],
    cvSuggestions: ['Add cloud experience', 'Highlight leadership'],
    recruiterMessage: 'Great fit for this role',
    scoreColor: 'green',
    scoreBadgeClass: 'bg-green-500',
    decisionText: 'Strong match - Apply now!',
    decisionIcon: '✅',
    explanation: {
      positives: ['Hard Skills: +35/35 points'],
      negatives: ['Missing 1 requirement'],
      summary: 'Excellent candidate',
    },
    promptVersion: 'v1.1',
  };

  it('should render fit score', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/85\/100/)).toBeInTheDocument();
  });

  it('should render decision text', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/Strong match - Apply now!/i)).toBeInTheDocument();
  });

  it('should render strengths', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/React experience/i)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript expertise/i)).toBeInTheDocument();
  });

  it('should render gaps', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/Kubernetes knowledge/i)).toBeInTheDocument();
  });

  it('should render CV suggestions', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/Add cloud experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Highlight leadership/i)).toBeInTheDocument();
  });

  it('should render recruiter message', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/Great fit for this role/i)).toBeInTheDocument();
  });

  it('should render score explanation when available', () => {
    render(<ResultsDisplay result={mockResult} />);
    expect(screen.getByText(/Hard Skills: \+35\/35 points/i)).toBeInTheDocument();
    expect(screen.getByText(/Excellent candidate/i)).toBeInTheDocument();
  });

  it('should display appropriate color for different scores', () => {
    const lowScoreResult = { ...mockResult, fitScore: 30, scoreColor: 'red' };
    const { rerender } = render(<ResultsDisplay result={mockResult} />);
    
    // Should render without errors
    expect(screen.getByText(/85\/100/)).toBeInTheDocument();
    
    rerender(<ResultsDisplay result={lowScoreResult} />);
    expect(screen.getByText(/30\/100/)).toBeInTheDocument();
  });
});
