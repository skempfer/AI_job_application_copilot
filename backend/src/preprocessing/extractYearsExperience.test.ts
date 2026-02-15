import { extractYearsExperience } from "./extractYearsExperience";

describe("extractYearsExperience", () => {
  describe("explicit years patterns", () => {
    test("detects '5 years' format", () => {
      const result = extractYearsExperience("JavaScript developer with 5 years of experience");
      expect(result.yearsExperience).toBe(5);
      expect(result.confidence).toBe("high");
      expect(result.method).toBe("explicit_years");
    });

    test("detects '5+ years' format", () => {
      const result = extractYearsExperience("Senior developer with 8+ years");
      expect(result.yearsExperience).toBe(8);
      expect(result.confidence).toBe("high");
    });

    test("detects 'over X years' format", () => {
      const result = extractYearsExperience("Over 10 years of software development");
      expect(result.yearsExperience).toBe(10);
      expect(result.confidence).toBe("high");
    });

    test("detects 'more than X years' format", () => {
      const result = extractYearsExperience("More than 7 years in the industry");
      expect(result.yearsExperience).toBe(7);
      expect(result.confidence).toBe("high");
    });

    test("detects Portuguese 'anos' (years)", () => {
      const result = extractYearsExperience("Desenvolvedor com 5 anos de experiência");
      expect(result.yearsExperience).toBe(5);
      expect(result.confidence).toBe("high");
    });

    test("uses maximum when multiple mentions found", () => {
      const result = extractYearsExperience(
        "3 years as junior, 5 years as senior, total 8 years"
      );
      expect(result.yearsExperience).toBe(8);
      expect(result.confidence).toBe("high");
    });

    test("ignores unreasonable year values", () => {
      const result = extractYearsExperience("I have 200 years of experience (kidding)");
      expect(result.yearsExperience).not.toBe(200);
    });
  });

  describe("date range patterns", () => {
    test("detects 'YYYY - Present' format", () => {
      const result = extractYearsExperience("Senior Dev (2015 - Present)");
      expect(result.yearsExperience).toBeGreaterThanOrEqual(11); // 2015 to 2026
      expect(result.confidence).toBe("high");
      expect(result.method).toBe("date_range");
    });

    test("detects 'YYYY - present' (lowercase)", () => {
      const result = extractYearsExperience("Developer from 2018 - present");
      expect(result.yearsExperience).toBeGreaterThanOrEqual(8);
      expect(result.confidence).toBe("high");
    });

    test("detects 'YYYY to YYYY' format", () => {
      const result = extractYearsExperience("Worked 2019 to 2023");
      expect(result.yearsExperience).toBe(4);
      expect(result.confidence).toBe("high");
    });

    test("detects 'Since YYYY' format", () => {
      const result = extractYearsExperience("I've been working since 2020");
      expect(result.yearsExperience).toBeGreaterThanOrEqual(6);
      expect(result.confidence).toBe("high");
    });

    test("detects 'From YYYY' format", () => {
      const result = extractYearsExperience("From 2017, working as developer");
      expect(result.yearsExperience).toBeGreaterThanOrEqual(9);
      expect(result.confidence).toBe("high");
    });

    test("handles en-dash (–) in ranges", () => {
      const result = extractYearsExperience("2020 – 2023");
      expect(result.yearsExperience).toBe(3);
      expect(result.confidence).toBe("high");
    });

    test("validates year order (start < end)", () => {
      const result = extractYearsExperience("2025 - 2020"); // Invalid: end before start
      expect(result.yearsExperience).not.toBe(-5);
    });
  });

  describe("year estimation fallback", () => {
    test("estimates from earliest year mentioned when no explicit data", () => {
      const result = extractYearsExperience(
        "Started my career around 2015, did various projects"
      );
      expect(result.yearsExperience).toBeGreaterThanOrEqual(11);
      expect(result.confidence).toBe("low");
      expect(result.method).toBe("year_estimate");
    });

    test("uses minimum reasonable year (1990)", () => {
      const result = extractYearsExperience("Some ancient reference to 1985");
      expect(result.yearsExperience).toBeNull();
    });

    test("estimates within reasonable bounds (max 70 years)", () => {
      const result = extractYearsExperience("In 2015");
      if (result.yearsExperience !== null) {
        expect(result.yearsExperience).toBeLessThanOrEqual(70);
      }
    });
  });

  describe("edge cases", () => {
    test("returns null when no data found", () => {
      const result = extractYearsExperience("Junior developer");
      expect(result.yearsExperience).toBeNull();
      expect(result.confidence).toBe("low");
      expect(result.method).toBe("unknown");
    });

    test("handles empty string", () => {
      const result = extractYearsExperience("");
      expect(result.yearsExperience).toBeNull();
      expect(result.method).toBe("unknown");
    });

    test("handles whitespace only", () => {
      const result = extractYearsExperience("   \n  \n  ");
      expect(result.yearsExperience).toBeNull();
    });

    test("handles null/undefined", () => {
      expect(() =>
        extractYearsExperience(null as unknown as string)
      ).not.toThrow();
      expect(extractYearsExperience(null as unknown as string).yearsExperience).toBeNull();
    });
  });

  describe("multiple patterns in same CV", () => {
    test("prefers explicit years over date ranges", () => {
      const result = extractYearsExperience(
        "5 years of experience, worked from 2015 to 2020"
      );
      expect(result.yearsExperience).toBe(5);
      expect(result.method).toBe("explicit_years");
    });

    test("handles mixed format CV", () => {
      const cv = `
        Professional Summary:
        Backend developer with 3 years of experience (2020 - present)
        Skills: Node.js, React, MongoDB
      `;
      const result = extractYearsExperience(cv);
      expect(result.yearsExperience).toBeGreaterThanOrEqual(3);
      expect(result.confidence).toBe("high");
    });
  });

  describe("confidence levels", () => {
    test("high confidence for explicit years", () => {
      const result = extractYearsExperience("5 years experience");
      expect(result.confidence).toBe("high");
    });

    test("high confidence for date ranges", () => {
      const result = extractYearsExperience("2020 - Present");
      expect(result.confidence).toBe("high");
    });

    test("low confidence for year estimation", () => {
      const result = extractYearsExperience("2020 was a great year");
      if (result.yearsExperience !== null) {
        expect(result.confidence).toBe("low");
      }
    });

    test("low confidence for unknown", () => {
      const result = extractYearsExperience("No year data here");
      expect(result.confidence).toBe("low");
      expect(result.method).toBe("unknown");
    });
  });

  describe("real-world CV examples", () => {
    test("senior developer CV", () => {
      const cv = `
        Senior Software Engineer
        10+ years of software development experience
        Led teams since 2016
      `;
      const result = extractYearsExperience(cv);
      expect(result.yearsExperience).toBeGreaterThanOrEqual(10);
      expect(result.confidence).toBe("high");
    });

    test("junior developer CV", () => {
      const cv = `
        Junior Frontend Developer
        1 year of professional experience
        Recent graduate, worked since 2025
      `;
      const result = extractYearsExperience(cv);
      expect(result.yearsExperience).toBe(1);
      expect(result.method).toBe("explicit_years");
    });

    test("career changer CV", () => {
      const cv = `
        Switching careers from marketing to development
        Completed bootcamp in 2024
        First developer role started Since January 2025
      `;
      const result = extractYearsExperience(cv);
      expect(result.yearsExperience).toBeLessThanOrEqual(2);
    });

    test("long career CV", () => {
      const cv = `
        Distinguished Software Architect
        Over 25 years in the industry
        Started my career in 2001
        Currently at TechCorp (2018 - Present)
      `;
      const result = extractYearsExperience(cv);
      expect(result.yearsExperience).toBe(25);
      expect(result.confidence).toBe("high");
    });
  });
});
