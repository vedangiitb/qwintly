"use client";
import { auth, db } from "@/lib/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Initiates Google login via popup.
 */
export const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
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
