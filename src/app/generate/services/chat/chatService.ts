import { FetchChatResult, Message } from "@/types/chat";
import { fetchStreamUtil, fetchUtil } from "@/utils/fetchUtil";

// ------------------------ STREAM RESPONSE ------------------------

export async function streamChatResponse(
  messages: Message[],
  chatId: string,
  onChunk: (chunk: string) => void,
  options?: { signal?: AbortSignal }
) {
  if (!chatId) throw new Error("Missing chatId");

  const bodyPayload = JSON.stringify({ chatId, messages });

  const reader = await fetchStreamUtil("/api/chat/stream", {
    method: "POST",
    body: bodyPayload,
    signal: options?.signal,
  });

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const text = line.replace(/^data: /, "");

        if (text === "[DONE]") return;

        try {
          onChunk(text);
        } catch (err) {
          console.error("onChunk failed:", err);
        }
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.warn("Stream aborted by user");
      return;
    }
    throw err;
  }
}

// ------------------------ ADD MESSAGE TO DB ------------------------

export async function addToDB(message: Message, chatId: string) {
  try {
    const json = await fetchUtil("/api/chat/updateDB", {
      method: "POST",
      body: JSON.stringify({ message, chatId }),
    });

    return json.success;
  } catch (e: any) {
    console.error("addToDB error", e);
    return false;
  }
}

// ------------------------ FETCH CHAT MESSAGES ------------------------

export async function fetchChatMessages(
  chatId: string
): Promise<FetchChatResult> {
  try {
    const json = (await fetchUtil(
      `/api/chat/fetchChat?chatId=${encodeURIComponent(chatId)}`,
      {
        method: "GET",
      }
    )) as { data?: { messages?: any[] } };

    const messagesRaw = json.data?.messages ?? [];

    const normalized: Message[] = messagesRaw.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    return { messages: normalized, error: null };
  } catch (e: any) {
    console.error("fetchChatMessages error", e);
    return { messages: null, error: e?.message };
  }
}

// ------------------------ USER CHATS ------------------------

export async function userChats() {
  try {
    const json = await fetchUtil("/api/chat/userChats", {
      method: "GET",
    });

    return { chats: json.data ?? null, error: null };
  } catch (e: any) {
    console.error("userChats error", e);
    return { chats: null, error: e?.message };
  }
}
