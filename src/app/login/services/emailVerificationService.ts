export const verificationService = async (otp: string) => {
  const resp = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });

  const { verified } = await resp.json();
  console.log(verified);
  if (verified) {
    return true;
  } else {
    return false;
  }
};
