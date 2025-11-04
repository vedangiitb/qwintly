"use client";

import { Card } from "@/components/ui/card";

export default function RenderUserMessage({ data }: { data: string }) {
  return (
    <div className="flex justify-end my-2 sm:my-3">
      <Card className="max-w-[80vw] sm:max-w-[70vw] px-4 py-2 rounded-2xl bg-muted/40 text-primary border-2 border-border">
        {data}
      </Card>
    </div>
  );
}
