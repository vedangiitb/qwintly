// apiHandler.ts
import { authenticateRequest } from "@/lib/authUtils";
import { NextResponse } from "next/server";

export const ApiResponse = {
  success: (data: any, status = 200) =>
    NextResponse.json({ success: true, data, error: null }, { status }),

  error: (message: string | undefined, status = 400) =>
    NextResponse.json(
      {
        success: false,
        error: message || "Unexpected error occured",
        data: null,
      },
      { status }
    ),
};

// POST handler wrapper
export function postHandler(
  handler: (ctx: { userId: string; body: any; token: string }) => Promise<any>
) {
  return async function (req: Request) {
    try {
      const auth = await authenticateRequest(req);

      if (!auth.success) {
        return ApiResponse.error(
          "Failed to authenticate user! Please Log In Before you continue",
          auth.status
        );
      }

      let body: any = {};
      try {
        body = await req.json();
      } catch {
        return ApiResponse.error("Invalid JSON body", 400);
      }

      const result = await handler({
        userId: auth.userId!,
        token: auth.token!,
        body,
      });

      return ApiResponse.success(result);
    } catch (err: any) {
      console.error("POST route error:", err);
      return ApiResponse.error(err.message || "Internal server error", 500);
    }
  };
}

// GET handler wrapper
export function getHandler(
  handler: (ctx: {
    userId: string;
    query: URLSearchParams;
    token: string;
  }) => Promise<any>
) {
  return async function (req: Request) {
    try {
      const auth = await authenticateRequest(req);

      if (!auth.success) {
        return ApiResponse.error("Please log in first", auth.status);
      }

      const url = new URL(req.url);
      const query = url.searchParams;

      const result = await handler({
        userId: auth.userId!,
        token: auth.token!,
        query,
      });

      return ApiResponse.success(result);
    } catch (err: any) {
      console.error("GET route error:", err);
      return ApiResponse.error(err.message || "Internal server error", 500);
    }
  };
}
