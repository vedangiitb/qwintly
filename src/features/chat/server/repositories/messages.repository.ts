/* messages.repository.ts */
import { InsertMsgPayload, RecentMsgContext } from "../../types/messages.types";
import { DBRepository } from "./repository";

export class MessagesRepository extends DBRepository {
  /*
   * Table: messages
   * Use: Fetch chat message summaries (READ) [Used for providing AI context]
   */
  async fetchRecentContext(convId: string): Promise<RecentMsgContext[]> {
    const supabase = this.client;
    const { data, error } = await supabase.rpc("fetch_recent_context", {
      p_conv_id: convId,
    });

    if (error) throw error;
    if (!data) return [];

    return data.map((chat: any) => ({
      role: chat.role,
      content: chat.content,
      type: chat.msg_type,
      toolName: chat.tool_name,
      toolSummary: chat.tool_summary,
      toolStatus: chat.tool_status,
    }));
  }

  /*
   * Table: messages
   * Use: Insert chat message (INSERT)
   */
  async insertChatMessage({
    chatId,
    content,
    role,
    type,
    tokenCount,
  }: InsertMsgPayload) {
    const supabase = this.client;
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conv_id: chatId,
        content,
        role,
        msg_type: type,
        token_count: tokenCount,
      })
      .select("id, content")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Chat not found or not authorized");
    return data;
  }
}
