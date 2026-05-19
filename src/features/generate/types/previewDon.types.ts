export type PreviewDomOp =
  | {
      kind: "text";
      id: string;
      oldText: string;
      newText: string;
    }
  | {
      kind: "delete";
      id: string;
      parentId: string;
      nextSiblingId: string | null;
      oldOuterHTML: string;
    };
