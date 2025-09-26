import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// 1. Get the raw JSON content of the Service Account key from the environment variable
const serviceAccountJson = process.env.FIREBASE_ADMIN_KEY_PATH;
if (!serviceAccountJson) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.");
}

// 2. Parse the JSON content
const serviceAccount = JSON.parse(serviceAccountJson);

// 3. Define the app name (arbitrary, but required if you use multiple apps)
const appName = 'default'; 

// 4. Check if the app is already initialized
if (getApps().length === 0) {
    // If not initialized, initialize it. We use the parsed JSON directly.
    initializeApp({
        credential: cert(serviceAccount),
        // Add your Firestore/Database URL if needed, e.g.:
        // databaseURL: 'https://your-project-id.firebaseio.com',
    }, appName);
}

// 5. Export the initialized services
export const adminApp = getApps().find(app => app.name === appName);
if (!adminApp) {
  throw new Error(`Firebase app with name "${appName}" was not found.`);
}
export const adminAuth = getAuth(adminApp);
export const firestoreDb = getFirestore(adminApp);