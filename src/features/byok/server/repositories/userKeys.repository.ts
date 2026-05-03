import { DBRepository } from "@/features/chat/server/repositories/repository";

export type UserKey = {
  id: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  keyVersion: number;
};

/*
Table: user_api_keys
*/

export class UserKeysRepository extends DBRepository {
  /**
   * Returns true when the user has at least one saved key.
   * Uses safe view.
   */
  async hasAnyKey(): Promise<boolean> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_api_keys_safe")
      .select("id")
      .limit(1);

    if (error) {
      throw new Error(`Failed to check user keys: ${error.message}`);
    }

    return Array.isArray(data) && data.length > 0;
  }

  /**
   * Fetch metadata only (NO encrypted_key)
   * Uses safe view
   */
  async fetchKeysDetail(): Promise<UserKey[]> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_api_keys_safe")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user keys: ${error.message}`);
    }

    return data.map((row) => ({
      id: row.id,
      provider: row.provider,
      createdAt: row.created_at,
      updatedAt: row.updated_at ? row.updated_at : null,
      lastUsedAt: row.last_used_at ? row.last_used_at : null,
      keyVersion: row.key_version,
    }));
  }

  /**
   * Create new API key
   * user_id auto-filled via auth.uid()
   */
  async createKey(provider: string, encryptedKey: string) {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_api_keys")
      .insert({
        provider,
        encrypted_key: encryptedKey,
      })
      .select("id, provider, created_at")
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete key (user can only delete their own due to RLS)
   */
  async deleteKey(keyId: string) {
    const supabase = this.client;

    const { error } = await supabase
      .from("user_api_keys")
      .delete()
      .eq("id", keyId);

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Update key (for rotation)
   * Optionally: you might want to deactivate old keys instead
   */
  async updateKey(keyId: string, encryptedKey: string) {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("user_api_keys")
      .update({
        encrypted_key: encryptedKey,
        updated_at: new Date().toISOString(),
      })
      .eq("id", keyId)
      .select("id, provider, updated_at")
      .single();

    if (error) {
      throw new Error(`Failed to update API key: ${error.message}`);
    }

    return data;
  }
}
