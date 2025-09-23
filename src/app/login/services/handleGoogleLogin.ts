import { auth, db } from "@/lib/firebaseConfig";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Initiates Google login via redirect.
 */
export const startGoogleLogin = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

/**
 * Call this after page load to complete Google login and create Firestore profile if needed.
 */
export const handleGoogleRedirectResult = async (
  setLoading: (val: boolean) => void,
  setError: (msg: string) => void
) => {
  setLoading(true);
  setError("");
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) {
      setLoading(false);
      return; // No user returned yet
    }

    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email,
        plan: "free",
        usageCount: 0,
        createdAt: Date.now(),
      });
    }

    console.log("Google login successful:", user.uid);
  } catch (err: any) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
