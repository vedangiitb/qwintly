"use client";

import { Button } from "@/components/ui/button";
import {
  templateInterface,
  templatesByCategory,
} from "@/data/projects/projectTemplates";
import { useNewProject } from "../hooks/useNewProject";
import { OptionCard } from "./shared/OptionCard";
import { OptionGrid } from "./shared/OptionGrid";
import { PageHeader } from "./shared/PageHeader";
import { PageWrapper } from "./shared/PageWrapper";

export default function SelectTemplate() {
  const { details, setTemplate, setStep } = useNewProject();

  const category = details.category as
    | keyof typeof templatesByCategory
    | undefined;
  const templates = (category ? templatesByCategory[category] : []) || [];

  return (
    <PageWrapper>
      <PageHeader
        title={`Select a template`}
        description={`Showing templates for: ${details.category}`}
      />

      <OptionGrid>
        {templates.map((temp: templateInterface) => (
          <OptionCard
            key={temp.key}
            title={temp.name}
            description={temp.description}
            selected={details.template === temp.key}
            onClick={() => setTemplate(temp.key)}
          >
            <div className="flex flex-wrap gap-2 mt-3">
              {temp.features.map((f: string) => (
                <span key={f} className="text-xs bg-muted px-2 py-1 rounded-md">
                  {f}
                </span>
              ))}
            </div>
          </OptionCard>
        ))}
      </OptionGrid>

      <Button variant="secondary" onClick={() => setStep("cat")}>
        Back
      </Button>
    </PageWrapper>
  );
}
