import { detectLanguage } from '../utils/languageDetection';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * Analyzes job fit via API
 * @param {string} cv - Candidate's resume text
 * @param {string} jobDescription - Job description
 * @param {string|null} resumeUrl - PDF resume URL (optional)
 */
export async function analyzeJobFit(cv, jobDescription, resumeUrl = null) {
  const detectedLanguage = detectLanguage(jobDescription);

  const payload = {
    cv: cv.trim(),
    jobDescription: jobDescription.trim(),
    language: detectedLanguage,
  };

  if (resumeUrl) {
    payload.resumeUrl = resumeUrl;
  }

  console.log('\n📮 [apiClient.analyzeJobFit] Sending payload:');
  console.log({
    cvLength: payload.cv.length,
    jobDescriptionLength: payload.jobDescription.length,
    hasResumeUrl: !!resumeUrl,
    language: detectedLanguage,
  });

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  console.log('\n📩 [apiClient.analyzeJobFit] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ [apiClient.analyzeJobFit] Error:', errorData);
    const error = new Error(errorData.error || `HTTP Error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const response_data = await response.json();
  console.log('✅ [apiClient.analyzeJobFit] Success! Response data:', response_data);
  
  if (response_data.preprocessedCV) {
    console.log('\n🔧 [apiClient.analyzeJobFit] PREPROCESSING DATA FOUND!');
    console.log('📊 Years Experience:', response_data.preprocessedCV.yearsExperience);
    console.log('🎯 Confidence:', response_data.preprocessedCV.yearsExperienceConfidence);
    console.log('🏢 Domain Experience:', response_data.preprocessedCV.domainExperience);
    console.log('🏷️  Seniority:', response_data.preprocessedCV.seniority);
    console.log('💾 Skills:', response_data.preprocessedCV.skills);
  } else {
    console.warn('⚠️ [apiClient.analyzeJobFit] No preprocessedCV in response!');
    console.log('Available keys:', Object.keys(response_data));
  }
  
  return {
    ...response_data,
    detectedLanguage
  };
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
    const error = new Error(errorData.error || `HTTP Error: ${response.status}`);
    error.status = response.status;
    throw error;
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
