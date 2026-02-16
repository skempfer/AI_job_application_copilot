import { SYSTEM_PROMPT } from './systemPrompt';

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
      expect(SYSTEM_PROMPT).toContain('EVIDENCE-BASED DATA HANDLING');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('fabricate');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('use only information');
    });

    it('should include validation rules', () => {
      expect(SYSTEM_PROMPT).toContain('VALIDATION REQUIREMENTS');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('cv evidence');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('redflag');
    });

    it('should prohibit hallucination', () => {
      expect(SYSTEM_PROMPT).toMatch(/never fabricate/i);
      expect(SYSTEM_PROMPT).toMatch(/do not fill gaps with assumptions/i);
    });

    it('should prohibit recalculating preprocessed signals', () => {
      expect(SYSTEM_PROMPT).toMatch(/do not recalculate/i);
      expect(SYSTEM_PROMPT).toMatch(/preprocessed signals/i);
      expect(SYSTEM_PROMPT).toMatch(/years of experience|domain flags/i);
    });

    it('should enforce JSON-only output', () => {
      expect(SYSTEM_PROMPT).toMatch(/return only valid json/i);
      expect(SYSTEM_PROMPT).toMatch(/no markdown/i);
      expect(SYSTEM_PROMPT).toMatch(/no explanatory text/i);
    });

    it('should define role as specialized assistant', () => {
      expect(SYSTEM_PROMPT).toContain('job fit analysis assistant');
    });

    it('should contain writing constraints for output', () => {
      // System prompt can mention output fields as constraints
      expect(SYSTEM_PROMPT).toContain('recruiterMessage');
      expect(SYSTEM_PROMPT).toContain('coverLetter');
      expect(SYSTEM_PROMPT).toContain('WRITING CONSTRAINTS');
    });

    it('should not contain placeholders or variables', () => {
      // System prompt should be static and invariant
      expect(SYSTEM_PROMPT).not.toContain('${');
      expect(SYSTEM_PROMPT).not.toContain('{{');
    });
  });

  describe('System vs User Prompt Separation', () => {
    it('should contain only invariant rules', () => {
      // System prompt should contain rules that apply to ALL requests
      // Not specific to any particular analysis
      const invariantKeywords = [
        'output format',
        'json',
        'evidence-based',
        'validation',
        'fabricate',
        'language rules',
      ];

      invariantKeywords.forEach((keyword) => {
        expect(SYSTEM_PROMPT.toLowerCase()).toContain(keyword.toLowerCase());
      });
    });

    it('should include language handling rules', () => {
      // System prompt should define how to handle multiple languages
      expect(SYSTEM_PROMPT).toContain('LANGUAGE RULES');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('uilanguage');
      expect(SYSTEM_PROMPT.toLowerCase()).toContain('joblanguage');
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
        'EVIDENCE-BASED DATA HANDLING',
        'VALIDATION REQUIREMENTS',
        'LANGUAGE RULES',
        'WRITING CONSTRAINTS',
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

    it('should be reasonably sized to minimize token usage', () => {
      // System prompt is sent with every request
      // Should be comprehensive but not excessively verbose
      const tokenEstimate = SYSTEM_PROMPT.split(/\s+/).length;
      expect(tokenEstimate).toBeLessThan(600); // Reasonable upper bound for comprehensive rules
      expect(tokenEstimate).toBeGreaterThan(50); // Need sufficient detail
    });
  });
});
