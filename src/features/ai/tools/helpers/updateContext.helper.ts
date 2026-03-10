import {
  BUSINESS_MODEL,
  CollectedContext,
  defaultCollectedContext,
  PROJECT_TYPE,
  TONE,
} from "@/features/chat/types/collectedContext.types";

type UpdateContextArgs = {
  collectedContext?: {
    projectIdentity?: Partial<CollectedContext["projectIdentity"]>;
    targetBusinessContext?: Partial<CollectedContext["targetBusinessContext"]>;
    branding?: Partial<CollectedContext["branding"]>;
    functionalRequirements?: Partial<CollectedContext["functionalRequirements"]>;
    constraints?: Partial<CollectedContext["constraints"]>;
    otherInfo?: unknown;
  };
};

export interface CollectedContextRepositoryPort {
  persistCollectedContext(
    id: string,
    updatedCollectedContext: CollectedContext,
  ): Promise<string>;
}

export type UpdateContextToolExecutionContext = {
  chatId: string;
  messageId: string;
  toolId: string;
  repository: CollectedContextRepositoryPort;
};

export class UpdateContextToolHelper {
  private static readonly VALID_PROJECT_TYPES = Object.values(PROJECT_TYPE);
  private static readonly VALID_BUSINESS_MODELS = Object.values(BUSINESS_MODEL);
  private static readonly VALID_TONES = Object.values(TONE);

  parse(args: unknown): CollectedContext {
    const typedArgs = (args ?? {}) as UpdateContextArgs;
    const context = typedArgs.collectedContext ?? {};

    const projectIdentity: Partial<CollectedContext["projectIdentity"]> =
      context.projectIdentity ?? {};
    const targetBusinessContext: Partial<
      CollectedContext["targetBusinessContext"]
    > = context.targetBusinessContext ?? {};
    const branding: Partial<CollectedContext["branding"]> = context.branding ?? {};
    const functionalRequirements: Partial<
      CollectedContext["functionalRequirements"]
    > = context.functionalRequirements ?? {};
    const constraints: Partial<CollectedContext["constraints"]> =
      context.constraints ?? {};

    return {
      projectIdentity: {
        projectName:
          typeof projectIdentity.projectName === "string"
            ? projectIdentity.projectName
            : defaultCollectedContext.projectIdentity.projectName,
        projectType: this.normalizeProjectType(projectIdentity.projectType),
        description:
          typeof projectIdentity.description === "string"
            ? projectIdentity.description
            : defaultCollectedContext.projectIdentity.description,
      },
      targetBusinessContext: {
        targetAudience:
          typeof targetBusinessContext.targetAudience === "string"
            ? targetBusinessContext.targetAudience
            : defaultCollectedContext.targetBusinessContext.targetAudience,
        businessModel: this.normalizeBusinessModel(
          targetBusinessContext.businessModel,
        ),
        industry:
          typeof targetBusinessContext.industry === "string"
            ? targetBusinessContext.industry
            : defaultCollectedContext.targetBusinessContext.industry,
        geography:
          typeof targetBusinessContext.geography === "string"
            ? targetBusinessContext.geography
            : defaultCollectedContext.targetBusinessContext.geography,
      },
      branding: {
        tone: this.normalizeTone(branding.tone),
        brandKeywords: this.getStringArray(
          branding.brandKeywords,
          defaultCollectedContext.branding.brandKeywords,
        ),
        colorPreference: this.getStringArray(
          branding.colorPreference,
          defaultCollectedContext.branding.colorPreference,
        ),
        designStyle:
          typeof branding.designStyle === "string"
            ? branding.designStyle
            : defaultCollectedContext.branding.designStyle,
      },
      functionalRequirements: {
        authenticationRequired:
          typeof functionalRequirements.authenticationRequired === "boolean"
            ? functionalRequirements.authenticationRequired
            : defaultCollectedContext.functionalRequirements
                .authenticationRequired,
        roles: this.getStringArray(
          functionalRequirements.roles,
          defaultCollectedContext.functionalRequirements.roles,
        ),
        paymentRequired:
          typeof functionalRequirements.paymentRequired === "boolean"
            ? functionalRequirements.paymentRequired
            : defaultCollectedContext.functionalRequirements.paymentRequired,
        integrations: this.getStringArray(
          functionalRequirements.integrations,
          defaultCollectedContext.functionalRequirements.integrations,
        ),
        dashboardRequired:
          typeof functionalRequirements.dashboardRequired === "boolean"
            ? functionalRequirements.dashboardRequired
            : defaultCollectedContext.functionalRequirements.dashboardRequired,
      },
      constraints: {
        budgetConstraints:
          typeof constraints.budgetConstraints === "string"
            ? constraints.budgetConstraints
            : defaultCollectedContext.constraints.budgetConstraints,
        timeline:
          typeof constraints.timeline === "string"
            ? constraints.timeline
            : defaultCollectedContext.constraints.timeline,
        performanceRequirements:
          typeof constraints.performanceRequirements === "string"
            ? constraints.performanceRequirements
            : defaultCollectedContext.constraints.performanceRequirements,
        seoRequired:
          typeof constraints.seoRequired === "boolean"
            ? constraints.seoRequired
            : defaultCollectedContext.constraints.seoRequired,
      },
      otherInfo: this.getStringArray(
        context.otherInfo,
        defaultCollectedContext.otherInfo,
      ),
    };
  }

  summarize(args: unknown): string {
    const context = this.parse(args);
    const summaryParts: string[] = [];

    if (context.projectIdentity.projectName) {
      summaryParts.push(`Project: ${context.projectIdentity.projectName}`);
    }

    if (context.projectIdentity.projectType) {
      summaryParts.push(`Type: ${context.projectIdentity.projectType}`);
    }

    if (context.targetBusinessContext.targetAudience) {
      summaryParts.push(`Audience: ${context.targetBusinessContext.targetAudience}`);
    }

    if (!summaryParts.length) return "Context updated";
    return summaryParts.join("; ");
  }

  async handle(
    args: unknown,
    context: UpdateContextToolExecutionContext,
  ): Promise<string> {
    const parsedContext = this.parse(args);
    return context.repository.persistCollectedContext(
      context.chatId,
      parsedContext,
    );
  }

  private getStringArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) return fallback;

    return value.filter((entry): entry is string => typeof entry === "string");
  }

  private normalizeProjectType(value: unknown): CollectedContext["projectIdentity"]["projectType"] {
    return UpdateContextToolHelper.VALID_PROJECT_TYPES.includes(
      value as CollectedContext["projectIdentity"]["projectType"],
    )
      ? (value as CollectedContext["projectIdentity"]["projectType"])
      : defaultCollectedContext.projectIdentity.projectType;
  }

  private normalizeBusinessModel(
    value: unknown,
  ): CollectedContext["targetBusinessContext"]["businessModel"] {
    return UpdateContextToolHelper.VALID_BUSINESS_MODELS.includes(
      value as CollectedContext["targetBusinessContext"]["businessModel"],
    )
      ? (value as CollectedContext["targetBusinessContext"]["businessModel"])
      : defaultCollectedContext.targetBusinessContext.businessModel;
  }

  private normalizeTone(value: unknown): CollectedContext["branding"]["tone"] {
    return UpdateContextToolHelper.VALID_TONES.includes(
      value as CollectedContext["branding"]["tone"],
    )
      ? (value as CollectedContext["branding"]["tone"])
      : defaultCollectedContext.branding.tone;
  }
}

export const updateContextToolHelper = new UpdateContextToolHelper();
