export const verifyOtpService = async (otp: string, userId: string) => {
  try {
    const resp = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, userId }),
    });

    const data = await resp.json();

    if (resp.ok) {
      return { isVerified: true, error: null };
    } else {
      return { isVerified: false, error: data.error };
    }
  } catch (e: any) {
    return { isVerified: true, error: e.message };
  }
};

export const resendOtpService = async (email: string, userId: string) => {
  try {
    const resp = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, userId: userId }),
    });

    const data = await resp.json();

    if (resp.ok) {
      return { sent: true, error: null };
    } else {
      return { sent: false, error: data.error };
    }
  } catch (e: any) {
    return { sent: true, error: e.message };
  }
};
