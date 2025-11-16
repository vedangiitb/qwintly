"use client";

import { useNewProject } from "../hooks/useNewProject";
import ProjectInitPage from "../components/initPage";
import CategoryPage from "../components/categoryPage";
import SelectTemplate from "../components/selectTemplate";
import ConfigureProject from "../components/configPage";
import ReviewProject from "../components/reviewPage";

export default function NewProject() {
  const { details } = useNewProject();

  const step = details.step;

  return (
    <div className="w-full">
      {step === "init" && <ProjectInitPage />}
      {step === "cat" && <CategoryPage />}
      {step === "temp" && <SelectTemplate />}
      {step === "config" && <ConfigureProject />}
      {step === "review" && <ReviewProject />}
    </div>
  );
}
