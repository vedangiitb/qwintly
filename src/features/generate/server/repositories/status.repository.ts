import { DBRepository } from "@/features/chat/server/repositories/repository";

export type GenerationStatusHistoryEvent = {
  event_type: string;
  step: string | null;
  message: string | null;
  seq_num: number;
  created_at: string;
};

export type GenerationSummary = {
  status: string;
  messages: string[];
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
    const payload = (rows[0] ?? null) as
      | {
          genStatus?: unknown;
          messages?: unknown;
        }
      | null;

    const status =
      typeof payload?.genStatus === "string" ? payload.genStatus : "";

    const messages = Array.isArray(payload?.messages)
      ? payload.messages.filter((item): item is string => typeof item === "string")
      : [];

    return { status, messages };
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
