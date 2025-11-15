import {
  setProjectCategory,
  setProjectTemplate,
} from "@/lib/features/newProjectSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";

export interface projectDetails {
  name: string | null;
  category: string | null;
  template: string | null;
}

export function useNewProject() {
  const details = useSelector((state: RootState) => state.newProject);

  const dispatch = useDispatch<AppDispatch>();

  const setCategory = (category: string | null) => {
    dispatch(setProjectCategory(category));
  };

  const setTemplate = (template: string | null) => {
    dispatch(setProjectTemplate(template));
  };

  return { details, setCategory, setTemplate };
}
