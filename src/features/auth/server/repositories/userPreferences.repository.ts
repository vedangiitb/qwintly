import { DBRepository } from "@/features/chat/server/repositories/repository";

export class UserPreferencesRepository extends DBRepository {
  /*
   * Update preferred provider
   */
  async updatePreferredProvider(userId: string, provider: string) {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_preferences")
      .update({ pref_provider: provider })
      .eq("id", userId)
      .select("id, pref_provider, pref_model");
    if (error) throw new Error(error.message);

    return data?.[0] ?? null;
  }

  /*
   * Update preferred model
   */
  async updatePreferredModel(userId: string, model: string) {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_preferences")
      .update({ pref_model: model })
      .eq("id", userId)
      .select("id, pref_provider, pref_model");
    if (error) throw new Error(error.message);

    return data?.[0] ?? null;
  }

  /*
   * Get preferrence data
   */
  async getPreferences(userId: string) {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_preferences")
      .select("id, pref_provider, pref_model")
      .eq("id", userId)
      .limit(1);
    if (error) throw new Error(error.message);

    return data?.[0] ?? null;
  }
}
