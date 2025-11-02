import { auth } from "@/lib/firebaseConfig";
import {
  getAuth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

/**
 * Login with email + password
 */
export const loginWithEmail = async (
  email: string,
  password: string,
  recaptchaToken: string
) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recaptchaToken }),
  });
  const resp = await response.json();

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to login");
  }

  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

/**
 * Sign up with email + password + username
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  userName: string,
  recaptchaToken: string
) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userName, recaptchaToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to sign up.");
  }

  const auth = getAuth();
  const userCredential = await signInWithCustomToken(auth, data.customToken);

  return userCredential.user;
};