import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import * as admin from "firebase-admin";
import { NextResponse } from "next/server";
import { adminAuth, firestoreDb } from "@/lib/firebase-admin";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

async function createAssessment(token: string, action: string) {
  if (!PROJECT_ID) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID is not set.");
  }

  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  const clientOptions = serviceAccountJson
    ? { credentials: JSON.parse(serviceAccountJson) }
    : {};

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

  if (
    !response.tokenProperties.valid ||
    response.tokenProperties.action !== action
  ) {
    throw new Error("Token is invalid or action mismatch.");
  }

  return response.riskAnalysis.score;
}

const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_DOMAIN}/login/verify`,
};

async function sendVerificationEmail({
  to,
  name,
  link,
}: {
  to: string;
  name: string;
  link: string;
}) {}

// This function will handle all POST requests to /api/auth/signup
export async function POST(req: Request) {
  try {
    const { email, password, userName, recaptchaToken } = await req.json();

    const score = await createAssessment(recaptchaToken, "signup");

    const MINIMUM_SCORE = 0.65;

    if (!score || score < MINIMUM_SCORE) {
      console.warn("Low score detected:", score);
      return NextResponse.json(
        { message: "Security check failed. Score too low." },
        { status: 403 }
      );
    }

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

    const verificationLink = await adminAuth.generateEmailVerificationLink(
      email,
      actionCodeSettings // Defined in step 1
    );

    // 4. SEND CUSTOM EMAIL (THE MANUAL STEP)
    await sendVerificationEmail({
      to: email,
      name: userName,
      link: verificationLink,
    });

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json(
      {
        message:
          "User created successfully. Check your email for verification.",
        customToken,
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
