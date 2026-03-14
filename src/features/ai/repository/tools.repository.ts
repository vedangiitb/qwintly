import {
  NewToolCallInsert,
  ToolCallStatus,
} from "../types/tools.types";
import { DBRepository } from "../../chat/server/repositories/repository";

/* tools.repository.ts */

export class ToolsRepository extends DBRepository {
  /*
   * Table: chat_tool_calls
   * Use: Create new tool call (CREATE)
   */
  async insertToolCallDB({
    convId,
    messageId,
    toolName,
    args,
    summary,
  }: NewToolCallInsert): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("chat_tool_calls")
      .insert({
        conv_id: convId,
        message_id:messageId,
        tool_name: toolName,
        arguments: args,
        summary,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  /*
   * Table: chat_tool_calls
   * Use: Update tool call status (UPDATE)
   */
  async updateToolCallStatus(
    toolCallId: string,
    status: ToolCallStatus,
  ): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("chat_tool_calls")
      .update({ status })
      .eq("id", toolCallId)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Tool call not found or unauthorized");
    return data.id;
  }

  /*
   * Table: chat_tool_calls
   * Use: Update tool call related messageId (UPDATE)
   */
  async updateToolCallMessageId(
    toolCallId: string,
    messageId: string,
  ): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("chat_tool_calls")
      .update({ message_id: messageId })
      .eq("id", toolCallId)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Tool call not found or unauthorized");
    return data.id;
  }
}
