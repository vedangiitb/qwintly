import {
  CollectedContext,
  defaultCollectedContext,
} from "../../types/collectedContext.types";
import {
  defaultProjectInfo,
  ProjectInfo,
} from "../../types/projectInfo.types";
import { DBRepository } from "./repository";

export class CollectedContextRepository extends DBRepository {
  /*
   * Table: project_context
   * Use: Fetch collected context (READ)
   */
  async fetchCollectedContext(chatId: string): Promise<CollectedContext> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_context")
      .select("collected_context")
      .eq("id", chatId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return defaultCollectedContext;
    }

    const raw = data.collected_context ?? {};

    return {
      projectIdentity: {
        ...defaultCollectedContext.projectIdentity,
        ...(raw.projectIdentity ?? {}),
      },
      targetBusinessContext: {
        ...defaultCollectedContext.targetBusinessContext,
        ...(raw.targetBusinessContext ?? {}),
      },
      branding: {
        ...defaultCollectedContext.branding,
        ...(raw.branding ?? {}),
      },
      functionalRequirements: {
        ...defaultCollectedContext.functionalRequirements,
        ...(raw.functionalRequirements ?? {}),
      },
      constraints: {
        ...defaultCollectedContext.constraints,
        ...(raw.constraints ?? {}),
      },
      otherInfo: raw.otherInfo ?? [],
    };
  }

  /*
   * Table: project_context
   * Use: Create/Update collected context (UPSERT)
   */
  async persistCollectedContext(
    id: string, // chatId
    updatedCollectedContext: CollectedContext,
  ): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_context")
      .upsert(
        {
          id,
          collected_context: updatedCollectedContext,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (error) throw error;

    return data.id;
  }
  /*
   * Table: project_context
   * Use: Fetch project info (READ)
   */
  async fetchProjectInfo(id: string): Promise<ProjectInfo> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_context")
      .select("project_info")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return defaultProjectInfo;

    const raw = data.project_info ?? {};

    return {
      ...defaultProjectInfo,
      ...raw,
      uiPages: raw.uiPages ?? defaultProjectInfo.uiPages,
    };
  }
}
