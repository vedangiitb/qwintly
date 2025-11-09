import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "sonner";

interface CreateProjectRequest {
  project_name: string;
  project_type: string;
  org_id: string;
}

interface Project {
  project_id: string;
  project_name: string;
  project_type: string;
  org_id: string;
  creator_id: string;
  created_at: string;
  role?: string;
}

interface AddProjectMemberRequest {
  project_id: string;
  member_id: string;
  role: string;
}

interface ProjectMember {
  project_id: string;
  member_id: string;
  role: string;
  created_at: string;
  expires_at?: string | null;
}

interface UserProject {
  project_id: string;
  project_name: string;
  project_type: string;
  org_id: string | null;
  created_at: string;
  role?: string; // returned by your RPC if user role info is included
}

/**
 * Create a new project and automatically add the creator as a member
 */
export async function createProject({
  project_name,
  project_type,
  org_id,
}: CreateProjectRequest): Promise<{
  data: Project | null;
  error: string | null;
}> {
  try {
    const json = await fetchWithAuth<Project>("/api/project/new", {
      method: "POST",
      body: JSON.stringify({ project_name, project_type, org_id }),
    });

    toast.success(`Project "${project_name}" created successfully!`);
    return { data: json.data ?? null, error: null };
  } catch (error: any) {
    console.error("createProject error:", error);
    toast.error(error?.message || "Failed to create new project.");
    return { data: null, error: error.message };
  }
}

/**
 * Add a member to a project
 */
export async function addProjectMember({
  project_id,
  member_id,
  role,
}: AddProjectMemberRequest): Promise<{
  data: ProjectMember | null;
  error: string | null;
}> {
  try {
    const json = await fetchWithAuth<ProjectMember>("/api/project/add-member", {
      method: "POST",
      body: JSON.stringify({ project_id, member_id, role }),
    });

    toast.success(`Member added successfully as "${role}".`);
    return { data: json.data ?? null, error: null };
  } catch (error: any) {
    console.error("addProjectMember error:", error);
    toast.error(error?.message || "Failed to add project member.");
    return { data: null, error: error.message };
  }
}

/**
 * Fetch all projects the logged-in user is a member of or owns
 */
export async function getUserProjects(): Promise<{
  data: UserProject[] | null;
  error: string | null;
}> {
  try {
    const json = await fetchWithAuth<UserProject[]>(
      "/api/project/user-projects",
      {
        method: "GET",
      }
    );

    // Notify only if there’s data
    if (json.data && json.data.length > 0) {
      toast.success(
        `Loaded ${json.data.length} project${json.data.length > 1 ? "s" : ""}.`
      );
    } else {
      toast.info("You don't have any projects yet.");
    }

    return { data: json.data ?? [], error: null };
  } catch (error: any) {
    console.error("getUserProjects error:", error);
    toast.error(error?.message || "Failed to fetch user projects.");
    return { data: null, error: error.message };
  }
}
