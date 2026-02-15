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
];

const DATE_RANGE_PATTERNS = [
  /(\d{4})\s*[-–]\s*(?:present|current|today|agora|atual)/gi,
  /(\d{4})\s*(?:[-–]|to)\s*(\d{4})/g,
  /since\s+(\d{4})/gi,
  /from\s+(\d{4})/gi,
];

export function extractYearsExperience(rawCV: string): YearsExperienceResult {
  if (!rawCV || typeof rawCV !== "string" || rawCV.trim().length === 0) {
    console.log("[extractYearsExperience] Empty or invalid CV");
    return {
      yearsExperience: null,
      confidence: "low",
      method: "unknown",
    };
  }

  const normalized = normalizeText(rawCV);
  console.log("[extractYearsExperience] Normalized CV (first 200 chars):", normalized.substring(0, 200));

  const explicitYears = findExplicitYears(normalized);
  console.log("[extractYearsExperience] Strategy 1 (explicit years):", explicitYears);
  if (explicitYears !== null) {
    console.log("[extractYearsExperience] ✓ Found explicit years:", explicitYears);
    return {
      yearsExperience: explicitYears,
      confidence: "high",
      method: "explicit_years",
    };
  }


  const dateRangeYears = findDateRangeYears(normalized);
  console.log("[extractYearsExperience] Strategy 2 (date ranges):", dateRangeYears);
  if (dateRangeYears !== null) {
    console.log("[extractYearsExperience] ✓ Found date range years:", dateRangeYears);
    return {
      yearsExperience: dateRangeYears,
      confidence: "high",
      method: "date_range",
    };
  }

  const estimatedYears = estimateFromEarliestYear(normalized);
  console.log("[extractYearsExperience] Strategy 3 (earliest year estimation):", estimatedYears);
  if (estimatedYears !== null) {
    console.log("[extractYearsExperience] ✓ Estimated years from earliest year:", estimatedYears);
    return {
      yearsExperience: estimatedYears,
      confidence: "low",
      method: "year_estimate",
    };
  }

  console.log("[extractYearsExperience] ✗ No years of experience data found");
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
      console.log("[findExplicitYears] Pattern match:", {
        fullMatch: match[0],
        yearsParsed: years,
        isValid: !isNaN(years) && years >= 1 && years <= 70,
      });

      if (!isNaN(years) && years >= 1 && years <= 70) {
        maxYears = Math.max(maxYears, years);
        found = true;
      }
    }
  }

  console.log("[findExplicitYears] Final result:", found ? maxYears : null);
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

      console.log("[findDateRangeYears] Pattern match:", {
        fullMatch: match[0],
        hasGroup1: !!match[1],
        group1: match[1],
        hasGroup2: !!match[2],
        group2: match[2],
      });

      if (match[1] && match.length === 2) {
        const startYear = parseInt(match[1], 10);
        if (!isNaN(startYear) && isReasonableYear(startYear)) {
          years = CURRENT_YEAR - startYear;
          console.log("[findDateRangeYears] Case 1 (Present):", {
            startYear,
            currentYear: CURRENT_YEAR,
            calculated: years,
          });
        }
      }

      else if (match[1] && match[2]) {
        const startYear = parseInt(match[1], 10);
        const endYear = parseInt(match[2], 10);

        console.log("[findDateRangeYears] Case 2 (Range):", {
          startYear,
          endYear,
          startValid: !isNaN(startYear) && isReasonableYear(startYear),
          endValid: !isNaN(endYear) && isReasonableYear(endYear),
          rangeValid: startYear < endYear,
        });

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

  console.log("[findDateRangeYears] Final result:", found ? maxYears : null);
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
      console.log("[estimateFromEarliestYear] Found year:", year);
    }
  }

  if (years.length === 0) {
    console.log("[estimateFromEarliestYear] No reasonable years found");
    return null;
  }

  const earliestYear = Math.min(...years);
  const estimatedYears = CURRENT_YEAR - earliestYear;

  console.log("[estimateFromEarliestYear] Years found:", years);
  console.log("[estimateFromEarliestYear] Earliest year:", earliestYear);
  console.log("[estimateFromEarliestYear] Estimated years:", estimatedYears);

  // Only return if estimate is reasonable
  if (estimatedYears >= 0 && estimatedYears <= 70) {
    console.log("[estimateFromEarliestYear] ✓ Result is reasonable");
    return estimatedYears;
  }

  console.log("[estimateFromEarliestYear] ✗ Result is out of bounds");
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
  if (!isValid) {
    console.log("[isReasonableYear] Year rejected:", year, {
      minYear: 1990,
      maxYear: CURRENT_YEAR,
      reason: year < 1990 ? "too old" : "in future",
    });
  }
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
