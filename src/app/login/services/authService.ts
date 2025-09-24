import { auth, db } from "@/lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * Login with email + password
 */
export const loginWithEmail = async (email: string, password: string) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
};

/**
 * Sign up with email + password + username
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  userName: string
) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // Update displayName in Firebase Auth
  if (userName) {
    await updateProfile(userCred.user, { displayName: userName });
  }

  // Create Firestore profile
  await setDoc(doc(db, "users", userCred.user.uid), {
    name: userName,
    email: userCred.user.email,
    plan: "free",
    usageCount: 0,
    createdAt: Date.now(),
  });

  return userCred.user;
};

// Log out
export async function logOut() {
  return await signOut(auth);
}
