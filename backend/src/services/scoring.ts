/**
 * Scoring híbrido - Lógica determinística para calcular fitScore
 * 
 * PRINCÍPIO: IA extrai sinais, código calcula score
 * 
 * Mesmo código do frontend/src/domain/scoring.js
 * Mantido duplicado para não criar dependência desnecessária
 */

import type { AISignals, ScoreExplanation, Decision } from '../types/analysis.js';

/**
 * Pesos para cada categoria de sinal
 */
const SCORING_WEIGHTS = {
  hardSkills: 0.35,           // 35% - Skills técnicas são críticas
  mandatoryRequirements: 0.30, // 30% - Requisitos obrigatórios
  seniority: 0.15,            // 15% - Match de senioridade
  desirableRequirements: 0.10, // 10% - Diferenciais
  softSkills: 0.05,           // 5% - Soft skills importam menos
  redFlags: -0.05,            // -5% - Penalidade por red flags
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
 * Calcula fit score baseado em sinais da IA
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
 * Gera explicação detalhada do score
 */
export function generateExplanation(signals: AISignals, fitScore: number): ScoreExplanation {
  const positives: string[] = [];
  const negatives: string[] = [];

  // Hard skills
  if (signals.hardSkillsDetected.length >= 3) {
    positives.push(`Forte match técnico: ${signals.hardSkillsDetected.length} hard skills identificadas`);
  } else if (signals.hardSkillsDetected.length > 0) {
    positives.push(`Algumas skills técnicas relevantes detectadas`);
  } else {
    negatives.push('Poucas hard skills técnicas identificadas no CV');
  }

  // Requisitos obrigatórios
  if (signals.mandatoryRequirementsMet.length > 0) {
    positives.push(`Atende ${signals.mandatoryRequirementsMet.length} requisito(s) obrigatório(s)`);
  }
  if (signals.mandatoryRequirementsMissing.length > 0) {
    negatives.push(`Falta ${signals.mandatoryRequirementsMissing.length} requisito(s) obrigatório(s)`);
  }

  // Senioridade
  if (signals.seniorityMatch === 'match') {
    positives.push('Senioridade perfeitamente alinhada com a vaga');
  } else if (signals.seniorityMatch === 'above') {
    positives.push('Senioridade acima do requisitado (overqualified)');
  } else {
    negatives.push('Senioridade abaixo do esperado para a vaga');
  }

  // Diferenciais
  if (signals.desirableRequirementsMet.length > 0) {
    positives.push(`Possui ${signals.desirableRequirementsMet.length} diferencial(is) desejado(s)`);
  }

  // Red flags
  if (signals.redFlags.length > 0) {
    negatives.push(`${signals.redFlags.length} problema(s) identificado(s): ${signals.redFlags.join(', ')}`);
  }

  // Summary
  let summary: string;
  if (fitScore >= 80) {
    summary = 'Candidato ideal - forte alinhamento técnico e de senioridade';
  } else if (fitScore >= 60) {
    summary = 'Bom fit - alguns ajustes recomendados antes de aplicar';
  } else if (fitScore >= 40) {
    summary = 'Fit mediano - gaps significativos a endereçar';
  } else {
    summary = 'Fit baixo - perfil não alinhado com requisitos da vaga';
  }

  return {
    positives,
    negatives,
    summary,
  };
}

/**
 * Determina decisão baseada no score
 */
export function determineDecision(fitScore: number): Decision {
  if (fitScore >= 70) return 'apply';
  if (fitScore >= 50) return 'apply_with_fixes';
  return 'skip';
}
