export interface PmIndex {
  projectDetails: ProjectDetails;
  capabilities: ProjectCapabilites;
  existingPages: ProjectStructure;
}

export interface ProjectCapabilites {
  supported_task_types: string[];
  ui_task_intents: string[];
  be_task_intents: string[];
  db_task_intents: string[];
}

export interface ProjectStructure {
  pages: Page[];
  components: Page[];
  hooks: Page[];
  infra: Page[];
  lib: Page[];
  services: Page[];
  utils: Page[];
}

export interface Page {
  name: string;
  path: string;
  description: string;
}

export interface ProjectDetails {
  name: string;
  description: string;
  category: string;
  target_users: string;
}
