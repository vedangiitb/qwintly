"use client";

import ProjectsPgSectionSkeleton from "@/components/skeletons/org/ProjectsPgSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Folder, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrg } from "../hooks/useOrg";
import { useRouter } from "next/navigation";
import React from "react";

interface OrgDetails {
  org_name: string;
  plan_id: string;
  owner_id: string;
  creator_id: string;
  created_at: string;
  subscription_plan_id: string;
  subscription_status: string;
  subscription_expires_at: string;
}

type Props = { params: { id: string } };

export default function ManageOrg({ params }: Props) {
  const { getOrgProjects, fetchOrgDetails } = useOrg();
  const [details, setDetails] = useState<OrgDetails | null>(null);
  const [orgProjects, setOrgProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [detailsRes, projectsRes] = await Promise.all([
          fetchOrgDetails(id),
          getOrgProjects(id),
        ]);

        if (detailsRes.data?.[0]) setDetails(detailsRes.data[0]);
        if (projectsRes.data) setOrgProjects(projectsRes.data);
      } catch (error) {
        console.error("Failed to load org data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchOrgDetails, getOrgProjects]);

  if (!loading && !details) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-red-500 text-lg">Organization details not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button
          onClick={() => router.push("/project/new")}
          className="gap-2 rounded-lg"
          size="sm"
        >
          <Plus className="w-4 h-4" /> Create Project
        </Button>
      </div>

      {loading && <ProjectsPgSectionSkeleton />}

      {!loading && orgProjects.length === 0 ? (
        <p className="text-muted-foreground">No projects found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {orgProjects.map((p, idx) => (
            <Card
              key={idx}
              className="rounded-xl hover:shadow transition-all cursor-pointer hover:bg-muted/60"
            >
              <CardContent className="flex items-center gap-4 py-2">
                <Folder className="w-4 h-4" />
                <div>
                  <p className="font-medium text-lg">
                    {p.project_name || "Untitled Project"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Project ID: {p.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
