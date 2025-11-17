import { Octokit } from "octokit";
import { cookies } from "next/headers";
import { decrypt } from "./crypto";

export async function getGitHubClient() {
  const encrypted = (await cookies()).get("gh_token")?.value;
  if (!encrypted) throw new Error("GitHub not connected");

  const token = await decrypt(encrypted);

  return new Octokit({ auth: token });
}
