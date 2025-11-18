import crypto from "crypto";

export function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}
