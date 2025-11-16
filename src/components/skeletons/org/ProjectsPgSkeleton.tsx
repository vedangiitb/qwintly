"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsPgSectionSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
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
