import { enqueueEmail } from "@/lib/queue";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();
    await enqueueEmail({
      email: email,
      userId: userId,
    });
    return NextResponse.json(
      {
        message: "Success",
      },
      {
        status: 200,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return NextResponse.json(
      { message: "Unknown error occured, please try again" },
      { status: 500 }
    );
  }
}
