/**
 * Preprocessing Layer Exports
 *
 * Exposes all deterministic preprocessing utilities for CV and job description analysis
 */

// Text normalization
export { normalizeText } from "./normalizeText";

// Years of experience extraction
export {
  extractYearsExperience,
  type YearsExperienceConfidence,
} from "./extractYearsExperience";

// Domain experience detection
export {
  detectDomainExperience,
  type DomainExperienceFlags,
} from "./detectDomainExperience";

// Role synonyms dictionary
export {
  DOMAIN_SYNONYMS,
  getDomainsByKeyword,
  type DomainCategory,
} from "./dictionaries/roleSynonyms";
