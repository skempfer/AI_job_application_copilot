/**
 * Construtor de prompts otimizado
 * Recebe dados estruturados ao invés de texto bruto
 * Objetivo: Reduzir tokens e melhorar qualidade da análise
 */

import type { ProcessedCV, ProcessedJobDescription } from "./preprocessing.js";

const PROMPT_VERSION = "v2.0-optimized";

/**
 * Constrói um prompt otimizado usando dados estruturados
 * 
 * Input: CV e Job Description JÁ preprocessados
 * Output: Prompt compacto e bem estruturado
 */
export function buildOptimizedPrompt(
  processedCV: ProcessedCV,
  processedJob: ProcessedJobDescription,
  language: "pt" | "en"
): string {
  const isPt = language === "pt";

  const cvSummary = formatCVSummary(processedCV, isPt);

  const jobSummary = formatJobSummary(processedJob, isPt);

  return `Você é um senior tech recruiter experiente. Analise objetivamente o perfil estruturado do candidato contra a vaga estruturada.

**VERSÃO DO PROMPT:** ${PROMPT_VERSION}

**SUA TAREFA:** Extrair sinais estruturados (NÃO calcular score).

**PERFIL ESTRUTURADO DO CANDIDATO:**
${cvSummary}

**VAGA ESTRUTURADA:**
${jobSummary}

**IDIOMA DAS MENSAGENS:** ${isPt ? "Português" : "English"}
Escreva recruiterMessage e coverLetter no idioma acima.

**SINAIS A EXTRAIR:**

1. **hardSkillsDetected**: Hard skills do perfil que são RELEVANTES para a vaga
2. **softSkillsEvidence**: Evidências de soft skills (liderança, comunicação, ownership, etc.)
3. **mandatoryRequirementsMet**: Requisitos obrigatórios da vaga que o candidato ATENDE
4. **mandatoryRequirementsMissing**: Requisitos obrigatórios que o candidato NÃO atende
5. **desirableRequirementsMet**: Diferenciais que o candidato POSSUI
6. **desirableRequirementsMissing**: Diferenciais que o candidato não possui
7. **seniorityMatch**: "above" (overqualified), "match" (perfeito) ou "below" (underqualified)
8. **redFlags**: Problemas graves (ex: falta experiência mínima crítica, skill obrigatória ausente, muito junior/senior)
9. **recruiterMessage**: Mensagem estratégica personalizada (4-6 frases) para enviar ao recrutador
10. **coverLetter**: Carta de apresentação formal (3-5 parágrafos, 400-500 palavras)

**CRITÉRIOS:**

🎯 ANÁLISE ESTRUTURADA

A análise deve ser baseada APENAS nos dados estruturados fornecidos:
- Skills disponíveis do candidato
- Seniority estimado
- Principais conquistas (achievements)
- Responsabilidades da vaga
- Requisitos obrigatórios vs desejáveis

📌 LINGUAGEM E TOM

${isPt ? `
1️⃣ Perspectiva
- Escreva sempre em PRIMEIRA PESSOA no recruiterMessage e coverLetter
- Nunca use terceira pessoa
- Nunca fale sobre "o candidato"

2️⃣ Saudação e Encerramento
- Inicie com saudação profissional natural ("Olá," / "Olá [Nome],")
- Termine com convite para conversa + despedida simples

3️⃣ Linguagem Natural
- Nada de clichês vazios ("ambiente dinâmico", "trabalhar com tecnologia de ponta")
- Nada de buzzwords genéricas
- Priorize linguagem concreta e intentiva
- Tom experiente, não "tentando impressionar"
` : `
1️⃣ Perspective
- Write always in FIRST PERSON in recruiterMessage and coverLetter
- Never use third person
- Never talk about "the candidate"

2️⃣ Greeting and Closing
- Start with natural professional greeting ("Hello," / "Hi [Name],")
- End with clear call to action + simple farewell

3️⃣ Natural Language
- No empty clichés ("dynamic environment", "cutting-edge technology")
- No generic buzzwords
- Prioritize concrete and intentional language
- Tone of someone experienced, not trying to impress
`}

🛡️ SEGURANÇA CONTRA ALUCINAÇÃO (CRÍTICO):

⛔ ABSOLUTAMENTE PROIBIDO:
- Inventar skills, tecnologias ou experiências não listadas no perfil
- Fabricar métricas, percentuais ou resultados não documentados
- Mencionar empresas ou projetos não listados nos achievements
- Inferir anos de experiência além do que foi estimado

✅ REGRA DE OURO:
"Se não está nos dados estruturados fornecidos, NÃO MENCIONE."

**VERIFICAÇÃO PRÉ-ESCRITA:**
1. Toda skill mencionada está em hardSkillsDetected?
2. Todo achievement mencionado está na lista?
3. Não estou fabricando métricas ou percentuais?
4. O tom é honesto e realista?

${isPt ? `
**ESTRUTURA OBRIGATÓRIA DA COVER LETTER (3-5 parágrafos, 400-500 palavras):**

📍 Parágrafo 1 — Abertura Estratégica:
- Cumprimento profissional natural
- Referência direta ao desafio/responsabilidade principal da vaga
- Conexão rápida com skills relevantes do perfil
- Demonstre entendimento do contexto

📍 Parágrafos 2-3 — Alinhamento Técnico:
- Conectar hard skills obrigatórias com experiência real
- Demonstrar impacto concreto através dos achievements
- Se houver gaps: RECONHECER COM MATURIDADE
- Foque em capacidade de aprendizado e adaptação rápida
- Mencionar arquiteturas, stacks ou projetos relevantes

📍 Parágrafo 3-4 — Diferencial Estratégico:
- Como VOCÊ RESOLVE O PROBLEMA específico da vaga
- Falar sobre ownership, responsabilidade pessoal
- Colaboração efetiva, visão de produto
- Mentalidade de iteração e melhoria contínua
- Soft skills como diferencial (se relevante)

📍 Parágrafo Final — Encerramento:
- Reforço de interesse genuíno
- Convite claro para conversa
- Despedida simples

CRITÉRIOS OBRIGATÓRIOS:
✓ Primeira pessoa ("eu"), NUNCA terceira pessoa
✓ Português totalmente localizado
✓ Diferenciar requisitos obrigatórios vs desejáveis
✓ Ser ESPECÍFICA — nunca vaga
✓ Nenhum metacomentário
✓ Máximo 500 palavras
✓ Sem markdown, apenas texto puro
✓ Proibidas frases genéricas tais como: "tenho interesse", "meu perfil se encaixa", "ambiente dinâmico"
✓ Tom confiante, estratégico, específico
✓ Parecer escrito manualmente por profissional experiente
` : `
**REQUIRED COVER LETTER STRUCTURE (3-5 paragraphs, 400-500 words):**

📍 Paragraph 1 — Strategic Opening:
- Natural professional greeting
- Direct reference to main challenge/responsibility of the role
- Quick connection with relevant skills from profile
- Demonstrate understanding of context

📍 Paragraphs 2-3 — Technical Alignment:
- Connect mandatory hard skills with real experience
- Demonstrate concrete impact through achievements
- If gaps exist: ACKNOWLEDGE WITH MATURITY
- Focus on learning capability and rapid adaptation
- Mention relevant architectures, stacks, or projects

📍 Paragraph 3-4 — Strategic Differentiator:
- How YOU SOLVE the company's specific problem
- Talk about ownership, personal responsibility
- Effective collaboration, product vision
- Iterative thinking and continuous improvement mindset
- Soft skills as differentiator (if relevant)

📍 Final Paragraph — Closing:
- Reinforcement of genuine interest
- Clear invitation for conversation
- Simple farewell

MANDATORY CRITERIA:
✓ First person ("I"), NEVER third person
✓ Fluent English
✓ Differentiate mandatory vs desirable requirements
✓ Be SPECIFIC — never vague
✓ No meta-commentary
✓ Maximum 500 words
✓ Plain text only, no markdown
✓ Forbidden generic phrases: "interested in", "profile fits", "dynamic environment"
✓ Confident, strategic, specific tone
✓ Sound manually written by experienced professional
`}

**FORMATO DE RESPOSTA:**
Retorne APENAS JSON válido (sem markdown, sem explicações adicionais):

{
  "hardSkillsDetected": ["skill1", "skill2", ...],
  "softSkillsEvidence": ["evidence1", "evidence2", ...],
  "mandatoryRequirementsMet": ["req1", "req2", ...],
  "mandatoryRequirementsMissing": ["req1", "req2", ...],
  "desirableRequirementsMet": ["req1", "req2", ...],
  "desirableRequirementsMissing": ["req1", "req2", ...],
  "seniorityMatch": "match"|"above"|"below",
  "redFlags": ["flag1", "flag2", ...],
  "recruiterMessage": "mensagem em texto simples",
  "coverLetter": "carta em texto simples, 3-5 parágrafos"
}`;
}

/**
 * Formata o CV estruturado para o prompt (compilado e legível)
 */
function formatCVSummary(cv: ProcessedCV, isPt: boolean): string {
  const header = isPt ? "RESUMO DO PERFIL:" : "PROFILE SUMMARY:";
  const seniorityLabel = isPt ? "Senioridade" : "Seniority";
  const yearsLabel = isPt ? "Anos de experiência" : "Years of experience";
  const skillsLabel = isPt ? "Skills técnicas" : "Technical skills";
  const companiesLabel = isPt ? "Empresas" : "Companies";
  const achievementsLabel = isPt ? "Principais conquistas" : "Key achievements";
  const experienceLabel = isPt ? "Experiência por skill" : "Experience by skill";

  const experienceStr =
    Object.entries(cv.experienceBySkill).length > 0
      ? Object.entries(cv.experienceBySkill)
          .map(([skill, years]) => `  - ${skill}: ${years}Y`)
          .join("\n")
      : "  (Not detailed)";

  const companiesStr = cv.companies.length > 0 ? cv.companies.map((c) => `  - ${c}`).join("\n") : "  (None extracted)";

  const achievementsStr =
    cv.achievements.length > 0 ? cv.achievements.map((a) => `  - ${a}`).join("\n") : "  (None extracted)";

  return `${header}
${seniorityLabel}: ${cv.seniority}
${yearsLabel}: ${cv.yearsTotal}

${skillsLabel}:
${cv.skills.map((s) => `  - ${s}`).join("\n")}

${companiesLabel}:
${companiesStr}

${experienceLabel}:
${experienceStr}

${achievementsLabel}:
${achievementsStr}`;
}

/**
 * Formata a Job Description estruturada para o prompt
 */
function formatJobSummary(job: ProcessedJobDescription, isPt: boolean): string {
  const header = isPt ? "RESUMO DA VAGA:" : "JOB SUMMARY:";
  const seniorityLabel = isPt ? "Nível de senioridade" : "Seniority level";
  const techStackLabel = isPt ? "Stack tecnológico mencionado" : "Mentioned tech stack";
  const responsibilitiesLabel = isPt ? "Principais responsabilidades" : "Main responsibilities";
  const mandatoryLabel = isPt ? "Requisitos OBRIGATÓRIOS" : "MANDATORY requirements";
  const desirableLabel = isPt ? "Requisitos desejáveis" : "DESIRABLE requirements";

  const mandatoryStr = job.mandatoryRequirements
    .map((r) => `  - ${r}`)
    .join("\n");

  const desirableStr =
    job.desirableRequirements.length > 0
      ? job.desirableRequirements.map((r) => `  - ${r}`).join("\n")
      : `  (${isPt ? "Nenhum extraído" : "None extracted"})`;

  const responsibilitiesStr = job.mainResponsibilities
    .map((r) => `  - ${r}`)
    .join("\n");

  const techStackStr =
    job.techStack.length > 0
      ? job.techStack.map((t) => `  - ${t}`).join("\n")
      : `  (${isPt ? "Nenhuma mencionada" : "None mentioned"})`;

  return `${header}
${seniorityLabel}: ${job.seniorityLevel}

${techStackLabel}:
${techStackStr}

${mandatoryLabel}:
${mandatoryStr}

${desirableLabel}:
${desirableStr}

${responsibilitiesLabel}:
${responsibilitiesStr}`;
}
