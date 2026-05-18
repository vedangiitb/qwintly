import { BuilderElement } from "./elements";

export type PageConfig = {
  elements: BuilderElement[];
};

export type Snapshot = {
  routes: Record<string, PageConfig>;
};
