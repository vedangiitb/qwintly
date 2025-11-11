// The Purpose of this file is to handle token expiry more gracefully
// If we see the token expired, we would retry once to get new id token

import { getAuth, onAuthStateChanged } from "firebase/auth";

export async function getIdToken(reload = false) {
  const auth = getAuth();

  // Wait for Firebase to initialize user
  if (!auth.currentUser) {
    await new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(auth, () => {
        unsub();
        resolve();
      });
    });
  }

  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(reload);
  } catch (e) {
    console.error("getIdToken failed", e);
    return null;
  }
}

export async function withAuthRetry<T extends Response>(
  fn: () => Promise<T>
): Promise<T> {
  let res = await fn();
  if (res.status === 401) {
    // try to refresh id token once
    const tokenRefreshed = await getIdToken(true);
    if (!tokenRefreshed) return res;
    res = await fn();
  }
  return res;
}
