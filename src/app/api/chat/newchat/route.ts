import { authenticateRequest } from "@/lib/authUtils";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface NewChatRequestBody {
  convId?: string;
  prompt: string;
}

/**
 * POST /api/chat/newChat
 * Creates a new chat document in Firestore.
 */
export async function POST(req: Request) {
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

    // --- Parse body ---
    const body: NewChatRequestBody = await req.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'prompt'" },
        { status: 400 }
      );
    }

    // --- Build chat row ---
    const now = new Date().toISOString();
    const chatRow = {
      user_id: userId,
      title: body.prompt.slice(0, 50).trim(),
      created_at: now,
      updated_at: now,
      last_message: body.prompt,
    } as const;

    // --- Insert into Supabase ---
    const { data, error } = await supabase
      .from("chats")
      .insert([chatRow])
      .select()
      .limit(1)
      .single();

    if (error) {
      console.error("supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "DB error" },
        { status: 500 }
      );
    }

    const responseData = { id: (data as any)?.id ?? null, ...(data as any) };

    return NextResponse.json(
      { success: true, data: responseData, error: null },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("newChat error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
