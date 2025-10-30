import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    // 🔒 1. Validate the Authorization header
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

    // 🧾 2. Extract chatId from query params
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }

    // 🧠 3. Fetch chat details from Firestore to verify ownership
    // (assuming your chat meta is stored there)
    const chatDoc = await (await import("@/lib/firebase-admin")).firestoreDb
      .collection("users")
      .doc(userId)
      .collection("chats")
      .doc(chatId)
      .get();

    if (!chatDoc.exists) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chatData = chatDoc.data();

    // 💬 4. Fetch messages from Supabase
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conv_id", chatId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // ✅ 5. Return chat + messages
    return NextResponse.json(
      {
        chat: chatData,
        messages: messages ?? [],
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
