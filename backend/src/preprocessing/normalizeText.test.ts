import {
  normalizeText,
  getDomainTermVariation,
  hasExcessiveSpacing,
  normalizePhrase,
} from "./normalizeText";

describe("normalizeText", () => {
  describe("basic normalization", () => {
    test("converts to lowercase", () => {
      expect(normalizeText("FRONTEND Developer")).toBe("frontend developer");
    });

    test("normalizes line endings to \\n", () => {
      const text = "Line 1\r\nLine 2\rLine 3";
      expect(normalizeText(text)).toBe("line 1\nline 2\nline 3");
    });

    test("normalizes multiple spaces to single space", () => {
      expect(normalizeText("Developer   with   multiple   spaces")).toBe(
        "developer with multiple spaces"
      );
    });

    test("removes trailing whitespace", () => {
      expect(normalizeText("Developer   \n   React  \n  ")).toBe(
        "developer\nreact"
      );
    });

    test("removes multiple consecutive newlines", () => {
      const text = "Line 1\n\n\n\nLine 2\n\n\n\nLine 3";
      expect(normalizeText(text)).toBe("line 1\n\nline 2\n\nline 3");
    });
  });

  describe("domain term normalization", () => {
    test("normalizes front-end variations", () => {
      expect(normalizeText("Frontend Developer")).toBe("frontend developer");
      expect(normalizeText("Front-end Developer")).toBe("frontend developer");
      expect(normalizeText("Front end Developer")).toBe("frontend developer");
    });

    test("normalizes back-end variations", () => {
      expect(normalizeText("Backend Developer")).toBe("backend developer");
      expect(normalizeText("Back-end Developer")).toBe("backend developer");
      expect(normalizeText("Back end Developer")).toBe("backend developer");
    });

    test("normalizes fullstack variations", () => {
      expect(normalizeText("Fullstack Engineer")).toBe("fullstack engineer");
      expect(normalizeText("Full-stack Engineer")).toBe("fullstack engineer");
      expect(normalizeText("Full stack Engineer")).toBe("fullstack engineer");
    });

    test("normalizes end-to-end variations", () => {
      expect(normalizeText("End to end Developer")).toBe("end-to-end developer");
      expect(normalizeText("End-to-end Developer")).toBe("end-to-end developer");
    });
  });

  describe("apostrophe normalization", () => {
    test("normalizes various apostrophe forms", () => {
      const text = "It's a test (it's) [it's]";
      expect(normalizeText(text)).toBe("it's a test (it's) [it's]");
    });

    test("normalizes various quote forms", () => {
      const text = 'He said "hello" and "goodbye"';
      const result = normalizeText(text);
      expect(result).toContain('"hello"');
    });
  });

  describe("edge cases", () => {
    test("handles empty string", () => {
      expect(normalizeText("")).toBe("");
    });

    test("handles null/undefined", () => {
      expect(normalizeText(null as unknown as string)).toBe("");
      expect(normalizeText(undefined as unknown as string)).toBe("");
    });

    test("handles only whitespace", () => {
      expect(normalizeText("   \n  \n  ")).toBe("");
    });

    test("preserves meaningful structure", () => {
      const text = "Frontend\nBackend\nDevOps";
      expect(normalizeText(text)).toBe("frontend\nbackend\ndevops");
    });
  });
});

describe("getDomainTermVariation", () => {
  test("finds frontend variations", () => {
    expect(getDomainTermVariation("Frontend dev", "frontend")).toBe("frontend");
    expect(getDomainTermVariation("Front-end dev", "frontend")).toBe("frontend");
    expect(getDomainTermVariation("Front end dev", "frontend")).toBe("frontend");
  });

  test("returns null when term not found", () => {
    expect(getDomainTermVariation("Backend dev", "frontend")).toBeNull();
    expect(getDomainTermVariation("Random text", "backend")).toBeNull();
  });

  test("searches normalized text", () => {
    expect(getDomainTermVariation("FRONT-END Developer", "frontend")).toBe(
      "frontend"
    );
  });

  test("handles null/empty inputs", () => {
    expect(getDomainTermVariation("", "frontend")).toBeNull();
    expect(getDomainTermVariation("text", "")).toBeNull();
    expect(getDomainTermVariation(null as unknown as string, "frontend")).toBeNull();
  });
});

describe("hasExcessiveSpacing", () => {
  test("detects multiple consecutive spaces", () => {
    expect(hasExcessiveSpacing("text  with   spaces")).toBe(true);
  });

  test("returns false for normal spacing", () => {
    expect(hasExcessiveSpacing("text with normal spacing")).toBe(false);
  });

  test("ignores newlines", () => {
    expect(hasExcessiveSpacing("text\nmore\ntext")).toBe(false);
  });
});

describe("normalizePhrase", () => {
  test("normalizes known phrases", () => {
    expect(normalizePhrase("Front-end Developer", "front-end")).toBe(
      "frontend Developer"
    );
  });

  test("handles unknown phrases", () => {
    expect(normalizePhrase("Text", "unknown")).toBe("Text");
  });

  test("respects word boundaries", () => {
    expect(normalizePhrase("frontend-development", "front-end")).toBe(
      "frontend-development"
    );
  });
});
