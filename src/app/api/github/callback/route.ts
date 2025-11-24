import { encrypt } from "@/lib/crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code)
    return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
  const redirect = process.env.NEXT_PUBLIC_GITHUB_REDIRECT!;

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirect,
    }),
    headers: { Accept: "application/json" },
  });

  const resp = await response.json();

  const accessToken = resp.data.access_token;

  // Encrypt before storing
  const encrypted = encrypt(accessToken);

  (await cookies()).set("gh_token", encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.redirect("/dashboard?github=connected");
}
