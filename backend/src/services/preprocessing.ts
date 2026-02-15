/**
 * CV and Job Description preprocessing service
 * Goal: Reduce tokens and improve AI parsing quality
 *
 * Simple heuristics: regex + basic parsing (no heavy libraries)
 *
 * IMPROVED: Now includes deterministic preprocessing layer with:
 * - Years of experience inference (never defaults to 0)
 * - Domain/role semantic detection using normalized synonym dictionary
 */

import { extractYearsExperience, YearsExperienceConfidence } from "../preprocessing/extractYearsExperience";
import { detectDomainExperience, DomainExperienceFlags } from "../preprocessing/detectDomainExperience";

/**
 * Structured data from a preprocessed CV
 */
export interface ProcessedCV {
  // Original fields
  skills: string[];
  seniority: "junior" | "mid" | "senior" | "unknown";
  experienceBySkill: Record<string, number>;
  companies: string[];
  achievements: string[];

  // DEPRECATED: Use yearsExperience instead (was defaulting to 0)
  yearsTotal: number;

  // NEW: Deterministic years experience inference
  yearsExperience: number | null;
  yearsExperienceConfidence: YearsExperienceConfidence;

  // NEW: Domain experience detection
  domainExperience: DomainExperienceFlags;
}

export interface ProcessedJobDescription {
  mandatoryRequirements: string[];
  desirableRequirements: string[];
  seniorityLevel: "junior" | "mid" | "senior" | "unknown";
  mainResponsibilities: string[];
  techStack: string[];
}

const PERSONAL_DATA_PATTERNS = [
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, 
  /\b\d{1,2}\.\d{3}\.\d{3}-?\d{1}\b/g,
  
  /\b(?:\+?55)?[\s.-]?(?:11|[0-9]{2})[\s.-]?(?:9\d{4}|\d{4})[\s.-]?\d{4}\b/g,
  /\b\(?[0-9]{2}\)?[\s.-]?[0-9]{4,5}[\s.-]?[0-9]{4}\b/g,
  
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  
  /(?:rua|av|avenida|apto|apartamento|n[ºo]|cep|cidade|estado|país)[\s:].+/gi,
  
  /(?:estado civil|marital status)[\s:].+/gi,
];

/**
 * Generic sections to remove
 */
const GENERIC_SECTIONS = [
  /#{0,3}\s*objetivo\s*:?.*/gi,
  /#{0,3}\s*summary\s*:?.*/gi,
  /#{0,3}\s*professional\s+objective\s*:?.*/gi,
  /participo em comunidades?.*(?:\n|$)/gi,
  /fiz cursos? online\.?.*(?:\n|$)/gi,
  /busco.*(?:crescimento|desenvolvimento|desafios?).*/gi,
  /apaixonado por.*(?:tecnologia|código|inovação)/gi,
  /dinâmico|ambicioso|dedicado|proativo/gi,
];


const SKILL_SYNONYMS: Record<string, string> = {
  "js": "javascript",
  "ts": "typescript",
  "py": "python",
  "rb": "ruby",
  "react": "react",
  "reactjs": "react",
  "react.js": "react",
  "vue": "vue.js",
  "angular": "angular",
  "node": "nodejs",
  "node.js": "nodejs",
  "sql": "sql",
  "nosql": "nosql",
  "mongo": "mongodb",
  "postgres": "postgresql",
  "docker": "docker",
  "k8s": "kubernetes",
  "aws": "aws",
  "gcp": "google cloud",
  "azure": "azure",
  "ci/cd": "ci/cd",
  "rest": "rest api",
  "graphql": "graphql",
  "testing": "testing",
  "jest": "jest",
  "vitest": "vitest",
  "oop": "oop",
  "design patterns": "design patterns",
};

/**
 * Patterns to detect seniority and years of experience
 */
const SENIORITY_PATTERNS = {
  senior: /\b(senior|lead|principal|staff|architect|principal engineer|engineering manager)\b/gi,
  mid: /\b(mid-level|mid level|pleno|specialist)\b/gi,
  junior: /\b(junior|entry|estagiário|trainee|graduate)\b/gi,
};

const YEARS_PATTERN = /(\d{1,2})\s*(?:\+|\s)?(?:years?|anos?|yrs?)\s*(?:of\s+)?(?:experience|experiência|exp\.?)?/gi;


export function preprocessCV(rawCV: string): ProcessedCV {
  console.log("[preprocessCV] Started. CV length:", rawCV.length);
  console.log("[preprocessCV] First 100 chars:", rawCV.substring(0, 100));
  
  let cleaned = rawCV;
  for (const pattern of PERSONAL_DATA_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[redacted]");
  }

  for (const pattern of GENERIC_SECTIONS) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned
    .replace(/\r\n/g, "\n") 
    .replace(/\n{3,}/g, "\n\n") 
    .replace(/\s+$/gm, "") 
    .trim();

  const seniorityMatch = cleaned.match(SENIORITY_PATTERNS.senior);
  const midMatch = cleaned.match(SENIORITY_PATTERNS.mid);
  const juniorMatch = cleaned.match(SENIORITY_PATTERNS.junior);

  let seniority: ProcessedCV["seniority"] = "unknown";
  if (seniorityMatch) seniority = "senior";
  else if (midMatch) seniority = "mid";
  else if (juniorMatch) seniority = "junior";

  const yearsMatches = cleaned.matchAll(YEARS_PATTERN);
  let yearsTotal = 0;
  const yearsArray: number[] = [];
  for (const match of yearsMatches) {
    const years = parseInt(match[1], 10);
    if (!isNaN(years)) yearsArray.push(years);
  }
  if (yearsArray.length > 0) {
    yearsTotal = Math.max(...yearsArray); 
  }

  const skillsSet = new Set<string>();
  const commonTechs = [
    "javascript", "typescript", "python", "java", "csharp", "c#", "golang", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "clojure", "perl", "r", "matlab",
    "react", "vue", "angular", "svelte", "next.js", "nuxt", "gatsby", "remix",
    "node.js", "nodejs", "express", "nestjs", "fastapi", "django", "flask", "rails",
    "spring", "hibernate", "sqlalchemy", "prisma", "typeorm",
    "sql", "postgresql", "mysql", "mongodb", "dynamodb", "firestore", "cassandra",
    "redis", "memcached", "elasticsearch", "solr",
    "docker", "kubernetes", "terraform", "ansible", "jenkins", "circleci", "github actions",
    "aws", "azure", "gcp", "google cloud", "heroku", "vercel", "netlify",
    "git", "graphql", "rest", "grpc", "websocket", "mqtt",
    "testing", "jest", "mocha", "vitest", "pytest", "unittest", "rspec",
    "tdd", "bdd", "oop", "functional programming", "microservices", "serverless",
    "design patterns", "architecture", "devops", "ci/cd", "agile", "scrum",
    "html", "css", "sass", "tailwind", "bootstrap", "material-ui",
    "webpack", "vite", "parcel", "esbuild", "rollup",
    "linux", "windows", "macos", "bash", "shell", "powershell",
    "machine learning", "data science", "nlp", "computer vision", "ai",
    "blockchain", "web3", "solidity", "smart contracts",
  ];

  const cleanedLower = cleaned.toLowerCase();
  for (const tech of commonTechs) {
    const pattern = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    if (pattern.test(cleanedLower)) {
      const normalized = SKILL_SYNONYMS[tech.toLowerCase()] || tech;
      skillsSet.add(normalized);
    }
  }

  const companies = new Set<string>();
  const companyPatterns = [
    /(?:at|em)\s+([A-Z][A-Za-z0-9\s&\-\.]+?)(?:\s*[\|•\-]|$)/gm,
    /(?:company|empresa|organização|organização)\s*:\s*([^\n]+)/gi,
  ];

  for (const pattern of companyPatterns) {
    const matches = cleaned.matchAll(pattern);
    for (const match of matches) {
      const companyName = match[1]?.trim();
      if (companyName && companyName.length > 2 && companyName.length < 100) {
        if (!/^\d+|job|role|position|título|cargo/i.test(companyName)) {
          companies.add(companyName);
        }
      }
    }
  }

  const achievements: string[] = [];
  const achievementVerbs = [
    "developed", "built", "created", "implemented", "designed", "architected",
    "optimized", "improved", "increased", "reduced", "decreased",
    "deployed", "launched", "released", "shipped",
    "desenvolveu", "construiu", "criou", "implementou", "projetou",
    "otimizou", "melhorou", "aumentou", "reduziu", "diminuiu",
    "implantou", "lançou", "liberou",
  ];

  const lines = cleaned.split("\n");
  for (const line of lines) {
    const hasVerb = achievementVerbs.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line));
    const hasMetric = /\d+%?|[A-Z]{2,}|framework|library|platform|system|app|service|api/i.test(line);
    const isLongEnough = line.length > 20 && line.length < 200;

    if (hasVerb && hasMetric && isLongEnough && !line.includes("[redacted]")) {
      const trimmed = line
        .replace(/^[-•\s]+/, "") 
        .replace(/^[\d.]+\s+/, "")
        .trim();

      if (trimmed && !achievements.includes(trimmed)) {
        achievements.push(trimmed);
      }
    }
  }

  achievements.splice(5);

  const experienceBySkill: Record<string, number> = {};
  const skillYearsPattern = /(\d{1,2})\s*(?:\+|\s)?(?:years?|anos?)\s+(?:of\s+)?(.+?)(?:\.|,|;|\n|$)/gi;

  let match;
  while ((match = skillYearsPattern.exec(cleaned)) !== null) {
    const years = parseInt(match[1], 10);
    let skill = match[2]?.trim() ?? "";

    if (skill && years && skill.length < 50) {
      skill = skill.toLowerCase();
      for (const [key, value] of Object.entries(SKILL_SYNONYMS)) {
        if (skill.includes(key)) {
          skill = value;
          break;
        }
      }

      if (!experienceBySkill[skill] || experienceBySkill[skill] < years) {
        experienceBySkill[skill] = years;
      }
    }
  }

  // NEW: Extract years of experience using deterministic inference
  const yearsExperienceResult = extractYearsExperience(rawCV);
  console.log([yearsExperienceResult])
  console.log("[preprocessCV] Years extraction result:", {
    yearsExperience: yearsExperienceResult.yearsExperience,
    confidence: yearsExperienceResult.confidence,
    method: yearsExperienceResult.method,
  });

  const domainExperience = detectDomainExperience(rawCV);
  console.log("[preprocessCV] Domain experience detected:", domainExperience);

  return {
    skills: Array.from(skillsSet).sort(),
    seniority,
    experienceBySkill,
    companies: Array.from(companies).slice(0, 10),
    achievements,
    yearsTotal,
    yearsExperience: yearsExperienceResult.yearsExperience,
    yearsExperienceConfidence: yearsExperienceResult.confidence,
    domainExperience,
  };
}


export function preprocessJobDescription(rawJob: string): ProcessedJobDescription {
  let cleaned = rawJob;

  const institutionalPatterns = [
    /(?:about\s+us|sobre\s+n[óo]s|cultura|culture|valores|values|missão|mission|visão|vision).*/gi,
    /(?:benefícios|benefits|salary|salário|perks|perk).+(?:\n|$)/gi,
    /(?:dinâmico|dynamic|inovador|innovative|collaborative|colaborativo|agile|ágil|fast-paced|rápido).*/gi,
    /(?:ambiente|environment).+(?:\n|$)/gi,
    /(?:por que se juntar|why join|por que vir|reasons to join).*/gi,
    /(?:processo de seleção|application process|hiring process|candidate journey).*/gi,
  ];

  for (const pattern of institutionalPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+$/gm, "")
    .trim();

  const seniorityKeywords = {
    senior: /\b(senior|lead|principal|staff|chief|architect)\b/gi,
    mid: /\b(mid-level|mid\s+level|pleno|specialist|advanced)\b/gi,
    junior: /\b(junior|entry-level|entry\s+level|graduate|trainee)\b/gi,
  };

  let seniorityLevel: ProcessedJobDescription["seniorityLevel"] = "unknown";
  if (seniorityKeywords.senior.test(cleaned)) seniorityLevel = "senior";
  else if (seniorityKeywords.mid.test(cleaned)) seniorityLevel = "mid";
  else if (seniorityKeywords.junior.test(cleaned)) seniorityLevel = "junior";

  const techStack = new Set<string>();
  const commonTechs = [
    "javascript", "typescript", "python", "java", "golang", "rust", "ruby", "php",
    "react", "vue", "angular", "next.js", "nodejs", "node.js",
    "postgresql", "mongodb", "mysql", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "azure", "gcp",
    "git", "graphql", "rest", "api",
  ];

  const cleanedLower = cleaned.toLowerCase();
  for (const tech of commonTechs) {
    const pattern = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    if (pattern.test(cleanedLower)) {
      techStack.add(SKILL_SYNONYMS[tech.toLowerCase()] || tech);
    }
  }

  const mandatoryRequirements: string[] = [];
  const desirableRequirements: string[] = [];

  const mandatoryMarkers = [
    /(?:required|obrigatório|must have|essential|necessário|essencial)\s*:?(.+?)(?=\n|$)/gis,
    /(?:requirements|requisitos)\s*:?(.+?)(?=(?:desired|desejável|nice to have|bônus)|$)/gis,
  ];

  const desirableMarkers = [
    /(?:desired|desejável|nice to have|bônus|bonus|preferred|preferencial|idealmente)\s*:?(.+?)(?=\n(?:requirements|requisitos)|$)/gis,
  ];

  for (const pattern of mandatoryMarkers) {
    const matches = cleaned.matchAll(pattern);
    for (const match of matches) {
      const section = match[1] || match[0];
      const items = section
        .split(/[\n•\-]/g)
        .map((item) => item.trim())
        .filter((item) => item && item.length > 3 && item.length < 150);

      for (const item of items) {
        if (!mandatoryRequirements.includes(item)) {
          mandatoryRequirements.push(item);
        }
      }
    }
  }

  for (const pattern of desirableMarkers) {
    const matches = cleaned.matchAll(pattern);
    for (const match of matches) {
      const section = match[1] || match[0];
      const items = section
        .split(/[\n•\-]/g)
        .map((item) => item.trim())
        .filter((item) => item && item.length > 3 && item.length < 150);

      for (const item of items) {
        if (!desirableRequirements.includes(item)) {
          desirableRequirements.push(item);
        }
      }
    }
  }

  mandatoryRequirements.splice(15);
  desirableRequirements.splice(10);

  const mainResponsibilities: string[] = [];
  const responsibilityVerbs = [
    "develop", "design", "build", "architect", "lead", "manage", "coordinate",
    "optimize", "improve", "implement", "maintain", "support", "mentor",
    "desenvolver", "projetar", "construir", "otimizar", "melhorar", "manter", "apoiar",
  ];

  const lines = cleaned.split("\n");
  for (const line of lines) {
    const hasVerb = responsibilityVerbs.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line));
    const isLongEnough = line.length > 15 && line.length < 200;

    if (hasVerb && isLongEnough) {
      const trimmed = line
        .replace(/^[-•\s\d.]+/, "")
        .trim();

      if (trimmed && !mainResponsibilities.includes(trimmed)) {
        mainResponsibilities.push(trimmed);
      }
    }
  }

  mainResponsibilities.splice(8);

  return {
    mandatoryRequirements: mandatoryRequirements.length > 0 ? mandatoryRequirements : ["No specific requirements extracted"],
    desirableRequirements: desirableRequirements.length > 0 ? desirableRequirements : [],
    seniorityLevel,
    mainResponsibilities: mainResponsibilities.length > 0 ? mainResponsibilities : ["No specific responsibilities extracted"],
    techStack: Array.from(techStack).sort(),
  };
}
