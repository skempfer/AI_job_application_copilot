import { buildOptimizedPrompt, estimateTokenCount } from './promptBuilder';
import type { ProcessedCV, ProcessedJobDescription } from './preprocessing';

describe('Prompt Builder Service', () => {
  const mockFullCV = `John Doe
Senior Full Stack Engineer
5 years of experience with React, TypeScript, and Node.js
TechCorp (2019-2022): Led frontend team, architected scalable systems
StartupXYZ (2022-present): Built microservices architecture`;

  const mockFullJob = `Senior Full Stack Engineer
5+ years experience required
Must have: TypeScript, React, PostgreSQL
Nice to have: Docker, AWS
Lead team and design architecture`;

  const mockProcessedCV: ProcessedCV = {
    skills: ['React', 'TypeScript', 'Node.js'],
    seniority: 'senior',
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

  describe('buildOptimizedPrompt', () => {
    it('should generate a prompt with full CV and job description texts', () => {
      const result = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'en');
      
      expect(result).toContain('FULL CANDIDATE CV');
      expect(result).toContain('FULL JOB DESCRIPTION');
      expect(result).toContain(mockFullCV);
      expect(result).toContain(mockFullJob);
    });

    it('should include preprocessed signals as reference', () => {
      const result = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'en');
      
      expect(result).toContain('PREPROCESSED STRUCTURED SIGNALS');
      expect(result).toContain('React');
      expect(result).toContain('TypeScript');
    });

    it('should include anti-hallucination instructions', () => {
      const result = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'en');
      
      expect(result).toContain('ANTI-HALLUCINATION');
      expect(result).toContain('NEVER invent');
    });

    it('should set correct output language', () => {
      const resultEn = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'en');
      const resultPt = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'pt');
      
      expect(resultEn).toContain('English');
      expect(resultPt).toContain('Portuguese');
    });

    it('should include version identifier', () => {
      const result = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'en');
      
      expect(result).toContain('v3.0-full-context');
    });

    it('should include analysis instructions', () => {
      const result = buildOptimizedPrompt(mockFullCV, mockFullJob, mockProcessedCV, mockProcessedJob, 'en');
      
      expect(result).toContain('ANALYSIS INSTRUCTIONS');
      expect(result).toContain('YEARS OF EXPERIENCE');
      expect(result).toContain('SKILLS MATCHING');
    });
  });

  describe('estimateTokenCount', () => {
    it('should estimate token count approximately', () => {
      const text = 'This is a test string with approximately 10 tokens';
      const estimate = estimateTokenCount(text);
      
      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(text.length);
    });

    it('should handle empty strings', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    it('should use 1 token per 4 characters heuristic', () => {
      const text = 'a'.repeat(400);
      const estimate = estimateTokenCount(text);
      
      expect(estimate).toBe(100);
    });
  });
});
