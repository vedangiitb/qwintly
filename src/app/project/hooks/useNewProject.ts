import {
  setProjectCategory,
  setProjectConfig,
  setProjectDescription,
  setProjectName,
  setProjectStep,
  setProjectTemplate,
} from "@/lib/features/newProjectSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export interface projectConfig {
  auth: string | boolean;
  db: string;
  storage: string | boolean;
  ai: string | boolean;
  payments: string;
}

export interface projectDetails {
  name: string | null;
  description: string | null;
  category: string | null;
  template: string | null;
  config: projectConfig | null;
  step: StepType;
}

export type StepType = "init" | "cat" | "temp" | "config" | "review";

export function useNewProject() {
  const details = useSelector((state: RootState) => state.newProject);
  const dispatch = useDispatch<AppDispatch>();
  const [description, setDescription] = useState("");

  const setName = (name: string) => {
    dispatch(setProjectName(name));
  };

  const setCategory = (category: string | null) => {
    setStep("temp");
    dispatch(setProjectCategory(category));
  };

  const submitDescription = () => {
    if (description) dispatch(setProjectDescription(description));
  };

  const setTemplate = (template: string | null) => {
    setStep("config");
    dispatch(setProjectTemplate(template));
  };

  const setConfig = (config: projectConfig | null) => {
    dispatch(setProjectConfig(config));
  };

  const setStep = (step: StepType) => {
    dispatch(setProjectStep(step));
  };

  return {
    details,
    setCategory,
    setTemplate,
    setConfig,
    setStep,
    submitDescription,
    description,
    setDescription,
    setName,
  };
}
