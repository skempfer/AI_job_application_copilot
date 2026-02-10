/**
 * Camada de domínio em JavaScript puro
 * Sem dependências do React ou qualquer framework
 * 
 * Responsabilidades:
 * - Validação de inputs
 * - Cálculos de score
 * - Formatação de dados
 * - Lógica de decisão
 */

/**
 * Valida se o CV fornecido tem conteúdo mínimo
 */
export function validateCV(cv) {
  if (!cv || typeof cv !== 'string') {
    return { valid: false, error: 'CV é obrigatório' };
  }

  const trimmed = cv.trim();
  
  if (trimmed.length < 50) {
    return { valid: false, error: 'CV muito curto. Forneça mais detalhes sobre sua experiência.' };
  }

  if (trimmed.length > 20000) {
    return { valid: false, error: 'CV muito longo. Máximo de 20.000 caracteres.' };
  }

  return { valid: true, error: null };
}

/**
 * Valida se a job description tem conteúdo mínimo
 */
export function validateJobDescription(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return { valid: false, error: 'Descrição da vaga é obrigatória' };
  }

  const trimmed = jobDescription.trim();
  
  if (trimmed.length < 50) {
    return { valid: false, error: 'Descrição muito curta. Cole a descrição completa da vaga.' };
  }

  if (trimmed.length > 50000) {
    return { valid: false, error: 'Descrição muito longa. Máximo de 50.000 caracteres.' };
  }

  return { valid: true, error: null };
}

/**
 * Valida ambos os inputs juntos
 */
export function validateInputs(cv, jobDescription) {
  const cvValidation = validateCV(cv);
  if (!cvValidation.valid) {
    return cvValidation;
  }

  const jobValidation = validateJobDescription(jobDescription);
  if (!jobValidation.valid) {
    return jobValidation;
  }

  return { valid: true, error: null };
}

/**
 * Determina a cor do score baseado no valor
 */
export function getScoreColor(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

/**
 * Retorna classe Tailwind para o score
 */
export function getScoreBadgeClass(score) {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Mapeia decisão para texto em português
 */
export function getDecisionText(decision) {
  const map = {
    'apply': 'Aplique para esta vaga',
    'apply_with_fixes': 'Aplique após ajustes no CV',
    'skip': 'Pule esta vaga',
  };
  return map[decision] || 'Decisão desconhecida';
}

/**
 * Mapeia decisão para ícone emoji
 */
export function getDecisionIcon(decision) {
  const map = {
    'apply': '✅',
    'apply_with_fixes': '⚠️',
    'skip': '❌',
  };
  return map[decision] || '❓';
}

/**
 * Formata o resultado da análise para exibição
 */
export function formatAnalysisResult(result) {
  return {
    ...result,
    scoreColor: getScoreColor(result.fitScore),
    scoreBadgeClass: getScoreBadgeClass(result.fitScore),
    decisionText: getDecisionText(result.decision),
    decisionIcon: getDecisionIcon(result.decision),
  };
}

/**
 * Verifica se uma análise resultou em decisão positiva
 */
export function shouldApply(decision) {
  return decision === 'apply' || decision === 'apply_with_fixes';
}

/**
 * Conta palavras em um texto
 */
export function countWords(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Estima tempo de leitura em minutos
 */
export function estimateReadingTime(text) {
  const words = countWords(text);
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
