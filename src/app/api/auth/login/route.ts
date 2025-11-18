import { NextResponse } from "next/server";
import { validateRecaptcha } from "@/lib/google-recaptcha";

export async function POST(req: Request) {
  try {
    const { recaptchaToken } = await req.json();

    const score = await validateRecaptcha(recaptchaToken, "login");
    if (score < 0.5)
      return NextResponse.json(
        { message: "Security check failed" },
        { status: 403 }
      );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
