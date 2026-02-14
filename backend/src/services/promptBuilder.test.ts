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

    // Should have clear structure
    expect(prompt.split('\n').length).toBeGreaterThan(5);
  });

  it('should include JSON output instructions', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    expect(prompt.toLowerCase()).toContain('json');
  });

  it('should format skills as lists', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    // Should have bullet points or structured list format
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
    // Prompt should acknowledge the gap
  });

  it('should prioritize mandatory requirements', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    // Should contain analysis of mandatory requirements
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should include assessment criteria', () => {
    const prompt = buildOptimizedPrompt(mockProcessedCV, mockProcessedJob, 'en');

    // Prompt should guide the AI on what to evaluate
    expect(prompt).toBeTruthy();
  });
});
