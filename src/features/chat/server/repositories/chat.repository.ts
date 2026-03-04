import {
  ChatMetadata,
  FetchChatsResult,
  FetchMessagesResult,
} from "../../types/chat.types";
import { DBRepository } from "./repository";

/* chat.repository.ts */

export class ChatRepository extends DBRepository {
  /*
   * Fetch user chats (READ)
   */
  async fetchChats({
    limit = 10,
    cursor,
  }: {
    limit?: number;
    cursor?: string;
  }): Promise<FetchChatsResult> {
    const supabase = this.client;
    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const [cursorUpdatedAt, cursorId] = cursor?.split("|") ?? [];

    let query = supabase
      .from("chats")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(boundedLimit + 1);

    if (cursorUpdatedAt && cursorId) {
      query = query.or(
        `updated_at.lt.${cursorUpdatedAt},and(updated_at.eq.${cursorUpdatedAt},id.lt.${cursorId})`,
      );
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const hasMore = rows.length > boundedLimit;
    const pageRows = hasMore ? rows.slice(0, boundedLimit) : rows;
    const lastRow = pageRows[pageRows.length - 1];
    const nextCursor =
      hasMore && lastRow?.updated_at && lastRow?.id
        ? `${lastRow.updated_at}|${lastRow.id}`
        : null;

    return {
      chats: pageRows.map((chat) => ({
        id: chat.id,
        title: chat.title,
      })),
      nextCursor,
    };
  }

  /*
   * Create a new chat (CREATE)
   */
  async createChat({ title }: { title: string }) {
    if (!title?.trim()) throw new Error("Title is required");

    const supabase = this.client;

    const { data, error } = await supabase
      .from("chats")
      .insert({ title: title.trim() })
      .select("id, title")
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Chat not found or not authorized");

    return data;
  }

  /*
   * Delete a chat (DELETE)
   */
  async deleteChat(chatId: string) {
    if (!chatId) throw new Error("Chat ID is required");

    const supabase = this.client;

    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) throw new Error(error.message);
  }

  /*
   * Fetch chat metadata with collected_context (READ)
   */
  async fetchChatMetadata(chatId: string): Promise<ChatMetadata> {
    if (!chatId) throw new Error("Chat ID is required");

    const supabase = this.client;

    const { data, error } = await supabase
      .from("chats")
      .select(
        `
      *,
      project_context (
        collected_context
      )
    `,
      )
      .eq("id", chatId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Chat not found or not authorized");

    return {
      id: data.id,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      collectedContext: data.project_context?.collected_context ?? null,
    };
  }

  /*
   * Table: messages
   * Use: Fetch chat messages (READ) [Cursor Paginated]
   */
  async fetchChatMessages(
    chatId: string,
    {
      limit = 20,
      cursor,
    }: {
      limit?: number;
      cursor?: string; // created_at|id of last message from previous page
    } = {},
  ): Promise<FetchMessagesResult> {
    if (!chatId) throw new Error("Chat ID is required");

    const supabase = this.client;
    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const [cursorCreatedAt, cursorId] = cursor?.split("|") ?? [];

    let query = supabase
      .from("messages")
      .select(
        `
      id,
      content,
      role,
      msg_type,
      created_at
    `,
      )
      .eq("conv_id", chatId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(boundedLimit + 1);

    if (cursorCreatedAt && cursorId) {
      query = query.or(
        `created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`,
      );
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const hasMore = rows.length > boundedLimit;
    const pageRows = hasMore ? rows.slice(0, boundedLimit) : rows;

    const messages = pageRows.map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      type: msg.msg_type,
      createdAt: msg.created_at,
    }));

    const lastMessage = messages[messages.length - 1];
    const nextCursor =
      hasMore && lastMessage
        ? `${lastMessage.createdAt}|${lastMessage.id}`
        : null;

    return {
      messages,
      nextCursor,
    };
  }

  async isGenerating(chatId: string) {
    if (!chatId) throw new Error("Chat ID is required");

    const supabase = this.client;

    const { data, error } = await supabase
      .from("chats")
      .select("is_generating")
      .eq("id", chatId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Chat not found or not authorized");

    return data.is_generating;
  }
}
