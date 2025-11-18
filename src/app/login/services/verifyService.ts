export const verifyOtpService = async (otp: string, userId: string) => {
  const resp = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp, userId }),
  });

  const data = await resp.json();
  if (resp.ok) return { isVerified: true, error: null };

  return { isVerified: false, error: data.message };
};

export const resendOtpService = async (email: string, userId: string) => {
  const resp = await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, userId }),
  });

  const data = await resp.json();
  if (resp.ok) return { sent: true, error: null };

  return { sent: false, error: data.message };
};
