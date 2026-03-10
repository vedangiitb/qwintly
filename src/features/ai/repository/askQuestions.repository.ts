import {
  Question,
  QUESTION_STATUS,
  QuestionAnswers,
  QuestionStatus,
  UserResponse,
} from "../types/askQuestions.types";
import { DBRepository } from "../../chat/server/repositories/repository";

export class AskQuestionsRepository extends DBRepository {
  /*
   * Table: project_questions
   * Use: Add Project Question (CREATE)
   * Returns: Questions id
   */
  async addProjectQuestions(
    convId: string,
    messageId: string,
    toolId: string,
    questions: Question[],
  ): Promise<string> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_questions")
      .insert({
        conv_id: convId,
        message_id: messageId,
        tool_id: toolId,
        questions: questions,
        status: QUESTION_STATUS.PENDING,
      })
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("conversation not found or unauthorized");
    return data.id;
  }

  /*
   * Table: project_questions
   * Use: Update user responses for a question set (UPDATE)
   * Returns: Questions id
   */
  async updateUserResponses(
    id: string,
    userResponses: UserResponse[],
    status: QuestionStatus,
  ): Promise<{ id: string; questions: Question[] }> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_questions")
      .update({
        user_responses: userResponses,
        status: status,
      })
      .eq("id", id)
      .select("id , questions")
      .single();

    if (error) throw error;
    return { id: data.id, questions: data.questions };
  }

  /*
   * Table: project_questions
   * Use: Fetch Project Questions for a given message id (READ)
   */
  async fetchQuestionsByMessageId(messageId: string): Promise<QuestionAnswers> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_questions")
      .select("*")
      .eq("message_id", messageId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    if (!data) throw new Error("conversation not found or unauthorized");

    return {
      id: data.id,
      questions: data.questions,
      userResponses: data.user_responses,
      messageId: data.message_id,
      status: data.status,
    };
  }

  /*
   * Table: project_questions
   * Use: Fetch all Project Questions for a chat (READ)
   */
  async fetchQuestionsByChatId(chatId: string): Promise<QuestionAnswers[]> {
    const supabase = this.client;

    const { data, error } = await supabase
      .from("project_questions")
      .select("*")
      .eq("conv_id", chatId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("conversation not found or unauthorized");

    return data.map((q: any) => ({
      id: q.id,
      questions: q.questions,
      userResponses: q.user_responses,
      messageId: q.message_id,
      status: q.status,
    }));
  }
}
