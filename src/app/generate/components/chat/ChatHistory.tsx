import { Message } from "@/types/chat";
import RenderAIResponse from "./RenderAIResponse";
import RenderUserMessage from "./RenderUserMessage";
import TypingIndicator from "./TypingIndicator";
import { Questionnaire } from "./Questionnaire";

export default function ChatHistory({
  convHistory,
  isResponseLoading,
  generatingsite,
}: {
  convHistory: Message[];
  isResponseLoading: boolean;
  generatingsite: boolean;
}) {
  const onChange = (answer: Record<string, string | string[]>) => {
    console.log(answer);
  };
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
              />
            )}
          </div>
        ))}
      {isResponseLoading && <TypingIndicator generatingsite={generatingsite} />}
    </div>
  );
}
