import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { NextResponse } from "next/server";

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

  console.log(response);

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

export async function POST(req: Request) {
  try {
    const { recaptchaToken } = await req.json();

    const score = await createAssessment(recaptchaToken, "login");

    const MINIMUM_SCORE = 0.5;
    
    if (!score || score < MINIMUM_SCORE) {
      console.warn("Low score detected:", score);
      return NextResponse.json(
        { message: "Security check failed. Score too low." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Security check passed." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Login Error:", error);
    return NextResponse.json(
      { message: error.message || "An unknown error occurred." },
      { status: 500 }
    );
  }
}
