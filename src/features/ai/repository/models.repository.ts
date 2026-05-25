import { DBRepository } from "@/features/chat/server/repositories/repository";

export type ValidModelsByProvider = Array<{
  providerId: string;
  provider: string;
  models: Array<{
    id: string;
    modelName: string;
  }>;
}>;

export class ModelsRepository extends DBRepository {
  async getValidModels(): Promise<ValidModelsByProvider> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("models")
      .select(
        "id, model_name, provider_id, providers!inner(id, provider, enabled)",
      )
      .eq("enabled", true)
      .eq("providers.enabled", true);

    if (error) throw error;
    if (!data) return [];

    const grouped = new Map<
      string,
      {
        providerId: string;
        provider: string;
        models: Array<{ id: string; modelName: string }>;
      }
    >();

    for (const row of data as any[]) {
      const providerRow = row.providers as
        | { id: string; provider: string; enabled: boolean }
        | null
        | undefined;

      if (!providerRow?.enabled) continue;

      const providerKey = providerRow.provider;
      const existing = grouped.get(providerKey) ?? {
        providerId: providerRow.id,
        provider: providerRow.provider,
        models: [],
      };

      existing.models.push({ id: row.id, modelName: row.model_name });
      grouped.set(providerKey, existing);
    }

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      models: group.models.sort((a, b) => a.modelName.localeCompare(b.modelName)),
    }));
  }
}
