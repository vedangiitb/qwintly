import { DBRepository } from "../../chat/server/repositories/repository";
import {
  Plan,
  PLAN_STATUS,
  PlanStatus,
  PlanTask,
} from "../types/updatePlan.types";

export class UpdatePlanRepository extends DBRepository {
  /*
   * Table: project_tasks
   * Use: Add Project Tasks (CREATE)
   * Returns: Plan id
   */
  async addPlan(
    tasksDetail: PlanTask[],
    chatId: string,
    messageId: string,
    toolId: string,
  ): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_tasks")
      .insert({
        conv_id: chatId,
        message_id: messageId,
        content: tasksDetail,
        status: PLAN_STATUS.PENDING,
        tool_id: toolId,
      })
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Chat not found or unauthorized");

    return data.id;
  }

  /*
   * Table: project_tasks
   * Use: Fetch Project Tasks for a message id (READ)
   */
  async fetchPlanByMessageId(messageId: string): Promise<Plan> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("message_id", messageId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("message not found or unauthorized");

    return {
      id: data.id,
      tasks: data.content,
      status: data.status,
      messageId: data.message_id,
    };
  }

  /*
   * Table: project_tasks
   * Use: Fetch Project Tasks for a chat (READ)
   */
  async fetchPlansByChatId(chatId: string): Promise<Plan[]> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("conv_id", chatId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((plan: any) => ({
      id: plan.id,
      tasks: plan.content,
      status: plan.status,
      messageId: plan.message_id,
    }));
  }

  /*
   *Table: project_tasks
   *Use: Update Project Task Status (UPDATE)
   */
  async updateProjectTasksStatus(
    planId: string,
    status: PlanStatus,
  ): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_tasks")
      .update({ status })
      .eq("id", planId)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Plan not found or unauthorized");

    return data.id;
  }

  /*
   *Table: project_tasks
   *Use: Fetch last generated plan (Fetch)
   */
  async fetchPrevPlan(chatId: string): Promise<Plan | null> {
    if (!chatId) throw new Error("Chat ID is required");

    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_tasks")
      .select("id, content, status, message_id")
      .eq("conv_id", chatId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      tasks: data.content,
      status: data.status,
      messageId: data.message_id,
    };
  }
}
