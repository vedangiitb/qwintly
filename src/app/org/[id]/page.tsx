"use client";

import React, { useEffect, useState } from "react";
import { useOrg } from "../hooks/useOrg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";

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
  const id = params.id;

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

  if (loading) {
    return (
      <div className="px-4 md:px-32 py-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-red-500 text-lg">Organization details not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {details.org_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Created:</strong>{" "}
            {new Date(details.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Subscription:</strong> {details.subscription_status}
          </p>
          <p>
            <strong>Expires:</strong>{" "}
            {new Date(details.subscription_expires_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Create Project
        </Button>
      </div>

      {orgProjects.length === 0 ? (
        <p className="text-muted-foreground">No projects found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {orgProjects.map((p, idx) => (
            <Card
              key={idx}
              className="rounded-2xl hover:shadow transition-all cursor-pointer"
            >
              <CardContent className="flex items-center gap-4 py-6">
                <Folder className="w-8 h-8" />
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
