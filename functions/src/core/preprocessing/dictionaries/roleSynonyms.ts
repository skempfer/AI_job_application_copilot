export type DomainCategory =
  | "frontend"
  | "backend"
  | "fullstack"
  | "qa"
  | "devops"
  | "product";

export const DOMAIN_SYNONYMS: Record<DomainCategory, string[]> = {
  frontend: [
    "frontend", "front-end", "front end", "react", "reactjs", "react.js", "vue", "vue.js", "angular",
    "svelte", "next", "next.js", "nuxt", "gatsby", "remix", "quasar",
    "ui developer", "ux developer", "frontend engineer", "front-end engineer", "front end engineer",
    "web developer", "web engineer", "javascript developer", "js developer", "typescript developer",
    "ts developer", "css specialist", "html developer", "ui engineer", "web ui", "css engineer",
    "html engineer", "component developer", "tailwind developer", "bootstrap developer",
    "material ui developer", "antd developer", "css-in-js", "styled components", "scss developer",
    "sass developer", "postcss developer", "webpack specialist", "vite developer",
    "parcel developer", "build tool",
  ],

  backend: [
    "backend", "back-end", "back end", "server", "api", "rest api", "graphql", "microservices",
    "node", "node.js", "nodejs", "express", "nestjs", "fastapi", "django", "flask", "rails",
    "ruby on rails", "spring", "spring boot", "java", "python", "golang", "go", "rust", "c#",
    "csharp", "php", "swift", "kotlin", "scala", "clojure", "perl", "r", "matlab",
    "database", "sql", "postgresql", "postgres", "mysql", "mongodb", "dynamodb", "firestore",
    "cassandra", "redis", "memcached", "elasticsearch", "solr", "oracle", "sqlserver",
    "sql server", "microservice", "monolith", "serverless", "lambda", "orm", "sqlalchemy",
    "prisma", "typeorm", "hibernate", "backend engineer", "back-end engineer", "back end engineer",
    "server engineer", "api engineer", "api developer", "database engineer", "database administrator",
    "dba", "senior backend", "lead developer", "architect", "solutions architect", "tech lead",
    "engineering lead", "infrastructure engineer", "systems engineer",
  ],

  fullstack: [
    "fullstack", "full-stack", "full stack", "full stack developer", "fullstack developer",
    "full-stack developer", "full stack engineer", "fullstack engineer", "full-stack engineer",
    "end to end", "end-to-end", "end-to-end developer", "end to end developer",
    "frontend and backend", "backend and frontend", "both frontend and backend", "both client and server",
    "client-server", "client and server", "stack engineer", "generalist developer",
  ],

  qa: [
    "qa", "quality assurance", "quality engineer", "test engineer", "tester", "testing",
    "test automation", "automation tester", "automation engineer", "sdet",
    "software development engineer in test", "jest", "mocha", "chai", "vitest", "pytest",
    "unittest", "rspec", "selenium", "cypress", "playwright", "puppeteer",
    "unit testing", "integration testing", "e2e", "e2e testing", "end to end testing",
    "end-to-end testing", "functional testing", "regression testing", "performance testing",
    "load testing", "stress testing", "qa engineer", "qa developer", "senior qa", "qa lead",
    "test lead", "test manager", "quality team lead", "tdd", "test-driven",
    "test driven development", "bdd", "behavior driven",
  ],

  devops: [
    "devops", "dev ops", "platform engineer", "platform engineering", "sre", "site reliability",
    "site reliability engineer", "infrastructure", "infrastructure engineer", "systems engineer",
    "cloud engineer", "cloud architect", "docker", "kubernetes", "k8s", "terraform", "ansible",
    "jenkins", "circleci", "github actions", "gitlab ci", "travis ci", "ci/cd",
    "continuous integration", "continuous deployment", "continuous delivery", "aws",
    "amazon web services", "azure", "gcp", "google cloud", "heroku", "vercel", "netlify",
    "cloudflare", "digitalocean", "prometheus", "grafana", "datadog", "splunk", "elk stack",
    "elastic", "logstash", "kibana", "newrelic", "new relic", "sentry", "pagerduty", "linux",
    "bash", "shell", "powershell", "scripting", "container", "orchestration", "container registry",
    "docker registry", "helm", "devops engineer", "devops lead", "infrastructure lead",
    "platform lead", "cloud engineer", "senior devops",
  ],

  product: [
    "product owner", "product manager", "pm", "technical product manager", "tpm",
    "product leadership", "product director", "vp product", "chief product officer", "cpo",
    "product strategist", "product analyst", "product operations", "product ops", "product coordinator",
    "product specialist", "strategy", "roadmap", "product roadmap", "planning", "product planning",
    "requirements", "product requirements", "prd", "specification", "stakeholder management",
    "cross-functional leadership", "product vision", "technical lead", "tech lead",
    "engineering manager", "team lead", "lead engineer", "principal engineer", "staff engineer",
  ],
};

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

export function getSynonymsForDomain(domain: DomainCategory): string[] {
  return DOMAIN_SYNONYMS[domain] || [];
}

export function isKeywordInDomain(
  keyword: string,
  domain: DomainCategory
): boolean {
  const normalized = keyword.toLowerCase().trim();
  return DOMAIN_SYNONYMS[domain]?.includes(normalized) ?? false;
}

export function getAllDomains(): DomainCategory[] {
  return Object.keys(DOMAIN_SYNONYMS) as DomainCategory[];
}
