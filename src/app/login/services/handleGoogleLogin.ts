import { auth, db } from "@/lib/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Initiates Google login via redirect.
 */
export const startGoogleLogin = () => {
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(auth, provider);
};

/**
 * Handles Google redirect result and ensures Firestore profile exists.
 */
export const completeGoogleLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    console.log("Redirect result:", result);
    
    if (!result || !result.user) {
      console.log("No redirect result or user");
      return null;
    }

    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("Creating new user profile");
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email,
        plan: "free",
        usageCount: 0,
        createdAt: Date.now(),
      });
    }

    console.log("Login successful, returning user:", user);
    return user;
  } catch (error) {
    console.error("Error in completeGoogleLogin:", error);
    throw error;
  }
};
