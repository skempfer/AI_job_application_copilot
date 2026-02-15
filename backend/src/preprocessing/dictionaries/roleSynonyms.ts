/**
 * Role and Domain Synonym Dictionary
 *
 * Maps keywords/phrases to normalized domain categories
 *
 * Used by domain experience detection to classify roles and skills
 * into high-level domains for pattern matching.
 *
 * Structure: Record<DomainCategory, string[]>
 * where string[] are all synonyms/variations for that domain
 */

export type DomainCategory =
  | "frontend"
  | "backend"
  | "fullstack"
  | "qa"
  | "devops"
  | "product";

/**
 * Comprehensive domain/role synonym dictionary
 *
 * All keywords are lowercase; search text should also be normalized
 *
 * Frontend: UI development, client-side technologies
 * Backend: Server-side, APIs, databases, microservices
 * Fullstack: Both frontend and backend work
 * QA: Testing, quality assurance, automation
 * DevOps: Infrastructure, deployment, CI/CD, cloud
 * Product: Product management, planning, strategy
 */
export const DOMAIN_SYNONYMS: Record<DomainCategory, string[]> = {
  frontend: [
    // Core technologies
    "frontend",
    "front-end",
    "front end",
    "react",
    "reactjs",
    "react.js",
    "vue",
    "vue.js",
    "angular",
    "svelte",
    "next",
    "next.js",
    "nuxt",
    "gatsby",
    "remix",
    "quasar",

    // Role titles
    "ui developer",
    "ux developer",
    "frontend engineer",
    "front-end engineer",
    "front end engineer",
    "web developer",
    "web engineer",
    "javascript developer",
    "js developer",
    "typescript developer",
    "ts developer",
    "css specialist",
    "html developer",

    // UI/UX specific
    "ui engineer",
    "web ui",
    "css engineer",
    "html engineer",
    "component developer",

    // Styling and tools
    "tailwind developer",
    "bootstrap developer",
    "material ui developer",
    "antd developer",
    "css-in-js",
    "styled components",
    "scss developer",
    "sass developer",
    "postcss developer",
    "webpack specialist",
    "vite developer",
    "parcel developer",
    "build tool",
  ],

  backend: [
    // Core technologies
    "backend",
    "back-end",
    "back end",
    "server",
    "api",
    "rest api",
    "graphql",
    "microservices",
    "node",
    "node.js",
    "nodejs",
    "express",
    "nestjs",
    "fastapi",
    "django",
    "flask",
    "rails",
    "ruby on rails",
    "spring",
    "spring boot",
    "java",
    "python",
    "golang",
    "go",
    "rust",
    "c#",
    "csharp",
    "php",
    "swift",
    "kotlin",
    "scala",
    "clojure",
    "perl",
    "r",
    "matlab",

    // Databases
    "database",
    "sql",
    "postgresql",
    "postgres",
    "mysql",
    "mongodb",
    "dynamodb",
    "firestore",
    "cassandra",
    "redis",
    "memcached",
    "elasticsearch",
    "solr",
    "oracle",
    "sqlserver",
    "sql server",

    // Patterns and architecture
    "microservice",
    "monolith",
    "serverless",
    "lambda",
    "orm",
    "sqlalchemy",
    "prisma",
    "typeorm",
    "hibernate",

    // Role titles
    "backend engineer",
    "back-end engineer",
    "back end engineer",
    "server engineer",
    "api engineer",
    "api developer",
    "database engineer",
    "database administrator",
    "dba",
    "senior backend",
    "lead developer",
    "architect",
    "solutions architect",
    "tech lead",
    "engineering lead",

    // Infrastructure (sometimes backend)
    "infrastructure engineer",
    "systems engineer",
  ],

  fullstack: [
    // Core identifiers
    "fullstack",
    "full-stack",
    "full stack",
    "full stack developer",
    "fullstack developer",
    "full-stack developer",
    "full stack engineer",
    "fullstack engineer",
    "full-stack engineer",
    "end to end",
    "end-to-end",
    "end-to-end developer",
    "end to end developer",

    // Combined mentions
    "frontend and backend",
    "backend and frontend",
    "both frontend and backend",
    "both client and server",
    "client-server",
    "client and server",

    // Role titles emphasizing both
    "stack engineer",
    "generalist developer",
  ],

  qa: [
    // Core technologies
    "qa",
    "quality assurance",
    "quality engineer",
    "test engineer",
    "tester",
    "testing",
    "test automation",
    "automation tester",
    "automation engineer",
    "sdet",
    "software development engineer in test",

    // Testing frameworks
    "jest",
    "mocha",
    "chai",
    "vitest",
    "pytest",
    "unittest",
    "rspec",
    "selenium",
    "cypress",
    "playwright",
    "puppeteer",

    // Testing types
    "unit testing",
    "integration testing",
    "e2e",
    "e2e testing",
    "end to end testing",
    "end-to-end testing",
    "functional testing",
    "regression testing",
    "performance testing",
    "load testing",
    "stress testing",

    // Role titles
    "qa engineer",
    "qa developer",
    "senior qa",
    "qa lead",
    "test lead",
    "test manager",
    "quality team lead",

    // Testing focused
    "tdd",
    "test-driven",
    "test driven development",
    "bdd",
    "behavior driven",
  ],

  devops: [
    // Core technologies
    "devops",
    "dev ops",
    "platform engineer",
    "platform engineering",
    "sre",
    "site reliability",
    "site reliability engineer",
    "infrastructure",
    "infrastructure engineer",
    "systems engineer",
    "cloud engineer",
    "cloud architect",

    // Infrastructure tools
    "docker",
    "kubernetes",
    "k8s",
    "terraform",
    "ansible",
    "jenkins",
    "circleci",
    "github actions",
    "gitlab ci",
    "travis ci",
    "ci/cd",
    "continuous integration",
    "continuous deployment",
    "continuous delivery",

    // Cloud platforms
    "aws",
    "amazon web services",
    "azure",
    "gcp",
    "google cloud",
    "heroku",
    "vercel",
    "netlify",
    "cloudflare",
    "digitalocean",

    // Configuration and monitoring
    "prometheus",
    "grafana",
    "datadog",
    "splunk",
    "elk stack",
    "elastic",
    "logstash",
    "kibana",
    "newrelic",
    "new relic",
    "sentry",
    "pagerduty",

    // Linux and shells
    "linux",
    "bash",
    "shell",
    "powershell",
    "scripting",

    // Container and orchestration
    "container",
    "orchestration",
    "container registry",
    "docker registry",
    "helm",

    // Role titles
    "devops engineer",
    "devops lead",
    "infrastructure lead",
    "platform lead",
    "cloud engineer",
    "senior devops",
  ],

  product: [
    // Core titles
    "product owner",
    "product manager",
    "pm",
    "technical product manager",
    "tpm",
    "product leadership",
    "product director",
    "vp product",
    "chief product officer",
    "cpo",

    // Product-adjacent
    "product strategist",
    "product strategist",
    "product analyst",
    "product operations",
    "product ops",
    "product coordinator",
    "product specialist",

    // Planning and strategy
    "strategy",
    "roadmap",
    "product roadmap",
    "planning",
    "product planning",
    "requirements",
    "product requirements",
    "prd",
    "specification",

    // Stakeholder management (product-focused)
    "stakeholder management",
    "cross-functional leadership",
    "product vision",

    // Business roles with technical focus
    "technical lead",
    "tech lead",
    "engineering manager",
    "team lead",
    "lead engineer",
    "principal engineer",
    "staff engineer",
  ],
};

/**
 * Reverse lookup: given a keyword, return which domain(s) it belongs to
 *
 * @param keyword - Normalized keyword to look up
 * @returns Array of domain categories containing this keyword, or empty array
 *
 * @example
 * getDomainsByKeyword("react")
 * // → ["frontend"]
 *
 * @example
 * getDomainsByKeyword("backend")
 * // → ["backend"]
 *
 * @example
 * getDomainsByKeyword("unknown-role")
 * // → []
 */
export function getDomainsByKeyword(keyword: string): DomainCategory[] {
  const normalized = keyword.toLowerCase().trim();

  const domains: DomainCategory[] = [];

  for (const [domain, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    if (synonyms.includes(normalized)) {
      domains.push(domain as DomainCategory);
    }
  }

  return domains;
}

/**
 * Gets all synonyms for a given domain
 *
 * @param domain - Domain category to get synonyms for
 * @returns Array of all keywords/synonyms for this domain
 *
 * @example
 * getSynonymsForDomain("frontend")
 * // → ["react", "vue", "angular", "ui developer", ...]
 */
export function getSynonymsForDomain(domain: DomainCategory): string[] {
  return DOMAIN_SYNONYMS[domain] || [];
}

/**
 * Checks if a keyword belongs to a specific domain
 *
 * @param keyword - Keyword to check
 * @param domain - Domain to check against
 * @returns true if keyword belongs to domain
 *
 * @example
 * isKeywordInDomain("react", "frontend")
 * // → true
 *
 * @example
 * isKeywordInDomain("react", "backend")
 * // → false
 */
export function isKeywordInDomain(
  keyword: string,
  domain: DomainCategory
): boolean {
  const normalized = keyword.toLowerCase().trim();
  return DOMAIN_SYNONYMS[domain]?.includes(normalized) ?? false;
}

/**
 * Gets all available domains
 *
 * @returns Array of all domain categories
 */
export function getAllDomains(): DomainCategory[] {
  return Object.keys(DOMAIN_SYNONYMS) as DomainCategory[];
}
