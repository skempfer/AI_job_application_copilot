import { render, screen } from '@testing-library/react';
import { AlignmentDisplay } from './AlignmentDisplay';
import type { AlignmentUIModel } from '../../../../types/analysis';

const createMockModel = (overrides?: Partial<AlignmentUIModel>): AlignmentUIModel => ({
  fitScore: 75,
  decision: 'apply',
  detectedLanguage: 'en',
  seniority: {
    match: 'match',
    label: 'Perfect Match',
    badgeClass: 'badge-success',
    priority: 'success',
    explanation: 'Your experience aligns well with the role',
    detectedYears: 5,
    expectedSeniority: 'mid',
  },
  requirements: {
    mandatory: {
      met: [
        { text: 'React', category: 'mandatory', status: 'met' },
        { text: 'TypeScript', category: 'mandatory', status: 'met' },
      ],
      missing: [],
    },
    desirable: {
      met: [{ text: 'Docker', category: 'desirable', status: 'met' }],
      missing: [{ text: 'Kubernetes', category: 'desirable', status: 'missing' }],
    },
  },
  hardSkills: ['React', 'TypeScript', 'Node.js'],
  softSkills: ['Communication', 'Leadership'],
  detectedDomains: [
    { domain: 'frontend', label: 'Frontend Developer', badgeClass: 'badge-info' },
  ],
  redFlags: [],
  recruiterMessage: 'Great candidate',
  coverLetter: 'Looking forward to this opportunity',
  yearsExperience: 5,
  yearsConfidence: 'high',
  cvSuggestions: [],
  hasAnyMissingMandatory: false,
  hasRedFlags: false,
  hasDetectedDomains: true,
  ...overrides,
});

describe('AlignmentDisplay - Edge Cases', () => {
  it('renders complete alignment with all fields', () => {
    const model = createMockModel();
    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
    expect(screen.getByText('Great candidate')).toBeInTheDocument();
  });

  it('handles missing mandatory requirements', () => {
    const model = createMockModel({
      requirements: {
        mandatory: {
          met: [{ text: 'React', category: 'mandatory', status: 'met' }],
          missing: [
            { text: 'Node.js', category: 'mandatory', status: 'missing' },
            { text: 'AWS', category: 'mandatory', status: 'missing' },
          ],
        },
        desirable: { met: [], missing: [] },
      },
      hasAnyMissingMandatory: true,
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
  });

  it('handles no domains detected', () => {
    const model = createMockModel({
      detectedDomains: [],
      hasDetectedDomains: false,
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
  });

  it('handles empty hard skills array', () => {
    const model = createMockModel({
      hardSkills: [],
      softSkills: ['Communication'],
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('handles empty soft skills array', () => {
    const model = createMockModel({
      hardSkills: ['React'],
      softSkills: [],
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('handles null years of experience', () => {
    const model = createMockModel({
      yearsExperience: null,
      yearsConfidence: 'low',
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
  });

  it('handles empty recruiter message', () => {
    const model = createMockModel({
      recruiterMessage: '',
      coverLetter: 'Some cover letter',
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
  });

  it('handles empty cover letter', () => {
    const model = createMockModel({
      recruiterMessage: 'Some message',
      coverLetter: '',
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Some message')).toBeInTheDocument();
  });

  it('handles critically low fit score', () => {
    const model = createMockModel({
      fitScore: 0,
      decision: 'skip',
      requirements: {
        mandatory: {
          met: [],
          missing: [
            { text: 'Node.js', category: 'mandatory', status: 'missing' },
            { text: 'React', category: 'mandatory', status: 'missing' },
          ],
        },
        desirable: { met: [], missing: [] },
      },
      hasAnyMissingMandatory: true,
    });

    render(<AlignmentDisplay uiModel={model} />);

    const container = screen.getByText('Perfect Match').closest('.alignment-display');
    expect(container?.className).toContain('alignment-display--');
  });

  it('handles all content missing', () => {
    const model = createMockModel({
      hardSkills: [],
      softSkills: [],
      detectedDomains: [],
      redFlags: [],
      recruiterMessage: '',
      coverLetter: '',
      cvSuggestions: [],
      requirements: {
        mandatory: { met: [], missing: [] },
        desirable: { met: [], missing: [] },
      },
      hasAnyMissingMandatory: false,
      hasRedFlags: false,
      hasDetectedDomains: false,
    });

    const { container } = render(<AlignmentDisplay uiModel={model} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles seniority below expected', () => {
    const model = createMockModel({
      seniority: {
        match: 'below',
        label: 'Below Expected',
        badgeClass: 'badge-warning',
        priority: 'warning',
        explanation: 'Your experience is below what this role typically requires',
        detectedYears: 2,
        expectedSeniority: 'senior',
      },
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Below Expected')).toBeInTheDocument();
  });

  it('handles seniority above expected', () => {
    const model = createMockModel({
      seniority: {
        match: 'above',
        label: 'Above Expected',
        badgeClass: 'badge-lg badge-success',
        priority: 'success',
        explanation: 'Your experience exceeds the requirements',
        detectedYears: 10,
        expectedSeniority: 'mid',
      },
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Above Expected')).toBeInTheDocument();
  });

  it('handles red flags appropriately', () => {
    const model = createMockModel({
      redFlags: [
        'Overqualified for the position',
        'Salary expectations may not align',
      ],
      hasRedFlags: true,
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(
      screen.getByText('Overqualified for the position')
    ).toBeInTheDocument();
  });

  it('handles empty CV suggestions array', () => {
    const model = createMockModel({
      cvSuggestions: [],
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
  });

  it('handles multiple CV suggestions', () => {
    const model = createMockModel({
      cvSuggestions: [
        'Add more detail about AWS experience',
        'Highlight containerization projects',
      ],
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
  });

  it('renders priority styling for critical state', () => {
    const model = createMockModel({
      fitScore: 15,
      decision: 'skip',
      requirements: {
        mandatory: {
          met: [],
          missing: [
            { text: 'Required Skill 1', category: 'mandatory', status: 'missing' },
            { text: 'Required Skill 2', category: 'mandatory', status: 'missing' },
            { text: 'Required Skill 3', category: 'mandatory', status: 'missing' },
          ],
        },
        desirable: { met: [], missing: [] },
      },
      hasAnyMissingMandatory: true,
    });

    const { container } = render(<AlignmentDisplay uiModel={model} />);

    const display = container.querySelector('.alignment-display');
    expect(display?.className).toMatch(/alignment-display--/);
  });

  it('renders priority styling for warning state', () => {
    const model = createMockModel({
      seniority: {
        match: 'below',
        label: 'Below',
        badgeClass: 'badge-warning',
        priority: 'warning',
        explanation: 'Below',
        detectedYears: 2,
        expectedSeniority: 'senior',
      },
    });

    const { container } = render(<AlignmentDisplay uiModel={model} />);

    const display = container.querySelector('.alignment-display');
    expect(display?.className).toMatch(/alignment-display--/);
  });

  it('handles mixed requirement states', () => {
    const model = createMockModel({
      requirements: {
        mandatory: {
          met: [
            { text: 'React', category: 'mandatory', status: 'met' },
            { text: 'TypeScript', category: 'mandatory', status: 'met' },
          ],
          missing: [{ text: 'AWS', category: 'mandatory', status: 'missing' }],
        },
        desirable: {
          met: [{ text: 'Docker', category: 'desirable', status: 'met' }],
          missing: [
            { text: 'K8s', category: 'desirable', status: 'missing' },
          ],
        },
      },
      hasAnyMissingMandatory: true,
    });

    const { container } = render(<AlignmentDisplay uiModel={model} />);

    const requirementItems = container.querySelectorAll('.requirement-item');
    expect(requirementItems.length).toBeGreaterThan(0);
  });

  it('handles very long text content', () => {
    const longMessage =
      'This is a very long recruiter message that contains detailed feedback about the candidate and their fit for the position. It includes multiple paragraphs and discusses various aspects of their experience and qualifications.';

    const model = createMockModel({
      recruiterMessage: longMessage,
    });

    render(<AlignmentDisplay uiModel={model} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles all optional fields populated', () => {
    const fullModel = createMockModel({
      yearsExperience: 8,
      yearsConfidence: 'high',
      cvSuggestions: [
        'Suggestion 1',
        'Suggestion 2',
        'Suggestion 3',
      ],
      hardSkills: [
        'React',
        'TypeScript',
        'Node.js',
        'AWS',
        'Docker',
      ],
      softSkills: [
        'Leadership',
        'Communication',
        'Problem Solving',
      ],
    });

    render(<AlignmentDisplay uiModel={fullModel} />);

    expect(screen.getByText('Perfect Match')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
