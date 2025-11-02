import { authenticateRequest } from "@/lib/authUtils";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

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

    // --- Parse Input ---
    const { message, chatId } = await req.json();

    if (!message?.content || !chatId) {
      return NextResponse.json(
        { success: false, error: "Missing message content or chatId" },
        { status: 400 }
      );
    }

    // --- Insert Message into Supabase ---
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conv_id: chatId,
          user_id: userId,
          role: message.role || "user",
          content: message.content,
          token_count: message.token_count ?? 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // --- Return Normalized Success Response ---
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Unexpected error in updateDB:", e);
    return NextResponse.json(
      {
        success: false,
        error: e.message || "Unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
