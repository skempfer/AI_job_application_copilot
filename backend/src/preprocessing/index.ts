/**
 * Preprocessing Layer Exports
 *
 * Exposes all deterministic preprocessing utilities for CV and job description analysis
 */

// Text normalization
export { normalizeText, getDomainTermVariation, hasExcessiveSpacing, normalizePhrase } from "./normalizeText";

// Years of experience extraction
export {
  extractYearsExperience,
  type YearsExperienceResult,
  type YearsExperienceConfidence,
  getCurrentYear,
} from "./extractYearsExperience";

// Domain experience detection
export {
  detectDomainExperience,
  detectDomainExperienceDetailed,
  countDomainsDetected,
  getDetectedDomains,
  type DomainExperienceFlags,
  type DomainExperienceDetailed,
} from "./detectDomainExperience";

// Role synonyms dictionary
export {
  DOMAIN_SYNONYMS,
  getDomainsByKeyword,
  getSynonymsForDomain,
  isKeywordInDomain,
  getAllDomains,
  type DomainCategory,
} from "./dictionaries/roleSynonyms";
