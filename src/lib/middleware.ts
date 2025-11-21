import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function middleware(req: Request) {
  const supabase = supabaseAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPaths = ["/dashboard", "/account"];

  if (protectedPaths.some((p) => req.url.includes(p)) && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
