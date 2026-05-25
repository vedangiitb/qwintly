"use client";

import { Card } from "@/components/ui/card";
import { MESSAGE_TYPES } from "../../types/messages.types";

export default function RenderUserMessage({
  data,
  messageType,
}: {
  data: string;
  messageType: string;
}) {
  let content = data;
  if (messageType == MESSAGE_TYPES.QUESTIONS) {
    content = "Answers submitted successfully!";
  }
  return (
    <div className="flex justify-end my-2 sm:my-3 select-text">
      <div className="md:max-w-[75%] sm:max-w-[70vw] px-5 py-2.5 rounded-[1.25rem] bg-white/35 dark:bg-stone-900/35 text-stone-800 dark:text-stone-200 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.01)] border border-stone-200/35 dark:border-stone-800/35">
        {content}
      </div>
    </div>
  );
}
