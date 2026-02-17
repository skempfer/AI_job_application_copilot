const DOMAIN_TERM_MAPPINGS: Record<string, string> = {
  "front end": "frontend",
  "front-end": "frontend",
  "frontend": "frontend",
  "back end": "backend",
  "back-end": "backend",
  "backend": "backend",
  "full stack": "fullstack",
  "full-stack": "fullstack",
  "fullstack": "fullstack",
  "end to end": "end-to-end",
  "end-to-end": "end-to-end",
  "qa": "qa",
  "quality assurance": "quality assurance",
};

export function normalizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }


  let normalized = text.toLowerCase();

  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  normalized = normalized.replace(/['´`]/g, "'").replace(/[""]|"""/g, '"');

  for (const [pattern, canonical] of Object.entries(DOMAIN_TERM_MAPPINGS)) {
    const regex = new RegExp(`\\b${escapeRegExp(pattern)}\\b`, "g");
    const before = normalized;
    normalized = normalized.replace(regex, canonical);
    if (before !== normalized) {
    }
  }

  normalized = normalized.replace(/  +/g, " ");
  normalized = normalized
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  normalized = normalized.replace(/\n{3,}/g, "\n\n");
  normalized = normalized.trim();

  return normalized;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getDomainTermVariation(
  text: string,
  domainTerm: string
): string | null {
  if (!text || !domainTerm) return null;

  const normalized = normalizeText(text);

  const variations = Object.keys(DOMAIN_TERM_MAPPINGS)
    .filter((key) => DOMAIN_TERM_MAPPINGS[key] === domainTerm)
    .map((key) => escapeRegExp(key));

  if (variations.length === 0) return null;

  const regex = new RegExp(`\\b(?:${variations.join("|")})\\b`, "g");
  return regex.test(normalized) ? domainTerm : null;
}

export function hasExcessiveSpacing(text: string): boolean {
  return /  +/.test(text);
}

export function normalizePhrase(text: string, phrase: string): string {
  const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
  const canonical = DOMAIN_TERM_MAPPINGS[phrase.toLowerCase()];
  return canonical ? text.replace(regex, canonical) : text;
}
