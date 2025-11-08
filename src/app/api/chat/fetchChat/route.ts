import { authenticateRequest } from "@/lib/authUtils";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

/**
 * GET /api/chat/fetchChat?chatId=<id>
 * Fetch chat metadata (Firestore) and messages (Supabase)
 */
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

    // --- Extract and validate chatId ---
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Missing chatId" },
        { status: 400 }
      );
    }

    // --- Verify chat ownership in Supabase (`chats` table) ---
    const { data: chatRows, error: chatError } = await supabase
      .from("chats")
      .select("id, user_id, title, created_at, updated_at")
      .eq("id", chatId)
      .limit(1)
      .single();

    if (chatError) {
      // if the row is not found supabase returns error with code 'PGRST116' or returns null depending on settings
      console.error("Supabase chat lookup error:", chatError.message);
      return NextResponse.json({ success: false, error: "Chat not found" }, { status: 404 });
    }

    const chatData = chatRows;

    if (!chatData || chatData.user_id !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // --- Fetch messages from Supabase ---
    const { data: messages, error: supabaseError } = await supabase
      .from("messages")
      .select("id, role, content, created_at, token_count")
      .eq("conv_id", chatId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (supabaseError) {
      console.error("Supabase error:", supabaseError.message);
      return NextResponse.json(
        { success: false, error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    //--- Update last accessed timestamp in Supabase ---
    const { error: updateError } = await supabase
      .from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatId);
    // ignore update errors for last-access tracking
    if (updateError) {
      console.warn("Failed updating chat updated_at:", updateError.message);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          chat: {
            id: chatId,
            title: chatData.title ?? "Untitled Chat",
            createdAt: chatData.created_at ?? null,
            updatedAt: chatData.updated_at ?? null,
          },
          messages: messages ?? [],
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("fetchChat error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
