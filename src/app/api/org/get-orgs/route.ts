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

    const { data: orgs, error: orgError } = await supabase.rpc(
      "get_user_organizations",
      { userid: userId }
    );

    console.log(orgs);

    if (orgError) {
      console.error("Supabase chat lookup error:", orgError.message);
      return NextResponse.json(
        { success: false, error: "Organizations not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: orgs,
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
