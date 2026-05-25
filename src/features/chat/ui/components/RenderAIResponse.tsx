"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Questionnaire } from "./Questionnaire";
import { PlanReview } from "./planPreview";
import { useChat } from "../hooks/useChat";
import { MESSAGE_TYPES } from "../../types/messages.types";
import { GenSummaryCard } from "./GenSummaryCard";

export default function RenderAIResponse({
  data,
  msgType,
  messageId,
}: {
  data: string;
  msgType: string;
  messageId?: string;
}) {
  const { questionAnswersByMessageId, plansByMessageId } = useChat();
  const mappedMessageId = messageId ?? "";
  const plan = plansByMessageId[mappedMessageId];
  const questionSet = questionAnswersByMessageId[mappedMessageId];

  // If no textual content is loaded yet and no tool payloads are present in state, render nothing
  if (!data?.trim() && !plan && !questionSet) {
    return null;
  }

  const displayMessage: string = data || "Something went wrong";

  const aiCard = (messageType: string) => {
    if (messageType === MESSAGE_TYPES.PLAN) {
      return (
        <div className="w-full space-y-2">
          {data?.trim() ? defaultCard(data) : null}
          <PlanReview plan={plan} fallbackText={displayMessage} />
        </div>
      );
    }

    if (messageType === MESSAGE_TYPES.QUESTIONS) {
      return (
        <div className="w-full space-y-2">
          {data?.trim() ? defaultCard(data) : null}
          <Questionnaire
            questionSet={questionSet}
            fallbackText={displayMessage}
          />
        </div>
      );
    }

    if (messageType === MESSAGE_TYPES.GEN_SUMMARY) {
      return (
        <GenSummaryCard
          displayMessage={displayMessage}
          messageId={mappedMessageId}
          renderMessageBody={(content) => defaultCard(content)}
        />
      );
    }

    if (messageType === MESSAGE_TYPES.MESSAGE) {
      return defaultCard(displayMessage);
    }
    return defaultCard(displayMessage);
  };

  return (
    <div className="flex items-start gap-3 my-4">
      <Avatar className="hidden sm:flex h-8 w-8 bg-stone-900 dark:bg-stone-100 shadow-xs">
        <AvatarFallback className="bg-transparent text-white dark:text-stone-950 text-xs font-medium">
          ✨
        </AvatarFallback>
      </Avatar>

      {aiCard(msgType)}
    </div>
  );
}

const defaultCard = (displayMessage: string) => {
  return (
    <div
      className={cn(
        "w-full md:max-w-[75%] px-5 py-3.5 rounded-[1.25rem] select-text",
        "bg-white/35 dark:bg-stone-900/35 text-stone-800 dark:text-stone-200 text-sm leading-relaxed",
        "border border-stone-200/35 dark:border-stone-800/35 shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all",
      )}
    >
      <MarkdownBody displayMessage={displayMessage} />
    </div>
  );
};

const MarkdownBody = ({ displayMessage }: { displayMessage: string }) => {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          return (
            <code
              className={cn(
                "rounded bg-stone-200/60 dark:bg-stone-800/60 px-1.5 py-0.5 text-xs font-mono text-teal-650 dark:text-teal-350 font-semibold",
                className,
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children, ...props }) {
          return (
            <pre
              className="rounded-xl bg-stone-950 p-4 overflow-x-auto text-xs text-stone-200 font-mono shadow-md border border-stone-800/50 my-2.5"
              {...props}
            >
              {children}
            </pre>
          );
        },
        p({ children }) {
          return <p className="leading-relaxed my-1">{children}</p>;
        },
      }}
    >
      {displayMessage}
    </ReactMarkdown>
  );
};
