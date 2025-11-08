import { adminAuth, firestoreDb } from "@/lib/firebase-admin";
import { enqueueEmail } from "@/lib/queue";
import admin from "firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (
      !email ||
      !userId ||
      typeof email !== "string" ||
      typeof userId !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid request payload" },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await adminAuth.getUser(userId);
    } catch {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.email !== email) {
      return NextResponse.json(
        { message: "Email does not match user" },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Already verified" },
        { status: 409 }
      );
    }

    const docRef = firestoreDb.collection("verificationOtps").doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = docSnap.data();
    const createdAt = data?.createdAt?.toDate?.() || new Date(data?.createdAt);
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    if (createdAt && createdAt > oneMinuteAgo) {
      return NextResponse.json(
        { message: "OTP recently sent. Please wait before requesting again." },
        { status: 429 }
      );
    }

    try {
      await enqueueEmail({ email, userId });
      await docRef.set(
        { createdAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to enqueue email", err);
      return NextResponse.json(
        { message: "Failed to send OTP, please try again later" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Resend OTP error:", e);
    return NextResponse.json(
      { message: "Unknown error occurred, please try again" },
      { status: 500 }
    );
  }
}
