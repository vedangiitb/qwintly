import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: Request) {
  try {
    const { turnstileToken } = await req.json();

    // const valid = await verifyTurnstile(turnstileToken);
    const valid = true;
    if (!valid) {
      return NextResponse.json(
        { message: "Security check failed" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
