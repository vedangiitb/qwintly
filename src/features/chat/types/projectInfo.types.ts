interface Page {
  pageRoute: string;
  pageName: string;
  description: string;
}

export interface ProjectInfo {
  uiPages: Page[];
  lastUpdatedPlanVersion?: number;
}

export const defaultProjectInfo: ProjectInfo = {
  uiPages: [
    {
      pageRoute: "/",
      pageName: "Home Page",
      description:
        "A simple starter homepage with placeholder content you can replace with your brand, product, and links.",
    },
  ],
  lastUpdatedPlanVersion: 0,
};
