export function validateCV(cv) {
  if (!cv || typeof cv !== 'string') {
    return { valid: false, error: 'Please enter your CV' };
  }

  const trimmed = cv.trim();
  
  if (trimmed.length < 100) {
    return { valid: false, error: 'CV too short. Provide at least 100 characters with information about experience, skills, and education.' };
  }

  if (trimmed.length > 20000) {
    return { valid: false, error: 'CV too long. Maximum 20,000 characters.' };
  }

  return { valid: true, error: null };
}

export function validateJobDescription(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return { valid: false, error: 'Please enter the job description' };
  }

  const trimmed = jobDescription.trim();
  
  if (trimmed.length < 100) {
    return { valid: false, error: 'Job description too short. Paste the complete description with requirements, responsibilities, and expected experience.' };
  }

  if (trimmed.length > 50000) {
    return { valid: false, error: 'Job description too long. Maximum 50,000 characters.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates both CV and job description inputs
 * @param {string} cv - CV text
 * @param {string} jobDescription - Job description
 * @param {string|null} resumeUrl - PDF resume URL (optional)
 */
export function validateInputs(cv, jobDescription, resumeUrl = null) {
  // If there is a resumeUrl, the CV text is optional
  if (!resumeUrl) {
    const cvValidation = validateCV(cv);
    if (!cvValidation.valid) {
      return cvValidation;
    }
  } else if (cv && cv.trim().length > 0) {
    // If there is resumeUrl AND cv, validate cv too
    const cvValidation = validateCV(cv);
    if (!cvValidation.valid) {
      return cvValidation;
    }
  }

  const jobValidation = validateJobDescription(jobDescription);
  if (!jobValidation.valid) {
    return jobValidation;
  }

  return { valid: true, error: null };
}

export function getDecisionText(decision) {
  const map = {
    'apply': 'Apply to this job',
    'apply_with_fixes': 'Apply after CV adjustments',
    'skip': 'Skip this job',
  };
  return map[decision] || 'Unknown decision';
}

export function getDecisionIcon(decision) {
  const map = {
    'apply': '✅',
    'apply_with_fixes': '⚠️',
    'skip': '❌',
  };
  return map[decision] || '❓';
}

export function formatAnalysisResult(result) {
  // Import helpers from utils for consistency
  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };
  
  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-700';
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700';
  };

  return {
    ...result,
    scoreColor: getScoreColor(result.fitScore),
    scoreBadgeClass: getScoreBadgeClass(result.fitScore),
    decisionText: getDecisionText(result.decision),
    decisionIcon: getDecisionIcon(result.decision),
  };
}

export function shouldApply(decision) {
  return decision === 'apply' || decision === 'apply_with_fixes';
}

export function countWords(text) {
  return text.trim().split(/\s+/).length;
}

export function estimateReadingTime(text) {
  const words = countWords(text);
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
