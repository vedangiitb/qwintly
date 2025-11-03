import { authenticateRequest } from "@/lib/authUtils";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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
    const { data: chats, error: chatError } = await supabase
      .from("chats")
      .select("id, title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (chatError) {
      console.error("Supabase chat lookup error:", chatError.message);
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: chats,
      },
      {
        status: 200,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
