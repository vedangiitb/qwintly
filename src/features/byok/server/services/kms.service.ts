import { KeyManagementServiceClient } from "@google-cloud/kms";

const client = new KeyManagementServiceClient();

function resolveKeyName(): string {
  const projectId = process.env.GCP_PROJECT_ID?.trim();

  if (!projectId) {
    throw new Error("Missing env var GCP_PROJECT_ID (required for KMS encryption)");
  }

  return `projects/${projectId}/locations/global/keyRings/qwintly-keyring/cryptoKeys/user-api-keys`;
}

export async function encrypt(text: string): Promise<string> {
  const keyName = resolveKeyName();
  const [result] = await client.encrypt({
    name: keyName,
    plaintext: Buffer.from(text),
  });

  return result.ciphertext!.toString("base64");
}
