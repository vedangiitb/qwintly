import { NextResponse } from "next/server";

export async function streamChatResponse(
  messages: Chat[],
  chatId: string,
  onChunk: (chunk: string) => void
) {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, messages }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (reader) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const text = line.replace(/^data: /, "");
      if (text === "[DONE]") {
        addToDB([{ role: "system", content: buffer }], chatId);
        return;
      }
      onChunk(text);
    }
  }
}

const addToDB = async (messages: Chat[], chatId: string) => {
  try {
    const response = await fetch("/api/chat/updateDB", {
      method: "POST",
      body: JSON.stringify({
        messages: messages,
        chatId: chatId,
      }),
    });
    if (response.ok) {
      return NextResponse.json({ message: "Message added" }, { status: 200 });
    } else {
      throw new Error("Error occured");
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: e.message || "Unexpected issue occured" },
      { status: 500 }
    );
  }
};
