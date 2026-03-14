import { z } from "zod";

export const ProjectTypeSchema = z
  .enum(["landing_page", "saas", "portfolio", "ecommerce", "hobby"])
  .describe("Type of project being built.");

export const BusinessModelSchema = z
  .enum(["subscription", "one-time", "lead-gen", "free"])
  .describe("Primary business model for the project.");

export const ToneSchema = z
  .enum(["modern", "minimal", "playful", "technical", "casual", "vintage"])
  .describe("Brand tone to guide messaging and visual direction.");

export const ProjectIdentitySchema = z.object({
  projectName: z.string().describe("Name of the project or product."),
  projectType: ProjectTypeSchema,
  description: z
    .string()
    .describe("Short description of what the project does."),
});

export const TargetBusinessContextSchema = z.object({
  targetAudience: z.string().describe("Primary audience or customer segment."),
  businessModel: BusinessModelSchema,
  industry: z.string().describe("Industry or market vertical."),
  geography: z.string().describe("Primary geographic market."),
});

export const BrandingSchema = z.object({
  tone: ToneSchema,
  brandKeywords: z
    .array(z.string())
    .describe("Keywords that describe brand personality and positioning."),
  colorPreference: z
    .array(z.string())
    .describe("Preferred colors, palette hints, or style cues."),
  designStyle: z.string().describe("Preferred design style direction."),
});

export const FunctionalRequirementsSchema = z.object({
  authenticationRequired: z
    .boolean()
    .describe("Whether user authentication is required."),
  roles: z.array(z.string()).describe("User roles required by the product."),
  paymentRequired: z.boolean().describe("Whether payment flow is required."),
  integrations: z
    .array(z.string())
    .describe("Third-party integrations needed."),
  dashboardRequired: z
    .boolean()
    .describe("Whether an internal/admin dashboard is required."),
});

export const ConstraintsSchema = z.object({
  budgetConstraints: z
    .string()
    .describe("Budget boundaries or spending constraints."),
  timeline: z.string().describe("Expected timeline or deadline."),
  performanceRequirements: z
    .string()
    .describe("Performance and scalability requirements."),
  seoRequired: z.boolean().describe("Whether SEO is a requirement."),
});

export const CollectedContextSchema = z.object({
  projectIdentity: ProjectIdentitySchema,
  targetBusinessContext: TargetBusinessContextSchema,
  branding: BrandingSchema,
  functionalRequirements: FunctionalRequirementsSchema,
  constraints: ConstraintsSchema,
  otherInfo: z
    .array(z.string())
    .describe("Additional notes that do not fit other sections."),
});

export const UpdateContextSchema = z.object({
  collectedContext: CollectedContextSchema.partial().describe(
    "Partial project context updates to merge into existing context.",
  ),
});
