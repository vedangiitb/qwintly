import { insertDataSupabase } from "../../../../infra/supabase/insertData";

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

  return { questions, collectedInfo };
};

export const askQuestionClient = () => {};
