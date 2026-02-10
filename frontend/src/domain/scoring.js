/**
 * Scoring híbrido - Lógica determinística para calcular fitScore
 * 
 * PRINCÍPIO: IA extrai sinais, código calcula score
 * 
 * Por que separar?
 * - Scoring determinístico é testável e auditável
 * - IA pode variar, lógica de score permanece consistente
 * - Fácil ajustar pesos sem retreinar IA
 */

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

/**
 * Calcula score de hard skills (0-100)
 */
function scoreHardSkills(detected) {
  if (!detected || detected.length === 0) return 0;
  
  // Quanto mais skills detectadas, melhor (diminuição marginal)
  // 1 skill = 30, 3 skills = 60, 5+ skills = 100
  if (detected.length >= 5) return 100;
  if (detected.length >= 3) return 60 + (detected.length - 3) * 20;
  if (detected.length >= 1) return 30 + (detected.length - 1) * 15;
  return 0;
}

/**
 * Calcula score de requisitos obrigatórios (0-100)
 */
function scoreMandatoryRequirements(met, missing) {
  const total = met.length + missing.length;
  if (total === 0) return 50; // Sem requisitos = neutro
  
  // Penalização severa por requisitos faltando
  const percentMet = (met.length / total) * 100;
  return percentMet;
}

/**
 * Calcula score de senioridade (0-100)
 */
function scoreSeniority(seniorityMatch) {
  const scores = {
    'above': 80,  // Overqualified, mas ok
    'match': 100, // Perfeito
    'below': 30,  // Underqualified, problema
  };
  return scores[seniorityMatch] || 50;
}

/**
 * Calcula score de requisitos desejáveis (0-100)
 */
function scoreDesirableRequirements(met, missing) {
  const total = met.length + missing.length;
  if (total === 0) return 50; // Sem diferenciais = neutro
  
  const percentMet = (met.length / total) * 100;
  return percentMet;
}

/**
 * Calcula score de soft skills (0-100)
 */
function scoreSoftSkills(detected) {
  if (!detected || detected.length === 0) return 50; // Neutro
  
  // 1-2 soft skills = ok, 3+ = excelente
  if (detected.length >= 3) return 100;
  if (detected.length >= 1) return 70;
  return 50;
}

/**
 * Penalidade por red flags
 */
function penaltyRedFlags(redFlags) {
  if (!redFlags || redFlags.length === 0) return 0;
  
  // Cada red flag reduz 15 pontos (máx 45 pontos de penalidade)
  return Math.min(redFlags.length * 15, 45);
}

/**
 * FUNÇÃO PRINCIPAL: Calcula fit score híbrido
 * 
 * @param {Object} signals - Sinais extraídos pela IA
 * @returns {number} Score 0-100
 */
export function calculateFitScore(signals) {
  // Calcular scores parciais
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

  // Score ponderado
  const weightedScore =
    hardSkillsScore * SCORING_WEIGHTS.hardSkills +
    mandatoryScore * SCORING_WEIGHTS.mandatoryRequirements +
    seniorityScore * SCORING_WEIGHTS.seniority +
    desirableScore * SCORING_WEIGHTS.desirableRequirements +
    softSkillsScore * SCORING_WEIGHTS.softSkills;

  // Aplicar penalidade e limitar entre 0-100
  const finalScore = Math.max(0, Math.min(100, weightedScore - redFlagPenalty));

  return Math.round(finalScore);
}

/**
 * Gera explicação detalhada do score
 * 
 * @param {Object} signals - Sinais da IA
 * @param {number} fitScore - Score calculado
 * @returns {Object} { positives, negatives, summary }
 */
export function generateExplanation(signals, fitScore) {
  const positives = [];
  const negatives = [];

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
  let summary;
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
export function determineDecision(fitScore) {
  if (fitScore >= 70) return 'apply';
if (fitScore >= 50) return 'apply_with_fixes';
  return 'skip';
}
