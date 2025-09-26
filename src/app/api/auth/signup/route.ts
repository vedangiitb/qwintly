import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import * as admin from "firebase-admin"; // This is the server-side SDK
import { NextResponse } from "next/server";
import { adminAuth, firestoreDb } from "@/lib/firebase-admin";

// Use environment variable for your Google Cloud Project ID
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

async function createAssessment(token: string, action: string) {
  if (!PROJECT_ID) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID is not set.");
  }

  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  // 1. Initialize client options
  const clientOptions = serviceAccountJson
    ? { credentials: JSON.parse(serviceAccountJson) }
    : {};

  // Create the reCAPTCHA Enterprise client
  // It automatically handles authentication using the environment variables (e.g., GOOGLE_APPLICATION_CREDENTIALS)
  const client = new RecaptchaEnterpriseServiceClient(clientOptions);
  const projectPath = client.projectPath(PROJECT_ID);

  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        expectedAction: action,
      },
    },
    parent: projectPath,
  };

  const [response] = await client.createAssessment(request);

  if (!response.tokenProperties || !response.riskAnalysis) {
    throw new Error("Invalid assessment response from reCAPTCHA Enterprise.");
  }

  // Check if the token is valid for the expected action
  if (
    !response.tokenProperties.valid ||
    response.tokenProperties.action !== action
  ) {
    throw new Error("Token is invalid or action mismatch.");
  }

  return response.riskAnalysis.score;
}

// This function will handle all POST requests to /api/auth/signup
export async function POST(req: Request) {
  try {
    const { email, password, userName, recaptchaToken } = await req.json();

    // 1. VERIFY TOKEN USING ENTERPRISE SDK
    const score = await createAssessment(recaptchaToken, "signup");

    const MINIMUM_SCORE = 0.5; // Set your own threshold

    if (!score || score < MINIMUM_SCORE) {
      console.warn("Low score detected:", score);
      return NextResponse.json(
        { message: "Security check failed. Score too low." },
        { status: 403 }
      );
    }

    // 2. SECURE FIREBASE USER CREATION & FIRESTORE PROFILE
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: userName,
    });

    await firestoreDb.collection("users").doc(userRecord.uid).set({
      name: userName,
      email,
      plan: "free",
      usageCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. SECURE AUTHENTICATION (Optional but recommended)
    // To complete the login on the client, you can create a custom token
    // or a session cookie on the server and return it.
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json(
      {
        message: "User created successfully.",
        customToken, // Return the token to the client
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return NextResponse.json(
        { message: "Email already in use." },
        { status: 409 }
      );
    }
    console.error("API Sign-up Error:", error);
    return NextResponse.json(
      { message: error.message || "An unknown error occurred." },
      { status: 500 }
    );
  }
}
