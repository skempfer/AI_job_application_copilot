import { describe, it } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SeniorityBadge } from './SeniorityBadge';
import { DomainBadges } from './DomainBadges';
import { RequirementsSection } from './RequirementsSection';
import { RedFlagsSection } from './RedFlagsSection';
import { SkillsDisplay } from './SkillsDisplay';
import { AlignmentDisplay } from './AlignmentDisplay';
import type { SeniorityUIInfo, AlignmentUIModel } from '../../../../types/analysis';

describe('Alignment Display Components', () => {
  describe('SeniorityBadge', () => {
    it('renders seniority match with label and explanation', () => {
      const seniorityInfo: SeniorityUIInfo = {
        match: 'match',
        label: 'Seniority Match',
        badgeClass: 'badge-success',
        priority: 'success',
        explanation: 'Your experience aligns with requirements',
        detectedYears: 5,
        expectedSeniority: 'mid',
      };

      render(<SeniorityBadge info={seniorityInfo} />);

      expect(screen.getByText('Seniority Match')).toBeInTheDocument();
      expect(screen.getByText('Your experience aligns with requirements')).toBeInTheDocument();
      expect(screen.getByText('5 years detected')).toBeInTheDocument();
    });

    it('handles null years gracefully', () => {
      const seniorityInfo: SeniorityUIInfo = {
        match: 'below',
        label: 'Seniority Below Expected',
        badgeClass: 'badge-warning',
        priority: 'warning',
        explanation: 'Experience below requirements',
        detectedYears: null,
        expectedSeniority: 'senior',
      };

      render(<SeniorityBadge info={seniorityInfo} />);

      expect(screen.getByText('Seniority Below Expected')).toBeInTheDocument();
      expect(screen.queryByText(/years detected/)).not.toBeInTheDocument();
    });

    it('uses correct badge class for styling', () => {
      const seniorityInfo: SeniorityUIInfo = {
        match: 'above',
        label: 'Senior Match',
        badgeClass: 'badge-success badge-lg',
        priority: 'success',
        explanation: 'Above expectations',
        detectedYears: 10,
        expectedSeniority: 'mid',
      };

      const { container } = render(<SeniorityBadge info={seniorityInfo} />);
      const badge = container.querySelector('.badge-success');

      expect(badge).toBeInTheDocument();
    });
  });

  describe('DomainBadges', () => {
    it('renders detected domains as badges', () => {
      const domains = [
        { domain: 'backend' as const, label: 'Backend', badgeClass: 'badge-purple' },
        { domain: 'devops' as const, label: 'DevOps', badgeClass: 'badge-orange' },
      ];

      render(<DomainBadges domains={domains} />);

      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('DevOps')).toBeInTheDocument();
      expect(screen.getByText('🎯 Detected Roles')).toBeInTheDocument();
    });

    it('returns null when no domains detected', () => {
      const { container } = render(<DomainBadges domains={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('applies correct badge classes', () => {
      const domains = [
        { domain: 'backend' as const, label: 'Backend', badgeClass: 'badge-purple' },
      ];

      const { container } = render(<DomainBadges domains={domains} />);
      const badge = container.querySelector('.badge-purple');

      expect(badge).toBeInTheDocument();
    });
  });

  describe('RequirementsSection', () => {
    it('renders requirements grouped by category', () => {
      const requirements = {
        mandatory: {
          met: [{ text: 'Node.js experience', category: 'mandatory' as const, status: 'met' as const }],
          missing: [{ text: 'React experience', category: 'mandatory' as const, status: 'missing' as const }],
        },
        desirable: {
          met: [{ text: 'Docker knowledge', category: 'desirable' as const, status: 'met' as const }],
          missing: [{ text: 'Kubernetes', category: 'desirable' as const, status: 'missing' as const }],
        },
      };

      render(<RequirementsSection requirements={requirements} />);

      expect(screen.getByText('📋 Requirements Analysis')).toBeInTheDocument();
      expect(screen.getByText('Node.js experience')).toBeInTheDocument();
      expect(screen.getByText('React experience')).toBeInTheDocument();
      expect(screen.getByText('Docker knowledge')).toBeInTheDocument();
    });

    it('returns null when no requirements', () => {
      const requirements = {
        mandatory: { met: [], missing: [] },
        desirable: { met: [], missing: [] },
      };

      const { container } = render(<RequirementsSection requirements={requirements} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('RedFlagsSection', () => {
    it('renders red flags with warning icon', () => {
      const redFlags = ['No production experience', 'Limited team background'];

      render(<RedFlagsSection redFlags={redFlags} />);

      expect(screen.getByText('⚠️ Points of Attention')).toBeInTheDocument();
      expect(screen.getByText('No production experience')).toBeInTheDocument();
      expect(screen.getByText('Limited team background')).toBeInTheDocument();
    });

    it('returns null when no red flags', () => {
      const { container } = render(<RedFlagsSection redFlags={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('SkillsDisplay', () => {
    it('renders years of experience with confidence', () => {
      render(
        <SkillsDisplay
          hardSkills={[]}
          softSkills={[]}
          yearsExperience={5}
          yearsConfidence="high"
        />
      );

      expect(screen.getByText('🛠️ Detected Profile')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('High confidence')).toBeInTheDocument();
    });

    it('renders hard and soft skills', () => {
      render(
        <SkillsDisplay
          hardSkills={['Node.js', 'Python']}
          softSkills={['Communication', 'Leadership']}
          yearsExperience={3}
          yearsConfidence="medium"
        />
      );

      expect(screen.getByText('Technical Skills')).toBeInTheDocument();
      expect(screen.getByText('Soft Skills')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });

    it('returns null when no data', () => {
      const { container } = render(
        <SkillsDisplay
          hardSkills={[]}
          softSkills={[]}
          yearsExperience={null}
          yearsConfidence="low"
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('AlignmentDisplay', () => {
    const mockUIModel: AlignmentUIModel = {
      fitScore: 85,
      decision: 'apply',
      detectedLanguage: 'en',
      seniority: {
        match: 'match',
        label: 'Seniority Match',
        badgeClass: 'badge-success',
        priority: 'success',
        explanation: 'Good alignment',
        detectedYears: 5,
        expectedSeniority: 'mid',
      },
      requirements: {
        mandatory: { met: [], missing: [] },
        desirable: { met: [], missing: [] },
      },
      hardSkills: ['Node.js', 'React'],
      softSkills: ['Communication'],
      detectedDomains: [
        { domain: 'backend' as const, label: 'Backend', badgeClass: 'badge-purple' },
      ],
      redFlags: ['Limited experience'],
      recruiterMessage: 'Great candidate',
      coverLetter: 'Dear Hiring Manager...',
      yearsExperience: 5,
      yearsConfidence: 'high',
      cvSuggestions: ['Add React projects'],
      hasAnyMissingMandatory: false,
      hasRedFlags: true,
      hasDetectedDomains: true,
    };

    it('renders main container', () => {
      const { container } = render(<AlignmentDisplay uiModel={mockUIModel} />);

      expect(container.querySelector('.alignment-display')).toBeInTheDocument();
    });

    it('renders seniority section', () => {
      render(<AlignmentDisplay uiModel={mockUIModel} />);

      expect(screen.getByText('Seniority Match')).toBeInTheDocument();
    });

    it('renders domain badges when available', () => {
      render(<AlignmentDisplay uiModel={mockUIModel} />);

      expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('renders messages', () => {
      render(<AlignmentDisplay uiModel={mockUIModel} />);

      expect(screen.getByText('Great candidate')).toBeInTheDocument();
      expect(screen.getByText('Dear Hiring Manager...')).toBeInTheDocument();
    });

    it('renders red flags when present', () => {
      render(<AlignmentDisplay uiModel={mockUIModel} />);

      expect(screen.getByText('Limited experience')).toBeInTheDocument();
    });

    it('does not render red flags section when empty', () => {
      const modelNoFlags = { ...mockUIModel, redFlags: [], hasRedFlags: false };

      const { container } = render(<AlignmentDisplay uiModel={modelNoFlags} />);

      expect(container.textContent).not.toContain('Points of Attention');
    });
  });
});
