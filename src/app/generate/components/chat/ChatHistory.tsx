import RenderAIResponse from "./RenderAIResponse";
import RenderUserMessage from "./RenderUserMessage";
import TypingIndicator from "./TypingIndicator";

export default function ChatHistory({
  convHistory,
  isResponseLoading,
  generatingsite,
}: {
  convHistory: { role: string; content: string }[];
  isResponseLoading: boolean;
  generatingsite: boolean;
}) {
  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar px-2 py-8 space-y-2"
      aria-live="polite"
      tabIndex={0}
    >
      {convHistory.length > 0 &&
        convHistory.map((item, idx) => (
          <div key={idx}>
            {item.role === "user" ? (
              <RenderUserMessage data={item.content} />
            ) : (
              <RenderAIResponse data={item.content} />
            )}
          </div>
        ))}
      {isResponseLoading && <TypingIndicator generatingsite={generatingsite} />}
    </div>
  );
}
