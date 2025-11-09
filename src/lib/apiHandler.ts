import { authenticateRequest } from "@/lib/authUtils";
import { NextResponse } from "next/server";

/**
 * Generic JSON response helpers
 */
export const ApiResponse = {
  success: (data: any, status = 200) =>
    NextResponse.json({ success: true, data, error: null }, { status }),

  error: (message: string | undefined, status = 400) =>
    NextResponse.json(
      {
        success: false,
        error: message || "Error while authenticating user",
        data: null,
      },
      { status }
    ),
};

/**
 * Wrapper for POST routes:
 * - Authenticates request
 * - Parses JSON body
 * - Catches all errors uniformly
 */
export function postHandler(
  handler: (ctx: { userId: string; body: any }) => Promise<any>
) {
  return async function (req: Request) {
    try {
      const auth = await authenticateRequest(req);
      const userId = auth.userId;
      if (!auth.success || !userId) {
        return ApiResponse.error(auth.error, auth.status);
      }

      let body: any = {};
      try {
        body = await req.json();
      } catch {
        return ApiResponse.error("Invalid JSON body", 400);
      }

      const result = await handler({ userId: auth.userId, body });

      return ApiResponse.success(result);
    } catch (err: any) {
      console.error("POST route error:", err);
      return ApiResponse.error(err.message || "Internal server error", 500);
    }
  };
}

/**
 * Wrapper for GET routes:
 * - Authenticates request
 * - Provides query params via URL
 * - Catches all errors uniformly
 */
export function getHandler(
  handler: (ctx: { userId: string; query: URLSearchParams }) => Promise<any>
) {
  return async function (req: Request) {
    try {
      const auth = await authenticateRequest(req);
      const userId = auth.userId;
      if (!auth.success || !userId) {
        return ApiResponse.error(auth.error, auth.status);
      }

      const url = new URL(req.url);
      const query = url.searchParams;

      const result = await handler({ userId: userId, query });

      return ApiResponse.success(result);
    } catch (err: any) {
      console.error("GET route error:", err);
      return ApiResponse.error(err.message || "Internal server error", 500);
    }
  };
}
