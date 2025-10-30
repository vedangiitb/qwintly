import { NextResponse } from "next/server";
import { firestoreDb, verifyFirebaseToken } from "@/lib/firebase-admin";
import { supabase } from "@/lib/supabaseClient";
// import { countTextTokens } from "@/utils/tokenCount";

export async function POST(req: Request) {
  try {
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
    const { convId: providedConvId, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ message: "Missing prompt" }, { status: 400 });
    }

    const convId = providedConvId || firestoreDb.collection("chats").doc().id;

    // Firestore: store conversation metadata
    const chatData = {
      userId,
      title: prompt.slice(0, 50),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: prompt,
    };

    await firestoreDb.collection("chats").doc(convId).set(chatData);

    // Supabase: store message
    await storeMessage("user", prompt, convId, userId);

    return NextResponse.json(
      { message: "Chat created successfully", chatData },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

const storeMessage = async (
  sender: string,
  message: string,
  convId: string,
  userId: string
) => {
  const { error } = await supabase.from("messages").insert([
    {
      conv_id: convId,
      user_id: userId,
      sender: sender,
      content: message,
      token_count: 0,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) throw new Error(error.message);
};
