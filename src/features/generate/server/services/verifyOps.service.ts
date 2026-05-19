import { createHttpError } from "@/lib/httpError";
import { PreviewDomOp } from "../../types/previewDon.types";

const PROMPT_INJECTION_PATTERNS: {
  id: string;
  re: RegExp;
  severity: "high" | "medium";
}[] = [
  {
    id: "ignore_instructions",
    severity: "high",
    re: /\b(ignore|disregard|forget)\s+(all|any|previous|above)\s+(instructions|rules|messages)\b/i,
  },
  {
    id: "system_developer_prompt",
    severity: "high",
    re: /\b(system|developer)\s+prompt\b/i,
  },
  {
    id: "role_system_developer",
    severity: "high",
    re: /\brole\s*:\s*(system|developer)\b/i,
  },
  {
    id: "begin_end_system_developer",
    severity: "high",
    re: /\b(begin|end)\s+(system|developer)\b/i,
  },
  {
    id: "tool_function_call",
    severity: "medium",
    re: /\b(function\s+call|tool\s*:\s*|tools?\s*:\s*\[)\b/i,
  },
  {
    id: "assistant_system_tags",
    severity: "medium",
    re: /<\s*\/?\s*(assistant|system|developer)\b[^>]*>/i,
  },
];

const CODE_INJECTION_PATTERNS: {
  id: string;
  re: RegExp;
  severity: "high" | "medium";
}[] = [
  { id: "script_tag", severity: "high", re: /<\s*script\b[^>]*>/i },
  { id: "js_url", severity: "high", re: /\bjavascript\s*:/i },
  { id: "html_tag", severity: "medium", re: /<\s*\/?\s*[a-z][^>]*>/i },
  { id: "event_handler", severity: "medium", re: /\bon\w+\s*=/i },
  { id: "code_fence", severity: "medium", re: /```/ },
];

export const assertOperationsAreSafe = (operations: unknown) => {
  if (!Array.isArray(operations)) {
    throw createHttpError(400, "Missing or invalid operations list");
  }

  const violations: string[] = [];

  for (const op of operations as PreviewDomOp[]) {
    if (!op || typeof op !== "object") continue;

    if ((op as any).kind === "text") {
      const newText = (op as any).newText;
      if (typeof newText !== "string") continue;

      // Keep this intentionally strict: edited text is later fed to an LLM.
      // Reject obviously dangerous / prompt-injection-ish content early.
      if (newText.length > 20_000) {
        violations.push("text_too_long");
        continue;
      }

      const lower = newText.toLowerCase();
      const highHits =
        countPatternHits(lower, PROMPT_INJECTION_PATTERNS, "high") +
        countPatternHits(lower, CODE_INJECTION_PATTERNS, "high");
      const mediumHits =
        countPatternHits(lower, PROMPT_INJECTION_PATTERNS, "medium") +
        countPatternHits(lower, CODE_INJECTION_PATTERNS, "medium");

      // Rule of thumb:
      // - any high severity hit => reject
      // - multiple medium hits => reject
      if (highHits >= 1 || mediumHits >= 2) {
        violations.push("disallowed_text_content");
      }
    }
  }

  if (violations.length) {
    throw createHttpError(
      400,
      "Edits contain disallowed content (possible prompt/code injection).",
    );
  }
};

function countPatternHits(
  textLower: string,
  patterns: { re: RegExp; severity: "high" | "medium" }[],
  severity: "high" | "medium",
) {
  let hits = 0;
  for (const p of patterns) {
    if (p.severity !== severity) continue;
    if (p.re.test(textLower)) hits++;
  }
  return hits;
}
