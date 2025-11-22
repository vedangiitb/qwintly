import { FetchChatResult, Message } from "@/types/chat";
import { getIdToken, withAuthRetry } from "@/utils/userIdTokenUtil";

export async function streamChatResponse(
  messages: Message[],
  chatId: string,
  onChunk: (chunk: string) => void,
  options?: { signal?: AbortSignal }
) {
  // Validate input
  if (!chatId) throw new Error("Missing chatId");

  const token = await getIdToken();
  if (!token) throw new Error("User not authenticated");

  const payload = JSON.stringify({ chatId, messages });

  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: payload,
    signal: options?.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stream endpoint returned ${res.status}: ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) return;

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
        } catch (e) {
          console.error("onChunk handler failed", e);
        }
      }
    }
  } catch (err: any) {
    // If the abort signal triggered, surface a clear message
    if (err?.name === "AbortError") {
      console.warn("Stream aborted by user");
      return;
    }
    throw err;
  }
}

export const addToDB = async (message: Message, chatId: string) => {
  try {
    const token = await getIdToken();
    if (!token) throw new Error("User not authenticated");

    const res = await withAuthRetry(() =>
      fetch("/api/chat/updateDB", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, chatId }),
      })
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to add message: ${text}`);
    }

    return true;
  } catch (e: any) {
    console.error("addToDB error", e);
    return false;
  }
};

export async function fetchChatMessages(
  chatId: string
): Promise<FetchChatResult> {
  try {
    const token = await getIdToken();
    if (!token) throw new Error("User not authenticated");

    const res = await withAuthRetry(() =>
      fetch(`/api/chat/fetchChat?chatId=${encodeURIComponent(chatId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );

    const json = await res.json();

    if (!res.ok) {
      return {
        messages: null,
        error: json?.error || json?.message || "Unknown error",
      };
    }

    const messagesRaw = json.data?.messages ?? null;

    const normalizedMessages: Message[] = (messagesRaw ?? []).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    return { messages: normalizedMessages, error: null };
  } catch (e: any) {
    console.error("fetchChatMessages error", e);
    return { messages: null, error: e?.message || String(e) };
  }
}

export async function userChats() {
  try {
    const token = await getIdToken();
    if (!token) throw new Error("User not authenticated");
    const res = await withAuthRetry(() =>
      fetch("/api/chat/userChats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );
    const json = await res.json();

    if (!res.ok) {
      return {
        messages: null,
        error: json?.error || json?.message || "Unknown error",
      };
    }

    const chats = json.data ?? null;

    console.log(chats);

    return { chats: chats, error: null };
  } catch (e: any) {
    console.error("userChats error", e);
    return { chats: null, error: e?.message || String(e) };
  }
}
