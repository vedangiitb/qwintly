"use client";

import { Button } from "@/components/ui/button";
import { categories } from "@/data/projects/categories";
import { useNewProject } from "../hooks/useNewProject";
import { OptionCard } from "./shared/OptionCard";
import { OptionGrid } from "./shared/OptionGrid";
import { PageHeader } from "./shared/PageHeader";
import { PageWrapper } from "./shared/PageWrapper";

export default function CategoryPage() {
  const { setCategory, setStep, details } = useNewProject();

  return (
    <PageWrapper>
      <PageHeader
        title="Select category"
        description="Choose the base type of project you want to create."
      />

      <OptionGrid>
        {categories.map((cat) => (
          <OptionCard
            selected={cat.key == details.category}
            key={cat.key}
            title={cat.name}
            description={cat.description}
            onClick={() => setCategory(cat.key)}
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg opacity-60">
              {cat.name[0]}
            </div>
          </OptionCard>
        ))}
      </OptionGrid>

      <Button variant="secondary" onClick={() => setStep("init")}>
        Back
      </Button>
    </PageWrapper>
  );
}
