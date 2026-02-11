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

  if (resumeUrl) {
    payload.resumeUrl = resumeUrl;
  }

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
