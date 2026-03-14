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
    <div className="flex justify-end my-2 sm:my-3">
      <Card className="md:max-w-[75%] sm:max-w-[70vw] px-4 py-2 rounded-2xl bg-muted/40 text-primary border">
        {content}
      </Card>
    </div>
  );
}
