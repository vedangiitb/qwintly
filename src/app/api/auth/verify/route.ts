import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashOtp, safeCompare } from "@/lib/otp-utils";

export async function POST(req: Request) {
  try {
    const { otp, userId } = await req.json();

    if (!otp || !userId)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("verification_otps")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data)
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });

    if (Date.now() > new Date(data.expires_at).getTime())
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });

    if (!safeCompare(data.otp_hash, hashOtp(otp)))
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });

    // delete used OTP
    await supabaseAdmin
      .from("verification_otps")
      .delete()
      .eq("user_id", userId);

    // Mark email verified
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    return NextResponse.json({ message: "Verified" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
