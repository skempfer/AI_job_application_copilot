/**
 * Cliente HTTP para comunicação com o backend
 * JavaScript puro, sem dependências
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Realiza análise de job fit via API
 * @param {string} cv - O currículo do candidato
 * @param {string} jobDescription - A descrição da vaga
 * @param {string|null} resumeUrl - URL do CV em PDF (opcional)
 */
export async function analyzeJobFit(cv, jobDescription, resumeUrl = null) {
  const payload = {
    cv: cv.trim(),
    jobDescription: jobDescription.trim(),
  };

  // Incluir resumeUrl se fornecido
  if (resumeUrl) {
    payload.resumeUrl = resumeUrl;
  }

  console.log('📤 Enviando para API /api/analyze:', {
    cvLength: payload.cv.length,
    cvPreview: payload.cv.substring(0, 80) + (payload.cv.length > 80 ? '...' : ''),
    jobDescriptionLength: payload.jobDescription.length,
    jobDescriptionPreview: payload.jobDescription.substring(0, 80) + (payload.jobDescription.length > 80 ? '...' : ''),
    hasResumeUrl: !!resumeUrl
  });

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
  }

  return response.json();
}

/**
 * Realiza analise com gap via novo endpoint
 * @param {string} jobDescription - A descricao da vaga
 * @param {string} resumePath - Caminho/local do CV em PDF
 * @param {string} cv - CV em texto como fallback se resume não disponível
 */
export async function analyzeWithGap(jobDescription, resumePath = null, cv = null) {
  const payload = {
    jobDescription: jobDescription.trim(),
  };

  // Usar resumePath se disponível, senão usar CV de texto
  if (resumePath && resumePath.trim()) {
    payload.resumePath = resumePath.trim();
  } else if (cv && cv.trim()) {
    payload.cv = cv.trim();
  } else {
    throw new Error('Resume path ou CV é obrigatório para análise técnica');
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze-with-gap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
  }

  return response.json();
}

/**
 * Verifica se o backend está online
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
