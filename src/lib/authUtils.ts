// authUtils.ts
export async function authenticateRequest(req: Request) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { success: false, status: 401, error: "Missing token" };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  return {
    success: true,
    status: 200,
    token,
  };
}
