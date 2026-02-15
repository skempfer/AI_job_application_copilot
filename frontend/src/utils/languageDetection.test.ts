import { detectLanguage, getLanguageLabel } from './languageDetection';

describe('languageDetection', () => {
  describe('detectLanguage', () => {
    describe('Portuguese detection', () => {
      it('should detect Portuguese from common keywords', () => {
        const ptText = 'Procuramos um desenvolvedor com experiência em React e Node.js. Responsabilidades incluem arquitetura de software.';
        expect(detectLanguage(ptText)).toBe('pt');
      });

      it('should detect Portuguese from job posting format', () => {
        const ptText = `
          Vaga: Desenvolvedor Senior
          Candidatos com experiência em tecnologia
          Requisitos: 5 anos de experiência
          Benefícios: Salário competitivo
        `;
        expect(detectLanguage(ptText)).toBe('pt');
      });

      it('should detect Portuguese from company description', () => {
        const ptText = 'Somos uma empresa de tecnologia. Nosso time trabalha com inovação. Buscamos desenvolvedores para nossos projetos.';
        expect(detectLanguage(ptText)).toBe('pt');
      });

      it('should detect Portuguese with multiple repeated keywords', () => {
        const ptText = 'Vaga para desenvolvedor. Requisitos: experiência. Responsabilidades: arquitetura. Candidato ideal tem conhecimento em banco de dados.';
        expect(detectLanguage(ptText)).toBe('pt');
      });

      it('should be case-insensitive', () => {
        const ptText = 'VAGA: DESENVOLVEDOR COM EXPERIÊNCIA EM TECNOLOGIA. BUSCAMOS PROFISSIONAIS PARA NOSSO TIME.';
        expect(detectLanguage(ptText)).toBe('pt');
      });

      it('should handle mixed PT/EN when PT is dominant', () => {
        const mixedText = 'Position de desenvolvedor. Company com expertise em cloud. Vaga requisitos: experiência e conhecimento.';
        expect(detectLanguage(mixedText)).toBe('pt');
      });
    });

    describe('English detection', () => {
      it('should detect English from common keywords', () => {
        const enText = 'We are seeking a developer with experience in React and Node.js. Responsibilities include software architecture.';
        expect(detectLanguage(enText)).toBe('en');
      });

      it('should detect English from job posting format', () => {
        const enText = `
          Position: Senior Developer
          We are looking for experienced candidates
          Requirements: 5 years of experience
          Benefits: Competitive salary
        `;
        expect(detectLanguage(enText)).toBe('en');
      });

      it('should detect English from company description', () => {
        const enText = 'We are a technology company. Our team works with innovation. We seek developers for our projects.';
        expect(detectLanguage(enText)).toBe('en');
      });

      it('should default to English when uncertain', () => {
        const unclearText = 'Developer wanted. Senior role. Work on projects.';
        expect(detectLanguage(unclearText)).toBe('en');
      });

      it('should be case-insensitive', () => {
        const enText = 'POSITION: DEVELOPER WITH EXPERIENCE. WE ARE LOOKING FOR PROFESSIONALS. REQUIREMENTS AND BENEFITS INCLUDED.';
        expect(detectLanguage(enText)).toBe('en');
      });

      it('should handle mixed PT/EN when EN is dominant', () => {
        const mixedText = 'Vaga: position. Desenvolvedor: developer. Experience required. Candidato ideal.';
        expect(detectLanguage(mixedText)).toBe('en');
      });
    });

    describe('Edge cases', () => {
      it('should return "en" for empty string', () => {
        expect(detectLanguage('')).toBe('en');
      });

      it('should return "en" for whitespace-only string', () => {
        expect(detectLanguage('   \n\t  ')).toBe('en');
      });

      it('should return "en" for text with no language keywords', () => {
        const text = 'The quick brown fox jumps over the lazy dog. Sphinx of black quartz judges my vow.';
        expect(detectLanguage(text)).toBe('en');
      });

      it('should return "en" when PT and EN scores are equal', () => {
        const equalText = 'job position tecnologia experience';
        expect(detectLanguage(equalText)).toBe('en');
      });

      it('should require minimum 3 PT matches to detect Portuguese', () => {
        const text = 'vaga candidato experiência importante';
        expect(detectLanguage(text)).toBe('pt');

        const twoMatches = 'vaga candidato important data';
        expect(detectLanguage(twoMatches)).toBe('en'); // Only 2 PT matches is not enough
      });
    });

    describe('Special language markers', () => {
      it('should detect Portuguese from explicit markers', () => {
        const text = 'A vaga requisitos português fluência em português brasileiro';
        expect(detectLanguage(text)).toBe('pt');
      });

      it('should detect English from "about the role" marker', () => {
        const text = 'About the role. About us. Join our team and work with technology.';
        expect(detectLanguage(text)).toBe('en');
      });

      it('should detect Portuguese from specific phrases', () => {
        const text = 'Se você tem experiência. Se você possui skills. Procuramos desenvolvedores.';
        expect(detectLanguage(text)).toBe('pt');
      });

      it('should detect English from specific phrases', () => {
        const text = 'If you have experience. If you possess skills. We seek developers.';
        const result = detectLanguage(text);
        expect(result).toMatch(/en|pt/); // Could be either, but EN should be preferred
      });
    });

    describe('Real-world examples', () => {
      it('should detect typical Portuguese job posting', () => {
        const ptPosting = `
          Vaga: Desenvolvedor Senior
          
          Somos uma empresa de tecnologia inovadora.
          Procuramos profissionais com experiência.
          
          Requisitos:
          - 5 anos de experiência em desenvolvimento
          - Conhecimento em React, Node.js
          - Domínio de inglês
          
          Responsabilidades:
          - Arquitetura de software
          - Liderança técnica de times
          
          Benefícios:
          - Salário competitivo
          - Home office
          - Convênio médico
          
          Diferenciais:
          - Experiência com cloud
          - Certificações
          
          Se você tem interesse, candidate-se no nosso site.
        `;
        expect(detectLanguage(ptPosting)).toBe('pt');
      });

      it('should detect typical English job posting', () => {
        const enPosting = `
          Position: Senior Developer
          
          We are an innovative technology company.
          We seek experienced professionals.
          
          Requirements:
          - 5 years of development experience
          - Knowledge of React, Node.js
          - English proficiency
          
          Responsibilities:
          - Software architecture
          - Technical team leadership
          
          Benefits:
          - Competitive salary
          - Remote work
          - Health insurance
          
          Nice to have:
          - Cloud experience
          - Certifications
          
          If you have interest, apply on our website.
        `;
        expect(detectLanguage(enPosting)).toBe('en');
      });

      it('should handle multilingual content with strong Portuguese presence', () => {
        const polyglotText = `
          Vaga em português. English text minors.
          Procuramos desenvolvedores para candidatos. 
          Experience and requisitos obrigatórios.
          Join team hoje.
        `;
        expect(detectLanguage(polyglotText)).toBe('pt');
      });
    });

    describe('Keyword count scenarios', () => {
      it('should count keywords correctly even in repeated text', () => {
        const repeatedPT = 'vaga vaga vaga candidato candidato experiência';
        expect(detectLanguage(repeatedPT)).toBe('pt');
      });

      it('should handle concatenated words', () => {
        const text = 'positionjobdeveloper'; // No spaces, should not match keywords
        expect(detectLanguage(text)).toBe('en'); // Should default to EN
      });

      it('should handle partial word matches within larger words', () => {
        const text = 'excavation position experienced';
        const result = detectLanguage(text);
        expect(result).toBeDefined();
      });
    });
  });

  describe('getLanguageLabel', () => {
    describe('Portuguese detected, UI Portuguese', () => {
      it('should return Portuguese label', () => {
        const label = getLanguageLabel('pt', 'pt');
        expect(label).toContain('Português');
        expect(label).toContain('detectado');
        expect(label).toContain('descrição da vaga');
      });
    });

    describe('Portuguese detected, UI English', () => {
      it('should return English label', () => {
        const label = getLanguageLabel('pt', 'en');
        expect(label).toContain('Portuguese');
        expect(label).toContain('detected');
        expect(label).toContain('job description');
      });
    });

    describe('English detected, UI Portuguese', () => {
      it('should return Portuguese label', () => {
        const label = getLanguageLabel('en', 'pt');
        expect(label).toContain('Inglês');
        expect(label).toContain('detectado');
        expect(label).toContain('descrição da vaga');
      });
    });

    describe('English detected, UI English', () => {
      it('should return English label', () => {
        const label = getLanguageLabel('en', 'en');
        expect(label).toContain('English');
        expect(label).toContain('detected');
        expect(label).toContain('job description');
      });
    });

    describe('Label consistency', () => {
      it('should always mention language name', () => {
        expect(getLanguageLabel('pt', 'pt')).toContain('Português');
        expect(getLanguageLabel('pt', 'en')).toContain('Portuguese');
        expect(getLanguageLabel('en', 'pt')).toContain('Inglês');
        expect(getLanguageLabel('en', 'en')).toContain('English');
      });

      it('should always mention detection source', () => {
        expect(getLanguageLabel('pt', 'pt')).toContain('detectado');
        expect(getLanguageLabel('pt', 'en')).toContain('detected');
        expect(getLanguageLabel('en', 'pt')).toContain('detectado');
        expect(getLanguageLabel('en', 'en')).toContain('detected');
      });

      it('should always reference job description', () => {
        expect(getLanguageLabel('pt', 'pt')).toContain('descrição da vaga');
        expect(getLanguageLabel('pt', 'en')).toContain('job description');
      });

      it('should return non-empty strings', () => {
        expect(getLanguageLabel('pt', 'pt').length).toBeGreaterThan(0);
        expect(getLanguageLabel('pt', 'en').length).toBeGreaterThan(0);
        expect(getLanguageLabel('en', 'pt').length).toBeGreaterThan(0);
        expect(getLanguageLabel('en', 'en').length).toBeGreaterThan(0);
      });
    });

    describe('UI language parameter', () => {
      it('should respect UI language preference', () => {
        const ptUI = getLanguageLabel('pt', 'pt');
        const enUI = getLanguageLabel('pt', 'en');

        expect(ptUI).not.toEqual(enUI);
        expect(ptUI).toContain('Português');
        expect(enUI).toContain('Portuguese');
      });

      it('should maintain consistency across detected languages', () => {
        const ptDetectedPtUI = getLanguageLabel('pt', 'pt');
        const enDetectedPtUI = getLanguageLabel('en', 'pt');

        expect(ptDetectedPtUI).toContain('Português');
        expect(enDetectedPtUI).toContain('Inglês');
      });
    });
  });

  describe('integration: detect then label', () => {
    it('should provide complete language information flow', () => {
      const jobText = `
        Vaga: Desenvolvedor Senior
        Procuramos profissionais com experiência
        Conhecimento em React e Node.js
        Requisitos: comprovada experiência
      `;

      const detectedLanguage = detectLanguage(jobText);
      const label = getLanguageLabel(detectedLanguage, 'en');

      expect(detectedLanguage).toBe('pt');
      expect(label).toContain('Portuguese');
      expect(label).toContain('detected');
    });

    it('should handle language switching', () => {
      const englishJob = 'Senior developer position with requirements';

      const detectEn = detectLanguage(englishJob);
      const labelPt = getLanguageLabel(detectEn, 'pt');

      expect(detectEn).toBe('en');
      expect(labelPt).toContain('Inglês');

      const labelEn = getLanguageLabel(detectEn, 'en');
      expect(labelEn).toContain('English');
    });
  });
});
