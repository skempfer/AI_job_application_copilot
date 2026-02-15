/**
 * Domain/Role Experience Detection
 *
 * Implements semantic detection of domain expertise by matching CV content
 * against a normalized synonym dictionary.
 *
 * Process:
 * 1. Normalize CV text for matching
 * 2. Extract meaningful sections (skills, roles, achievements)
 * 3. Match normalized keywords against domain synonym dictionary
 * 4. Return boolean flags indicating detected domains
 */

import { normalizeText } from "./normalizeText";
import { DomainCategory, getDomainsByKeyword } from "./dictionaries/roleSynonyms";

/**
 * Result of domain experience detection
 * Boolean flags for each domain category
 */
export interface DomainExperienceFlags {
  frontend: boolean;
  backend: boolean;
  fullstack: boolean;
  qa: boolean;
  devops: boolean;
  product: boolean;
}

/**
 * Detailed domain detection with evidence tracking
 * Useful for debugging and explaining decisions
 */
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

/**
 * Detects domain experience from CV text
 *
 * Uses normalized text matching against synonym dictionary to identify
 * domain expertise without heavy NLP/AI processing.
 *
 * @param rawCV - Raw CV text
 * @returns Boolean flags for each domain
 *
 * @example
 * detectDomainExperience("JavaScript React developer, 5 years")
 * // → { frontend: true, backend: false, fullstack: false, qa: false, devops: false, product: false }
 *
 * @example
 * detectDomainExperience("Full stack engineer: Node.js & React")
 * // → { frontend: true, backend: true, fullstack: true, qa: false, devops: false, product: false }
 *
 * @example
 * detectDomainExperience("QA Engineer with Selenium and Jest")
 * // → { frontend: false, backend: false, fullstack: false, qa: true, devops: false, product: false }
 */
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

/**
 * Detects domain experience with keyword evidence
 *
 * Same as detectDomainExperience but includes the keywords that triggered detection
 *
 * @param rawCV - Raw CV text
 * @returns Domain flags plus detected keywords (for debugging)
 *
 * @example
 * const result = detectDomainExperienceDetailed("React & Node developer")
 * console.log(result.frontend) // → true
 * console.log(result.detectedKeywords.frontend) // → ["react"]
 * console.log(result.detectedKeywords.backend) // → ["node.js", "nodejs"]
 */
export function detectDomainExperienceDetailed(
  rawCV: string
): DomainExperienceDetailed {
  const normalized = normalizeText(rawCV);
  console.log("[detectDomainExperienceDetailed] Input: first 100 chars:", rawCV.substring(0, 100));

  // Initialize result with all domains as empty arrays
  const detectedKeywords: Record<DomainCategory, string[]> = {
    frontend: [],
    backend: [],
    fullstack: [],
    qa: [],
    devops: [],
    product: [],
  };

  // Extract tokens from normalized text for matching
  const tokens = extractTokens(normalized);
  console.log("[detectDomainExperienceDetailed] Extracted tokens:", tokens.slice(0, 20)); // First 20 tokens

  // For each unique token, check if it matches a domain keyword
  for (const token of tokens) {
    const domains = getDomainsByKeyword(token);
    if (domains.length > 0) {
      console.log("[detectDomainExperienceDetailed] Token matched:", token, "→", domains);
    }
    for (const domain of domains) {
      if (!detectedKeywords[domain].includes(token)) {
        detectedKeywords[domain].push(token);
      }
    }
  }

  console.log("[detectDomainExperienceDetailed] Final results:", {
    frontend: detectedKeywords.frontend.length,
    backend: detectedKeywords.backend.length,
    fullstack: detectedKeywords.fullstack.length,
    qa: detectedKeywords.qa.length,
    devops: detectedKeywords.devops.length,
    product: detectedKeywords.product.length,
  });

  // Convert to boolean flags
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

/**
 * Extracts meaningful tokens from normalized text
 *
 * Strategy:
 * 1. Split by common delimiters (whitespace, commas, etc.)
 * 2. Remove numbers, special chars, and very short tokens
 * 3. Check multi-word phrases (2-3 words)
 * 4. Return sorted unique tokens
 *
 * @param normalizedText - Text that's already been normalized
 * @returns Array of unique lowercase tokens
 */
function extractTokens(normalizedText: string): string[] {
  const tokens = new Set<string>();

  // Remove URLs, emails, and common noise
  let cleaned = normalizedText
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    .replace(/\(.*?\)/g, "") // Remove parentheses content
    .replace(/\[.*?\]/g, ""); // Remove brackets content

  // Split into potential tokens
  const rawTokens = cleaned.split(/[\s,;:\-_./*+|\\]/);

  // Process single-word tokens
  for (const token of rawTokens) {
    const t = token.toLowerCase().trim();

    // Keep if:
    // - Non-empty
    // - Longer than 1 char
    // - Not purely numeric
    // - Not common stop words
    if (
      t.length > 1 &&
      !/^\d+$/.test(t) &&
      !isStopWord(t) &&
      !isNumberRange(t)
    ) {
      tokens.add(t);
    }
  }

  // Extract 2-3 word phrases from original normalized text
  // This helps catch "frontend engineer", "qa automation", etc.
  const phrases = extractPhrases(cleaned, 2, 3);
  for (const phrase of phrases) {
    const p = phrase.toLowerCase().trim();
    if (p.length > 1 && !isStopWord(p)) {
      tokens.add(p);
    }
  }

  return Array.from(tokens).sort();
}

/**
 * Extracts N-gram phrases from text
 *
 * @param text - Text to extract phrases from
 * @param minWords - Minimum words in phrase
 * @param maxWords - Maximum words in phrase
 * @returns Unique phrases found
 */
function extractPhrases(
  text: string,
  minWords: number = 2,
  maxWords: number = 3
): string[] {
  const phrases = new Set<string>();

  // Split into words (removing punctuation)
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w) && !isStopWord(w));

  // Generate n-grams
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

/**
 * Common stop words to ignore in token extraction
 *
 * These words appear frequently but don't indicate domain expertise
 */
const STOP_WORDS = new Set([
  // Articles and pronouns
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

  // Common verbs
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

  // Prepositions
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

  // Common in CVs but not domain-specific
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

  // Portuguese equivalents
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

/**
 * Checks if a token is a common stop word
 *
 * @param token - Token to check
 * @returns true if token is in stop word list
 */
function isStopWord(token: string): boolean {
  return STOP_WORDS.has(token.toLowerCase());
}

/**
 * Checks if a token looks like a year range (e.g., "2019-2021")
 *
 * @param token - Token to check
 * @returns true if token looks like a year range
 */
function isNumberRange(token: string): boolean {
  return /^\d{4}-\d{4}$/.test(token) || /^\d{1,2}-\d{1,2}$/.test(token);
}

/**
 * Counts total domains detected in CV
 *
 * Useful for understanding breadth of candidate's experience
 *
 * @param flags - Domain experience flags
 * @returns Number of domains detected
 *
 * @example
 * const flags = { frontend: true, backend: true, fullstack: false, ... }
 * countDomainsDetected(flags) // → 2
 */
export function countDomainsDetected(flags: DomainExperienceFlags): number {
  return Object.values(flags).filter(Boolean).length;
}

/**
 * Gets list of detected domains
 *
 * @param flags - Domain experience flags
 * @returns Array of detected domain names
 *
 * @example
 * const flags = { frontend: true, backend: false, fullstack: true, ... }
 * getDetectedDomains(flags) // → ["frontend", "fullstack"]
 */
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
