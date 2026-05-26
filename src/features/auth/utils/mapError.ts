export const mapError = (err: string) => {
  const lowerErr = err.toLowerCase();

  if (
    lowerErr.includes("email-already-in-use") ||
    lowerErr.includes("already registered") ||
    lowerErr.includes("already exists")
  ) {
    return "Email already registered.";
  }

  if (
    lowerErr.includes("invalid-credential") ||
    lowerErr.includes("wrong-password") ||
    lowerErr.includes("user-not-found") ||
    lowerErr.includes("invalid-email") ||
    lowerErr.includes("invalid login credentials")
  ) {
    return "Invalid email or password.";
  }

  // Return the error itself if it's descriptive and custom, e.g. password or security check messages.
  // Otherwise, fallback to a generic error message.
  return err || "Something went wrong. Please try again.";
};

