import {
  detectDomainExperience,
  detectDomainExperienceDetailed,
  countDomainsDetected,
  getDetectedDomains,
} from "./detectDomainExperience";
import {
  getDomainsByKeyword,
  isKeywordInDomain,
  getSynonymsForDomain,
} from "./dictionaries/roleSynonyms";

describe("domain synonym dictionary", () => {
  describe("getDomainsByKeyword", () => {
    test("finds frontend technologies", () => {
      expect(getDomainsByKeyword("react")).toContain("frontend");
      expect(getDomainsByKeyword("vue")).toContain("frontend");
      expect(getDomainsByKeyword("angular")).toContain("frontend");
    });

    test("finds backend technologies", () => {
      expect(getDomainsByKeyword("nodejs")).toContain("backend");
      expect(getDomainsByKeyword("mongodb")).toContain("backend");
      expect(getDomainsByKeyword("postgresql")).toContain("backend");
    });

    test("finds QA keywords", () => {
      expect(getDomainsByKeyword("qa")).toContain("qa");
      expect(getDomainsByKeyword("jest")).toContain("qa");
      expect(getDomainsByKeyword("selenium")).toContain("qa");
    });

    test("finds DevOps keywords", () => {
      expect(getDomainsByKeyword("docker")).toContain("devops");
      expect(getDomainsByKeyword("kubernetes")).toContain("devops");
      expect(getDomainsByKeyword("terraform")).toContain("devops");
    });

    test("finds Product keywords", () => {
      expect(getDomainsByKeyword("product manager")).toContain("product");
      expect(getDomainsByKeyword("product owner")).toContain("product");
      expect(getDomainsByKeyword("pm")).toContain("product");
    });

    test("returns empty array for unknown keywords", () => {
      expect(getDomainsByKeyword("unknown-tech-xyz")).toEqual([]);
      expect(getDomainsByKeyword("foobar")).toEqual([]);
    });

    test("case insensitive matching", () => {
      expect(getDomainsByKeyword("REACT")).toContain("frontend");
      expect(getDomainsByKeyword("React")).toContain("frontend");
      expect(getDomainsByKeyword("rEaCt")).toContain("frontend");
    });
  });

  describe("isKeywordInDomain", () => {
    test("validates frontend keywords", () => {
      expect(isKeywordInDomain("react", "frontend")).toBe(true);
      expect(isKeywordInDomain("vue", "frontend")).toBe(true);
      expect(isKeywordInDomain("react", "backend")).toBe(false);
    });

    test("validates backend keywords", () => {
      expect(isKeywordInDomain("nodejs", "backend")).toBe(true);
      expect(isKeywordInDomain("nodejs", "frontend")).toBe(false);
    });

    test("case insensitive validation", () => {
      expect(isKeywordInDomain("REACT", "frontend")).toBe(true);
      expect(isKeywordInDomain("React", "frontend")).toBe(true);
    });
  });

  describe("getSynonymsForDomain", () => {
    test("returns frontend synonyms", () => {
      const synonyms = getSynonymsForDomain("frontend");
      expect(synonyms).toContain("react");
      expect(synonyms).toContain("vue");
      expect(synonyms).toContain("ui developer");
    });

    test("returns backend synonyms", () => {
      const synonyms = getSynonymsForDomain("backend");
      expect(synonyms).toContain("nodejs");
      expect(synonyms).toContain("java");
      expect(synonyms).toContain("database");
    });

    test("all synonyms are non-empty strings", () => {
      const domains: Array<"frontend" | "backend" | "qa" | "devops" | "product" | "fullstack"> = [
        "frontend",
        "backend",
        "qa",
        "devops",
        "product",
        "fullstack",
      ];
      domains.forEach((domain) => {
        const synonyms = getSynonymsForDomain(domain);
        expect(Array.isArray(synonyms)).toBe(true);
        expect(synonyms.length).toBeGreaterThan(0);
        synonyms.forEach((synonym: string) => {
          expect(typeof synonym).toBe("string");
          expect(synonym.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe("detectDomainExperience", () => {
  describe("frontend detection", () => {
    test("detects React developer", () => {
      const result = detectDomainExperience("React developer with 5 years");
      expect(result.frontend).toBe(true);
    });

    test("detects Vue developer", () => {
      const result = detectDomainExperience("Vue.js specialist");
      expect(result.frontend).toBe(true);
    });

    test("detects Angular developer", () => {
      const result = detectDomainExperience("Angular framework expert");
      expect(result.frontend).toBe(true);
    });

    test("detects UI developer", () => {
      const result = detectDomainExperience("UI Engineer");
      expect(result.frontend).toBe(true);
    });

    test("detects frontend with hyphen variations", () => {
      expect(detectDomainExperience("Front-end developer").frontend).toBe(true);
      expect(detectDomainExperience("Front end engineer").frontend).toBe(true);
    });
  });

  describe("backend detection", () => {
    test("detects Node.js developer", () => {
      const result = detectDomainExperience("Node.js backend engineer");
      expect(result.backend).toBe(true);
    });

    test("detects Java developer", () => {
      const result = detectDomainExperience("Java developer with Spring Boot");
      expect(result.backend).toBe(true);
    });

    test("detects Python developer", () => {
      const result = detectDomainExperience("Python Flask specialist");
      expect(result.backend).toBe(true);
    });

    test("detects database engineer", () => {
      const result = detectDomainExperience("Database Administrator with PostgreSQL");
      expect(result.backend).toBe(true);
    });

    test("detects MongoDB experience", () => {
      const result = detectDomainExperience("MongoDB specialist");
      expect(result.backend).toBe(true);
    });

    test("detects API developer", () => {
      const result = detectDomainExperience("REST API Developer");
      expect(result.backend).toBe(true);
    });
  });

  describe("fullstack detection", () => {
    test("detects fullstack developer", () => {
      const result = detectDomainExperience("Fullstack engineer");
      expect(result.fullstack).toBe(true);
    });

    test("detects full-stack variations", () => {
      expect(detectDomainExperience("Full-stack developer").fullstack).toBe(
        true
      );
      expect(detectDomainExperience("Full stack engineer").fullstack).toBe(true);
    });

    test("detects end-to-end developer", () => {
      const result = detectDomainExperience("End-to-end developer");
      expect(result.fullstack).toBe(true);
    });
  });

  describe("QA detection", () => {
    test("detects QA engineer", () => {
      const result = detectDomainExperience("QA Engineer");
      expect(result.qa).toBe(true);
    });

    test("detects quality assurance", () => {
      const result = detectDomainExperience("Quality Assurance specialist");
      expect(result.qa).toBe(true);
    });

    test("detects automation tester", () => {
      const result = detectDomainExperience("Automation Tester");
      expect(result.qa).toBe(true);
    });

    test("detects test engineer", () => {
      const result = detectDomainExperience("Test Engineer with Jest");
      expect(result.qa).toBe(true);
    });

    test("detects SDET", () => {
      const result = detectDomainExperience("SDET at TechCorp");
      expect(result.qa).toBe(true);
    });

    test("detects testing framework developers", () => {
      expect(detectDomainExperience("Jest specialist").qa).toBe(true);
      expect(detectDomainExperience("Selenium expert").qa).toBe(true);
      expect(detectDomainExperience("Cypress testing").qa).toBe(true);
    });
  });

  describe("DevOps detection", () => {
    test("detects DevOps engineer", () => {
      const result = detectDomainExperience("DevOps engineer");
      expect(result.devops).toBe(true);
    });

    test("detects infrastructure engineer", () => {
      const result = detectDomainExperience("Infrastructure engineer");
      expect(result.devops).toBe(true);
    });

    test("detects SRE", () => {
      const result = detectDomainExperience("Site Reliability Engineer");
      expect(result.devops).toBe(true);
    });

    test("detects container/orchestration experience", () => {
      expect(detectDomainExperience("Docker specialist").devops).toBe(true);
      expect(detectDomainExperience("Kubernetes expert").devops).toBe(true);
      expect(detectDomainExperience("Terraform developer").devops).toBe(true);
    });

    test("detects CI/CD experience", () => {
      expect(detectDomainExperience("Github Actions").devops).toBe(true);
      expect(detectDomainExperience("Jenkins pipeline").devops).toBe(true);
      expect(
        detectDomainExperience("continuous integration and deployment").devops
      ).toBe(true);
    });

    test("detects cloud platform experience", () => {
      expect(detectDomainExperience("AWS architect").devops).toBe(true);
      expect(detectDomainExperience("Azure expert").devops).toBe(true);
      expect(detectDomainExperience("GCP engineer").devops).toBe(true);
    });
  });

  describe("Product detection", () => {
    test("detects product manager", () => {
      const result = detectDomainExperience("Product Manager");
      expect(result.product).toBe(true);
    });

    test("detects product owner", () => {
      const result = detectDomainExperience("Product Owner");
      expect(result.product).toBe(true);
    });

    test("detects PM abbreviation", () => {
      const result = detectDomainExperience("Technical PM");
      expect(result.product).toBe(true);
    });

    test("detects product strategist", () => {
      const result = detectDomainExperience("Product strategist");
      expect(result.product).toBe(true);
    });
  });

  describe("combined domains", () => {
    test("detects frontend + backend (fullstack)", () => {
      const result = detectDomainExperience(
        "React and Node.js developer with 5 years"
      );
      expect(result.frontend).toBe(true);
      expect(result.backend).toBe(true);
    });

    test("detects multiple domains in complex CV", () => {
      const cv = `
        Fullstack Engineer with DevOps experience
        Frontend: React, Vue
        Backend: Node.js, PostgreSQL
        DevOps: Docker, Kubernetes, AWS
        Testing: Jest, Selenium
      `;
      const result = detectDomainExperience(cv);
      expect(result.frontend).toBe(true);
      expect(result.backend).toBe(true);
      expect(result.fullstack).toBe(true);
      expect(result.devops).toBe(true);
      expect(result.qa).toBe(true);
    });

    test("detects backend + QA", () => {
      const result = detectDomainExperience(
        "Backend engineer and test automation specialist"
      );
      expect(result.backend).toBe(true);
      expect(result.qa).toBe(true);
    });
  });

  describe("case insensitivity", () => {
    test("detects uppercase domains", () => {
      const result = detectDomainExperience("REACT DEVELOPER");
      expect(result.frontend).toBe(true);
    });

    test("detects mixed case domains", () => {
      const result = detectDomainExperience("ReAcT.Js DevelOpER");
      expect(result.frontend).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("returns all false for unknown technology", () => {
      const result = detectDomainExperience("Cobol developer with Fortran");
      expect(result.frontend).toBe(false);
      expect(result.backend).toBe(false);
      expect(result.qa).toBe(false);
      expect(result.devops).toBe(false);
      expect(result.product).toBe(false);
      expect(result.fullstack).toBe(false);
    });

    test("handles empty string", () => {
      const result = detectDomainExperience("");
      expect(result.frontend).toBe(false);
      expect(result.backend).toBe(false);
    });

    test("handles whitespace only", () => {
      const result = detectDomainExperience("   \n  \n  ");
      expect(result.frontend).toBe(false);
    });

    test("ignores personal data like names", () => {
      const result = detectDomainExperience("John Developer is a software engineer");
      expect(result.frontend || result.backend).not.toBe(true);
    });
  });
});

describe("detectDomainExperienceDetailed", () => {
  test("includes detected keywords", () => {
    const result = detectDomainExperienceDetailed("React and Node.js developer");
    expect(result.detectedKeywords.frontend).toContain("react");
    expect(
      result.detectedKeywords.backend.some(
        (kw: string) => kw.includes("node") || kw.includes("nodejs")
      )
    ).toBe(true);
  });

  test("tracks evidence for debugging", () => {
    const result = detectDomainExperienceDetailed(
      "QA Engineer with Jest and Selenium"
    );
    expect(result.detectedKeywords.qa.length).toBeGreaterThan(0);
    expect(
      result.detectedKeywords.qa.some((kw: string) =>
        kw.includes("jest") || kw.includes("selenium")
      )
    ).toBe(true);
  });
});

describe("countDomainsDetected", () => {
  test("counts detected domains correctly", () => {
    let result = detectDomainExperience("React developer");
    expect(countDomainsDetected(result)).toBe(1);

    result = detectDomainExperience("React and Node.js fullstack");
    expect(countDomainsDetected(result)).toBeGreaterThan(1);
  });
});

describe("getDetectedDomains", () => {
  test("returns list of detected domains", () => {
    const result = detectDomainExperience("React, Node.js, Docker, QA tester");
    const domains = getDetectedDomains(result);
    expect(Array.isArray(domains)).toBe(true);
    expect(domains.length).toBeGreaterThan(0);
  });

  test("returns empty array when no domains detected", () => {
    const result = detectDomainExperience("Random text");
    expect(getDetectedDomains(result)).toEqual([]);
  });
});

describe("real-world CV examples", () => {
  test("senior fullstack engineer CV", () => {
    const cv = `
      Senior Fullstack Engineer
      Expert in React and Node.js
      AWS certified DevOps practitioner
      5+ years in the industry
    `;
    const result = detectDomainExperience(cv);
    expect(result.frontend).toBe(true);
    expect(result.backend).toBe(true);
    expect(result.fullstack).toBe(true);
    expect(result.devops).toBe(true);
  });

  test("QA automation specialist CV", () => {
    const cv = `
      QA Automation Engineer
      Selenium, Jest, and Cypress expert
      CI/CD pipeline experience with Jenkins
      Test-driven development advocate
    `;
    const result = detectDomainExperience(cv);
    expect(result.qa).toBe(true);
    expect(result.devops).toBe(true);
  });

  test("backend API specialist CV", () => {
    const cv = `
      Backend API Developer
      Specialized in Node.js and MongoDB
      PostgreSQL and Redis optimization
      Microservices architecture
    `;
    const result = detectDomainExperience(cv);
    expect(result.backend).toBe(true);
    expect(result.frontend).toBe(false);
  });

  test("product manager CV", () => {
    const cv = `
      Senior Product Manager
      Roadmap planning and strategy
      Cross-functional team leadership
      Data-driven decision making
    `;
    const result = detectDomainExperience(cv);
    expect(result.product).toBe(true);
  });
});
