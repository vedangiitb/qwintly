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
import Link from "next/link";

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


      <div>
    {/* TODO: Check if the user has linked the github account and only show if NOT! */}
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-muted cursor-pointer border hover:bg-muted/60 transition-all"
          onClick={() => {
            const url = "/api/github/login";
            const width = 600;
            const height = 700;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;
            const features = `width=${width},height=${height},left=${Math.max(left, 0)},top=${Math.max(top, 0)},menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes`;
            const popup = window.open(url, "github_oauth", features);
            if (popup) {
              popup.focus();
            } else {
              // Fallback to full navigation if popup blocked
              window.location.href = url;
            }
          }}
        >
          Connect GitHub
        </button>
      </div>

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
                details.config.ai && typeof details.config.ai === "string"
                  ? aiPlatforms[details.config.ai as keyof typeof aiPlatforms]
                      ?.name || "None"
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
