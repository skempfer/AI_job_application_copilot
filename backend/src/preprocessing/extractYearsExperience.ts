import { normalizeText } from "./normalizeText";

const CURRENT_YEAR = new Date().getFullYear();
export type YearsExperienceConfidence = "high" | "medium" | "low";

export interface YearsExperienceResult {
  yearsExperience: number | null;
  confidence: YearsExperienceConfidence;
  method: "explicit_years" | "date_range" | "year_estimate" | "unknown";
}

const EXPLICIT_YEARS_PATTERNS = [
  /(?:over|more than|approximately|~)?\s*(\d{1,2})\s*(?:\+)?\s*(?:years?|anos?|yrs?)\b/gi,
  /(\d{1,2})\s*\+\s*(?:years?|anos?)/gi,
  /(\d{1,2})\s+(?:years?|anos?)\s+of\s+(?:experience|experiência)/gi,
  /(\d{1,2})\s*(?:anos?)\s*(?:de|em)?\s*(?:experi[êe]ncia|exp\.?|atua[cç][aã]o|carreira)/gi,
  /(\d{1,2})\s*(?:anos?)\s*(?:na|em)\s+(?:[aá]rea|fun[cç][aã]o)/gi,
];

const DATE_RANGE_PATTERNS = [
  /(\d{4})\s*[-–—]\s*(?:present|current|today|agora|atual)/gi,
  /(?:\d{1,2}\/)?(\d{4})\s*[-–—]\s*(?:\d{1,2}\/)?(\d{4})/g,
  /(\d{4})\s*(?:[-–—]|to)\s*(\d{4})/g,
  /since\s+(\d{4})/gi,
  /from\s+(\d{4})/gi,
];

export function extractYearsExperience(rawCV: string): YearsExperienceResult {
  if (!rawCV || typeof rawCV !== "string" || rawCV.trim().length === 0) {
    return {
      yearsExperience: null,
      confidence: "low",
      method: "unknown",
    };
  }

  const normalized = normalizeText(rawCV);

  const explicitYears = findExplicitYears(normalized);
  if (explicitYears !== null) {
    return {
      yearsExperience: explicitYears,
      confidence: "high",
      method: "explicit_years",
    };
  }

  const dateRangeYears = findDateRangeYears(normalized);
  if (dateRangeYears !== null) {
    return {
      yearsExperience: dateRangeYears,
      confidence: "high",
      method: "date_range",
    };
  }

  const estimatedYears = estimateFromEarliestYear(normalized);
  if (estimatedYears !== null) {
    return {
      yearsExperience: estimatedYears,
      confidence: "low",
      method: "year_estimate",
    };
  }

  return {
    yearsExperience: null,
    confidence: "low",
    method: "unknown",
  };
}

function findExplicitYears(normalizedText: string): number | null {
  let maxYears = 0;
  let found = false;

  for (const pattern of EXPLICIT_YEARS_PATTERNS) {
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(normalizedText)) !== null) {
      const years = parseInt(match[1], 10);

      if (!isNaN(years) && years >= 1 && years <= 70) {
        maxYears = Math.max(maxYears, years);
        found = true;
      }
    }
  }

  return found ? maxYears : null;
}

function findDateRangeYears(normalizedText: string): number | null {
  let maxYears = 0;
  let found = false;

  for (const pattern of DATE_RANGE_PATTERNS) {
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(normalizedText)) !== null) {
      let years: number | null = null;

      if (match[1] && match.length === 2) {
        const startYear = parseInt(match[1], 10);
        if (!isNaN(startYear) && isReasonableYear(startYear)) {
          years = CURRENT_YEAR - startYear;
        }
      }

      else if (match[1] && match[2]) {
        const startYear = parseInt(match[1], 10);
        const endYear = parseInt(match[2], 10);

        if (
          !isNaN(startYear) &&
          !isNaN(endYear) &&
          isReasonableYear(startYear) &&
          isReasonableYear(endYear) &&
          startYear < endYear
        ) {
          years = endYear - startYear;
        }
      }

      if (years !== null && years >= 0 && years <= 70) {
        maxYears = Math.max(maxYears, years);
        found = true;
      }
    }
  }

  return found ? maxYears : null;
}

function estimateFromEarliestYear(normalizedText: string): number | null {
  const yearPattern = /\b(19\d{2}|20\d{2})\b/g;
  const years: number[] = [];

  let match;
  while ((match = yearPattern.exec(normalizedText)) !== null) {
    const year = parseInt(match[1], 10);
    if (isReasonableYear(year)) {
      years.push(year);
    }
  }

  if (years.length === 0) {
    return null;
  }

  const earliestYear = Math.min(...years);
  const estimatedYears = CURRENT_YEAR - earliestYear;

  // Only return if estimate is reasonable
  if (estimatedYears >= 0 && estimatedYears <= 70) {
    return estimatedYears;
  }

  return null;
}

/**
 * Validates that a year is within reasonable bounds
 *
 * Years should be between 1990 and current year
 * (professional CVs unlikely to mention earlier dates)
 *
 * @param year - Year to validate
 * @returns true if year is reasonable
 */
function isReasonableYear(year: number): boolean {
  const isValid = year >= 1990 && year <= CURRENT_YEAR;
  return isValid;
}

/**
 * Gets the current year used for calculations
 *
 * Exposed for testing purposes
 *
 * @returns Current calendar year
 */
export function getCurrentYear(): number {
  return CURRENT_YEAR;
}
