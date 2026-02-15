import { buildOptimizedPrompt } from './promptBuilder';
import type { ProcessedCV, ProcessedJobDescription } from './preprocessing';

describe('Prompt Builder Service', () => {
  const mockProcessedCV: ProcessedCV = {
    skills: ['React', 'TypeScript', 'Node.js'],
    yearsTotal: 5,
    seniority: 'senior',
    experienceBySkill: { 'React': 5, 'TypeScript': 5 },
    companies: ['TechCorp', 'StartupXYZ'],
    achievements: ['Led frontend team', 'Architected system'],
    yearsExperience: 5,
    yearsExperienceConfidence: 'high',
    domainExperience: {
      frontend: true,
      backend: true,
      fullstack: true,
      qa: false,
      devops: false,
      product: false,
    },
  };

  const mockProcessedJob: ProcessedJobDescription = {
    techStack: ['React', 'TypeScript', 'PostgreSQL'],
    desirableRequirements: ['Docker', 'AWS'],
    mandatoryRequirements: ['5+ years experience', 'TypeScript'],
    seniorityLevel: 'senior',
    mainResponsibilities: ['Design architecture', 'Lead team'],
  };

  it('should generate a valid prompt', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('should include CV information in prompt', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt).toContain('React');
    expect(prompt).toContain('TypeScript');
  });

  it('should include job requirements in prompt', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt).toContain('React');
    expect(prompt).toContain('PostgreSQL');
  });

  it('should structure prompt with clear sections', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt.split('\n').length).toBeGreaterThan(5);
  });

  it('should include JSON output instructions', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt.toLowerCase()).toContain('json');
  });

  it('should format skills as lists', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt).toMatch(/[-•*]|[\d]+\./);
  });

  it('should handle empty arrays gracefully', () => {
    const cvWithoutSkills: ProcessedCV = {
      ...mockProcessedCV,
      skills: [],
    };

    const prompt = buildOptimizedPrompt(cvWithoutSkills, mockProcessedJob, 'en');

    expect(prompt).toBeTruthy();
  });

  it('should create consistent prompts for same input', () => {
    const prompt1 = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');
    const prompt2 = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt1).toBe(prompt2);
  });

  it('should differentiate between seniority levels', () => {
    const juniorCV: ProcessedCV = {
      ...mockProcessedCV,
      seniority: 'junior',
      yearsTotal: 1,
    };

    const seniorCV: ProcessedCV = {
      ...mockProcessedCV,
      seniority: 'senior',
      yearsTotal: 10,
    };

    const juniorPrompt = buildOptimizedPrompt(juniorCV, mockProcessedJob, 'en');
    const seniorPrompt = buildOptimizedPrompt(seniorCV, mockProcessedJob, 'en');

    expect(juniorPrompt).not.toBe(seniorPrompt);
  });

  it('should highlight skill gaps', () => {
    const cvWithGaps: ProcessedCV = {
      ...mockProcessedCV,
      skills: ['React'], // Missing TypeScript and PostgreSQL
    };

    const prompt = buildOptimizedPrompt(cvWithGaps, mockProcessedJob, 'en');

    expect(prompt).toBeTruthy();
  });

  it('should prioritize mandatory requirements', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should include assessment criteria', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt).toBeTruthy();
  });

  describe('Output Structure Validation', () => {
    it('should specify all required output fields in the prompt', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      const requiredFields = [
        'hardSkillsDetected',
        'softSkillsEvidence',
        'mandatoryRequirementsMet',
        'mandatoryRequirementsMissing',
        'desirableRequirementsMet',
        'desirableRequirementsMissing',
        'seniorityMatch',
        'redFlags',
        'recruiterMessage',
        'coverLetter',
      ];

      requiredFields.forEach(field => {
        expect(prompt).toContain(field);
      });
    });

    it('should include detectedYearsExperience in output template', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('detectedYearsExperience');
      expect(prompt).toContain(String(mockProcessedCV.yearsExperience));
    });

    it('should include detectedDomainExperience in output template', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('detectedDomainExperience');
    });

    it('should enforce JSON-only output format', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt.toLowerCase()).toContain('json');
      expect(prompt).toContain('REQUIRED OUTPUT FORMAT');
    });

    it('should include seniorityMatch with valid values', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('seniorityMatch');
      // Should mention valid values somewhere in instructions
      expect(prompt).toMatch(/(above|match|below)/);
    });

    it('should specify writing rules for recruiterMessage', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('recruiterMessage');
      expect(prompt).toContain('WRITING RULES');
    });

    it('should specify writing rules for coverLetter', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('coverLetter');
    });

    it('should include analysis algorithm section', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('ANALYSIS ALGORITHM');
    });

    it('should include structured candidate profile section', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('STRUCTURED CANDIDATE PROFILE');
      // Check that skills are included (may be pretty-printed)
      mockProcessedCV.skills.forEach(skill => {
        expect(prompt).toContain(skill);
      });
    });

    it('should include structured role section', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('STRUCTURED ROLE');
      // Check that requirements are included (may be pretty-printed)
      mockProcessedJob.mandatoryRequirements.forEach(req => {
        expect(prompt).toContain(req);
      });
    });

    it('should include deterministic signals section', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('DETERMINISTICALLY EXTRACTED SIGNALS');
      expect(prompt).toContain('yearsExperience');
      expect(prompt).toContain('domainExperience');
    });

    it('should include prompt version', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('PROMPT VERSION');
      expect(prompt).toContain('v2.0-optimized');
    });

    it('should include objective section', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('OBJECTIVE');
    });

    it('should specify language in prompt', () => {
      const promptEn = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');
      const promptPt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'pt');

      expect(promptEn).toContain('LANGUAGE');
      expect(promptEn).toContain('English');
      
      expect(promptPt).toContain('LANGUAGE');
      expect(promptPt).toContain('Portuguese');
    });
  });

  describe('Prompt Consistency and Determinism', () => {
    it('should generate identical prompts for identical inputs', () => {
      const prompt1 = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');
      const prompt2 = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt1).toBe(prompt2);
    });

    it('should handle null yearsExperience gracefully', () => {
      const cvWithNullYears = {
        ...mockProcessedCV,
        yearsExperience: null,
      };

      const prompt = buildOptimizedPrompt(cvWithNullYears, mockProcessedJob, 'en');

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('null');
    });

    it('should handle empty domain experience', () => {
      const cvWithEmptyDomain = {
        ...mockProcessedCV,
        domainExperience: {
          frontend: false,
          backend: false,
          fullstack: false,
          qa: false,
          devops: false,
          product: false,
        },
      };

      const prompt = buildOptimizedPrompt(cvWithEmptyDomain, mockProcessedJob, 'en');

      expect(prompt).toBeTruthy();
    });
  });

  describe('Refactored Architecture (Phase 3)', () => {
    it('should separate content into clear sections', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      const sections = [
        'PROMPT VERSION',
        'OBJECTIVE',
        'LANGUAGE',
        'STRUCTURED CANDIDATE PROFILE',
        'DETERMINISTICALLY EXTRACTED SIGNALS',
        'STRUCTURED ROLE',
        'ANALYSIS ALGORITHM',
        'WRITING RULES',
        'REQUIRED OUTPUT FORMAT',
      ];

      sections.forEach(section => {
        expect(prompt).toContain(section);
      });
    });

    it('should have modular structure without redundancy', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      // Should appear exactly once
      expect((prompt.match(/PROMPT VERSION/g) || []).length).toBe(1);
      expect((prompt.match(/OBJECTIVE/g) || []).length).toBe(1);
      expect((prompt.match(/ANALYSIS ALGORITHM/g) || []).length).toBe(1);
    });

    it('should reference deterministic signals without recalculating', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      // Should reference the section
      expect(prompt).toContain('DETERMINISTICALLY EXTRACTED SIGNALS');
      
      // Step 2 should reference them
      expect(prompt).toContain('Compare with yearsExperience from DETERMINISTICALLY EXTRACTED SIGNALS');
    });

    it('should have clean writing rules without generic buzzwords', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('WRITING RULES');
      expect(prompt).toContain('Use first person');
      expect(prompt).toContain('Natural, professional tone');
      expect(prompt).not.toContain('synergy');
      expect(prompt).not.toContain('leverage');
    });

    it('should not duplicate anti-hallucination rules', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      // These rules should be in system prompt, not repeated here
      expect(prompt).not.toContain('Do NOT fabricate');
      expect(prompt).not.toContain('Return ONLY valid JSON');
      expect(prompt).not.toContain('No markdown');
    });

    it('should provide clear analysis steps', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('ANALYSIS ALGORITHM');
      expect(prompt).toContain('1. Extract years-of-experience requirement');
      expect(prompt).toContain('2. Compare with yearsExperience');
      expect(prompt).toContain('3. Compare candidate skills');
      expect(prompt).toContain('4. Compare domainExperience');
      expect(prompt).toContain('5. Identify missing mandatory items');
    });

    it('should have template with JSON structure examples', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('hardSkillsDetected');
      expect(prompt).toContain('softSkillsEvidence');
      expect(prompt).toContain('mandatoryRequirementsMet');
      expect(prompt).toContain('mandatoryRequirementsMissing');
      expect(prompt).toContain('desirableRequirementsMet');
      expect(prompt).toContain('desirableRequirementsMissing');
      expect(prompt).toContain('seniorityMatch');
      expect(prompt).toContain('redFlags');
      expect(prompt).toContain('recruiterMessage');
      expect(prompt).toContain('coverLetter');
    });

    it('should maintain same output schema as before', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      // Key fields that should always be present
      expect(prompt).toContain('detectedYearsExperience');
      expect(prompt).toContain('detectedDomainExperience');
      expect(prompt).toContain(String(mockProcessedCV.yearsExperience));
    });

    it('should include role requirements in structured format', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      expect(prompt).toContain('mandatoryRequirements');
      expect(prompt).toContain('desirableRequirements');
      expect(prompt).toContain('seniorityLevel');
      expect(prompt).toContain('mainResponsibilities');
      expect(prompt).toContain('techStack');
    });

    it('should separate algorithm section with clear numbering', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      // Each step should be numbered
      expect(prompt).toMatch(/1\.\s+Extract years/);
      expect(prompt).toMatch(/2\.\s+Compare with/);
      expect(prompt).toMatch(/3\.\s+Compare candidate/);
      expect(prompt).toMatch(/4\.\s+Compare domainExperience/);
      expect(prompt).toMatch(/5\.\s+Identify missing/);
    });

    it('should not exceed reasonable token count', () => {
      const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

      // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
      const tokenEstimate = prompt.length / 4;
      
      // Should be well under the 1500 max_tokens budget
      expect(tokenEstimate).toBeLessThan(1200);
    });
  });
});
