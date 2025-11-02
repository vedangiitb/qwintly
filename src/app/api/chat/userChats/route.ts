import { authenticateRequest } from "@/lib/authUtils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // --- Auth Verification ---
    const auth = await authenticateRequest(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const userId = auth.userId;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
