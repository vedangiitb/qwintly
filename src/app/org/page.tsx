"use client";

import { useEffect, useState } from "react";
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
import NewOrgDialog from "./components/orgDialog";

interface Org {
  org_id: string;
  org_name: string;
  created_at: string;
}

export default function Org() {
  const { fetchOrganizations, loading } = useOrg();
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data } = await fetchOrganizations();
      if (data) setOrganizations(data);
    };
    fetchOrgs();
  }, []);

  return (
    <div className="px-4 md:px-32 py-4 mx-auto flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Your Organizations
        </h2>
        <NewOrgDialog />
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

      <div className="flex justify-end gap-2 py-2 mb-2">
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
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 min-h-0">
          <div
            className={cn(
              "transition-all duration-200 overflow-y-auto",
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col divide-y gap-4"
            )}
          >
            {organizations.map((org) => (
              <Card
                key={org.org_id}
                className="rounded-2xl border shadow-sm hover:border-muted-foreground/60 transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/org/${org.org_id}`)}
              >
                <CardContent
                  className={cn(
                    "px-4  flex flex-col gap-2",
                    viewMode === "list"
                      ? "flex-row justify-between items-center"
                      : "flex-col py-2"
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-12">
          <Building2 className="w-10 h-10 mb-3 opacity-60" />
          <p className="italic">No organizations found.</p>
          <Button
            variant="outline"
            className="mt-4 gap-2 rounded-xl"
            onClick={() => router.push("/org/new")}
          >
            <Plus className="w-4 h-4" />
            Create your first organization
          </Button>
        </div>
      )}
    </div>
  );
}
