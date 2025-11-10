"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Building2,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrg } from "./hooks/useOrg";
import { cn } from "@/lib/utils"; // optional, but handy if you have shadcn’s cn helper

export default function Org() {
  const { organizations, loading } = useOrg();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="px-10 py-2 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Your Organizations
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/new")}
            className="gap-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search for an organization..."
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 py-2">
        {viewMode == "grid" ? (
          <Button
            variant="outline"
            size="icon"
            className={cn("rounded-xl transition-all")}
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className={cn("rounded-xl transition-all")}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-600 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Loading organizations...</p>
        </div>
      ) : organizations && organizations.length > 0 ? (
        <div
          className={cn(
            "transition-all duration-200",
            viewMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col divide-y"
          )}
        >
          {organizations.map((org) => (
            <Card
              key={org.org_id}
              className={cn(
                "rounded-2xl border shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer",
                viewMode === "list" && "rounded-none border-0 border-b px-2"
              )}
              onClick={() => router.push(`/org/${org.org_id}`)}
            >
              <CardContent
                className={cn(
                  "p-4 flex flex-col gap-2",
                  viewMode === "list"
                    ? "flex-row justify-between items-center"
                    : "flex-col"
                )}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <p className="text-lg font-medium">{org.org_name}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Created on{" "}
                  {new Date(org.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-12">
          <Building2 className="w-10 h-10 mb-3 opacity-60" />
          <p className="italic">No organizations found.</p>
          <Button
            variant="outline"
            className="mt-4 gap-2 rounded-xl"
            onClick={() => router.push("/new")}
          >
            <Plus className="w-4 h-4" />
            Create your first organization
          </Button>
        </div>
      )}
    </div>
  );
}
