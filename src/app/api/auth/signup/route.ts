import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateRecaptcha } from "@/lib/google-recaptcha";
import { enqueueEmail } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const { email, password, userName, recaptchaToken } = await req.json();

    const score = await validateRecaptcha(recaptchaToken, "signup");
    if (score < 0.65)
      return NextResponse.json(
        { message: "Security check failed" },
        { status: 403 }
      );

    // 1. Create user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { userName },
    });

    if (error)
      return NextResponse.json({ message: error.message }, { status: 500 });

    // 2. Insert into your own table
    await supabaseAdmin.from("users").insert({
      id: user.user.id,
      name: userName,
      email,
      plan: "free",
      usage_count: 0,
    });

    // 3. Queue your OTP email
    await enqueueEmail({ email, userId: user.user.id });

    return NextResponse.json(
      { message: "User created. Check email for OTP." },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
