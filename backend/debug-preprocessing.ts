/**
 * Teste detalhado do preprocessamento de CV
 * Mostra cada etapa para debugar por que skills não estão sendo detectadas
 */

import { preprocessCV, preprocessJobDescription } from "./src/services/preprocessing.js";

// ============================================================================
// DADOS DE TESTE - CV REAL (do erro anterior)
// ============================================================================

const testCV = `João Silva
email: joao@example.com
Tel: (11) 98765-4321

OBJETIVO
Busco posição em empresa dinâmica

EXPERIÊNCIA
Desenvolvedor Full Stack (2020-2024)
- React, Node.js, TypeScript
- PostgreSQL, MongoDB
- Docker, AWS
- Implementei solução que processava 1M requisições/dia

SKILLS
JavaScript, TypeScript, React, Node.js, Python, Docker, AWS, PostgreSQL, MongoDB`;

const testJob = `Senior Software Engineer

Requisitos obrigatórios:
- 5+ anos JavaScript/TypeScript
- React ou Vue.js
- Node.js
- SQL database experience

Requisitos desejáveis:
- AWS
- Docker/Kubernetes
- Experience com GraphQL`;

// ============================================================================
// TESTE PASSO A PASSO
// ============================================================================

console.log("\n📋 ========================================");
console.log("   TESTE DETALHADO DE PREPROCESSAMENTO");
console.log("========================================\n");

console.log("📥 CV ORIGINAL:");
console.log("─".repeat(80));
console.log(testCV);
console.log("─".repeat(80));
console.log(`Tamanho: ${testCV.length} caracteres\n`);

console.log("📥 JOB DESCRIPTION ORIGINAL:");
console.log("─".repeat(80));
console.log(testJob);
console.log("─".repeat(80));
console.log(`Tamanho: ${testJob.length} caracteres\n`);

// ============================================================================
// PREPROCESSAR CV
// ============================================================================

console.log("🔍 PREPROCESSANDO CV...\n");
const processedCV = preprocessCV(testCV);

console.log("📊 RESULTADO DO PREPROCESSAMENTO DE CV:");
console.log("─".repeat(80));
console.log(JSON.stringify(processedCV, null, 2));
console.log("─".repeat(80));
console.log(`
✅ Skills detectadas: ${processedCV.skills.length}
   ${processedCV.skills.length > 0 ? processedCV.skills.join(", ") : "⚠️  NENHUMA SKILL DETECTADA!"}

✅ Senioridade: ${processedCV.seniority}

✅ Anos totais: ${processedCV.yearsTotal}

✅ Empresas: ${processedCV.companies.length}
   ${processedCV.companies.length > 0 ? processedCV.companies.join(", ") : "⚠️  NENHUMA EMPRESA DETECTADA!"}

✅ Achievements: ${processedCV.achievements.length}
   ${processedCV.achievements.map((a, i) => `${i + 1}. ${a}`).join("\n   ")}

✅ Experiência por skill:
   ${JSON.stringify(processedCV.experienceBySkill, null, 3)}
\n`);

// ============================================================================
// PREPROCESSAR JOB
// ============================================================================

console.log("🔍 PREPROCESSANDO JOB DESCRIPTION...\n");
const processedJob = preprocessJobDescription(testJob);

console.log("📊 RESULTADO DO PREPROCESSAMENTO DE JOB:");
console.log("─".repeat(80));
console.log(JSON.stringify(processedJob, null, 2));
console.log("─".repeat(80));
console.log(`
✅ Requisitos OBRIGATÓRIOS: ${processedJob.mandatoryRequirements.length}
   ${processedJob.mandatoryRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n   ")}

✅ Requisitos DESEJÁVEIS: ${processedJob.desirableRequirements.length}
   ${processedJob.desirableRequirements.length > 0 ? processedJob.desirableRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n   ") : "Nenhum"}

✅ Senioridade exigida: ${processedJob.seniorityLevel}

✅ Tech Stack: ${processedJob.techStack.length}
   ${processedJob.techStack.join(", ")}

✅ Responsabilidades: ${processedJob.mainResponsibilities.length}
   ${processedJob.mainResponsibilities.map((r, i) => `${i + 1}. ${r}`).join("\n   ")}
\n`);

// ============================================================================
// ANÁLISE DO PROBLEMA
// ============================================================================

console.log("🔴 DIAGNÓSTICO:");
console.log("─".repeat(80));

if (processedCV.skills.length === 0) {
  console.log("⚠️  PROBLEMA DETECTADO: CV com 0 skills!");
  console.log("\nPossíveis causas:");
  console.log("1. As heurísticas de detecção de skills não estão funcionando");
  console.log("2. Os patterns de regex não estão casando com o CV");
  console.log("3. O CV pode estar em formato não esperado");
  console.log("\nDado que o CV contém: JavaScript, TypeScript, React, Node.js, Python");
  console.log("Esperávamos detectar pelo menos essas skills");
} else {
  console.log("✅ Skills detectadas corretamente!");
}

if (processedJob.mandatoryRequirements.length < 3) {
  console.log("\n⚠️  PROBLEMA DETECTADO: Poucos requisitos obrigatórios!");
  console.log("\nExpectativa: Detectar 'JavaScript/TypeScript', 'React', 'Node.js', 'SQL database'");
  console.log(`Encontrado: ${processedJob.mandatoryRequirements.length}`);
} else {
  console.log("\n✅ Requisitos detectados corretamente!");
}

console.log("\n" + "─".repeat(80));
console.log("✨ Teste concluído\n");
