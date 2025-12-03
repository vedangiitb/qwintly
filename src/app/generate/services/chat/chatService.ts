import { FetchChatResult, Message } from "@/types/chat";
import { fetchStreamUtil, fetchUtil } from "@/utils/fetchUtil";

// ------------------------ STREAM RESPONSE ------------------------

// services/streamChatResponse.ts
export async function streamChatResponse({
  messages,
  chatId,
  onToken,
  onMetadata,
  onComplete,
  onError,
  onDone,
  signal,
}: {
  messages: Message[];
  chatId: string;
  onToken: (text: string) => void;
  onMetadata: (meta: any) => void;
  onComplete: (meta: any) => void;
  onError: (err: any) => void;
  onDone: (message: any) => void;
  signal?: AbortSignal;
}) {
  if (!chatId) throw new Error("Missing chatId");

  const bodyPayload = JSON.stringify({ chatId, messages });

  // Get SSE reader from server
  const reader = await fetchStreamUtil("/api/chat/stream", {
    method: "POST",
    body: bodyPayload,
    signal,
  });

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      // Append new chunk
      buffer += decoder.decode(value, { stream: true });

      // Split into SSE message groups
      const parts = buffer.split("\n\n");

      // Keep last chunk incomplete
      buffer = parts.pop() ?? "";

      for (const raw of parts) {
        if (!raw.startsWith("data:")) continue;

        const payloadStr = raw.replace(/^data:\s*/, "").trim();
        if (!payloadStr || payloadStr === "[DONE]") continue;

        let envelope: any = null;
        try {
          envelope = JSON.parse(payloadStr);
        } catch (err) {
          console.warn("Malformed SSE JSON, skipping:", err, payloadStr);
          continue;
        }

        console.log("envelope", envelope);

        // ---- Handle envelope types ----
        switch (envelope.type) {
          case "token":
            if (envelope.value) onToken(envelope.value);
            break;

          case "metadata":
            if (envelope.payload) onMetadata(envelope.payload);
            break;

          case "complete":
            if (envelope.payload) onComplete(envelope.payload);
            break;

          case "error":
            onError(envelope.message ?? "Unknown error");
            break;

          case "done":
            onDone(envelope.payload);

            return;

          default:
            console.warn("Unknown envelope type:", envelope);
        }
      }
    }
  } finally {
    try {
      reader.cancel();
    } catch {}
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

    return {
      chats:
        (json.data as any[])?.map((data: any) => ({
          id: data.chat_id,
          ...data,
        })) ?? null,
      error: null,
    };
  } catch (e: any) {
    console.error("userChats error", e);
    return { chats: null, error: e?.message };
  }
}
