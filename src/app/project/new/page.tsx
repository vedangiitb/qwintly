"use client";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/projects/categories";
import { ArrowRight } from "lucide-react";
import { useNewProject } from "../hooks/useNewProject";
import SelectTemplate from "../components/selectTemplate";

export default function NewProject() {
  const { details, setCategory } = useNewProject();

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-bold px-4 md:px-32 py-8">
        Create a new Project
      </h2>

      {/* STEP 1: Select Category */}
      {!details.category && (
        <div className="px-4 md:px-32">
          <p className="text-muted-foreground mb-6">Select project category</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {categories.map((cat) => (
              <div
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className="
                  border p-6 rounded-xl cursor-pointer transition hover:shadow-lg 
                  hover:border-primary group
                "
              >
                <div className="w-12 h-12 bg-muted rounded-xl mb-4 flex items-center justify-center">
                  {/* Placeholder icon/image */}
                  <span className="text-lg font-bold opacity-50">
                    {cat.name[0]}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
                  {cat.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Category Selected */}
      {details.category && !details.template && (
        <div className="px-4 md:px-32 mt-10">
          <h3 className="text-xl font-semibold">Selected:</h3>
          <p className="text-primary font-medium capitalize mt-1">
            {details.category}
          </p>

          <SelectTemplate />

          {/* <div className="mt-6 flex gap-4">
            <Button variant="secondary" onClick={() => setCategory(null)}>
              Back
            </Button>

            <Button className="gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div> */}
        </div>
      )}
    </div>
  );
}
