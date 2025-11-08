import { getIdToken } from "@/utils/userIdTokenUtil";
import { toast } from "sonner";

export async function addOrganization({ org_name }: { org_name: string }) {
  try {
    const token = await getIdToken();
    if (!token) throw new Error("User not authenticated");
    const response = await fetch("/api/org/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        org_name: org_name,
      }),
    });

    const resp = await response.json();

    if (!response.ok || !resp?.success) {
      const errMsg = resp?.error || "Error occurred while creating new chat";
      throw new Error(errMsg);
    }

    const id: string | null = resp?.data?.id ?? null;
    return { id, data: resp?.data };
  } catch (err: any) {
    console.error("initConvService error:", err);
    toast.error(
      err?.message ||
        "Error occurred while creating new organization, please try again!"
    );
    return { id: null };
  }
}

export async function getOrganizations({ user_id }: { user_id: string }) {
  try {
  } catch (e) {}
}

export async function getOrganizationDetails({ org_id }: { org_id: string }) {
  try {
  } catch (e) {}
}
