import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "sonner";

interface AddOrgResponse {
  id: string;
  name: string;
}

interface AddOrgMemberRequest {
  org_id: string;
  member_id: string;
  role: string;
}

interface OrgMember {
  member_entry_id: string;
  member_org_id: string;
  member_user_id: string;
  member_role: string;
  member_created_at: string;
}

/**
 * Add a new organization
 */
export async function addOrganization({
  org_name,
}: {
  org_name: string;
}): Promise<{ id: string | null; data?: AddOrgResponse }> {
  try {
    const json = await fetchWithAuth<AddOrgResponse>("/api/org/new", {
      method: "POST",
      body: JSON.stringify({ org_name }),
    });

    toast.success(`Organization "${org_name}" created successfully!`);
    return { id: json.data?.id ?? null, data: json.data };
  } catch (error: any) {
    console.error("addOrganization error:", error);
    toast.error(error?.message || "Failed to create organization.");
    return { id: null };
  }
}

/**
 * Fetch all organizations for the logged-in user
 */
export async function getOrganizations(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const json = await fetchWithAuth<any[]>("/api/org/get-orgs", { method: "GET" });
    return { data: json.data ?? [], error: null };
  } catch (error: any) {
    console.error("getOrganizations error:", error);
    toast.error(error?.message || "Failed to fetch organizations.");
    return { data: null, error: error.message };
  }
}

/**
 * Fetch all projects under a specific organization
 */
export async function getOrgProjects({
  org_id,
}: {
  org_id: string;
}): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const json = await fetchWithAuth<any[]>(
      `/api/org/org-projects?org-id=${encodeURIComponent(org_id)}`,
      { method: "GET" }
    );
    return { data: json.data ?? [], error: null };
  } catch (error: any) {
    console.error("getOrgProjects error:", error);
    toast.error(error?.message || "Failed to load organization projects.");
    return { data: null, error: error.message };
  }
}

/**
 * Add a member to an organization
 */
export async function addOrgMember({
  org_id,
  member_id,
  role,
}: AddOrgMemberRequest): Promise<{
  data: OrgMember | null;
  error: string | null;
}> {
  try {
    const json = await fetchWithAuth<OrgMember>("/api/org/add-member", {
      method: "POST",
      body: JSON.stringify({ org_id, member_id, role }),
    });

    toast.success(`Member added successfully as "${role}".`);
    return { data: json.data ?? null, error: null };
  } catch (error: any) {
    console.error("addOrgMember error:", error);
    toast.error(error?.message || "Failed to add organization member.");
    return { data: null, error: error.message };
  }
}

export async function getOrganizationDetails({ org_id }: { org_id: string }) {
  try {
  } catch (e) {}
}
