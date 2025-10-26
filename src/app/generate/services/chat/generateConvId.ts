import crypto from "crypto";

export const generateConvId = (uid: string) => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const rawString = `${uid}-${timestamp}-${randomSuffix}`;

  const hash = crypto.createHash("sha256").update(rawString).digest("hex");
  return hash;
};