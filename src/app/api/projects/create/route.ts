import { authenticateRequest } from "@/lib/authUtils";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface NewOrgRequestBody {
  project_name?: string;
  project_type?: string;
  org_id?: string;
}

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const userId = auth.userId;
    const body: NewOrgRequestBody = await req.json();

    if (!body || !body.project_name || !body.project_type || !body.org_id) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid type or name " },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("create_project_with_member", {
      p_name: body.project_name,
      p_creator_id: userId,
      p_type: body.project_type,
      p_org_id: body.org_id,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "DB error" },
        { status: 500 }
      );
    }

    const responseData = {
      id: (data[0] as any)?.project_id ?? null,
      ...(data[0] as any),
    };

    return NextResponse.json(
      { success: true, data: responseData, error: null },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error while creating new Organization:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
