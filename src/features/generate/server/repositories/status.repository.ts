import { DBRepository } from "@/features/chat/server/repositories/repository";

export type GenerationStatusHistoryEvent = {
  event_type: string;
  step: string | null;
  message: string | null;
  seq_num: number;
  created_at: string;
};

export class StatusRepository extends DBRepository {
  async fetchGenerationHistory(
    chatId: string,
  ): Promise<GenerationStatusHistoryEvent[]> {
    if (!chatId?.trim()) throw new Error("Chat ID is required");

    const supabase = this.client;
    const { data, error } = await supabase
      .from("generation_events")
      .select("event_type, step, message, seq_num, created_at")
      .eq("conv_id", chatId)
      .order("seq_num", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
