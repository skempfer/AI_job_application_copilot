export function parseJsonStrict(
  content: string,
  onError: (message: string, details?: string) => Error
): unknown {
  const trimmed = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    throw onError("Resposta da IA nao esta em JSON");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Erro desconhecido";
    throw onError("Falha ao parsear JSON da IA", details);
  }
}

export function normalizeStringArray(
  value: unknown,
  fieldName: string,
  onError: (message: string) => Error
): string[] {
  if (!Array.isArray(value)) {
    throw onError(`Campo ${fieldName} deve ser um array`);
  }

  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return Array.from(new Set(cleaned));
}
