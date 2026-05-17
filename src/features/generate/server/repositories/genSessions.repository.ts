import { DBRepository } from "@/features/chat/server/repositories/repository";

export class GenSnapshotsRepository extends DBRepository {
  async getGenIdFromChatId(chatId: string): Promise<string | null> {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("generation_sessions")
      .select("id")
      .eq("conv_id", chatId)
      .eq("status", "implemented")
      .eq("session_type","generate")
      .order("last_modified", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data.id;
  }

  async getGenIdFromChatIdAndPlanId(
    chatId: string,
    planId: string,
  ): Promise<string | null> {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("generation_sessions")
      .select("id")
      .eq("conv_id", chatId)
      .eq("plan_id", planId)
      .order("last_modified", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data.id;
  }

  async getPlanIdByGenId(genId: string): Promise<string | null> {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("generation_sessions")
      .select("plan_id")
      .eq("id", genId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data.plan_id;
  }

  async getGenIdbyDeploymentId(deployId: string): Promise<string | null> {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("deployment_generation_map")
      .select("generation_session_id")
      .eq("deployment_session_id", deployId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data.generation_session_id;
  }
}
