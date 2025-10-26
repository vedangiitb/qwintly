import { NextResponse } from "next/server";
import { firestoreDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { id, userId, prompt } = await req.json();
    if (!id || !userId || !prompt) {
      return NextResponse.json(
        {
          message: "Missing userId or id",
        },
        {
          status: 400,
        }
      );
    }

    // TODO: Verify userId so that someone can't send any random id

    const chatsRef = firestoreDb
      .collection("users")
      .doc(userId)
      .collection("chats");

    const newChatRef = chatsRef.doc();
    const chatData = {
      title: prompt.slice(0, 50),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: prompt,
    };

    await newChatRef.set(chatData);    

    // TODO: Store messages

    return NextResponse.json(
      {
        message: "Chat created successfully",
        chatId: newChatRef.id,
        chatData,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e || "Error while creating new chat");
    return NextResponse.json(
      {
        message: e || "Error while creating new chat",
      },
      {
        status: 500,
      }
    );
  }
}
