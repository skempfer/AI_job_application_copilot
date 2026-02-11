import { analyzeGap, GapAnalyzerError, setAIClient } from './gapAnalyzerService';
import type { StructuredCV } from '../types/analysis';
import OpenAI from 'openai';

const mockStructuredCV: StructuredCV = {
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  technologies: ['AWS', 'Docker', 'PostgreSQL'],
  seniorityLevel: 'senior',
  yearsOfExperience: 7,
  languages: ['English', 'Portuguese'],
  education: ['Computer Science B.S.'],
  certifications: ['AWS Certified'],
  strengths: ['Full-stack development', 'Team leadership'],
};

describe('GapAnalyzerService', () => {
  beforeAll(() => {
    const mockAIClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    skills: ['TypeScript', 'React', 'Node.js'],
                    technologies: ['AWS', 'Docker', 'PostgreSQL', 'Kubernetes', 'GraphQL'],
                  }),
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI;
    setAIClient(mockAIClient);
  });

  describe('analyzeGap', () => {
    it('should calculate high match score when skills align perfectly', async () => {
      const jobDescription = `
        We need a Senior Full-stack Developer with strong skills in:
        - TypeScript and React for frontend
        - Node.js for backend
        - AWS cloud infrastructure
        - Docker containerization
        - PostgreSQL database
      `;

      const result = await analyzeGap(mockStructuredCV, jobDescription);

      expect(result.matchScore).toBeGreaterThan(50);
      expect(result.strongMatches.length).toBeGreaterThan(0);
    });

    it('should identify missing critical skills', async () => {
      const jobDescription = `
        We require expertise in Kubernetes, Kubernetes, Kubernetes.
        GraphQL is also critical. GraphQL must be strong.
        React is nice to have.
      `;

      const result = await analyzeGap(mockStructuredCV, jobDescription);

      expect(result.missingCriticalSkills.length).toBeGreaterThan(0);
    });

    it('should suggest focus areas for missing requirements', async () => {
      const jobDescription = `
        Looking for a developer with Python, Django, and FastAPI experience.
      `;

      const result = await analyzeGap(mockStructuredCV, jobDescription);

      expect(result.suggestedFocusAreas.length).toBeGreaterThan(0);
    });

    it('should throw GapAnalyzerError on empty job description', async () => {
      await expect(analyzeGap(mockStructuredCV, '')).rejects.toThrow(GapAnalyzerError);
      await expect(analyzeGap(mockStructuredCV, '')).rejects.toMatchObject({
        code: 'JOB_DESCRIPTION_EMPTY',
      });
    });
  });
});
