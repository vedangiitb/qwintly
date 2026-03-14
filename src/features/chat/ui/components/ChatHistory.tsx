import RenderAIResponse from "./RenderAIResponse";
import RenderUserMessage from "./RenderUserMessage";
import TypingIndicator from "./TypingIndicator";

type ChatHistoryItem = {
  id?: string;
  role: string;
  content: string;
  type?: string;
  msgType?: string;
};

export default function ChatHistory({
  convHistory,
  isResponseLoading,
  isGenerating,
}: {
  convHistory: ChatHistoryItem[];
  isResponseLoading: boolean;
  isGenerating: boolean;
}) {
  return (
    <div
      className="flex-1 overflow-y-auto px-2 py-8 space-y-2"
      aria-live="polite"
      tabIndex={0}
    >
      {convHistory.length > 0 &&
        convHistory.map((item, idx) => (
          <div key={item.id ?? idx}>
            {item.role === "user" ? (
              <RenderUserMessage data={item.content} messageType={item.type} />
            ) : (
              <RenderAIResponse
                data={item.content}
                msgType={item.type ?? item.msgType ?? "message"}
                messageId={item.id}
              />
            )}
          </div>
        ))}
      {isResponseLoading && <TypingIndicator isGenerating={isGenerating} />}
    </div>
  );
}
