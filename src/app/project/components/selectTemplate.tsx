"use client";

import { Button } from "@/components/ui/button";
import {
  templateInterface,
  templatesByCategory,
} from "@/data/projects/projectTemplates";
import { ArrowLeft, Check } from "lucide-react";
import { useNewProject } from "../hooks/useNewProject";

export default function SelectTemplate() {
  const { details, setTemplate, setCategory } = useNewProject();
  console.log(details.category);

  if (!details.category) {
    return null;
  }

  const templates =
    templatesByCategory[details.category as keyof typeof templatesByCategory] ||
    [];
  const selected = details.template;

  console.log(templates);

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">
        Select a Template ({details.category})
      </h2>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {templates.map((temp: templateInterface) => (
          <div
            key={temp.key}
            onClick={() => setTemplate(temp.key)}
            className={`
              border rounded-xl p-6 cursor-pointer transition hover:shadow-lg relative
              ${selected === temp.key ? "border-primary shadow-md" : "border-muted"}
            `}
          >
            {/* Selected Check */}
            {selected === temp.key && (
              <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
            )}

            <h3 className="text-lg font-semibold mb-2">{temp.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {temp.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {temp.features.map((f: string) => (
                <span key={f} className="text-xs bg-muted px-2 py-1 rounded-md">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-10">
        <Button variant="secondary" onClick={() => setCategory(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* <Button
          disabled={!selected}
          onClick={() => setStep("config")}
          className="gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button> */}
      </div>
    </div>
  );
}
