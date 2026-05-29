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
    re: /\b(ignore|disregard|forget|override|bypass)(?:\s+(?:all|any|previous|above|safety|system|developer|rules|other))*\s+(instructions|rules|messages|prompt|restrictions|guidelines|filters)\b/i,
  },
  {
    id: "system_developer_prompt",
    severity: "high",
    re: /\b(system|developer)[\s_-]+prompt\b/i,
  },
  {
    id: "role_system_developer",
    severity: "high",
    re: /\brole\s*[:=]\s*(system|developer)\b/i,
  },
  {
    id: "begin_end_system_developer",
    severity: "high",
    re: /\b(begin|end)[\s_-]+(system|developer)\b/i,
  },
  {
    id: "assistant_system_tags",
    severity: "high",
    re: /(<\s*\/?\s*(assistant|system|developer)[a-z0-9_-]*\b[^>]*>|\[\s*(system|developer|instruction|assistant)[a-z0-9_-]*\s*\])/i,
  },
  {
    id: "adversarial_jailbreak",
    severity: "high",
    re: /\b(jailbreak|dan\s+mode|do\s+anything\s+now|unsafe\s+mode|safety\s+off|bypass\s+filters)\b/i,
  },
  {
    id: "tool_function_call",
    severity: "medium",
    re: /\b(function\s+call|tool\s*:\s*|tools?\s*:\s*\[)\b/i,
  },
  {
    id: "role_assumption",
    severity: "medium",
    re: /\b(you\s+are\s+now|act\s+as|new\s+role|assume\s+the\s+role)\b/i,
  },
  {
    id: "system_leakage",
    severity: "medium",
    re: /\b(output|print|reveal|show|display|leak)\s+(your|the)\s+(original|initial)?\s*(prompt|instructions|system\s+message)\b/i,
  },
];

const CODE_INJECTION_PATTERNS: {
  id: string;
  re: RegExp;
  severity: "high" | "medium";
}[] = [
  {
    id: "script_tag",
    severity: "high",
    re: /(<\s*script\b[^>]*>|<\s*\/\s*script\s*>)/i,
  },
  {
    id: "dangerous_html_tags",
    severity: "high",
    re: /<\s*(iframe|object|embed|applet|base|meta|frame|frameset)\b[^>]*>/i,
  },
  {
    id: "javascript_uri",
    severity: "high",
    re: /\b(javascript|vbscript|data\s*:\s*(text\/html|application\/javascript|image\/svg\+xml|text\/xml))\s*:/i,
  },
  {
    id: "event_handler",
    severity: "high",
    re: /\bon[a-z]+\s*=/i,
  },
  {
    id: "srcdoc_attribute",
    severity: "high",
    re: /\bsrcdoc\s*=/i,
  },
  {
    id: "server_side_injection",
    severity: "high",
    re: /\b(require\s*\(|process\.env|child_process|exec\s*\(|eval\s*\(|Function\s*\()/i,
  },
  {
    id: "html_tag",
    severity: "medium",
    re: /<\s*\/?\s*[a-z][^>]*>/i,
  },
  {
    id: "code_fence",
    severity: "medium",
    re: /```/,
  },
  {
    id: "style_injection",
    severity: "medium",
    re: /<\s*style\b[^>]*>|\bexpression\s*\(|behavior\s*:/i,
  },
];

/**
 * Normalizes and decodes text content to expose obfuscated code or prompt injections.
 * Decodes URI component encodings, HTML Entities (decimal, hex, and standard named),
 * backslash escapes, removes invisible unicode markers, and collapses whitespace.
 */
export function normalizeText(input: string): string {
  if (!input) return "";
  let normalized = input;

  // 1. Decode URI encodings repeatedly (up to 3 times for nested encodings)
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(normalized);
      if (decoded === normalized) break;
      normalized = decoded;
    } catch {
      break;
    }
  }

  // 2. Decode standard XML/HTML entities
  normalized = normalized
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&colon;/gi, ":")
    .replace(/&nbsp;/gi, " ");

  // Decimal entities like &#60;
  normalized = normalized.replace(/&#(\d+);?/g, (_, num) => {
    try {
      return String.fromCharCode(parseInt(num, 10));
    } catch {
      return "";
    }
  });

  // Hex entities like &#x3c;
  normalized = normalized.replace(/&#[xX]([0-9a-fA-F]+);?/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return "";
    }
  });

  // 3. Remove backslash escapes if any (e.g. \u003c or \x3c)
  normalized = normalized.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return "";
    }
  });
  normalized = normalized.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return "";
    }
  });

  // 4. Remove unicode zero-width spaces/invisible characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 5. Convert all whitespace characters to standard single spaces
  normalized = normalized.replace(/\s+/g, " ");

  return normalized;
}

export const assertOperationsAreSafe = (operations: unknown) => {
  if (!Array.isArray(operations)) {
    throw createHttpError(400, "Missing or invalid operations list");
  }

  const violations: string[] = [];

  for (const op of operations) {
    if (!op || typeof op !== "object") {
      violations.push("invalid_operation_structure");
      continue;
    }

    const kind = (op as any).kind;
    if (kind !== "text" && kind !== "delete") {
      violations.push("unsupported_operation_kind");
      continue;
    }

    // Strict schema/type checks
    if (kind === "text") {
      const id = (op as any).id;
      const oldText = (op as any).oldText;
      const newText = (op as any).newText;

      if (typeof id !== "string" || id.trim() === "") {
        violations.push("invalid_operation_id");
        continue;
      }
      if (typeof oldText !== "string") {
        violations.push("invalid_old_text");
        continue;
      }
      if (typeof newText !== "string") {
        violations.push("invalid_new_text");
        continue;
      }

      // Check text length
      if (newText.length > 20_000) {
        violations.push("text_too_long");
        continue;
      }

      // Normalize text content before checking patterns
      const normalized = normalizeText(newText).toLowerCase();

      const highHits =
        countPatternHits(normalized, PROMPT_INJECTION_PATTERNS, "high") +
        countPatternHits(normalized, CODE_INJECTION_PATTERNS, "high");
      const mediumHits =
        countPatternHits(normalized, PROMPT_INJECTION_PATTERNS, "medium") +
        countPatternHits(normalized, CODE_INJECTION_PATTERNS, "medium");

      if (highHits >= 1 || mediumHits >= 2) {
        violations.push("disallowed_text_content");
      }
    } else if (kind === "delete") {
      const id = (op as any).id;
      const parentId = (op as any).parentId;
      const nextSiblingId = (op as any).nextSiblingId;
      const oldOuterHTML = (op as any).oldOuterHTML;

      if (typeof id !== "string" || id.trim() === "") {
        violations.push("invalid_operation_id");
        continue;
      }
      if (typeof parentId !== "string" || parentId.trim() === "") {
        violations.push("invalid_parent_id");
        continue;
      }
      if (nextSiblingId !== null && typeof nextSiblingId !== "string") {
        violations.push("invalid_next_sibling_id");
        continue;
      }
      if (typeof oldOuterHTML !== "string") {
        violations.push("invalid_old_outer_html");
        continue;
      }
    }
  }

  if (violations.length) {
    throw createHttpError(
      400,
      `Edits contain disallowed content or invalid schemas (violations: ${violations.join(", ")}).`,
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
