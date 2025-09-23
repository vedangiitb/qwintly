import { auth, db } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const handleSignUp = async (
  setLoading: (val: boolean) => void,
  setError: (msg: string) => void,
  email: string,
  password: string,
  userName: string
) => {
  setLoading(true);
  setError("");
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update displayName in Auth
    if (userName) {
      await updateProfile(userCred.user, { displayName: userName });
    }

    // Create Firestore profile
    await setDoc(doc(db, "users", userCred.user.uid), {
      name: userName,
      email: userCred.user.email,
      plan: "free",
      usageCount: 0,
      createdAt: new Date().toISOString().replace(/\.\d{3}Z$/, (ms) => ms.padEnd(5, '0') + 'Z'),
    });

    console.log("User signed up:", userCred.user.uid);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
