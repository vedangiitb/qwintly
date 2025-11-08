import { verifyFirebaseToken } from "@/lib/firebase-admin";

export async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { success: false, status: 401, error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await verifyFirebaseToken(token);
    if (!decoded) {
      return { success: false, status: 401, error: "Invalid token" };
    }

    return { success: true, userId: decoded.uid };
  } catch (err: any) {
    console.error("Token verification failed:", err);
    return { success: false, status: 401, error: "Token verification failed" };
  }
}
