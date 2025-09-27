export const mapError = (err: string) => {
  if (err.includes("email-already-in-use")) {
    return "Email already registered.";
  }

  if (
    err.includes("invalid-credential") ||
    err.includes("wrong-password") ||
    err.includes("user-not-found") ||
    err.includes("invalid-email")
  ) {
    return "Invalid email or password.";
  }

  return "Something went wrong. Please try again.";
};
