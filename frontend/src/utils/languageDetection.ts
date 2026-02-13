/**
 * Language detection utility for job descriptions
 * Uses simple heuristics to detect Portuguese (pt) vs English (en)
 */

const PT_KEYWORDS = [
  'vaga',
  'candidato',
  'experiência',
  'conhecimento',
  'responsabilidades',
  'requisitos',
  'português',
  'brasileiro',
  'empresa',
  'equipe',
  'projeto',
  'desenvolvimento',
  'tecnologia',
  'anos',
  'mês',
  'jornada',
  'salário',
  'benefício',
  'diferencial',
  'requisitos obrigatórios',
  'desejável',
  'oferecer',
  'solicitamos',
  'procuramos',
  'buscamos',
  'busca-se',
  'estamos contratando',
  'contrataremos',
  'somos uma empresa',
  'nosso time',
  'nossos',
  'nossos clientes',
  'trabalhar conosco',
  'Se você tem',
  'Se você possui',
  'que você tenha',
  'com expertises em',
  'domínio de',
  'fluência em',
];

const EN_KEYWORDS = [
  'position',
  'job',
  'candidate',
  'experience',
  'knowledge',
  'responsibilities',
  'requirements',
  'english',
  'company',
  'team',
  'project',
  'development',
  'technology',
  'years',
  'month',
  'salary',
  'benefits',
  'nice to have',
  'required',
  'preferred',
  'we are looking',
  'we seek',
  'we\'re hiring',
  'join our team',
  'our team',
  'work with us',
  'if you have',
  'if you possess',
  'proficiency in',
  'fluency in',
  'expertise in',
  'skilled in',
  'familiar with',
  'about us',
  'about the role',
];

/**
 * Detects language of a text based on keyword frequency
 * Returns 'pt' for Portuguese, 'en' for English
 * Default to 'en' if detection is uncertain
 */
export function detectLanguage(text: string): 'pt' | 'en' {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  const lowerText = text.toLowerCase();

  const ptMatches = PT_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  ).length;

  const enMatches = EN_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  ).length;

  if (ptMatches > enMatches && ptMatches > 2) {
    return 'pt';
  }

  return 'en';
}

/**
 * Get human-readable label for detected language
 */
export function getLanguageLabel(
  detectedLang: 'pt' | 'en',
  uiLanguage: 'pt' | 'en'
): string {
  if (detectedLang === 'pt') {
    return uiLanguage === 'pt'
      ? 'Português (detectado na descrição da vaga)'
      : 'Portuguese (detected from job description)';
  }

  return uiLanguage === 'pt'
    ? 'Inglês (detectado na descrição da vaga)'
    : 'English (detected from job description)';
}
