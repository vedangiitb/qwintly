"use client";

import { setOrganizations } from "@/lib/features/orgSlice";
import { AppDispatch } from "@/lib/store";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  addOrganization as apiAddOrganization,
  addOrgMember as apiAddOrgMember,
  getOrganizations as apiGetOrganizations,
  getOrgProjects as apiGetOrgProjects,
  getOrgDetails as apigetOrganizations,
} from "../services/orgService";

export function useOrg() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  /** Fetch all organizations */
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await apiGetOrganizations();
      if (error) throw new Error(error);
      dispatch(setOrganizations(data || []));
    } catch (err: any) {
      console.error("useOrganizations fetch error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchOrgDetails = useCallback(
    async (
      org_id: string
    ): Promise<{
      data: any | null;
    }> => {
      try {
        const { data, error } = await apigetOrganizations(org_id);
        if (error) throw new Error(error);
        return { data };
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch organization details");
        return { data: null };
      }
    },
    []
  );

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
        toast.error("Failed to create organization");
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
      return { data: data || [] };
    } catch (err: any) {
      console.error("useOrganizations getOrgProjects error:", err);
      toast.error(err.message || "Failed to fetch organization projects");
      throw err;
    }
  }, []);

  /** Initial fetch */

  return {
    loading,
    error,
    fetchOrganizations,
    addOrganization,
    addOrgMember,
    getOrgProjects,
    fetchOrgDetails,
  };
}
