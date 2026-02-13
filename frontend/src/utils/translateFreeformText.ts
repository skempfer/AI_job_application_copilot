import type { Language } from '../i18n';

/**
 * Best-effort translation for backend/AI freeform strings.
 * This is separate from key-based i18n (t) because the input is dynamic and unstructured.
 */
export function translateFreeformText(text: string, language: Language): string {
  if (language !== 'pt') return text;

  const summaryMap: Record<string, string> = {
    'Ideal candidate - strong technical and seniority alignment': 'Candidato ideal - forte alinhamento técnico e de senioridade',
    'Good fit - some adjustments recommended before applying': 'Bom match - alguns ajustes recomendados antes de aplicar',
    'Moderate fit - significant gaps to address': 'Match moderado - gaps significativos a tratar',
    'Low fit - profile not aligned with role requirements': 'Baixo match - perfil não alinhado com requisitos da vaga',
  };

  if (summaryMap[text]) return summaryMap[text];

  let translated = text;

  translated = translated.replace(
    /Strong technical match: (\d+) hard skills identified/,
    'Match técnico forte: $1 skills técnicas identificadas'
  );

  translated = translated.replace(
    /Some relevant technical skills detected/,
    'Algumas skills técnicas relevantes detectadas'
  );

  translated = translated.replace(
    /Few technical hard skills identified in the CV/,
    'Poucas skills técnicas identificadas no CV'
  );

  translated = translated.replace(
    /Meets (\d+) mandatory requirement\(s\)/,
    'Atende $1 requisito(s) obrigatório(s)'
  );

  translated = translated.replace(
    /Missing (\d+) mandatory requirement\(s\)/,
    'Faltam $1 requisito(s) obrigatório(s)'
  );

  translated = translated.replace(
    /Seniority perfectly aligned with the role/,
    'Senioridade perfeitamente alinhada com a vaga'
  );

  translated = translated.replace(
    /Seniority above the requirement \(overqualified\)/,
    'Senioridade acima do requisito (superqualificado)'
  );

  translated = translated.replace(
    /Seniority below what is expected for the role/,
    'Senioridade abaixo do esperado para a vaga'
  );

  translated = translated.replace(
    /Has (\d+) desired bonus qualification\(s\)/,
    'Possui $1 qualificação(ões) desejável(is)'
  );

  translated = translated.replace(
    /(\d+) issue\(s\) identified:/,
    '$1 problema(s) identificado(s):'
  );

  translated = translated.replace(
    /Hard skill: /g,
    'Skill técnica: '
  );

  translated = translated.replace(
    /Requirement met: /g,
    'Requisito atendido: '
  );

  translated = translated.replace(
    /Bonus qualification: /g,
    'Qualificação bonus: '
  );

  translated = translated.replace(
    /Missing requirement: /g,
    'Requisito faltando: '
  );

  translated = translated.replace(
    /Missing requirements: /g,
    'Requisitos faltando: '
  );

  translated = translated.replace(
    /Missing bonus qualification: /g,
    'Qualificação bonus faltando: '
  );

  translated = translated.replace(
    /Years of experience: /g,
    'Anos de experiência: '
  );

  translated = translated.replace(
    /Highlight experience related to: /g,
    'Destaque experiência relacionada a: '
  );

  translated = translated.replace(
    /Add more detail about your technical skills/gi,
    'Adicione mais detalhes sobre suas skills técnicas'
  );

  translated = translated.replace(
    /Emphasize complex projects and technical leadership to demonstrate seniority/gi,
    'Destaque projetos complexos e liderança técnica para demonstrar senioridade'
  );

  translated = translated.replace(
    /Highlight your bonus qualifications near the top of the CV/gi,
    'Destaque suas qualificações bonus no início do CV'
  );

  translated = translated.replace(
    /Your CV is well aligned\. Just review formatting and clarity\./gi,
    'Seu CV está bem alinhado. Apenas revise formatação e clareza.'
  );

  translated = translated.replace(
    /Missing bonus qualification:\s*/gi,
    'Qualificação bonus faltando: '
  );

  translated = translated.replace(
    /Missing mandatory skill:\s*/gi,
    'Skill obrigatória faltando: '
  );

  translated = translated.replace(
    /missing minimum experience/gi,
    'experiência mínima faltando'
  );

  translated = translated.replace(
    /missing mandatory skill/gi,
    'skill obrigatória faltando'
  );

  return translated;
}
