// apiHandler.ts
import { authenticateRequest } from "@/lib/authUtils";
import { NextResponse } from "next/server";

export const ApiResponse = {
  success: (data: any, status = 200) =>
    NextResponse.json({ success: true, data, error: null }, { status }),

  stream: (stream: any) =>
    new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // for nginx proxy setups
      },
    }),

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
  handler: (ctx: { body: any; token: string }) => Promise<any>
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
  handler: (ctx: { query: URLSearchParams; token: string }) => Promise<any>
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
        token: auth.token!,
        query,
      });

      console.log(result);

      return ApiResponse.success(result);
    } catch (err: any) {
      console.error("GET route error:", err);
      return ApiResponse.error(err.message || "Internal server error", 500);
    }
  };
}

export function streamHandler(
  handler: (ctx: { body: any; token: string }) => Promise<any>
) {
  return async function (req: Request) {
    try {
      const auth = await authenticateRequest(req);

      if (!auth.success) {
        return ApiResponse.error(
          "Failed to authenticate user! Please log in before you continue",
          auth.status
        );
      }

      let body: any = {};
      try {
        body = await req.json();
      } catch {
        return ApiResponse.error("Invalid JSON body", 400);
      }

      const result = await handler({ body, token: auth.token! });

      // If handler returns an SSE Response, DO NOT WRAP IT
      if (
        result &&
        result._sse === true &&
        result.response instanceof Response
      ) {
        return result.response; // direct passthrough
      }

      // Otherwise → normal JSON response
      return ApiResponse.stream(result);
    } catch (err: any) {
      console.error("POST route error:", err);
      return ApiResponse.error(err.message || "Internal server error", 500);
    }
  };
}
