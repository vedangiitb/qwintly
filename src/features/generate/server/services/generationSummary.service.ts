import { StatusRepository } from "../repositories/status.repository";

export const fetchGenerationSummaryService = async (
  msgId: string,
  token: string,
) => {
  const statusRepository = new StatusRepository(token);
  return statusRepository.fetchGenerationSummary(msgId);
};

