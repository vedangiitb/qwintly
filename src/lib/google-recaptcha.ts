import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!;

export async function validateRecaptcha(token: string, action: string) {
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  const clientOptions = serviceAccountJson
    ? { credentials: JSON.parse(serviceAccountJson) }
    : {};

  const client = new RecaptchaEnterpriseServiceClient(clientOptions);
  const projectPath = client.projectPath(PROJECT_ID);

  const request = {
    assessment: {
      event: {
        token,
        siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        expectedAction: action,
      },
    },
    parent: projectPath,
  };

  const [response] = await client.createAssessment(request);

  if (!response.tokenProperties?.valid)
    throw new Error("Invalid recaptcha token");

  if (response.tokenProperties.action !== action)
    throw new Error("Action mismatch");

  return response.riskAnalysis?.score || 0;
}
