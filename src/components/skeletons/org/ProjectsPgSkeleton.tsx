"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ProjectsPgSectionSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>

        <Button className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      {/* Empty State */}
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="rounded-2xl border-dashed opacity-60 hover:opacity-100 transition-all"
          >
            <CardContent className="flex items-center gap-4 py-6 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-muted" />

              <div className="space-y-2 w-full">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
