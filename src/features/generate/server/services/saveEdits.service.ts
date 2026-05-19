import { PageConfig } from "../../types/snapshot";
import { GenSnapshotsRepository } from "../repositories/genSessions.repository";
import { ProjectOperationsRepository } from "../repositories/projectOperations.repository";
import { assertOperationsAreSafe } from "./verifyOps.service";

type TextOp = {
  kind: "text";
  id: string;
  oldText: string;
  newText: string;
};

type DeleteOp = {
  kind: "delete";
  id: string;
  parentId: string;
  nextSiblingId: string | null;
  oldOuterHTML: string;
};

type PreviewDomOp = TextOp | DeleteOp;

export const saveEdits = async (
  genId: string,
  route: string,
  operations: any,
  token: string,
) => {
  assertOperationsAreSafe(operations);

  const projectOperationsRepository = new ProjectOperationsRepository(token);
  const genSnapshotsRepository = new GenSnapshotsRepository(token);
  await projectOperationsRepository.addProjectOperation(
    genId,
    route,
    operations,
  );

  await updateSnapshot(genId, route, operations, genSnapshotsRepository);

  return { ok: true };
};

const updateSnapshot = async (
  genId: string,
  route: string,
  operations: any,
  snapshotRepo: GenSnapshotsRepository,
) => {
  const pageConfig = await snapshotRepo.getSnapshotByGenId(genId);
  if (!pageConfig || typeof pageConfig !== "object") {
    throw new Error("Missing snapshot for genId");
  }

  if (!pageConfig.routes || typeof pageConfig.routes !== "object") {
    throw new Error("Invalid snapshot: missing routes");
  }

  const config: PageConfig | undefined = pageConfig.routes[route];
  if (!config || !Array.isArray(config.elements)) {
    throw new Error(`Invalid snapshot: missing route config for "${route}"`);
  }

  const ops: PreviewDomOp[] = Array.isArray(operations) ? operations : [];

  for (const op of ops) {
    if (!op || typeof op !== "object") continue;

    if (op.kind === "text") {
      if (typeof op.id !== "string" || typeof op.newText !== "string") continue;
      const found = findElementById(config.elements, op.id);
      if (!found) continue;

      found.element.props = {
        ...(found.element.props ?? {}),
        text: op.newText,
      };
      continue;
    }

    if (op.kind === "delete") {
      if (typeof op.id !== "string" || typeof op.parentId !== "string")
        continue;

      const parent = findElementById(config.elements, op.parentId)?.element;
      if (parent?.children && Array.isArray(parent.children)) {
        parent.children = parent.children.filter(
          (child) => child?.id !== op.id,
        );
      } else {
        // Fallback: allow deleting a top-level element (or handle missing parentId)
        config.elements = config.elements.filter((el) => el?.id !== op.id);
      }
      continue;
    }
  }

  pageConfig.routes[route] = config;
  await snapshotRepo.updateSnapshotByGenId(genId, pageConfig);
};

function findElementById(
  elements: any[],
  id: string,
): { element: any; parent: any | null } | null {
  for (const element of elements) {
    if (!element || typeof element !== "object") continue;
    if (element.id === id) return { element, parent: null };

    const children = (element as any).children;
    if (Array.isArray(children) && children.length) {
      const found = findElementById(children, id);
      if (found) return { element: found.element, parent: element };
    }
  }
  return null;
}
