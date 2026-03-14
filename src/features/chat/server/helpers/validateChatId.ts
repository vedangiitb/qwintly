export const validateChatId = (chatId: string): string => {
  const trimmedChatId = chatId?.trim();
  if (!trimmedChatId) {
    throw new Error("Missing or invalid chatId");
  }
  return trimmedChatId;
};
