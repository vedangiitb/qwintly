"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewProject } from "../hooks/useNewProject";

import { PageWrapper } from "./shared/PageWrapper";
import { PageHeader } from "./shared/PageHeader";
import { SectionCard } from "./shared/SectionCard";

import { ArrowLeft, Rocket, FileText } from "lucide-react";
import { aiPlatforms } from "@/data/projects/configs/aiPlatforms";
import { useState } from "react";

export default function ReviewProject() {
  const { details, setStep, setName } = useNewProject();
  const [error, setError] = useState(false);

  const generateProject = () => {
    if (!details.name) {
      setError(true);
    } else {
      setError(false);
    }

    console.log(details);
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Review your setup"
        description="Make sure everything looks good before we generate your project."
      />

      {/* PROJECT NAME */}
      <SectionCard>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          Project Name
        </h3>

        <Input
          placeholder="Enter your project name"
          value={details.name || ""}
          onChange={(e) => setName(e.target.value)}
          className="max-w-md"
        />
        {error && (
          <p className="text-red-500 text-sm">
            Please enter a name for your project
          </p>
        )}
      </SectionCard>

      {/* BASIC INFO */}
      <SectionCard>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Project Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Category</p>
            <p className="font-medium capitalize">{details.category}</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">Template</p>
            <p className="font-medium capitalize">{details.template}</p>
          </div>
        </div>
      </SectionCard>

      {/* DESCRIPTION */}
      {details.description && (
        <SectionCard>
          <h3 className="font-semibold text-lg mb-3">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {details.description}
          </p>
        </SectionCard>
      )}

      {/* CONFIGURATION */}
      {details.config && (
        <SectionCard>
          <h3 className="font-semibold text-lg mb-4">Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ConfigRow label="Authentication" value={details.config.auth} />
            <ConfigRow label="Database" value={details.config.db || "None"} />
            <ConfigRow label="Storage" value={details.config.storage} />
            <ConfigRow
              label="AI"
              value={
                details.config.ai
                  ? aiPlatforms[details.config.ai!].name || "None"
                  : false
              }
            />

            <ConfigRow
              label="Payments"
              value={details.config.payments || "None"}
            />
          </div>
        </SectionCard>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between mt-10">
        <Button variant="secondary" onClick={() => setStep("config")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button className="gap-2" onClick={generateProject}>
          Generate Project
          <Rocket className="w-4 h-4" />
        </Button>
      </div>
    </PageWrapper>
  );
}

/* Helper Component: clean label/value in config */
function ConfigRow({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-medium">
        {typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value}
      </p>
    </div>
  );
}
