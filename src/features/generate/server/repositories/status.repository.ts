import { DBRepository } from "@/features/chat/server/repositories/repository";

export type GenerationStatusHistoryEvent = {
  event_type: string;
  step: string | null;
  message: string | null;
  seq_num: number;
  created_at: string;
};

export type GenerationSummary = {
  genSessionId: string;
  status: string;
  messages: string[];
  sessionType?: "generate" | "deploy";
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
};

export class StatusRepository extends DBRepository {
  async fetchGenerationHistory(
    chatId: string,
    genId: string,
  ): Promise<GenerationStatusHistoryEvent[]> {
    if (!chatId?.trim()) throw new Error("Chat ID is required");

    const supabase = this.client;
    const { data, error } = await supabase
      .from("generation_events")
      .select("event_type, step, message, seq_num, created_at")
      .eq("conv_id", chatId)
      .eq("gen_id", genId)
      .order("seq_num", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async fetchGenerationSummary(msgId: string): Promise<GenerationSummary> {
    if (!msgId?.trim()) throw new Error("Message ID is required");
    const supabase = this.client;
    const { data, error } = await supabase.rpc("get_generation_summary", {
      p_msg_id: msgId,
    });

    if (error) throw new Error(error.message);

    const rows = Array.isArray(data) ? data : [];
    const payload = (rows[0] ?? null) as {
      id?: unknown;
      genStatus?: unknown;
      messages?: unknown;
      session_type?: unknown;
      input_tokens?: unknown;
      output_tokens?: unknown;
      input_cost?: unknown;
      output_cost?: unknown;
    } | null;

    const genSessionId = typeof payload?.id === "string" ? payload.id : "";

    const status =
      typeof payload?.genStatus === "string" ? payload.genStatus : "";

    const messages = Array.isArray(payload?.messages)
      ? payload.messages.filter(
          (item): item is string => typeof item === "string",
        )
      : [];

    const sessionType =
      payload.session_type == "deploy" ? "deploy" : "generate";

    const toNumber = (value: unknown): number => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "bigint") return Number(value);
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const inputTokens = toNumber(payload?.input_tokens);
    const outputTokens = toNumber(payload?.output_tokens);
    const inputCost = toNumber(payload?.input_cost);
    const outputCost = toNumber(payload?.output_cost);

    return {
      genSessionId,
      status,
      messages,
      sessionType,
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
    };
  }

  async getGenSession(chatId: string): Promise<string> {
    if (!chatId?.trim()) throw new Error("Chat ID is required");

    const supabase = this.client;
    const { data, error } = await supabase
      .from("generation_sessions")
      .select("id")
      .eq("conv_id", chatId)
      .order("last_modified", { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);
    return data?.[0]?.id ?? "";
  }
}
