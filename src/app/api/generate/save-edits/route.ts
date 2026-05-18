import { postHandler } from "@/lib/apiHandler";

export const POST = postHandler(async ({ body }) => {
  // Intentionally minimal stub. Backend implementation handled separately.
  return {
    ok: true,
    received: {
      route: body?.route ?? null,
      genId: body?.genId ?? null,
      chatId: body?.chatId ?? null,
      operationsCount: Array.isArray(body?.operations) ? body.operations.length : 0,
    },
  };
});

