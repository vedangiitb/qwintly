import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    if (!messages || messages.length == 0) return;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyFirebaseToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.uid;

    // add the message to supabase db
    const { error } = await supabase.from("messages").insert([
      messages.map((msg: Chat) => ({
        conv_id: chatId,
        user_id: userId,
        sender: msg.role,
        content: msg.content,
        token_count: 0,
        created_at: new Date().toISOString(),
      })),
    ]);

    if (error) {
      throw new Error(error.message || "Unexpected issue occured");
    }

    return NextResponse.json({ message: "Message added" }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: e.message || "Unexpected issue occured" },
      { status: 500 }
    );
  }
}
