import {
  ModelsRepository,
  ValidModelsByProvider,
} from "@/features/ai/repository/models.repository";

export const getModels = (token: string): Promise<ValidModelsByProvider> => {
  const modelsRepo = new ModelsRepository(token);
  return modelsRepo.getValidModels();
};
