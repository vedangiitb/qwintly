import { FetchChatResult, Message, Stage } from "@/types/chat";
import { fetchUtil } from "@/utils/fetchUtil";

export type TaskRow = {
  tasks: any[];
  implemented: boolean;
  info: CollectedInfo;
};

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
    if (!chatId) throw new Error("Missing chatId");
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
    )) as { data?: { messages?: any[]; chat: { stage?: Stage } } };

    const messagesRaw = json.data?.messages ?? [];
    const stage = json.data?.chat.stage ?? null;

    const normalized: Message[] = messagesRaw.map((m: any) => ({
      role: m.role,
      content: m.content,
      stage: m.stage,
      msgType: m.msgType || "message",
    }));

    return { messages: normalized, stage: stage, error: null };
  } catch (e: any) {
    console.error("fetchChatMessages error", e);
    return { messages: null, stage: null, error: e?.message };
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

export async function fetchQuestionAnswers(chatId: string) {
  try {
    const json = (await fetchUtil(
      `/api/chat/fetchQuestionAnswers?chatId=${encodeURIComponent(chatId)}`,
      {
        method: "GET",
      },
    )) as {
      data?: { questions?: any[]; answers?: any[]; submitted?: boolean };
    };

    return {
      questions: json.data?.questions ?? null,
      answers: json.data?.answers ?? null,
      submitted: json.data?.submitted ?? null,
      error: null,
    };
  } catch (e: any) {
    console.error("fetchQuestionAnswers error", e);
    return {
      questions: null,
      answers: null,
      submitted: false,
      error: e?.message || "Unknown Error occured while fetching questions",
    };
  }
}

export async function fetchCollectedInfo(chatId: string) {
  try {
    const json = (await fetchUtil(
      `/api/chat/fetchCollectedInfo?chatId=${encodeURIComponent(chatId)}`,
      {
        method: "GET",
      },
    )) as { data?: { collectedInfo?: any } };

    return {
      collectedInfo: json.data?.collectedInfo ?? null,
      error: null,
    };
  } catch (e: any) {
    console.error("fetchCollectedInfo error", e);
    return {
      collectedInfo: null,
      error: e?.message || "Unknown Error occured while fetching questions",
    };
  }
}

export async function submitAnswers(chatId: string, answers: UserAnswers[]) {
  try {
    const json = await fetchUtil("/api/chat/submitAnswers", {
      method: "POST",
      body: JSON.stringify({ chatId, answers }),
    });

    return json.success;
  } catch (e: any) {
    console.error("submitAnswers error", e);
    return false;
  }
}

export async function generatePlan(
  chatId: string,
  stage: Stage,
  messages: Message[],
  collectedInfo: CollectedInfo,
  questionAnswers: QuestionAnswers[],
) {
  try {
    const json = (await fetchUtil("/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        chatId,
        stage,
        messages: messages.filter((msg) => msg.stage == stage),
        collectedInfo,
        questionAnswers,
      }),
    })) as { data?: { text?: string; functionCallData: any } };

    return {
      text: json.data.text,
      functionCallData: json.data.functionCallData,
    };
  } catch (e: any) {
    console.error("generatePlan error", e);
    return {
      text: null,
      functionCallData: null,
      error: e?.message,
    };
  }
}

export async function fetchTasks(chatId: string) {
  try {
    const json = (await fetchUtil(
      `/api/chat/fetchTasks?chatId=${encodeURIComponent(chatId)}`,
      {
        method: "GET",
      },
    )) as { data?: { rows: TaskRow[] } };

    return {
      data: json.data.rows ?? null,
      error: null,
    };
  } catch (e: any) {
    console.error("fetchTasks error", e);
    return { data: null, error: e?.message };
  }
}
