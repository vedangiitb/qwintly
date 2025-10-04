import { firestoreDb, adminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

function safeCompare(a: string, b: string) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function hashOtp(otp: string) {
  if (typeof otp !== "string") otp = String(otp);
  return crypto.createHash("sha256").update(otp, "utf8").digest("hex");
}

export async function POST(req: Request) {
  try {
    const { otp, userId } = await req.json();
    if (!otp || !userId)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const docRef = firestoreDb.collection("verificationOtps").doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists)
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });

    const data = docSnap.data();
    const firestoreOtp = data?.otpHash;
    const expiresAt = data?.expiresAt?.toMillis?.();

    if (!firestoreOtp || (expiresAt && Date.now() > expiresAt))
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });

    if (!safeCompare(firestoreOtp, hashOtp(otp)))
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });

    await docRef.delete();

    adminAuth.updateUser(userId, {
      emailVerified: true,
    });

    return NextResponse.json({ message: "Verified" }, { status: 200 });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
