"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addOrganization as apiAddOrganization,
  addOrgMember as apiAddOrgMember,
  getOrganizations as apiGetOrganizations,
  getOrgProjects as apiGetOrgProjects,
} from "../services/orgService";

interface Org {
  id: string;
  name: string;
  created_at?: string;
}

export function useOrg() {
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all organizations */
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await apiGetOrganizations();
      if (error) throw new Error(error);
      setOrganizations(data || []);
    } catch (err: any) {
      console.error("useOrganizations fetch error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Add a new organization */
  const addOrganization = useCallback(
    async (org_name: string) => {
      try {
        const { id } = await apiAddOrganization({ org_name });
        if (id) {
          await fetchOrganizations(); // refresh after success
        }
        return id;
      } catch (err: any) {
        console.error("useOrganizations addOrganization error:", err);
        toast.error(err.message || "Failed to create organization");
        throw err;
      }
    },
    [fetchOrganizations]
  );

  /** Add a member to an org */
  const addOrgMember = useCallback(
    async (org_id: string, member_id: string, role: string) => {
      try {
        const { data, error } = await apiAddOrgMember({
          org_id,
          member_id,
          role,
        });
        if (error) throw new Error(error);
        toast.success("Member added successfully!");
        return data;
      } catch (err: any) {
        console.error("useOrganizations addOrgMember error:", err);
        toast.error(err.message || "Failed to add member");
        throw err;
      }
    },
    []
  );

  /** Fetch projects under a specific org */
  const getOrgProjects = useCallback(async (org_id: string) => {
    try {
      const { data, error } = await apiGetOrgProjects({ org_id });
      if (error) throw new Error(error);
      return data || [];
    } catch (err: any) {
      console.error("useOrganizations getOrgProjects error:", err);
      toast.error(err.message || "Failed to fetch organization projects");
      throw err;
    }
  }, []);

  /** Initial fetch */
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    refreshOrganizations: fetchOrganizations,
    addOrganization,
    addOrgMember,
    getOrgProjects,
  };
}
