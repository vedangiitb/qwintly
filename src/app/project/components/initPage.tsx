"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, XCircle } from "lucide-react";
import { useNewProject } from "../hooks/useNewProject";
import { PageWrapper } from "./shared/PageWrapper";
import { PageHeader } from "./shared/PageHeader";
import { SectionCard } from "./shared/SectionCard";

export default function ProjectInitPage() {
  const { description, setDescription, submitDescription, setStep } =
    useNewProject();

  return (
    <PageWrapper>
      <PageHeader
        title="Tell us about your project"
        description="We'll suggest the best project setup for you."
      />

      <SectionCard>
        <Label className="font-medium text-sm mb-2 block">
          Project Description
        </Label>
        <Textarea
          className="min-h-[130px] resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. An AI job portal with resume ranking, profiles and admin dashboard."
        />
      </SectionCard>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep("cat")}
          className="gap-2 cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Skip
        </Button>

        <Button
          className="gap-2 cursor-pointer"
          onClick={() => {
            submitDescription();
            setStep("cat");
          }}
          disabled={!description.trim()}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageWrapper>
  );
}
