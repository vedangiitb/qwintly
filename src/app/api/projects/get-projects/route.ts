import { authenticateRequest } from "@/lib/authUtils";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // TODO: Add rate limiting
    // TODO: Add database query timeouts
    const auth = await authenticateRequest(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }
    const userId = auth.userId;

    const { data: projects, error: orgError } = await supabase.rpc(
      "get_user_projects",
      { p_user_id: userId }
    );

    console.log(projects);

    if (orgError) {
      console.error("Supabase chat lookup error:", orgError.message);
      return NextResponse.json(
        { success: false, error: "Projects not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: projects,
      },
      {
        status: 200,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
