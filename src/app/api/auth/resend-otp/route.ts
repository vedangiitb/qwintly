import { enqueueEmail } from "@/lib/queue";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    await enqueueEmail({ email, userId });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
