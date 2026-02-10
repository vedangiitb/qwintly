import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
  const redirect = process.env.NEXT_PUBLIC_GITHUB_REDIRECT!;

  if (!clientId || !redirect) {
    return NextResponse.json(
      { error: "Missing GitHub credentials" },
      { status: 500 },
    );
  }

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect}&scope=repo,user`;

  return Response.redirect(url);
}
