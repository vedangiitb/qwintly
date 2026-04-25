export type GenerationTerminalEventHandler = (chatId: string) => void;

const terminalEventHandlers = new Set<GenerationTerminalEventHandler>();

export const emitGenerationTerminalEvent = (chatId: string) => {
  for (const handler of terminalEventHandlers) {
    try {
      handler(chatId);
    } catch (e) {
      console.error(e.message);
      // Best-effort: terminal event handlers should not crash the app.
    }
  }
};

export const subscribeToGenerationTerminalEvents = (
  handler: GenerationTerminalEventHandler,
) => {
  terminalEventHandlers.add(handler);
  return () => {
    terminalEventHandlers.delete(handler);
  };
};
