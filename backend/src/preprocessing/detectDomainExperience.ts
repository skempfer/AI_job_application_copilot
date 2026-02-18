import { normalizeText } from "./normalizeText";
import { DomainCategory, getDomainsByKeyword } from "./dictionaries/roleSynonyms";

export interface DomainExperienceFlags {
  frontend: boolean;
  backend: boolean;
  fullstack: boolean;
  qa: boolean;
  devops: boolean;
  product: boolean;
}

export interface DomainExperienceDetailed extends DomainExperienceFlags {
  detectedKeywords: {
    frontend: string[];
    backend: string[];
    fullstack: string[];
    qa: string[];
    devops: string[];
    product: string[];
  };
}

export function detectDomainExperience(rawCV: string): DomainExperienceFlags {
  const detailed = detectDomainExperienceDetailed(rawCV);

  return {
    frontend: detailed.frontend,
    backend: detailed.backend,
    fullstack: detailed.fullstack,
    qa: detailed.qa,
    devops: detailed.devops,
    product: detailed.product,
  };
}

export function detectDomainExperienceDetailed(
  rawCV: string
): DomainExperienceDetailed {
  const normalized = normalizeText(rawCV);

  const detectedKeywords: Record<DomainCategory, string[]> = {
    frontend: [],
    backend: [],
    fullstack: [],
    qa: [],
    devops: [],
    product: [],
  };

  const tokens = extractTokens(normalized);

  for (const token of tokens) {
    const domains = getDomainsByKeyword(token);
    if (domains.length > 0) {
    }
    for (const domain of domains) {
      if (!detectedKeywords[domain].includes(token)) {
        detectedKeywords[domain].push(token);
      }
    }
  }

  return {
    frontend: detectedKeywords.frontend.length > 0,
    backend: detectedKeywords.backend.length > 0,
    fullstack: detectedKeywords.fullstack.length > 0,
    qa: detectedKeywords.qa.length > 0,
    devops: detectedKeywords.devops.length > 0,
    product: detectedKeywords.product.length > 0,
    detectedKeywords,
  };
}

function extractTokens(normalizedText: string): string[] {
  const tokens = new Set<string>();

  let cleaned = normalizedText
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "");

  const rawTokens = cleaned.split(/[\s,;:\-_./*+|\\]/);

  for (const token of rawTokens) {
    const t = token.toLowerCase().trim();

    if (
      t.length > 1 &&
      !/^\d+$/.test(t) &&
      !isStopWord(t) &&
      !isNumberRange(t)
    ) {
      tokens.add(t);
    }
  }

  const phrases = extractPhrases(cleaned, 2, 3);
  for (const phrase of phrases) {
    const p = phrase.toLowerCase().trim();
    if (p.length > 1 && !isStopWord(p)) {
      tokens.add(p);
    }
  }

  return Array.from(tokens).sort();
}

function extractPhrases(
  text: string,
  minWords: number = 2,
  maxWords: number = 3
): string[] {
  const phrases = new Set<string>();

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w) && !isStopWord(w));

  for (let nGramSize = minWords; nGramSize <= maxWords; nGramSize++) {
    for (let i = 0; i <= words.length - nGramSize; i++) {
      const phrase = words.slice(i, i + nGramSize).join(" ");
      if (phrase.length > 2) {
        phrases.add(phrase);
      }
    }
  }

  return Array.from(phrases);
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",

  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "being",
  "been",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "ought",
  "get",
  "got",
  "make",
  "made",
  "go",
  "went",
  "come",
  "came",

  "in",
  "on",
  "at",
  "to",
  "by",
  "for",
  "from",
  "with",
  "about",
  "of",
  "as",
  "or",
  "up",
  "out",
  "if",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",

  "years",
  "year",
  "experience",
  "job",
  "position",
  "role",
  "work",
  "company",
  "project",
  "team",
  "skill",
  "skills",
  "profile",
  "cv",
  "resume",
  "resume",
  "contact",
  "email",
  "phone",
  "address",
  "location",
  "date",
  "current",
  "present",

  "o",
  "a",
  "um",
  "uma",
  "os",
  "as",
  "uns",
  "umas",
  "de",
  "em",
  "por",
  "com",
  "sem",
  "para",
  "sob",
  "sobre",
  "são",
  "é",
  "está",
  "estão",
  "foi",
  "foram",
]);

function isStopWord(token: string): boolean {
  return STOP_WORDS.has(token.toLowerCase());
}

function isNumberRange(token: string): boolean {
  return /^\d{4}-\d{4}$/.test(token) || /^\d{1,2}-\d{1,2}$/.test(token);
}

export function countDomainsDetected(flags: DomainExperienceFlags): number {
  return Object.values(flags).filter(Boolean).length;
}

export function getDetectedDomains(
  flags: DomainExperienceFlags
): DomainCategory[] {
  const domains: DomainCategory[] = [];

  for (const [domain, detected] of Object.entries(flags)) {
    if (detected) {
      domains.push(domain as DomainCategory);
    }
  }

  return domains;
}
