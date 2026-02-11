/**
 * Hybrid scoring - Deterministic logic to calculate fitScore
 * 
 * PRINCIPLE: AI extracts signals, code calculates score
 * 
 * Why separate?
 * - Deterministic scoring is testable and auditable
 * - AI can vary, score logic remains consistent
 * - Easy to adjust weights without retraining AI
 */

/**
 * Weights for each signal category
 */
const SCORING_WEIGHTS = {
  hardSkills: 0.35,           // 35% - Technical skills are critical
  mandatoryRequirements: 0.30, // 30% - Mandatory requirements
  seniority: 0.15,            // 15% - Seniority match
  desirableRequirements: 0.10, // 10% - Nice-to-have requirements
  softSkills: 0.05,           // 5% - Soft skills matter less
  redFlags: -0.05,            // -5% - Penalty for red flags
};

/**
 * Calculates hard skills score (0-100)
 */
function scoreHardSkills(detected) {
  if (!detected || detected.length === 0) return 0;
  
  // More skills detected = better (with diminishing returns)
  // 1 skill = 30, 3 skills = 60, 5+ skills = 100
  if (detected.length >= 5) return 100;
  if (detected.length >= 3) return 60 + (detected.length - 3) * 20;
  if (detected.length >= 1) return 30 + (detected.length - 1) * 15;
  return 0;
}

/**
 * Calculates mandatory requirements score (0-100)
 */
function scoreMandatoryRequirements(met, missing) {
  const total = met.length + missing.length;
  if (total === 0) return 50; // No requirements = neutral
  
  // Severe penalty for missing requirements
  const percentMet = (met.length / total) * 100;
  return percentMet;
}

/**
 * Calculates seniority score (0-100)
 */
function scoreSeniority(seniorityMatch) {
  const scores = {
    'above': 80,  // Overqualified, but ok
    'match': 100, // Perfect
    'below': 30,  // Underqualified, problem
  };
  return scores[seniorityMatch] || 50;
}

/**
 * Calculates desirable requirements score (0-100)
 */
function scoreDesirableRequirements(met, missing) {
  const total = met.length + missing.length;
  if (total === 0) return 50; // No nice-to-haves = neutral
  
  const percentMet = (met.length / total) * 100;
  return percentMet;
}

/**
 * Calculates soft skills score (0-100)
 */
function scoreSoftSkills(detected) {
  if (!detected || detected.length === 0) return 50; // Neutral
  
  // 1-2 soft skills = ok, 3+ = excellent
  if (detected.length >= 3) return 100;
  if (detected.length >= 1) return 70;
  return 50;
}

/**
 * Penalty for red flags
 */
function penaltyRedFlags(redFlags) {
  if (!redFlags || redFlags.length === 0) return 0;
  
  // Each red flag reduces 15 points (max 45 points penalty)
  return Math.min(redFlags.length * 15, 45);
}

/**
 * MAIN FUNCTION: Calculates hybrid fit score
 * 
 * @param {Object} signals - Signals extracted by AI
 * @returns {number} Score 0-100
 */
export function calculateFitScore(signals) {
  // Calculate partial scores
  const hardSkillsScore = scoreHardSkills(signals.hardSkillsDetected);
  const mandatoryScore = scoreMandatoryRequirements(
    signals.mandatoryRequirementsMet,
    signals.mandatoryRequirementsMissing
  );
  const seniorityScore = scoreSeniority(signals.seniorityMatch);
  const desirableScore = scoreDesirableRequirements(
    signals.desirableRequirementsMet,
    signals.desirableRequirementsMissing
  );
  const softSkillsScore = scoreSoftSkills(signals.softSkillsEvidence);
  const redFlagPenalty = penaltyRedFlags(signals.redFlags);

  // Weighted score
  const weightedScore =
    hardSkillsScore * SCORING_WEIGHTS.hardSkills +
    mandatoryScore * SCORING_WEIGHTS.mandatoryRequirements +
    seniorityScore * SCORING_WEIGHTS.seniority +
    desirableScore * SCORING_WEIGHTS.desirableRequirements +
    softSkillsScore * SCORING_WEIGHTS.softSkills;

  // Apply penalty and limit to 0-100
  const finalScore = Math.max(0, Math.min(100, weightedScore - redFlagPenalty));

  return Math.round(finalScore);
}

/**
 * Generates detailed score explanation
 * 
 * @param {Object} signals - AI signals
 * @param {number} fitScore - Calculated score
 * @returns {Object} { positives, negatives, summary }
 */
export function generateExplanation(signals, fitScore) {
  const positives = [];
  const negatives = [];

  // Hard skills
  if (signals.hardSkillsDetected.length >= 3) {
    positives.push(`Strong technical match: ${signals.hardSkillsDetected.length} hard skills identified`);
  } else if (signals.hardSkillsDetected.length > 0) {
    positives.push(`Some relevant technical skills detected`);
  } else {
    negatives.push('Few technical hard skills identified in CV');
  }

  // Mandatory requirements
  if (signals.mandatoryRequirementsMet.length > 0) {
    positives.push(`Meets ${signals.mandatoryRequirementsMet.length} mandatory requirement(s)`);
  }
  if (signals.mandatoryRequirementsMissing.length > 0) {
    negatives.push(`Missing ${signals.mandatoryRequirementsMissing.length} mandatory requirement(s)`);
  }

  // Seniority
  if (signals.seniorityMatch === 'match') {
    positives.push('Seniority perfectly aligned with job requirements');
  } else if (signals.seniorityMatch === 'above') {
    positives.push('Seniority above requirement (overqualified)');
  } else {
    negatives.push('Seniority below expected for this role');
  }

  // Nice-to-have requirements
  if (signals.desirableRequirementsMet.length > 0) {
    positives.push(`Has ${signals.desirableRequirementsMet.length} nice-to-have requirement(s)`);
  }

  // Red flags
  if (signals.redFlags.length > 0) {
    negatives.push(`${signals.redFlags.length} issue(s) identified: ${signals.redFlags.join(', ')}`);
  }

  // Summary
  let summary;
  if (fitScore >= 80) {
    summary = 'Ideal candidate - strong technical and seniority alignment';
  } else if (fitScore >= 60) {
    summary = 'Good fit - some adjustments recommended before applying';
  } else if (fitScore >= 40) {
    summary = 'Moderate fit - significant gaps to address';
  } else {
    summary = 'Low fit - profile not aligned with job requirements';
  }

  return {
    positives,
    negatives,
    summary,
  };
}

/**
 * Determines decision based on score
 */
export function determineDecision(fitScore) {
  if (fitScore >= 70) return 'apply';
if (fitScore >= 50) return 'apply_with_fixes';
  return 'skip';
}
