import { FetchChatResult, Message, Stage } from "@/types/chat";
import { fetchUtil } from "@/utils/fetchUtil";

// ------------------------ STREAM RESPONSE ------------------------

// services/streamChatResponse.ts
export async function streamChatResponse({
  messages,
  chatId,
  signal,
  stage,
}: {
  messages: Message[];
  chatId: string;
  signal?: AbortSignal;
  stage: Stage;
}) {
  if (!chatId) throw new Error("Missing chatId");

  if (!stage) throw new Error("Missing stage");

  // TODO: Implement signal to abort
  const bodyPayload = JSON.stringify({
    chatId,
    messages,
    stage,
  });

  const json = (await fetchUtil("/api/chat/stream", {
    method: "POST",
    body: bodyPayload,
  })) as { data?: { text?: string; functionCallData: any } };

  return {
    text: json.data.text,
    functionCallData: json.data.functionCallData,
  };
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
  chatId: string,
): Promise<FetchChatResult> {
  try {
    const json = (await fetchUtil(
      `/api/chat/fetchChat?chatId=${encodeURIComponent(chatId)}`,
      {
        method: "GET",
      },
    )) as { data?: { messages?: any[] } };

    const messagesRaw = json.data?.messages ?? [];

    const normalized: Message[] = messagesRaw.map((m: any) => ({
      role: m.role,
      content: m.content,
      stage: m.stage,
      msgType: m.msgType || "message",
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

export async function fetchQuestionAnswers(chatId: string) {}

export async function fetchCollectedInfo(chatId: string) {}
