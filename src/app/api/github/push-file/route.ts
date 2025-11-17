import { NextRequest, NextResponse } from "next/server";
import { getGitHubClient } from "@/lib/github";
import { Buffer } from "buffer";

export async function POST(req: NextRequest) {
  const { repoName, path, content } = await req.json();

  try {
    const octokit = await getGitHubClient();

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: repoName,
      path,
      message: `Add ${path}`,
      content: Buffer.from(content).toString("base64"),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
