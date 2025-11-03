"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function RenderUserMessage({ data }: { data: string }) {
  return (
    <div className="flex justify-end px-2 my-4">
      <Card
        className={cn(
          "max-w-[80%] sm:max-w-[75%] px-4 py-2 rounded-2xl",
          "bg-muted text-primary text-sm md:text-base",
          "border border-border/60 shadow-sm transition-all",
          "hover:border-indigo-400/40 hover:shadow-md"
        )}
        style={{ willChange: "transform, opacity" }}
      >
        {data}
      </Card>
    </div>
  );
}
