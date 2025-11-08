import { authenticateRequest } from "@/lib/authUtils";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

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
    const body = await req.json();

    if (!body?.org_id || !body?.member_id || !body?.role) {
      return NextResponse.json(
        { success: false, error: "Missing data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("add_org_member", {
      p_org_id: body.org_id,
      p_requester_id: userId,
      p_member_id: body.member_id,
      p_role: body.role,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("Error while adding org member:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
