import { Stage } from "@/types/chat";
import { insertDataSupabase } from "../../../../infra/supabase/insertData";
import { updateFieldSupabase } from "../../../../infra/supabase/updateField";

export const askQuestions = async ({
  questions,
  collectedInfo,
  token,
  userId,
  convId,
}: {
  questions: any;
  collectedInfo: any;
  token: string;
  userId: string;
  convId: string;
}) => {
  // Save questions in DB
  const questionsData = {
    contents: { questionsList: questions },
    user_id: userId,
    conv_id: convId,
  };
  await insertDataSupabase(questionsData, "questions", token);

  // Save collectedInfo in DB
  const collectedInfoData = {
    name: collectedInfo.name,
    description: collectedInfo.description,
    category: collectedInfo.category,
    target_users: collectedInfo.targetUsers,
    otherInfo: collectedInfo.otherInfo,
    user_id: userId,
    conv_id: convId,
  };

  await insertDataSupabase(collectedInfoData, "collected_info", token);

  // Update DB State - status
  await updateFieldSupabase(convId, "stage", "questioner", "chats", token);

  return { questions, collectedInfo };
};

export const askQuestionClient = async (
  params: any,
  updateProjectStage: (stage: Stage) => void,
): Promise<Questions> => {
  const questions = params.questions;
  const data = questions.map((q: any) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options,
    answer_default: q.answer_default,
  }));
  updateProjectStage("questioner");
  return data;
};
