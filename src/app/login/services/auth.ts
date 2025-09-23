import { auth } from "@/lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Sign up
export async function signUp(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Log in
export async function logIn(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Log out
export async function logOut() {
  return await signOut(auth);
}
