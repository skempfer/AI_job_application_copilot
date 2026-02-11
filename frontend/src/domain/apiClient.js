const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Analyzes job fit via API
 * @param {string} cv - Candidate's resume text
 * @param {string} jobDescription - Job description
 * @param {string|null} resumeUrl - PDF resume URL (optional)
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
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Analyzes gap via gap analysis endpoint
 * @param {string} jobDescription - Job description
 * @param {string} resumePath - Path to PDF resume
 * @param {string} cv - CV text as fallback if resume unavailable
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
    throw new Error('Resume path or CV is required for technical analysis');
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
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Checks if backend is online
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
