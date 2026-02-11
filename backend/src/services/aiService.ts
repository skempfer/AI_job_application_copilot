import OpenAI from "openai";
import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";

/**
 * Versão do prompt (atualizar quando houver mudanças significativas)
 */
const PROMPT_VERSION = "v1.1";

/**
 * Serviço de IA usando Groq (API compatível com OpenAI)
 * Groq fornece acesso grátis aos modelos Llama com velocidade ultra-rápida
 * 
 * ARQUITETURA HÍBRIDA:
 * - IA: extrai sinais e classifica requisitos
 * - Código: calcula score final de forma determinística
 */
export class AIService {
  private client: OpenAI;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiUrl,
    });
    this.model = config.model;
  }

  /**
   * Prompt engineering V1.1 - Focado em extrair sinais estruturados
   * 
   * MUDANÇA: IA não calcula score, apenas identifica e classifica
   * Score é calculado deterministicamente pelo código
   */
  private buildPrompt(cv: string, jobDescription: string, language: "pt" | "en"): string {
    return `Você é um senior tech recruiter experiente. Analise objetivamente o CV do candidato e a vaga.

**VERSÃO DO PROMPT:** ${PROMPT_VERSION}

**SUA TAREFA:** Extrair sinais estruturados (NÃO calcular score).

**CV DO CANDIDATO:**
${cv}

**DESCRIÇÃO DA VAGA:**
${jobDescription}

**IDIOMA DAS MENSAGENS:** ${language === "pt" ? "Português" : "English"}
Escreva recruiterMessage e coverLetter no idioma acima.

**SINAIS A EXTRAIR:**

1. **hardSkillsDetected**: Lista de hard skills técnicas do CV que são relevantes para a vaga
2. **softSkillsDetected**: Lista de soft skills identificadas (liderança, comunicação, etc.)
3. **mandatoryRequirementsMet**: Requisitos obrigatórios da vaga que o candidato atende
4. **mandatoryRequirementsMissing**: Requisitos obrigatórios que o candidato NÃO atende
5. **desirableRequirementsMet**: Diferenciais/requisitos desejáveis que o candidato possui
6. **desirableRequirementsMissing**: Diferenciais que o candidato não possui
7. **seniorityMatch**: "above" (overqualified), "match" (perfeito) ou "below" (underqualified)
8. **redFlags**: Problemas graves (ex: falta experiência mínima, skill crítica ausente, etc.)
9. **recruiterMessage**: Mensagem estrategica personalizada (4-6 frases) para enviar ao recrutador, escrita em primeira pessoa, com saudacao e despedida
10. **coverLetter**: Carta de apresentacao formal para envio junto com CV, 3-5 paragrafos, estrutura: abertura, alinhamento tecnico, diferencial estrategico, encerramento

**CRITÉRIOS:**

A mensagem deve se adaptar ao contexto da vaga e ao nivel tecnico de aderencia.

🎯 INTELIGENCIA CONTEXTUAL OBRIGATORIA

Antes de escrever, o modelo deve avaliar:

- Nivel de senioridade da vaga (junior, mid, senior)
- Tipo de empresa (startup dinamica vs empresa estruturada/corporativa)
- Nivel de fit tecnico (alto, medio, baixo)
- Se ha gaps criticos obrigatorios

A linguagem deve se adaptar automaticamente a isso.

📌 DIRETRIZES ESTRATEGICAS

1️⃣ Perspectiva

Escreva sempre em primeira pessoa.

Nunca use terceira pessoa.

Nunca fale sobre "o candidato".

2️⃣ Saudacao e Encerramento

Inicie com saudacao profissional natural:

"Ola,"

"Ola [Nome]," (se disponivel)

Termine com:

Convite objetivo para conversa

Despedida simples (ex: "Atenciosamente," ou "Abracos,")

3️⃣ Estrutura Inteligente da Mensagem

A mensagem deve:

Demonstrar entendimento real do desafio da vaga

Conectar minhas hard skills diretamente as necessidades do cargo

Posicionar-me explicitamente como alguem que pode gerar impacto

Se houver gaps relevantes:

Reconhecer com maturidade

Compensar com soft skills fortes e aprendizado continuo

Encerrar com convite profissional claro para conversa

4️⃣ Adaptacao por Nivel de Fit

Se o fit tecnico for alto:

Linguagem mais assertiva

Foco em impacto imediato

Se o fit for medio:

Linguagem equilibrada

Destacar capacidade de adaptacao e evolucao rapida

Se o fit for baixo (mas aplicavel):

Focar mais em:

Capacidade de aprendizado

Colaboracao

Mentalidade de crescimento

Nao fingir aderencia tecnica inexistente

5️⃣ Tom por Tipo de Empresa

Startup:

Mais direto

Orientado a impacto

Linguagem dinamica

Corporativa:

Mais estruturado

Enfase em consistencia e colaboracao

Tom ligeiramente mais formal

6️⃣ Restricoes

Nada de frases genericas como:

"Tenho interesse na vaga"

"Acredito que meu perfil se encaixa"

Nada de buzzwords vazias

Nada de exageros

Nada de metacomentarios

Sem markdown

Retornar apenas texto puro

🔎 8️⃣ Identificacao da Empresa (Regra de Fallback)

Antes de escrever a mensagem:

Verifique se o nome da empresa esta claramente identificado na descricao da vaga.

Se estiver explicito, mencione o nome da empresa naturalmente na mensagem.

Se NAO estiver claramente identificado:

NAO invente nome.

NAO use placeholders.

Utilize termos neutros como:

"projeto"

"plataforma"

"produto"

"equipe"

"organizacao"

Escolha o termo mais coerente com o contexto da vaga.

Nunca escreva frases vagas como:

"na empresa"

"na sua empresa"

"na companhia"

Sempre adapte o substantivo ao contexto da vaga.

🔄 Ajustes de Linguagem Natural

1️⃣ Evitar tom exageradamente entusiasmado

Nao usar expressoes como:

"Estou ansioso"

"Estou particularmente interessado"

"Fazer uma diferenca significativa"

"Startup dinamica e colaborativa"

2️⃣ Preferir linguagem de intencao concreta, no futuro simples ou imperfeito:

"Gostaria de conversar..."

"Vejo que posso contribuir..."

"Posso apoiar o projeto em..."

"Seria interessante discutir..."

"Acredito que minha experiencia em X pode ajudar em Y"

"Fico a disposicao para uma conversa"

3️⃣ Evitar linguagem performatica ou emocional exagerada.

4️⃣ Soar como alguem experiente, nao como alguem tentando impressionar.

🎯 Estrutura Mais Natural (preferida)

Primeira frase: referencia direta ao desafio da vaga

Segunda frase: conexao objetiva com experiencia

Terceira frase: proposta de conversa

Quarta frase: despedida simples

7️⃣ Instrucao explicita ao modelo

"Write the message in a natural and realistic tone, as if written manually by an experienced professional. Avoid exaggerated enthusiasm, generic corporate phrases, and overconfident statements. Prefer calm, intentional language that suggests collaboration and contribution. The message must feel grounded, thoughtful, and human — not promotional or AI-generated."

**COVER LETTER — ESPECIFICACOES DETALHADAS**

A cover letter deve ser formal, profissional, natural e estrategica. Ela é o primeiro contato escrito que mostra nao apenas aderencia tecnica, mas tambem entendimento do problema do negocio.

🛡️ SEGURANCA CONTRA ALUCINACAO (ANTI-FABRICACAO DE DADOS) — OBRIGATORIO:

⛔ ABSOLUTAMENTE PROIBIDO:
- Inventar que o candidato "acompanhou", "trabalhou com", "desenvolveu" ou "usou" algo NAO PRESENTE NO CV
- Fabricar metricas, numeros, percentuais, resultados (ex: "reduzi latencia em 80%", "processava 1M requisicoes/dia")
- Mencionar empresas especificas ou clientes NAO listados no CV (ex: "Google", "Spotify", "Teachable" se nao estao no CV)
- Inferir anos de experiencia alem do que esta documentado (ex: "5 anos em React" se o CV nao especifica)
- Descrever projetos, responsabilidades ou decisoes tecnicas nao documentadas
- Mencionar linguagens, frameworks, stacks ou tecnologias nao citadas no CV
- Criar datas, periodos de trabalho ou timelines nao explicitas
- Mencionar certificacoes, diplomas, cursos nao listados formalmente

⚠️ REGRA DE OURO ANTI-ALUCINACAO:

"Se uma experiencia, skill, tecnologia ou resultado NAO ESTA EXPLICITAMENTE ESCRITO NO CV FORNECIDO, NAO MENCIONE. Nao ha execoes. Nao infira, nao suponha, nao generalize."

EXEMPLOS DO QUE NAO FAZER:

❌ ERRADO: "Acompanhei o desenvolvimento de plataformas de educacao online..." (CV nao menciona isto)
❌ ERRADO: "Com minha experiencia em React..." (Se React nao esta no CV)
❌ ERRADO: "Tenho 10 anos em desenvolvimento..." (Se CV nao especifica)
❌ ERRADO: "Implementei solucoes de ML que aumentaram conversao em 45%..." (Metrica inventada)

✅ CORRETO: "Tenho experiencia em [SKILL MENCIONADO NO CV]..."
✅ CORRETO: "Trabalho com [TECNOLOGIA DO CV] e vejo aplicacao direta em [REQUISITO DA VAGA]..."
✅ CORRETO: "No meu ultimo projeto, [DESCRICAO EXATA DO CV]..."

✅ Se dados insuficientes:
- Ser honestamente generico: "Tenho interesse em desenvolver nessa area"
- Reconhecer o gap: "Nao tenho experiencia direta, mas meu background em [CV EXATO] me prepara"
- Focar em transferencia de skills: "Minhas experiencias em [CV] podem se aplicar a [VAGA]"
- NUNCA fingir expertise nao mencionada

VERIFICACAO PRE-ESCRITA (OBRIGATORIO):

Antes de escrever cada paragrafo:
1. VERIFIQUE: Toda skill/tecnologia mencionada esta no CV?
2. VERIFIQUE: Todo resultado/metrica esta documentado?
3. VERIFIQUE: Toda empresa/projeto esta listado?
4. VERIFIQUE: Nao estou inferindo anos de experiencia?
5. VERIFIQUE: O paragrafo so usa FATOS DO CV?

Se responder NAO a qualquer pergunta, REESCREVA SEM INVENTAR.

ESTRUTURA OBRIGATORIA (3-5 paragrafos, 400-500 palavras):

📍 Paragrafo 1 — Abertura Estrategica:
- Cumprimento profissional natural (ex: "Ola,")
- Referencia DIRETA a vaga/projeto (mencione o titulo ou desafio principal)
- Conexao rapida com experiencia relevante
- Demonstre entendimento do contexto (que problema a empresa esta resolvendo?)

📍 Paragrafo 2-3 — Alinhamento Tecnico:
- Conectar hard skills obrigatorias COM experiencias reais (nao apenas listar)
- Demonstrar impacto concreto (numeros, responsabilidades, decisoes tecnicas importantes)
- Se ha gaps criticos: RECONHECER COM MATURIDADE (nao fingir expertise inexistente)
- Foque em capacidade de aprendizado, velocidade de adaptacao, mentalidade de crescimento
- Mencionar arquiteturas, stacks, ou projetos relevantes

📍 Paragrafo 3-4 — Diferencial Estrategico (a parte que diferencia):
- Mostrar como VOCE RESOLVE O PROBLEMA especifico da empresa
- Falar sobre:
  - Ownership e responsabilidade pessoal
  - Colaboracao efetiva
  - Visao de produto
  - Lideranca tecnica ou mentoria (se relevante)
  - Mentalidade de iteracao/melhoria continua
- Demonstrar entendimento de tradeoffs e pragmatismo
- Se ha soft skills forte (comunicacao, pensamento critico): posicione como diferencial

📍 Paragrafo Final — Encerramento (1-2 frases):
- Reforco de interesse genuino (nao generica)
- Convite claro para conversa (ex: "Fico a disposicao para uma conversa sobre...")
- Despedida formal simples (ex: "Atenciosamente,")

CRITERIOS OBRIGATORIOS:

✓ Escrita em primeira pessoa ("eu"), NUNCA terceira pessoa
✓ Idioma correto: ${language === "pt" ? "Português totalmente localizado" : "English fluent"}
✓ Diferenciar claramente requisitos obrigatorios vs desejáveis
✓ Se fit tecnico NAO for alto: incluir soft skills como compensador
✓ Posicionar candidato como SOLUCAO do problema, nao como "interessado na vaga"
✓ SER ESPECIFICA — nunca vaga (ex: "Typescript e arquitetura de microservicos" > "tecnologia")
✓ Nenhum metacomentario ou explicacoes sobre analise
✓ Maximo 400-500 palavras
✓ NAO usar markdown (apenas texto puro)
✓ Proibido usar frases genericas:
  × "Tenho interesse na vaga"
  × "Acredito que meu perfil se encaixa"
  × "Estou particularmente interessado"
  × "Fazer uma diferenca significativa"
  × "Empresa dinamica e inovadora"
  × "Ambiente colaborativo"

✓ Tom confiante, estrategico e especifico
✓ Parecer como algo escrito manualmente por um profissional experiente (nao como IA)
✓ Preferir linguagem de intencao concreta: "Gostaria de conversar...", "Vejo que posso contribuir...", "Acredito que minha experiencia em X pode ajudar em Y"

📝 FORMATACAO OBRIGATORIA DO TEXTO:

- Cada parágrafo deve ser separado por UMA linha em branco (\n\n)
- Nenhuma linha vazia no início ou final do texto (usar .trim())
- Máximo de 2 quebras de linha consecutivas
- Sem pontuação duplicada ou espaços extra
- Sem aspas ou caracteres desnecessários no início/fim
- Parágrafos curtos (3-5 linhas cada máximo)
- Primeira linha de cada parágrafo SEM indentação

EXEMPLOS DE BOA ESTRUTURA (SEGURA CONTRA ALUCINACAO):

[PT EXAMPLE - CORRETO]
Ola,

Vi que a empresa precisa reforçar sua equipe em machine learning e infraestrutura de dados. Tenho experiencia em pipelines de dados e fiz arquitetura de streaming em projetos anteriores, onde trabalhei com otimizacao de latencia e processamento em larga escala.

O que me atrai nao é apenas o stack tecnologico, mas a oportunidade de colaborar em um desafio real: escalar sistemas de ML sem comprometer consistencia de dados. No meu ultimo projeto, abordei exatamente esse tradeoff ao implementar features de processing distribuido.

Apesar de nao ter experiencia comercial direta em Python, meu background em systems design me permite aprender rapidamente novas linguagens. O que realmente importa: entender problema tecnico profundamente e entregar producao estavel.

Gostaria de conversar sobre como posso contribuir no projeto. Fico a disposicao para uma conversa detalhada.

Atenciosamente,

[NOTAS SOBRE ESSE EXEMPLO]
- NAO menciona empresa especifica nem plataforma (evita alucinacao)
- Primeiro paragrafo conecta o que está NA VAGA com skills gerais DO CV
- Segundo paragrafo é honesto sobre o que foi feito (sem fabricar metricas especificas)
- Terceiro reconhece gap mas mostra capacidade de aprendizado
- Encerramento simples e profissional
- NUNCA diz "tenho X anos em Y" a menos que EXPLICITAMENTE no CV
- NUNCA menciona clientes, empresas ou metricas inventadas

**IMPORTANTE:** 
- Retorne APENAS JSON válido (sem markdown)
- NÃO calcule fitScore nem decision (o código fará isso)
- NÃO invente skills ou experiencias que não estão explicitamente no CV

**FORMATO DE RESPOSTA:**
{
  "hardSkillsDetected": ["skill1", "skill2", ...],
  "softSkillsEvidence": ["evidência1", "evidência2", ...],
  "mandatoryRequirementsMet": ["req1", "req2", ...],
  "mandatoryRequirementsMissing": ["req1", "req2", ...],
  "desirableRequirementsMet": ["req1", "req2", ...],
  "desirableRequirementsMissing": ["req1", "req2", ...],
  "seniorityMatch": "match"|"above"|"below",
  "redFlags": ["flag1", "flag2", ...],
  "recruiterMessage": "mensagem em texto simples, profissional e em primeira pessoa",
  "coverLetter": "carta de apresentacao em texto simples, 3-5 paragrafos, 400-500 palavras, estrutura: abertura + alinhamento tecnico + diferencial + encerramento. OBRIGATORIO: Use APENAS fatos do CV, nao invente experiencias, empresas, metricas ou skills nao documentadas"
}`;
  }

  async analyzeJobFit(cv: string, jobDescription: string, language: "pt" | "en" = "en"): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(cv, jobDescription, language);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Você é um assistente que retorna APENAS JSON válido, sem markdown ou texto adicional.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("AI retornou resposta vazia");
      }

      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const signals = JSON.parse(cleanJson) as AISignals;

      this.validateSignals(signals);

      const fitScore = calculateFitScore(signals);
      
      const explanation = generateExplanation(signals, fitScore);
      
      const decision = determineDecision(fitScore);

      const result: AnalysisResult = {
        fitScore,
        decision,
        strengths: [
          ...signals.hardSkillsDetected.map(s => `Hard skill: ${s}`),
          ...signals.mandatoryRequirementsMet.map(r => `Requisito atendido: ${r}`),
          ...signals.desirableRequirementsMet.map(d => `Diferencial: ${d}`),
        ],
        gaps: [
          ...signals.mandatoryRequirementsMissing.map(r => `Requisito faltando: ${r}`),
          ...signals.desirableRequirementsMissing.map(d => `Diferencial ausente: ${d}`),
          ...signals.redFlags,
        ],
        cvSuggestions: this.generateCVSuggestions(signals),
        recruiterMessage: signals.recruiterMessage,
        coverLetter: signals.coverLetter,
        explanation,
        promptVersion: PROMPT_VERSION,
      };

      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Falha ao parsear resposta da IA: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Gera sugestões de ajustes no CV baseado nos sinais
   */
  private generateCVSuggestions(signals: AISignals): string[] {
    const suggestions: string[] = [];

    if (signals.mandatoryRequirementsMissing.length > 0) {
      suggestions.push(
        `Destaque experiências relacionadas a: ${signals.mandatoryRequirementsMissing.slice(0, 2).join(', ')}`
      );
    }

    if (signals.hardSkillsDetected.length < 3) {
      suggestions.push('Adicione mais detalhes sobre suas habilidades técnicas');
    }

    if (signals.seniorityMatch === 'below') {
      suggestions.push('Enfatize projetos complexos e liderança técnica para demonstrar senioridade');
    }

    if (signals.desirableRequirementsMissing.length > 0 && signals.desirableRequirementsMet.length > 0) {
      suggestions.push('Destaque seus diferenciais no topo do CV');
    }

    if (suggestions.length === 0) {
      suggestions.push('Seu CV está bem alinhado. Apenas revise formatação e clareza.');
    }

    return suggestions;
  }

  /**
   * Valida os sinais extraídos pela IA
   */
  private validateSignals(signals: any): asserts signals is AISignals {
    const required = [
      "hardSkillsDetected",
      "mandatoryRequirementsMet",
      "mandatoryRequirementsMissing",
      "desirableRequirementsMet",
      "desirableRequirementsMissing",
      "softSkillsEvidence",
      "seniorityMatch",
      "redFlags",
      "recruiterMessage",
      "coverLetter"
    ];
    
    const missing = required.filter((field) => !(field in signals));

    if (missing.length > 0) {
      throw new Error(`Resposta da IA inválida. Campos faltando: ${missing.join(", ")}`);
    }

    const arrayFields = [
      "hardSkillsDetected",
      "mandatoryRequirementsMet",
      "mandatoryRequirementsMissing",
      "desirableRequirementsMet",
      "desirableRequirementsMissing",
      "softSkillsEvidence",
      "redFlags"
    ];

    for (const field of arrayFields) {
      if (!Array.isArray(signals[field])) {
        throw new Error(`${field} deve ser um array`);
      }
    }

    if (!["below", "match", "above"].includes(signals.seniorityMatch)) {
      throw new Error("seniorityMatch deve ser 'below', 'match' ou 'above'");
    }

    if (typeof signals.recruiterMessage !== "string" || signals.recruiterMessage.length === 0) {
      throw new Error("recruiterMessage deve ser uma string não vazia");
    }

    if (typeof signals.coverLetter !== "string" || signals.coverLetter.length === 0) {
      throw new Error("coverLetter deve ser uma string não vazia");
    }
  }
}
