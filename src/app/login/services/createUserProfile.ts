import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function createUserProfile(
  uid: string,
  name: string,
  email: string
) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    createdAt: Date.now(),
    plan: "free",
    usageCount: 0,
  });
}
