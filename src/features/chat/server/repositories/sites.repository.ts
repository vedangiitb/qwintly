import { DBRepository } from "./repository";

export class SitesRepository extends DBRepository {
  /*
   * Table: project_sites
   * Use: Fetch Project Site (READ)
   */
  async fetchSite(id: string): Promise<string> {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("project_sites")
      .select("url")
      .eq("conv_id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data.url;
  }
}
