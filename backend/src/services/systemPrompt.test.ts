import { SYSTEM_PROMPT, getSystemPrompt } from './systemPrompt';

describe('System Prompt Module', () => {
  describe('SYSTEM_PROMPT constant', () => {
    it('should be defined and non-empty', () => {
      expect(SYSTEM_PROMPT).toBeDefined();
      expect(typeof SYSTEM_PROMPT).toBe('string');
      expect(SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it('should include output format rules', () => {
      expect(SYSTEM_PROMPT).toContain('OUTPUT FORMAT RULES');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('json');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('markdown');
    });

    it('should include data handling principles', () => {
      expect(SYSTEM_PROMPT).toContain('DATA HANDLING PRINCIPLES');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('fabricate');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('structured input');
    });

    it('should include validation rules', () => {
      expect(SYSTEM_PROMPT).toContain('VALIDATION');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('array');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('redflag');
    });

    it('should prohibit hallucination', () => {
      expect(SYSTEM_PROMPT).toMatch(/do not fabricate/i);
      expect(SYSTEM_PROMPT).toMatch(/do not make assumptions/i);
    });

    it('should prohibit recalculating deterministic signals', () => {
      expect(SYSTEM_PROMPT).toMatch(/do not recalculate deterministic signals/i);
      expect(SYSTEM_PROMPT).toContain('yearsExperience');
      expect(SYSTEM_PROMPT).toContain('domainExperience');
    });

    it('should enforce JSON-only output', () => {
      expect(SYSTEM_PROMPT).toMatch(/return only valid json/i);
      expect(SYSTEM_PROMPT).toMatch(/no markdown/i);
      expect(SYSTEM_PROMPT).toMatch(/no explanatory text/i);
    });

    it('should define role as specialized assistant', () => {
      expect(SYSTEM_PROMPT).toContain('job fit analysis assistant');
    });

    it('should not contain task-specific instructions', () => {
      // System prompt should not contain task-specific details
      // These belong in the user prompt
      expect(SYSTEM_PROMPT).not.toContain('candidate profile');
      expect(SYSTEM_PROMPT).not.toContain('mandatory requirement');
      expect(SYSTEM_PROMPT).not.toContain('cover letter');
      expect(SYSTEM_PROMPT).not.toContain('recruiter message');
    });

    it('should not contain placeholders or variables', () => {
      // System prompt should be static and invariant
      expect(SYSTEM_PROMPT).not.toContain('${');
      expect(SYSTEM_PROMPT).not.toContain('{{');
    });
  });

  describe('getSystemPrompt function', () => {
    it('should return the same prompt as SYSTEM_PROMPT constant', () => {
      const result = getSystemPrompt();
      expect(result).toBe(SYSTEM_PROMPT);
    });

    it('should return same prompt for openai provider', () => {
      const result = getSystemPrompt('openai');
      expect(result).toBe(SYSTEM_PROMPT);
    });

    it('should return consistent results', () => {
      const result1 = getSystemPrompt();
      const result2 = getSystemPrompt();
      const result3 = getSystemPrompt('openai');

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should be a pure function (no side effects)', () => {
      const before = SYSTEM_PROMPT;
      getSystemPrompt();
      getSystemPrompt('openai');
      const after = SYSTEM_PROMPT;

      expect(after).toBe(before);
    });
  });

  describe('System vs User Prompt Separation', () => {
    it('should contain only invariant rules', () => {
      // System prompt should contain rules that apply to ALL requests
      // Not specific to any particular analysis
      const invariantKeywords = [
        'output format',
        'json',
        'data handling',
        'validation',
        'fabricate',
        'structured input',
      ];

      invariantKeywords.forEach((keyword) => {
        expect(SYSTEM_PROMPT.toLowerCase()).toContain(keyword.toLowerCase());
      });
    });

    it('should be language-agnostic', () => {
      // System prompt should not contain language-specific content
      // Language selection belongs in user prompt
      expect(SYSTEM_PROMPT).not.toMatch(/portuguese|português/i);
      expect(SYSTEM_PROMPT).not.toMatch(/\ben\b|\bpt\b/); // language codes
    });

    it('should not contain prompt version information', () => {
      // Versioning belongs in user prompt to track iterations
      expect(SYSTEM_PROMPT).not.toMatch(/v\d+\.\d+/i);
      expect(SYSTEM_PROMPT).not.toContain('version');
    });
  });

  describe('Documentation and Maintainability', () => {
    it('should have clear section headers', () => {
      const sections = [
        'OUTPUT FORMAT RULES',
        'DATA HANDLING PRINCIPLES',
        'VALIDATION',
      ];

      sections.forEach((section) => {
        expect(SYSTEM_PROMPT).toContain(section);
      });
    });

    it('should use imperative language for rules', () => {
      // Rules should be clear commands
      expect(SYSTEM_PROMPT).toMatch(/return only/i);
      expect(SYSTEM_PROMPT).toMatch(/do not/i);
      expect(SYSTEM_PROMPT).toMatch(/use only/i);
    });

    it('should be concise enough to minimize token usage', () => {
      // System prompt is sent with every request
      // Should be comprehensive but not verbose
      const tokenEstimate = SYSTEM_PROMPT.split(/\s+/).length;
      expect(tokenEstimate).toBeLessThan(300); // Reasonable upper bound
      expect(tokenEstimate).toBeGreaterThan(50); // Need sufficient detail
    });
  });
});
