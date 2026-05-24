import { toggleByokEnabledService } from "@/features/auth/server/services/getPreferences.service";
import { getHandler } from "@/lib/apiHandler";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const runtime = "nodejs";

function parseByokEnabled(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return null;
}

export const GET = getHandler(async ({ query, token }) => {
  const userId = await verifyToken(token);
  const byokEnabledRaw =
    query.get("byokEnabled") 

  const byokEnabled = parseByokEnabled(byokEnabledRaw);
  if (byokEnabled === null) {
    const err = new Error('Invalid "byokEnabled". Expected "true" or "false".') as Error & {
      status?: number;
    };
    err.status = 400;
    throw err;
  }

  return toggleByokEnabledService(userId, token, byokEnabled);
});

export const POST = postHandler(async ({ body, token }) => {
  const userId = await verifyToken(token);

  const byokEnabled = parseByokEnabled(body?.byokEnabled);
  if (byokEnabled === null) {
    const err = new Error('Invalid "byokEnabled". Expected boolean true/false.') as Error & {
      status?: number;
    };
    err.status = 400;
    throw err;
  }

  return toggleByokEnabledService(userId, token, byokEnabled);
});
