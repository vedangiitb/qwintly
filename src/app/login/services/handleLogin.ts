import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export const handleLogin = async (
  setLoading: (val: boolean) => void,
  setError: (msg: string) => void,
  email: string,
  password: string
) => {
  setLoading(true);
  setError("");
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCred.user.uid);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
