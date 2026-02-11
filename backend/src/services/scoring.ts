/**
 * Hybrid scoring - Deterministic logic to calculate fitScore
 *
 * PRINCIPLE: AI extracts signals, code calculates score
 *
 * Same code as frontend/src/domain/scoring.js
 * Kept duplicated to avoid unnecessary dependency
 */

import type { AISignals, ScoreExplanation, Decision } from '../types/analysis.js';

/**
 * Weights for each signal category
 */
const SCORING_WEIGHTS = {
  hardSkills: 0.35,           
  mandatoryRequirements: 0.30, 
  seniority: 0.15,            
  desirableRequirements: 0.10, 
  softSkills: 0.05,           
};

function scoreHardSkills(detected: string[]): number {
  if (!detected || detected.length === 0) return 0;
  
  if (detected.length >= 5) return 100;
  if (detected.length >= 3) return 60 + (detected.length - 3) * 20;
  if (detected.length >= 1) return 30 + (detected.length - 1) * 15;
  return 0;
}

function scoreMandatoryRequirements(met: string[], missing: string[]): number {
  const total = met.length + missing.length;
  if (total === 0) return 50;
  
  const percentMet = (met.length / total) * 100;
  return percentMet;
}

function scoreSeniority(seniorityMatch: string): number {
  const scores: Record<string, number> = {
    'above': 80,
    'match': 100,
    'below': 30,
  };
  return scores[seniorityMatch] || 50;
}

function scoreDesirableRequirements(met: string[], missing: string[]): number {
  const total = met.length + missing.length;
  if (total === 0) return 50;
  
  const percentMet = (met.length / total) * 100;
  return percentMet;
}

function scoreSoftSkills(detected: string[]): number {
  if (!detected || detected.length === 0) return 50;
  
  if (detected.length >= 3) return 100;
  if (detected.length >= 1) return 70;
  return 50;
}

function penaltyRedFlags(redFlags: string[]): number {
  if (!redFlags || redFlags.length === 0) return 0;
  
  return Math.min(redFlags.length * 15, 45);
}

/**
 * Calculate fit score based on AI signals
 */
export function calculateFitScore(signals: AISignals): number {
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

  const weightedScore =
    hardSkillsScore * SCORING_WEIGHTS.hardSkills +
    mandatoryScore * SCORING_WEIGHTS.mandatoryRequirements +
    seniorityScore * SCORING_WEIGHTS.seniority +
    desirableScore * SCORING_WEIGHTS.desirableRequirements +
    softSkillsScore * SCORING_WEIGHTS.softSkills;

  const finalScore = Math.max(0, Math.min(100, weightedScore - redFlagPenalty));

  return Math.round(finalScore);
}

/**
 * Generate a detailed score explanation
 */
export function generateExplanation(signals: AISignals, fitScore: number): ScoreExplanation {
  const positives: string[] = [];
  const negatives: string[] = [];

  if (signals.hardSkillsDetected.length >= 3) {
    positives.push(`Strong technical match: ${signals.hardSkillsDetected.length} hard skills identified`);
  } else if (signals.hardSkillsDetected.length > 0) {
    positives.push("Some relevant technical skills detected");
  } else {
    negatives.push("Few technical hard skills identified in the CV");
  }

  if (signals.mandatoryRequirementsMet.length > 0) {
    positives.push(`Meets ${signals.mandatoryRequirementsMet.length} mandatory requirement(s)`);
  }
  if (signals.mandatoryRequirementsMissing.length > 0) {
    negatives.push(`Missing ${signals.mandatoryRequirementsMissing.length} mandatory requirement(s)`);
  }

  if (signals.seniorityMatch === 'match') {
    positives.push("Seniority perfectly aligned with the role");
  } else if (signals.seniorityMatch === 'above') {
    positives.push("Seniority above the requirement (overqualified)");
  } else {
    negatives.push("Seniority below what is expected for the role");
  }

  if (signals.desirableRequirementsMet.length > 0) {
    positives.push(`Has ${signals.desirableRequirementsMet.length} desired bonus qualification(s)`);
  }

  if (signals.redFlags.length > 0) {
    negatives.push(`${signals.redFlags.length} issue(s) identified: ${signals.redFlags.join(', ')}`);
  }

  let summary: string;
  if (fitScore >= 80) {
    summary = "Ideal candidate - strong technical and seniority alignment";
  } else if (fitScore >= 60) {
    summary = "Good fit - some adjustments recommended before applying";
  } else if (fitScore >= 40) {
    summary = "Moderate fit - significant gaps to address";
  } else {
    summary = "Low fit - profile not aligned with role requirements";
  }

  return {
    positives,
    negatives,
    summary,
  };
}

/**
 * Determine decision based on score
 */
export function determineDecision(fitScore: number): Decision {
  if (fitScore >= 70) return 'apply';
  if (fitScore >= 50) return 'apply_with_fixes';
  return 'skip';
}
