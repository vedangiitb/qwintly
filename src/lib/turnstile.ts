export async function verifyTurnstile(token: string) {
  if (!token) return false;

  if (!process.env.TURNSTILE_SECRET_KEY)
    throw new Error("Missing environment variable: TURNSTILE_SECRET_KEY");

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
      },
    );

    const data = await res.json();

    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
