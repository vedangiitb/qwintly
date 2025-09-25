export const mapError = (err: string) => {
  if (err.includes("invalid-credential"))
    return "No account found with this email.";
  if (err.includes("wrong-password")) return "Incorrect password.";
  if (err.includes("email-already-in-use")) return "Email already registered.";
  return "Something went wrong. Please try again.";
};
