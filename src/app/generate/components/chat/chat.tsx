import { useConvHistory } from "../../hooks/chat/useConvHistory";
import { useConversation } from "../../hooks/chat/useChat";
import ChatBox from "./ChatBox";
import ChatHistory from "./ChatHistory";

export default function Chat({}) {
  const { prompt, setPrompt, submitPrompt, isResponseLoading, generatingsite } =
    useConversation();

  const { convHistory } = useConvHistory();

  return (
    <div className="pl-4 pr-2 pb-2 h-full flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      <ChatHistory
        convHistory={convHistory}
        isResponseLoading={isResponseLoading}
        generatingsite={generatingsite}
      />
      <ChatBox
        prompt={prompt}
        submitPrompt={submitPrompt}
        setPrompt={setPrompt}
        isResponseLoading={isResponseLoading}
      />
    </div>
  );
}
