"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function RenderUserMessage({ data }: { data: string }) {
  return (
    <div className="flex justify-end px-2 my-4">
      <Card
        className={cn(
          "max-w-[80%] px-4 py-2 rounded-2xl sm:rounded-3xl text-white text-sm",
          "bg-gradient-to-br from-teal-500 via-fuchsia-600 to-purple-700",
          "shadow-sm border border-transparent transition-all",
          "hover:shadow-md",
          "opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
        )}
        style={{ willChange: "transform, opacity" }}
      >
        {data}
      </Card>
    </div>
  );
}
