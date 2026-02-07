// src/lib/crypto.ts
import crypto from "crypto";

const KEY = process.env.TOKEN_SECRET!;
// if (!KEY || KEY.length !== 32) {
//   throw new Error("TOKEN_SECRET must be set and 32 characters long");
// }

if (!KEY) {
  throw new Error("TOKEN_SECRET must be set");
}

const ALGO = "aes-256-ctr";

/** Encrypt text -> iv:hex:content:hex */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY), iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/** Decrypt iv:hex:content:hex -> text */
export function decrypt(payload: string): string {
  const [ivHex, contentHex] = payload.split(":");
  if (!ivHex || !contentHex) throw new Error("Invalid encrypted payload");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(contentHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
