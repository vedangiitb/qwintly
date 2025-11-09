import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addProjectMember,
  createProject,
  getUserProjects,
} from "../services/projectService"; // adjust this import path

import type {
  AddProjectMemberRequest,
  CreateProjectRequest,
  Project,
  ProjectMember,
  UserProject,
} from "../services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user's projects
   */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getUserProjects();
      if (error) throw new Error(error);
      setProjects(data ?? []);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new project
   */
  const handleCreateProject = useCallback(
    async (payload: CreateProjectRequest): Promise<Project | null> => {
      setLoading(true);
      try {
        const { data, error } = await createProject(payload);
        if (error) throw new Error(error);
        if (data) {
          setProjects((prev) => [data, ...prev]); // optimistic update
        }
        return data;
      } catch (err: any) {
        toast.error(err.message || "Failed to create project.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Add a project member
   */
  const handleAddMember = useCallback(
    async (payload: AddProjectMemberRequest): Promise<ProjectMember | null> => {
      setLoading(true);
      try {
        const { data, error } = await addProjectMember(payload);
        if (error) throw new Error(error);
        return data;
      } catch (err: any) {
        toast.error(err.message || "Failed to add project member.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    createProject: handleCreateProject,
    addMember: handleAddMember,
    refetch: fetchProjects,
  };
}
