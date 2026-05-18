import { DBRepository } from "@/features/chat/server/repositories/repository";

export class ProjectOperationsRepository extends DBRepository {
  async addProjectOperation(
    genId: string,
    route: string,
    operation: any,
  ): Promise<string> {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("project_operations")
      .insert({
        gen_id: genId,
        route,
        operation,
      })
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Failed to add project operation");
    return data.id;
  }
}
