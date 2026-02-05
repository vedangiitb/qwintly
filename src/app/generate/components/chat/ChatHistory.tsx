import { Message } from "@/types/chat";
import RenderAIResponse from "./RenderAIResponse";
import RenderUserMessage from "./RenderUserMessage";
import TypingIndicator from "./TypingIndicator";

export default function ChatHistory({
  convHistory,
  isResponseLoading,
  generatingsite,
}: {
  convHistory: Message[];
  isResponseLoading: boolean;
  generatingsite: boolean;
}) {
  console.log(isResponseLoading,"Hi")
  return (
    <div
      className="flex-1 overflow-y-auto px-2 py-8 space-y-2"
      aria-live="polite"
      tabIndex={0}
    >
      {convHistory.length > 0 &&
        convHistory.map((item, idx) => (
          <div key={idx}>
            {item.role === "user" ? (
              <RenderUserMessage data={item.content as string} />
            ) : (
              <RenderAIResponse
                data={item.content as string}
                msgType={item.msgType || "message"}
                latest={idx === convHistory.length - 1}
              />
            )}
          </div>
        ))}
      {isResponseLoading && <TypingIndicator generatingsite={generatingsite} />}
    </div>
  );
}
